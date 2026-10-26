---
title: "The Scanner Said It Succeeded. The Process Never Exited."
description: "Six engineering problems we hit putting ZAP's Client Spider and OWASP PTK into a production pipeline — a hung JVM, a stale log marker, a silent auth failure, and the two diagnoses we got wrong first."
author:
  name: Mahidhar
  # role: Security Engineering
  avatar: /avatars/Mahidhar_img.png
date: 2026-10-25
category: DAST
tags:
  - ZAP
  - OWASP PTK
  - Client Spider
  - DAST
  - Docker
featured: false
readingTime: 14
cover: /covers/client-spider-ptk-debugging-cover.png
---

**Six engineering problems we hit putting ZAP's Client Spider and OWASP PTK into a production pipeline**

In a previous post we showed what ZAP's Client Spider and the OWASP PTK add-on did to our coverage: finding instances up 4.4x, the number of distinct URLs with findings up 3x, and ten classes of client-side vulnerability that a proxy-based scanner structurally cannot reach.

That post covered the result. This one covers the fortnight between "this clearly works better" and "this runs unattended in production." Because the gap between those two states is where scanner automation actually lives, and nobody writes about it.

Everything below is a real failure, with the real evidence, in the order we understood it — including the two diagnoses we got wrong first.

---

## Problem 1: The scan succeeds and the container never exits

The symptom was maddening because everything looked fine:

```
Job html-report generated report /zap/reports/scan-report.html
Job report finished, time taken: 00:00:00
Automation plan succeeded!
```

Reports written. Plan succeeded. And then the container sat there. Sometimes for minutes, sometimes indefinitely. Not every run — maybe one in three, apparently at random. In CI that means a job that never returns, a runner pinned until someone kills it, and no signal distinguishing "still scanning" from "finished twenty minutes ago."

### Wrong diagnosis #1: zombie processes

Inside the container, `ps` showed this:

```
zap  205  [crashhelper]     <defunct>
zap  287  [RDD Process]     <defunct>
zap  423  [Utility Process] <defunct>
```

Orphaned Firefox children, unreaped, because `zap.sh` execs the JVM and the JVM becomes PID 1 — and PID 1 is the process responsible for reaping orphans. The Client Side Integration add-on's changelog even notes that the Client Spider now waits for all browsers to close before reporting that it has finished. A spider waiting on processes that are dead but never reaped is a textbook hang.

We added `docker run --init` so tini takes PID 1 and reaps properly.

It changed nothing. The hang came back on the next run.

### Wrong diagnosis #2: a Netty shutdown bug

Thread dump time:

```bash
docker exec <container> jstack 1 > zap-threads.txt
```

And there it was:

```
"ZAP-IO-5-4" #369 prio=10 ... runnable
   at sun.nio.ch.EPoll.wait(Native Method)
   at io.netty.channel.nio.NioEventLoop.run(NioEventLoop.java:526)
```

No `daemon` flag on that thread. The JVM exits when only daemon threads remain, so one non-daemon Netty event loop sitting in `epoll_wait` is enough to hold the process open forever. Compare the thread directly beneath it in the same dump, `"HttpClient-8-SelectorManager" #370 daemon` — that one could never block shutdown.

Conclusion: ZAP isn't shutting down one of its event loop groups. A bug to report upstream, nothing we can fix.

That was closer, but still not the mechanism. It explained *what* held the process open, not *why* that loop refused to go idle.

### The actual cause

The answer was in the log timeline, once we lined up the timestamps:

```
14:57:39  Automation plan succeeded!
14:57:50  CommandLineBootstrap - ZAP 2.17.0 terminated.
14:57:57  ClientSpiderTask - Task 1 failed
          NoSuchSessionException: Session ID is null. Using WebDriver after calling quit()?
            at ClientSpider$WebDriverProcess.<init>
            at ClientSpider.getWebDriverProcess
            at ClientSpider.createTaskContext
14:58:02  ZAP-IO-5-4  AbstractChannel$AbstractUnsafe.register0
          RejectedExecutionException: event executor terminated
```

A Client Spider task launched a browser **eighteen seconds after the plan completed, and seven seconds after ZAP logged its own termination**. The Java side threw immediately — the driver pool was already quit — but the OS process it had just spawned was alive and nobody was going to call `quit()` on it.

That browser then did what browsers do: it kept making requests through the ZAP proxy. Look at the final stack frame — `register0` → `fireChannelRegistered`. That is a *new inbound connection being accepted*. The non-daemon event loop couldn't go idle because traffic kept arriving at it.

So: a task-lifecycle race in a beta add-on produces a live orphan browser, which holds open a non-daemon event loop, which prevents JVM exit. Both earlier diagnoses were fragments of this. The zombies were real but incidental — `--init` did nothing because **the browser wasn't dead**. It was alive and talking.

This also explains the randomness: it depends entirely on whether a task happened to be mid-launch when the stop signal arrived.

### The fix

Knowing the mechanism made the fix obvious and small. Kill the browsers first, and the event loop goes quiet on its own:

```bash
pkill -KILL -f 'geckodriver'
pkill -KILL -f 'firefox'
# then give the JVM ~15s to exit by itself before escalating to SIGTERM
```

On the good path the JVM now exits with no signal at all, which means the session database closes cleanly. We only escalate to SIGTERM and then SIGKILL if it doesn't.

The watchdog that does this watches the log for the completion markers, then runs that sequence. The reports are written *before* the hang, so killing at that point costs nothing.

---

## Problem 2: `--init` is a luxury you may not have

Our development environment runs `docker run` directly, so `--init` was available. Production deploys the image as a container job, where the platform starts the container and there is no runtime flag to pass.

Three options, depending on what you control:

| You control | Fix |
|---|---|
| The Dockerfile | `apt-get install tini` and `ENTRYPOINT ["/usr/bin/tini", "-g", "--", ...]` |
| The pod spec | `shareProcessNamespace: true` — the pause container reaps |
| Only the command | A wrapper that stays PID 1 itself and watches for completion |

The `-g` matters: it makes tini signal the whole process group, so stopping the container takes the browsers down with it instead of orphaning them.

A related trap, if your entrypoint is a shell script: `node app.js` and `exec node app.js` are not equivalent. Without `exec`, the shell stays alive as the parent and doesn't forward signals to its child while waiting — so a SIGTERM to PID 1 never reaches your process. With `-g` you get away with it by accident. Remove `-g` later and shutdown silently breaks.

---

## Problem 3: Watching the wrong log for the wrong words

Our watchdog needed to know when the plan finished. Two mistakes, both of which would have been invisible until they bit.

**The failure marker doesn't say "failed."** We matched `Automation plan failed`. ZAP actually prints:

```
Automation plan failures:
        Unexpected error Cannot invoke "com.crawljax.core.CrawljaxRunner.stop()"
        because "this.crawljax" is null - see log for details
```

Plural, with a colon. Our watchdog would have sailed straight past every failed run and sat waiting for a marker that never comes — the exact hang we built it to prevent, now triggered by the failure path alone.

**The persisted log contains yesterday's ending.** The plan markers go to stdout. ZAP's `zap.log` holds the `CommandLineBootstrap - ZAP 2.17.0 terminated.` line, which is the one signal that appears regardless of outcome — so it's worth watching.

Except our Dockerfile installs add-ons at build time, and that build-time ZAP run wrote its own `terminated` line into `zap.log`, baked into the image layer:

```
2026-10-13 22:13:25,456 [main] INFO CommandLineBootstrap - ZAP 2.17.0 terminated.
```

Every fresh container starts with a completion marker already in the log. A watchdog that greps the whole file matches on its first poll and kills the scan seconds after launch. Stateless containers don't save you — the stale line comes from the image, not from a previous run.

The fix is to baseline each log's byte offset at startup and only match content appended after that. Deleting the file in the Dockerfile works too, and we do both.

---

## Problem 4: Telling "still working" from "stuck"

A hung spider and a busy spider look identical from outside. We saw runs sit on:

```
Job spider requesting URL https://[redacted]
```

and never move. But we also have legitimate scans that run for six hours.

A total-runtime timeout is the obvious answer and the wrong one. Set it to two hours and you kill real scans; set it to twelve and a stuck run wastes most of a day.

What distinguishes the two isn't elapsed time, it's **output**. A healthy run keeps appending lines:

```
Job spider found 152 URLs
Job spider finished, time taken: 00:01:11
```

So the watchdog measures silence, not duration. It sums the byte count across the watched logs each poll and resets a clock whenever that grows. Two hours of no new bytes means stuck. Twelve hours of steady logging is fine.

With one exception, which took another failed run to learn: **the active scan is legitimately silent for hours.** It can run four hours without writing a line and still finish normally. So the stall detector switches off permanently once the active scan starts:

```
[monitor] active scan started — stall detection disabled for the rest of the run
```

The active scan has its own `maxScanDurationInMins` in the plan. A second ceiling in the watchdog would only fight it.

One more detail that cost us time: ZAP logs the **job name**, not the job type. Our plan has two active scan jobs, so the real lines are `Job activeScan-zap started` and `Job activeScan-ptk started`. A literal match on `Job activeScan started` misses both. The trigger has to be a pattern.

---

## Problem 5: Authentication fails in ways that still produce a report

This one isn't about hangs, and it's the most dangerous failure mode of all: **a scan that authenticates incorrectly still produces a clean-looking report.**

On one single-page app, browser-based authentication simply never happened. `loginPageUrl` was set to the site root. The app is hash-routed, so the login form lives at `/#/login` — a client-side route. As far as HTTP is concerned those are the same request; the form only exists after the router processes the fragment. ZAP's browser landed on a page with no username or password fields in the DOM, found nothing to fill, and carried on.

Changing one URL fixed it entirely. An earlier app had worked from the root because it server-renders its login form — so the thing that worked for one framework silently failed for another.

And when auth does work at startup, it can still degrade. One full run with the Client Spider logged a **20% authentication failure rate**: one request in five went out logged-out. The Client Spider has no logout-avoidance parameter, so a browser that clicks the wrong element ends the session. ZAP's poll verification re-authenticates, but by then part of your coverage came from logged-out states.

Both of these produce a report. Neither announces itself. The only defence is to run an authentication diagnostic *before* the scan and treat its result as a gate — not as a statistic you read afterwards if something looks off.

---

## Problem 6: Everything else that has to be right first

The problems above are the interesting ones. These are the ones that just cost time:

- **Headless Firefox crashes on Docker's default 64 MB `/dev/shm`.** The Client Spider launches several browsers, so this matters more than it did with the AJAX Spider. `--shm-size=2g`.
- **JVM heap versus browser memory.** Set the heap to most of the container limit and the kernel OOM-kills your browsers, which looks exactly like a crash in the spider. Heap at roughly half, and leave 4 GB+ for Firefox.
- **PTK with multiple browsers is expensive.** ZAP's own guidance is to drop to one or two browsers when PTK is enabled. Fewer concurrent browsers also means a smaller window for the lifecycle race in Problem 1.
- **Engine placement is configured outside the automation plan.** SAST and IAST belong in the Client Spider; DAST belongs in the active scan rule. Recommended defaults exist specifically to stop PTK duplicating ZAP's own SQLi and XSS findings — turn them off and your report fills with duplicates.
- **A persisted ZAP home masks add-ons baked into the image.** Bind-mount over `/home/zap/.ZAP` and the `client` and `ptk` add-ons you installed at build time are simply not there. The scan runs. It just quietly skips the jobs that needed them.
- **`tee` block-buffers.** Redirect ZAP's stdout to a file and you lose container logs; pipe it through `tee` and your watchdog may see markers a few KB late. Fine at hour scale, not at minute scale.

---

## What this actually costs

Add it up: a ~200-line automation plan, a watchdog with stall detection and marker baselining, container init and shm and memory tuning, engine placement flags, a pre-scan auth gate, framework-specific login URLs, and a thread dump to understand why any of it was failing.

None of that is security work. It is the price of admission before the security work starts.

And note what every failure in this post has in common: **none of them produced an error.** The hang said "Automation plan succeeded!" The unauthenticated scan produced a full report. The stale marker killed the run cleanly. The masked add-ons just skipped their jobs. The real failure mode of DIY scanner automation isn't crashes — it's confident emptiness, and a report nobody has reason to doubt.

---

## How CoreFix handles this

CoreFix exists so that none of the above is yours to own.

You supply a target and credentials. CoreFix determines the application profile, selects the crawling strategy, places the in-browser analysis engines where they belong, sets the time and resource ceilings, and manages the scanner process lifecycle — including the failure modes in this post, which are encoded once in our pipeline rather than rediscovered by every team that adopts these tools.

Authentication is treated as a gate, not a footnote. We verify the session before the scan and surface the result as a first-class signal, because a finding count means nothing without knowing whether the scanner was logged in when it produced it. If the session degraded mid-crawl, you're told.

Findings arrive normalised and deduplicated across the server-side and client-side engines, so a DOM XSS from in-browser taint analysis and a reflected XSS from the proxy layer land in one queue with one severity scale. And because CoreFix carries AI-assisted remediation, a client-side taint flow comes with the fix at the sink.

The upstream ZAP and OWASP PTK projects did the hard work, and they deserve the credit — the Client Spider and PTK are genuinely excellent, and the issues here are the normal cost of adopting capable tools early. What we built on top is the part that makes them repeatable: the difference between a scanner that *can* find these issues and a pipeline that reliably *does*, on every application, on every run.

---

*Issues encountered with ZAP 2.17.0, Client Side Integration and OWASP PTK 0.7.0, in October 2026. The task-lifecycle behaviour in Problem 1 has been reported upstream. Both add-ons are under active development and some of this may already be fixed by the time you read it.*
