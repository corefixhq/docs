---
title: "From 10 Findings to 22: What ZAP's Client Spider and OWASP PTK Actually Changed"
description: "A before-and-after case study on an authenticated Next.js application: same target, same ZAP version, same credentials — only the crawling and scanning stack changed. Finding instances went up 4.4x, and the caveats matter as much as the numbers."
author:
  name: Mahidhar
  # role: Security Engineering
  avatar: /avatars/Mahidhar_img.png
date: 2026-09-23
category: DAST
tags:
  - ZAP
  - OWASP PTK
  - Client Spider
  - DAST
  - IAST
featured: false
readingTime: 8
cover: /covers/client-spider-ptk-case-study-cover.png
---

**A before-and-after case study on an authenticated Next.js application**

In July 2026 the ZAP project changed its long-standing recommendation: the Client Spider replaces the AJAX Spider for crawling modern web applications. Around the same time, the OWASP PTK add-on reached beta, bringing in-browser SAST, IAST and DAST engines to automated scans.

We rebuilt one of our authenticated scan pipelines around both and ran it against the same target we had scanned two weeks earlier with our previous configuration. Same application, same build, same credentials, same authentication method, same ZAP version (2.17.0). Only the crawling and scanning stack changed.

The results were not marginal.

## The Target

A mid-sized enterprise SaaS application: a Next.js single-page frontend talking to a REST API, behind a cookie-based login. Roughly 100 discoverable endpoints. This is the archetype of the application class that traditional proxy-based scanning handles worst — most of the logic lives in JavaScript that a proxy never gets to interpret.

One statistic from the second run frames the whole problem: **52% of all discovered endpoints served `application/javascript`**. Only 5% served HTML. A scanner that reasons purely about HTTP requests and responses is, by construction, blind to the majority of what that application does.

## Run A — The Conventional Setup

Traditional spider plus AJAX Spider, ZAP's standard active and passive rule packs, browser-based authentication with poll verification.

## Run B — Client Spider Plus PTK

Traditional spider retained (it finds a different endpoint set and ZAP recommends running both), AJAX Spider replaced with the Client Spider, PTK's SAST and IAST engines running passively during the crawl, PTK's DAST engine running inside the active scan against the Client Map.

## The Numbers

| Metric | Run A | Run B |
|---|---|---|
| Distinct alert types | 10 | 22 |
| High risk | 1 | 7 |
| Medium risk | 2 | 5 |
| Low risk | 0 | 7 |
| Informational | 7 | 3 |
| Total finding instances | 12 (+2 systemic) | 53 (+3 systemic) |
| Distinct application URLs with findings | 12 | 36 |

Finding instances went up **4.4x**. The number of distinct URLs where something was actually found went up **3x**.

## Where the Extra Findings Came From

**The client-side layer that was previously invisible.** PTK's browser-resident engines produced ten alert types that no proxy-based scan can reach:

- DOM-based XSS via taint flow — 7 instances
- Template injection via taint flow — 2 instances
- DOM-based link manipulation — 2 instances
- Untrusted DOM data reaching navigation-adjacent sinks — 2 instances
- Data exfiltration through XMLHttpRequest headers and image beacons
- `postMessage` calls without `targetOrigin`
- AngularJS interpolation delimiters inside a template string
- Internal IP addresses, localhost references and staging environment hints leaking into responses

IAST tracks taint at runtime, following data from a source such as the URL, `postMessage` or `localStorage` through to a dangerous sink. SAST reads the JavaScript bundles as each page loads. Neither sends a single extra request. In ZAP's terms they behave passively — you get the coverage as a side effect of crawling.

**The part people don't expect: ZAP's own rules got better too.** Two of the new findings came from ZAP's standard active scanner, not PTK:

- SQL Injection (SQLite, time-based) — 7 instances
- Insecure HTTP method DELETE exposed — 11 instances

Those rules were enabled in Run A as well. They found nothing because the crawler never handed them the endpoints. A better crawl doesn't just improve client-side coverage; it improves server-side coverage, because the active scanner can only attack what discovery gives it.

## What We're Not Claiming

Three honest caveats, because a case study that only reports wins isn't a case study.

**Informational alerts went down, not up.** Run A reported five technology-fingerprinting alerts that Run B did not. That's a configuration artefact on our side, not evidence of anything, and it's a reminder that a rebuilt pipeline needs a diff against the old one rather than a glance at the risk totals.

**Authentication degraded during the longer crawl.** Both runs authenticated cleanly at startup — all five auth checks passed in both, with the session token correctly identified. But the full Run B scan logged a **20% authentication failure rate**. The Client Spider has no logout-avoidance parameter, so a browser that clicks the wrong element can end the session. ZAP's poll verification re-authenticated, but a fifth of the requests went out unauthenticated. Some findings therefore came from logged-out states, and coverage of authenticated areas was incomplete. This is the single biggest thing to fix, not the finding count.

**The PTK add-on is beta and behaves like it.** Our run logged 161 errors, of which 160 came from PTK's alert handler. The scan completed and the findings landed, but this is a young integration.

**Time-based SQL injection needs manual confirmation.** Time-based detection infers from response latency. In a run with a 20% auth failure rate and browser-driven load, latency is noisy. We don't put a time-based SQLi in a client report without reproducing it by hand.

## The Part Nobody Puts in the Blog Post

Getting from Run A to Run B was not a one-line change. It required:

- A ~200-line automation plan with an explicit context, include and exclude path regexes, browser-based authentication, a poll verification URL with logged-in and logged-out regexes tuned to the app's own JSON payloads, and custom poll headers
- A separate diagnostic phase that authenticates, probes a protected endpoint and emits an auth report — run *before* trusting a single finding
- Installing and pinning the right add-ons, since the container's persisted home directory silently keeps stale versions
- Knowing that PTK's engine placement is configured outside the plan, that SAST and IAST belong in the Client Spider while DAST belongs in the active scan rule, and that recommended defaults exist specifically to stop PTK duplicating ZAP's own SQLi and XSS findings
- Per-rule and per-job time caps, discovered the hard way when a browser-driven rule ran for hours
- Container tuning that has nothing to do with security — headless Firefox crashes on Docker's default 64 MB `/dev/shm`
- Crawl timing tuned to the framework: hydration delays, per-page load waits, post-click waits so XHRs actually fire

Every one of those is a place where a scan silently produces a clean-looking report that means nothing. An unauthenticated crawl still generates a report. A spider that logged itself out on page three still generates a report. That's the real failure mode of DIY scanner automation: not errors, but confident emptiness.

## How CoreFix Handles This

CoreFix exists so this configuration work isn't yours to do.

You supply a target and credentials. CoreFix determines the application profile, selects the crawling strategy, places the in-browser analysis engines where they belong, sets the time and resource ceilings, and runs the authentication diagnostic before the scan proper — then surfaces the result of that diagnostic as a first-class signal rather than a statistic buried on page four of an HTML report. If the session degraded mid-crawl, you're told, because a finding count is worthless without knowing whether the scanner was logged in when it produced it.

Findings arrive normalised and deduplicated across the server-side and client-side engines, so a DOM XSS from in-browser taint analysis and a reflected XSS from the proxy layer sit in one queue with one severity scale, not two reports in two formats. And because CoreFix carries AI-assisted remediation, a client-side taint flow comes with the fix at the sink, not just a stack trace.

The upstream ZAP and OWASP PTK projects did the hard work here, and they deserve the credit. What we've built on top is the part that makes it repeatable: the difference between a scanner that *can* find these issues and a pipeline that reliably *does*, on every application, on every run, without a security engineer hand-tuning YAML for an afternoon first.
