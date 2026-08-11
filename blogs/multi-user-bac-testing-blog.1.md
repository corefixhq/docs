---
title: "Part 1 — The Hidden Traps of Multi-User Access-Control Testing (and How a Purpose-Built Scanner Sidesteps Them)"
description: "Three failure modes in multi-user BAC testing with custom ZAP — crawl loops, non-comparable runs, and capture-time session bleed — and why each one is invisible until you go looking."
author:
  name: Corefix Team
  role: Security Engineering
date: 2026-08-05
category: DAST
tags:
  - Security
  - AppSec
  - OWASP
  - ZAP
  - Broken Access Control
  - BAC
  - IDOR
  - Web Scanning
featured: false
readingTime: 15
cover: /covers/multi-user-bac-testing-cover.png
draft: false
---

# Part 1 — The Hidden Traps of Multi-User Access-Control Testing (and How a Purpose-Built Scanner Sidesteps Them)

Broken Access Control has sat at the top of the OWASP Top 10 since 2021, and for good reason: it's the one vulnerability class that automated scanners are structurally bad at finding. A scanner can fuzz an input or diff a header on its own. It cannot, by itself, know that *this* object belongs to *that* user — because ownership is a fact about your data model, not about any single HTTP response.

The usual workaround is to script it. Give a scanner two or three authenticated identities, capture each one's traffic, then replay one user's requests carrying another user's session and watch for a `200` where you expected a `403`. OWASP ZAP, with its Automation Framework and a handful of custom Graal.js scripts, can be bent into exactly this shape.

We built that rig. It works. And then we spent several days discovering that almost every hard part of multi-user testing is a trap that doesn't announce itself — the scan completes, the report looks clean, and the findings are wrong. This post walks through the traps we hit, why each one is invisible until you go looking, and how a scanner designed for this problem from the start makes them disappear.

## The setup: three identities, one Juice Shop

Our target was a standard OWASP Juice Shop instance. We ran three configurations of the same custom ZAP automation plan:

- **1 user** — a single authenticated identity. No cross-user oracle.
- **2 users** — admin plus a regular user (`jim@juice-sh.op`). Inject the regular user's session into admin's captured traffic.
- **3 users** — admin, user A (`jim@`), user B (`bender@`). Now three pairs: admin→A, admin→B, and critically A→B.

The intent was an ablation: hold everything constant, vary only the identity count, and measure what multi-user testing buys you over single-user. That intent did not survive contact with the tooling. Here's what went wrong, in the order the failures reveal themselves.

## Trap 1: The crawl that eats itself

The first symptom was mundane — the 3-user report was 1.88 MB versus roughly 300 KB for the others. The cause was not.

Juice Shop, like most modern SPAs, serves a catch-all route: any unmatched path returns `index.html` with a `200`. That HTML references its assets *relatively* — `assets/public/main.js`. So when the app leaks a filesystem path in a stack trace (and it does — `/juice-shop/build/lib/insecurity.js:191:13` appears verbatim in the report), the spider treats it as a link, resolves the relative asset reference against that fabricated directory, gets a `200` with more relative links, and recurses. Forever.

The paths tell the story:

```
/juice-shop/build/lib/assets/public/assets/public/assets/public/...
/juice-shop/node_modules/express/lib/router/assets/public/assets/public/...
```

We had set `maxDepth: 5`. It didn't matter. The traditional spider respected its cap (71 seconds against a 120-second budget). But the **AJAX spider** — the browser-driven one — ran **218 seconds against the same 120-second cap**, an 82% overrun, and added 2,879 URLs on its own. Depth and child limits don't constrain a browser spider; it clicks whatever the DOM renders, and the DOM kept rendering fresh recursive links.

The blast radius, measured from the engine's own statistics rather than the deduplicated report:

| Passive rule | Alerts raised |
|---|---|
| Sec-Fetch headers missing | 28,164 |
| Cacheable content | 7,033 |
| Cross-Domain misconfiguration | 6,687 |
| CORP/COEP headers | 6,557 |
| Timestamp disclosure | 6,826 |

Tens of thousands of alerts, nearly all from looping URLs, collapsed to about five instances each in the final JSON because the report dedupes by rule. The traditional report *hid* the severity of its own poisoned crawl.

**Why it's invisible:** the scan succeeds. The report renders. Unless you diff crawl statistics against duration caps, you never learn that most of your scan budget was spent re-fetching the same three JavaScript bundles under different fictional paths.

**The manual fix** is a set of context-level exclusions — and note they belong on the *context*, not the spider job, because neither spider type has an `excludePaths` parameter; they inherit it by referencing the context. Target-specific patterns (`/juice-shop/.*`) don't generalize, so the durable version is structural:

```yaml
excludePaths:
  # one path segment repeated back-to-back: /assets/assets/
  - .*/([^/]+)/\1(/.*)?
  # two-segment group repeated: /assets/public/assets/public/
  - .*/([^/]+/[^/]+)/\1(/.*)?
  # absurd depth backstop
  - https?://[^/]+(/[^/?]+){15,}.*
```

Plus `inScopeOnly: true` on every AJAX spider job — which, given the 82% budget overrun, is not optional. It is the only control that actually reins in a browser-driven crawl.

## An aside on design: why the crawl is deliberately asymmetric

Before the next trap, it's worth explaining a piece of the rig that looks like an inconsistency until you see the reasoning — because the reasoning is the interesting part.

Our 2-user configuration crawls once, as admin. Our 3-user configuration crawls twice — once as admin, once as the regular user. At a glance that asymmetry looks like drift. It isn't; it's a deliberate optimization grounded in what the crawl is actually *for*.

The crawl exists to produce **baseline authenticated traffic for a victim** — the captured requests whose responses we later diff against when an attacker's token is injected. For any ordered pair (victim, attacker), you replay the victim's real requests carrying the attacker's session and watch for access that should have been denied. The key observation:

**A victim needs captured traffic. A pure attacker does not.**

The attacker contributes only a token — their identity is injected into someone else's requests. So you only need to crawl an identity when it plays the *victim* role in some pair. Walk the pairs:

- **2 users** — the only pair is (admin → regular). Admin is the victim; admin is already crawled. The regular user appears solely as an attacker, injecting its token into admin's traffic. **No regular-user crawl is needed**, and adding one would be wasted budget.
- **3 users** — the pairs are (admin → A), (admin → B), and crucially **(A → B)**. That third pair makes **A a victim**, and A is never a victim in the 2-user case, so A was never crawled. To have A's baseline traffic to inject B into, **A must now be crawled**. Hence the second spider pass — as user A, and only in the 3-user run.

That's not inconsistency; it's crawling exactly the identities that need crawling and no more. The asymmetry is the *correct* shape for the problem. It's the kind of optimization that only becomes visible once you model access-control testing as directed (victim, attacker) pairs rather than "just log in as everyone and scan."

The one caveat we'd flag on our own design: the "admin is already crawled, so admin-as-victim is covered" premise holds only if admin was genuinely crawled *as admin* and the session held throughout. That assumption turns out to be exactly what Trap 3 breaks — but the pairing logic itself is sound.

## Trap 2: The comparison that wasn't a comparison

With the crawl understood, we went back to the original question: is 3-user testing better than 2-user? The 2-user run had found a "Session bypass" category with six instances. The 3-user run had none. Naively, that looks like *fewer* findings from *more* users — a paradox.

It wasn't a paradox. It was three variables moving at once.

Between the two configs we had changed, simultaneously:

1. **Identity count** (2 → 3 users)
2. **Spider passes** (1 → 2 — the deliberate victim-crawl asymmetry from the previous section)
3. **The endpoint list the BAC scripts operate on**

The second one was intentional and correct, as we just walked through — user A needs a crawl in the 3-user case because it becomes a victim. But it's still a variable that changed between runs, and a sound design decision is no less of a confound in an ablation than a sloppy one. The third one, though, was the actual killer. The custom scripts don't test whatever the spider finds; they test an explicit list of URLs defined in the `requestor` jobs. And those lists diverged:

**Present in the 2-user config, removed in the 3-user config:**
```
/rest/2fa/status
/rest/wallet/balance
/rest/order-history
/rest/saveLoginIp
POST /rest/basket/1/checkout
```

**Added in the 3-user config:**
```
/api/Addresss, /api/Addresss/7, /api/Cards
/api/BasketItems/1, /api/Deliverys, /api/Quantitys/
```

Every endpoint in the vanished "Session bypass" finding was in the *removed* set. The category didn't disappear because a third user changed the result. It disappeared because **we stopped testing those endpoints.** The 3-user run found `/api/Cards` and a second write-IDOR precisely because we pointed it at `/api/Cards` — not because of the third identity.

**Why it's invisible:** each run produces a plausible standalone report. Nothing flags that run A and run B tested different surfaces. You only catch it by diffing the automation plans line by line, and even then only if you know to look at the requestor lists rather than the spider config.

The lesson is uncomfortable for anyone running "before/after" scans: **if discovery and the target list are re-derived per run, you are comparing crawls, not comparing coverage.** A defensible comparison requires building one endpoint inventory and replaying that fixed inventory across every identity configuration.

## Trap 3: Capture-time session bleed — the one that produces confident, wrong findings

The first two traps waste time and muddy comparisons. This one puts false vulnerabilities in a client report.

Here is a finding the 2-user run produced, stated with high confidence:

> **Vertical privilege escalation** — low-privilege user `regular-user` reached `/rest/2fa/status` and received a response anchored on `admin@juice-sh.op`.

`/rest/2fa/status` is strictly self-scoped. Jim's own token *must* return `jim@`. For the finding's anchor to match, jim's response literally had to contain admin's email. There are only two explanations: either Juice Shop has a real cross-user leak on a self-scoped endpoint (it doesn't — a `curl` with jim's real token returns jim's data and is actively blocked from admin's objects), or **the "regular-user" probe was not actually carrying jim's identity.**

It was the second. The mechanism:

Under browser-based authentication with `sessionManagement: autodetect`, the script's call to `setRequestingUser(PROBE)` did not reliably swap identity. ZAP handed the "regular-user" probe an **admin-backed session**. So the request labeled "jim" executed as admin, returned admin's data, and the oracle dutifully flagged a cross-user access that never happened. Every request looked authenticated — but the auth-state statistics from the engine tell the real story:

```
state.loggedin  (session verified live):    113   →  1.2%
state.assumedin (session merely assumed): 9,549   → 98.8%
```

For 98.8% of authenticated requests, ZAP never confirmed the session belonged to the intended user. It *assumed* it. And 197 `ConcurrentModificationException` errors from the HttpSender — our four httpsender scripts mutating requests while the AJAX spider fired them in parallel — meant token injection could silently miss on any given request.

### Why the obvious guard didn't catch it

The rig had a safety check: `sessionsDistinct`. Before running a pair, confirm user A's token and user B's token are different strings. They were different. The check passed. The bleed sailed through anyway.

The reason is the single most important lesson of the whole exercise:

**Distinctness is not identity.**

Juice Shop, like most JWT applications, mints a brand-new token on every login — fresh `iat`, different signature, a different string every time. Two consecutive logins *as the same admin* produce two different token strings. `sessionsDistinct` sees two different strings and concludes two different users. But both strings resolve, server-side, to the same principal. Checking that the tokens *differ* proves nothing about *who they belong to*.

### The fix: assert identity, not distinctness

The correct guard costs one request per user per pair. After capturing each user's token, replay the app's identity endpoint — `/rest/user/whoami?fields=email` — with that exact captured token, and confirm it resolves to the *expected* user. If `regular-user`'s token resolves to `admin@`, don't raise a finding. Skip the pair and emit a loud diagnostic.

This turns every BAC finding self-certifying: *"B's token provably belongs to B, yet reached A's object."* It would have caught the `2fa/status` false positive instantly — both sides resolved to `admin@`, identities equal, pair skipped.

A second, deeper fix addresses the root rather than the symptom: inject the orchestrator's real per-user discovery tokens into the script as an explicit constant, so "regular-user" actually carries jim's bearer instead of ZAP's bled admin session — with a graceful fallback to the old behavior when no injected token is present. But the identity assertion is the hard gate that guards either path.

### What survived

Not everything was a false positive. The single-user report, having no cross-user oracle, had no bleed at all, and its findings hold up:

- **Session not invalidated after logout** (CWE-613) — real, single-user, bleed-immune.
- **Public endpoint receiving an unnecessary bearer token** (CWE-522) — real.
- Unauthenticated `/rest/admin/application-configuration` (CWE-306) — real but public-by-design in Juice Shop, correctly hedged.

The cross-user findings were the casualties, and only because the oracle they depended on couldn't prove the identities feeding it.

## The pattern behind all three traps

Step back and the three failures share a shape. In every case:

- The scan **completed successfully**.
- The report **rendered cleanly**.
- The failure was only visible in **secondary diagnostics** — crawl statistics versus duration caps, automation-plan diffs, auth-state ratios buried in an `afEnv` report.

Multi-user access-control testing on a general-purpose scanner isn't hard because the scanner refuses to do it. It's hard because the scanner will happily do it *wrong* and tell you it succeeded. The correctness of the result depends on invariants the tool doesn't know it's supposed to maintain: that the crawl stays bounded, that runs test identical surfaces, that a probe's identity is the identity it claims. Nothing enforces those invariants. You have to know they exist, and check each one by hand, every time.

## How CoreFix abstracts this away

CoreFix's web scanner was built around the assumption that access-control testing is the *primary* job, not a scripting exercise bolted onto a passive scanner. That reframing turns each of the traps above from "a thing the operator must remember" into "a thing the engine guarantees."

**Bounded discovery by construction.** The crawler treats adjacent path-segment repetition and anomalous depth as loop signals natively, independent of any target-specific exclusion list. There is no scenario where a leaked filesystem path becomes 2,879 fabricated URLs, because the loop shape is recognized structurally before the budget is spent. The operator doesn't write regex backreferences; the engine already knows what a crawl loop looks like.

**Directed (victim, attacker) pairs as the native model.** The rig we built arrived, by hand, at the right mental model — access control is tested as ordered pairs, a victim's baseline traffic replayed under an attacker's identity, and you only crawl the identities that play victim. That insight is the correct foundation, and it's baked into CoreFix rather than reconstructed per engagement. The operator declares identities; the engine derives the pairs, works out which identities need baseline capture, and does exactly that much crawling — no wasted passes, no missing baselines.

**Stable inventory across identities.** Discovery of the victim surface runs once and produces a single inventory that every attacker identity replays against. There is no per-run requestor list to drift out of sync, because the target surface is decoupled from the identity dimension by design. A comparison across one, two, or three users is always a comparison of the *same* surface — the ablation the operator wanted is the only thing the tool can produce. The asymmetry we had to reason out and justify becomes an implementation detail the operator never sees.

**Identity as a first-class assertion.** Every captured session is resolved to its true principal before any cross-user test runs. A probe labeled "user B" that resolves to user A is a hard error, not a silent finding. Distinctness checks — the trap that let session bleed through our custom rig — are replaced by identity proofs. Each access-control finding carries its own certification: the acting token provably belonged to the actor, and it still reached the victim's object. There is no assumed-authentication state, because state is verified, not assumed.

**Diagnostics promoted to first-class results.** The signals that were buried — the auth-state ratio, the crawl-versus-budget overrun, the injection failures under concurrency — are surfaced as scan-health indicators, not left for an analyst to reconstruct from a statistics dump. A scan that *ran* but shouldn't be *trusted* says so, loudly, instead of rendering a clean report over a poisoned run.

The custom-ZAP approach taught us exactly what a correct multi-user scanner has to guarantee — because we found each guarantee by watching its absence produce a wrong answer. That's the value of building the hard version by hand once: it turns a vague sense that "access-control testing is tricky" into a precise list of invariants. CoreFix's contribution is making those invariants the default, so the traps that cost us several days of investigation cost the next operator nothing at all.

---

*The findings, statistics, and root-cause analysis in this post come from real scan runs against an OWASP Juice Shop target. Endpoint names and identities are from the standard Juice Shop dataset.*
