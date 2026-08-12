---
title: "Case Study: Boosting DAST Coverage on a SPA with Chrome Recorder HAR Imports (No Custom Tooling Required)"
description: "How a five-minute Chrome Recorder walkthrough surfaced 4.7x more scannable URL-instances and 17.5x more tested injection points than automated crawling alone on a JS-heavy shipping SPA."
author:
  name: Mahidhar
  # role: Security Engineering
  avatar: /avatars/Mahidhar_img.png
date: 2026-07-16
category: DAST
tags:
  - HAR
  - DAST
  - ZAP
  - SPA
  - Case Study
  - Web Scanning
featured: false
readingTime: 6
cover: /covers/har-coverage-case-study-iship-cover.png
---

## Background

We run OWASP ZAP automation-framework scans against a shipping/vessel management SPA (`demo-oq.ishipplus.cloud`) built on a JS-heavy AJAX frontend with a JSON REST API backend. Like most SPAs, meaningful application state — vessel selection, crew rosters, permission screens, filtered lists — sits behind multi-step interaction sequences rather than plain hyperlinks.

ZAP's built-in Spider and AJAX Spider are good at *discovering* URLs by crawling links and firing DOM events, but they have no concept of business logic. They don't know that viewing a crew history requires selecting a vessel first, or that a permissions table only loads after a specific designation is clicked. On JS-heavy SPAs, this caps how much of the real application a spider can ever reach on its own.

## The Change: HAR Import via Chrome's Built-in Recorder

Instead of relying solely on the AJAX Spider for discovery, we recorded a full manual walkthrough of the application using **Chrome DevTools' native Recorder** — no custom scripts, no bespoke crawler, no additional authentication scripting beyond what the scan already used. The exported HAR file was fed into ZAP as an **import job** ahead of the active scan.

That's the entire setup change. Everything else — authentication config, session handling, active scan policy — stayed the same.

## What the HAR Import Captured

```
Total HAR URLs collected: 1109
Unique URLs: 286
Unique paths: 230
```

```
stats.exim.importer.har.count: 537
stats.auto.job.import.run: 45
```

537 real, browser-executed requests were imported across 45 batches — every one of them a request the application actually made during genuine authenticated use, including AJAX/API calls a spider would otherwise have to accidentally stumble into by chance.

## Coverage: Before vs. After

| Metric | Automated crawl only (best run) | HAR-augmented run | Change |
|---|---:|---:|---:|
| Active scan URL-instances (`stats.ascan.urls`) | 45,616 | 212,813 | **~4.7x** |
| Successful network requests sent | 84,404 | 234,142 | **~2.8x** |
| OAST (out-of-band) payloads generated | 130 | 2,272 | **~17.5x** |
| Active scan total time | ~50 min | ~127 min | scales with coverage |

The **OAST payload jump is the most telling number**. Out-of-band payloads are generated for blind/async vulnerability classes — blind SQLi, SSRF, blind command injection — that only get tested when the scanner actually reaches the injectable parameter in the first place. A 17.5x increase in OAST payloads means the scan found and tested vastly more real injection points than crawling alone ever surfaced, because those parameters live behind interaction sequences a spider doesn't naturally trigger (filtering a vessel list, expanding a crew roster, updating a designation's permissions, etc.).

## Why This Works Especially Well on SPAs

The AJAX Spider simulates clicks and DOM events, but it's fundamentally guessing. It has no model of the application's business rules — it can't know that a permissions API only returns data after a designation is selected from a dropdown that itself only appears after a role filter is applied. A human walking through the app once, doing exactly what a real user does, sidesteps this problem entirely. The HAR capture is a verbatim record of legitimate application state transitions — no reverse-engineering required.

In other words: **the harder an app is for a spider to model, the more a five-minute manual HAR recording is worth.**

## An Honest Caveat

Scope wasn't perfectly identical between the two runs compared above — several `excludePaths` for RBAC/permission endpoints were added in the HAR-augmented run. So the full 4.7x jump in URL-instances isn't attributable to HAR import alone. That said, the HAR import numbers (537 imported entries, 45 import jobs) are large, directly measurable, and the qualitative shift — dramatically more OAST payloads reaching real injectable parameters — lines up exactly with what you'd expect from filling in the gaps a spider misses on a JS-heavy SPA.

## Takeaway

A single manual walkthrough recorded through Chrome's stock Recorder — zero custom tooling, zero extra scripting — surfaced roughly **4.7x more scannable URL-instances** and **~17.5x more tested injection points** than automated crawling alone on this AJAX-heavy application. The cost was proportionally longer scan time (not a stall — the numbers scale together), which is a reasonable trade for meaningfully deeper coverage of real application logic.

**Practical recommendation:** for any SPA where core functionality is gated behind multi-step flows, pair your DAST spider with a short manual HAR recording before the active scan. It's minutes of manual effort for a large, measurable jump in real coverage.
