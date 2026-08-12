---
title: "Why Spider-Based DAST Scanners Miss Most of Your App (And What HAR Import Fixes)"
description: "A technical breakdown of why crawler-driven scanning structurally can't reach large parts of a modern web app — and what changes when you feed a scanner real, recorded user traffic instead."
author:
  name: V Sai Mahidhar
  # role: Security Engineering
  avatar: /avatars/Mahidhar_img.png
date: 2026-07-15
category: DAST
tags:
  - HAR
  - DAST
  - ZAP
  - Web Scanning
  - Security Testing
featured: false
readingTime: 8
cover: /covers/har-coverage-technical-cover.png
---

# Why Spider-Based DAST Scanners Miss Most of Your App (And What HAR Import Fixes)

*A technical breakdown of why crawler-driven scanning structurally can't reach large parts of a modern web app — and what changes when you feed a scanner real, recorded user traffic instead.*

Most DAST tooling — ZAP's traditional spider, its AJAX spider, and commercial scanners like Qualys WAS and Acunetix — all share the same fundamental discovery model: **point a crawler at the app and let it follow links, forms, and DOM events to find URLs.** This works reasonably well for content-heavy, shallow sites. It works much worse for the kind of application most security teams actually need to test: deep, stateful, ID-driven dashboards where most of the interesting attack surface is several clicks deep behind specific user actions.

This post is about *why* that gap exists structurally, and what we found when we closed it using HAR-based traffic replay instead of relying on crawling alone.

---

## The structural limitation of crawler-based discovery

A spider, no matter how sophisticated, discovers URLs by **following what it can see and click** — links in HTML, forms it can submit, DOM mutations an AJAX spider can trigger via headless browser interaction. This breaks down in a few predictable, common patterns:

**1. Resource IDs that only exist after a prior action.** Consider an endpoint like:

```
GET /api/units/orchid-config?unitId=45623
```

A crawler has no way to *know* that `unitId=45623` is a valid, meaningful ID unless it has already navigated through several prior screens — select a project, drill into a site, select a unit — each step revealing an ID the next request depends on. If any link in that chain is a button triggering a JS event rather than a plain `<a href>`, or if the ID is injected via a state management layer rather than present in the DOM, the crawler simply never constructs that request.

**2. Multi-step dashboards with deep parameter chains.** Real-world enterprise apps often have request chains like:
```
project → customer → site group → site → unit → device → sensor config
```
Each level requires a specific ID from the level above. A spider exploring breadth-first (or even depth-first) has to correctly guess *and* execute an entire multi-step navigation sequence, in the right order, with the right IDs at each step, purely by inference from the DOM. In practice, it gets partway in and stalls — which is exactly what we saw: an AJAX spider run on its own surfaced roughly 1,300–3,300 URLs depending on the run, while a single authenticated user's actual recorded session included **370 unique URLs across 257 distinct paths** that the spider variants had never touched.

**3. Query-string-driven filter states.** Dashboard filter panels routinely produce URLs like:
```
/api/monitoringdashboard/stats?fromTime=2026-07-10 00:00:00&toTime=2026-07-10 23:59:59&project=&sourceEventType=&filterToggle=false
```
These parameter combinations are functionally infinite from a crawler's perspective — it has no signal for which combinations are meaningful without a human (or a script standing in for one) actually setting date ranges, toggles, and filters and observing what gets requested.

**4. This isn't unique to ZAP.** Commercial scanners share the identical constraint, because they use the same fundamental technique — a crawler exploring the DOM. Qualys WAS and Acunetix both offer "recorded login sequence" or "macro" features for exactly this reason: their engineering teams know pure crawling plateaus on real applications. But a recorded login macro alone still only gets you *past authentication* — it doesn't solve the deeper-navigation discovery problem once you're inside the app.

---

## What HAR-based coverage does differently

Instead of asking a crawler to *infer* the app's navigable structure, we record an actual authenticated user session using a Chrome extension (the Corefix HAR capture extension), covering realistic day-to-day usage — browsing projects, sites, units, dashboards, filters — and feed the resulting HAR file(s) directly into the scan as `import` jobs:

```yaml
- name: import-har-0
  type: import
  parameters:
    type: har
    fileName: /zap/wrk/chunk_<timestamp>-clean-0.har
```

Every request the user actually made — with real, valid, contextually correct parameter values — gets added straight into ZAP's Sites tree, ready for passive and active scanning, with zero inference required. No guessing what `unitId` values are valid; the HAR file already contains a real one that the actual app accepted.

### The numbers, before and after

On one recent authenticated scan of a production-style monitoring dashboard app:

| Metric | Spider + AJAX spider only | + HAR import |
|---|---|---|
| Total URL/parameter instances fed to active scan | 39,831 | **64,261** (+61%) |
| AJAX spider's own new discoveries | 1,300–3,300 (varies by run) | 583 |

That AJAX spider number dropping to 583 in the HAR-augmented run isn't a regression — it's the opposite. It means the HAR import had already **pre-seeded the Sites tree so thoroughly** that the AJAX spider found comparatively little left to discover on its own. The overlap between "what a real user does" and "what the app actually contains" is, unsurprisingly, close to total — because it *is* the app, walked by a real person instead of guessed at by a crawler.

### Where it mattered concretely

The URLs uniquely contributed by HAR import were overwhelmingly the deep, ID-chained, multi-step-navigation endpoints described above:

```
/api/units/orchid-config?unitId=45623
/api/monitoringnotes/notesview?unit_id=45623&potentialId=95623
/api/sensorzones/dropdown?unitId=45623
/api/customersitegroups?customerId=245&projectId=574&childSiteGroupTypeId=11
/api/devices?deviceId=2391070&type=Camera
```

None of these are reachable without first having walked through project → customer → site group → site → unit → device in the correct sequence with the correct IDs at each hop — precisely the class of endpoint a spider structurally cannot construct on its own, and precisely where a meaningful share of an app's authenticated attack surface tends to live in practice.

---

## The takeaway for teams relying on crawler-only DAST

If your DAST program — whether that's ZAP, Qualys WAS, Acunetix, or anything else built primarily on crawling — is only ever pointed at the app cold, with no recorded real-session input, you should assume you are testing a **fraction** of the app's actual authenticated surface, and specifically the *shallowest* fraction: the parts reachable without deep, sequential, ID-dependent navigation. The deep dashboard drill-downs, filter-driven queries, and multi-step workflows that make up the bulk of real enterprise application functionality are exactly the parts most likely to be silently skipped.

HAR-based import doesn't replace crawling — it complements it, filling in precisely the gap crawling can't close by design. In our case, doing so increased total scanned URL/parameter coverage by roughly 61%, made up almost entirely of endpoints no automated crawler variant had ever reached across multiple prior scan attempts.

**Practical recommendation:** if you're running authenticated DAST against any application with multi-step, ID-chained navigation — which describes most real internal tools and enterprise dashboards — record a genuine, broad user session (ideally covering as many distinct feature areas as practical) and feed it in as HAR import alongside your spider/AJAX spider jobs. Treat spider coverage as your floor, not your ceiling.
