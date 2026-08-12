---
title: "Case Study: Finding the Vulnerabilities Automated Crawling Missed"
description: "How recorded-session coverage uncovered attack surface that repeated automated scans had never touched — and what that meant for the client's actual risk picture."
author:
  name: V Sai Mahidhar
  # role: Security Engineering
  avatar: /avatars/Mahidhar_img.png
date: 2026-07-15
category: DAST
tags:
  - HAR
  - DAST
  - Case Study
  - Vulnerability Assessment
  - Web Scanning
featured: false
readingTime: 7
cover: /covers/har-coverage-case-study-cover.png
---

# Case Study: Finding the Vulnerabilities Automated Crawling Missed

*How recorded-session coverage uncovered attack surface that repeated automated scans had never touched — and what that meant for the client's actual risk picture.*

## The starting point

A client engaged us for an authenticated web application penetration test on a production-style monitoring and dashboard platform — the kind of internal enterprise tool most organizations run, with layered navigation across projects, customers, sites, units, devices, and configuration screens. Access to any given screen typically required drilling through several prior selections: pick a project, pick a customer, pick a site group, pick a site, pick a unit, and only then reach the device- or sensor-level configuration pages where a lot of the interesting functionality — and a lot of the risk — actually lives.

Standard practice for a job like this is an authenticated DAST pass: log the scanner in, let it crawl the app, run active scanning rules against whatever it finds. That's exactly where we started.

## What automated crawling alone found

Running a properly configured authenticated scan — correct login flow, correct session handling, spider and AJAX spider both enabled — is table stakes, and we had that working cleanly. But the coverage numbers told an important story on their own: across several scan iterations, the combined spider and AJAX spider discovered somewhere in the range of 1,300 to 3,300 URLs per run, out of an application that, as we'd later confirm, had far more genuine authenticated surface than that.

This isn't a knock on the tooling. It's a structural limitation shared by essentially every crawler-driven scanner on the market, commercial or open-source. A crawler discovers what it can see and click. It cannot infer a valid `unitId` or `siteId` it's never encountered, and it cannot reliably reconstruct a five-step navigation sequence (project → customer → site group → site → unit) purely by exploring the DOM. The deeper and more stateful an application's navigation model, the more of its surface sits beyond what any crawler will find on its own — regardless of budget, timeout settings, or scan depth configuration.

## Closing the gap: recording a real session

Rather than accept crawler coverage as the ceiling, we had an analyst walk through the application as a genuine user would — browsing projects, drilling into specific sites and units, opening device configuration panels, applying dashboard filters, checking reports — using our HAR capture Chrome extension running in the background. This produced a set of HAR files capturing exactly what a real, broad usage session looks like: every request, with real and valid parameter values, in the order a genuine workflow would produce them.

We fed that recorded traffic directly into the scan as import jobs alongside the existing spider and AJAX spider configuration — not as a replacement for automated crawling, but layered on top of it.

## The result

The combined authenticated scan's total URL/parameter coverage grew from roughly 40,000 instances to just over 64,000 — an increase of about 61% in a single step. Critically, this wasn't 61% more of the same shallow content the crawler had already found; it was almost entirely new, previously unreached territory: deep configuration endpoints, unit- and device-specific detail views, multi-parameter dashboard filter states, and nested drill-down screens that no prior crawler-based attempt — across multiple scan runs — had ever surfaced.

With that expanded surface in scope for active scanning, our SQL injection detection rules identified a genuine, exploitable finding: a boolean-based blind SQL injection vulnerability on an internal analytics API endpoint, reachable only through one of the deep, ID-chained paths that had never previously been part of any scan's tested surface. The vulnerable parameter sat several navigation steps deep — precisely the category of endpoint this engagement's HAR-based approach was designed to surface.

## Why this matters beyond one finding

The broader lesson for the client — and for any organization relying primarily on automated, crawler-driven DAST — wasn't really about one SQL injection. It was about what the coverage gap represented: a meaningful share of the application's actual authenticated attack surface had been effectively untested across prior scanning efforts, not because of a misconfiguration, but because of an inherent limitation in how crawler-based discovery works against deep, stateful, ID-driven applications.

This is a pattern we see repeatedly across engagements involving multi-step enterprise dashboards, internal tooling, and B2B SaaS platforms with role- and hierarchy-based navigation: the deepest, most operationally significant screens are frequently the ones furthest from a crawler's reach, and therefore the ones most likely to have gone unscanned in prior assessments — including ones run with well-known commercial scanning platforms, which share the same underlying crawl-based discovery model.

## Takeaway for security teams

If your organization's DAST program depends on crawler discovery alone — whether that's an open-source tool or an established commercial scanner — treat the resulting coverage as a **floor, not a ceiling**, particularly for applications with sequential, ID-dependent navigation. Recording genuine, broad usage sessions and importing them alongside automated crawling closed a substantial coverage gap for this client in a single step, and directly led to identifying a real, exploitable vulnerability that had gone undetected through repeated automated scanning alone.

For applications of meaningful depth and complexity, "the scanner didn't find anything" is not the same statement as "there's nothing to find" — it may simply mean the scanner never got there.
