---
title: "We Spent 3 Days Tuning OWASP ZAP So You Don't Have To"
description: "How a controlled DVWA experiment exposed DAST configuration complexity—and how policy tuning alone produced a 700% improvement in SQL injection detection."
author:
  name: Corefix Team
  role: Security Engineering
date: 2026-05-27
category: DAST
tags:
  - ZAP
  - DAST
  - Web Scanning
  - OWASP
  - Security Testing
featured: true
readingTime: 8
cover: /covers/zap-tuning.png
---

**How a simple DVWA scan exposed the hidden complexity of DAST and why we built Corefix to eliminate it.**

---

Every security team knows the promise of DAST tools: point a scanner at your app, hit run, get vulnerabilities. The reality? We recently ran a controlled experiment against DVWA (Damn Vulnerable Web Application) using OWASP ZAP's automation framework — a deliberately vulnerable app where SQL injection should be trivially detectable. What we found was a masterclass in how configuration complexity silently kills scan quality.

This is the story of three days, five scan iterations, and a 700% improvement in vulnerability detection — all from config changes alone. No new tools. No new plugins. Just YAML.

## The Setup

Our target was DVWA running on a remote server at security level "low" — the easiest difficulty setting, where every vulnerability category should be wide open. We configured ZAP's automation framework with authenticated scanning: form-based login, PHPSESSID cookie management, anti-CSRF token handling, HAR file imports from prior crawls, and a full suite of active and passive scan plugins.

On paper, this should have been straightforward. In practice, it was anything but.

## Run 1: The False Confidence Problem

Our first scan completed in 9 minutes with 41 vulnerabilities. For a deliberately vulnerable application with known SQL injection, XSS, command injection, file inclusion, and file upload flaws — 41 findings felt suspiciously low. More importantly, SQL injection was barely represented.

The scan *looked* successful. Authentication reported as working. The spider found 592 URLs. The automation plan reported "succeeded." But the active scanner finished in a fraction of the allocated 45-minute window — a red flag we almost missed.

**What went wrong:**

The first issue was subtle — a `maxAlertsPerRule: 5` setting that capped each scan rule at just 5 findings before skipping remaining URLs. When a rule like SQL Injection finds its fifth alert on the third URL, it silently stops testing the remaining 840+ URLs. The scan "completes successfully" while leaving the vast majority of the attack surface untested.

The second issue was more insidious. We had excluded `login.php` from the scan scope — a reasonable-sounding decision to avoid scanning the login page itself. But ZAP *needs* `login.php` in scope to perform re-authentication when sessions expire mid-scan. Without it, session drops during active scanning left the scanner hitting unauthenticated redirects instead of vulnerable pages.

## Run 2: Lifting the Alert Cap

We increased `maxAlertsPerRule` from 5 to 50. The results shifted immediately:

- User Agent Fuzzer alerts jumped from 5 to **52**
- Cookie Slack Detector went from 5 to **53**
- Advanced SQL Injection rose from 9 to **18**
- Cross-Site Scripting climbed from 5 to **8**
- Total URLs scanned increased from 14,527 to **23,957**

But core SQL Injection (rule 40018) stubbornly stayed at 3 alerts. The cap wasn't the only bottleneck.

## Run 3: Policy Tuning — Where the Real Gains Live

This is where things got interesting. ZAP's default scan policy uses "medium" strength and threshold for all rules. For a deliberately vulnerable application, this means the scanner sends a moderate number of payloads per parameter and requires moderate confidence before flagging an issue.

We added a `policyDefinition` to the active scan configuration:

```yaml
policyDefinition:
  defaultStrength: medium
  defaultThreshold: medium
  rules:
    - id: 40018    # SQL Injection
      strength: insane
      threshold: low
    - id: 40019    # SQL Injection (MySQL)
      strength: high
      threshold: low
    - id: 40012    # Cross-Site Scripting (Reflected)
      strength: insane
      threshold: low
```

The impact was dramatic:

| Metric | Run 1 | Run 3 | Improvement |
|--------|-------|-------|-------------|
| SQL Injection alerts | 3 | **24** | 700% |
| SQLi URLs tested | 844 | **1,743** | 106% |
| Advanced SQLi alerts | 9 | **25** | 178% |
| XSS alerts | 5 | **9** | 80% |
| New XSS findings (rule 40023) | 0 | **6** | — |
| SSTI alerts | 1 | **2** | 100% |
| Total active scan URLs | 14,527 | **29,470** | 103% |
| Total network requests | 16,762 | **32,755** | 95% |

The scan still completed in 14 minutes — well within the 45-minute cap — but with more than double the coverage and 700% more SQL injection findings. Same application. Same ZAP version. Same plugins. Just different YAML.

## The Hidden Bottleneck We Almost Missed

Even after three iterations, there was still a problem lurking. The `sqliplugin` add-on (rule 40019) was generating 144 warnings in the logs and hitting the `maxRuleDurationInMins: 5` ceiling — spending all 5 minutes but only managing to test 30 URLs before being forcibly terminated. Meanwhile, it was throwing `ZapSocketTimeoutException` errors, suggesting that time-based SQL injection tests were consuming the entire rule budget on network timeouts rather than actual vulnerability testing.

This is the kind of issue that requires reading raw statistics JSON, cross-referencing rule IDs with plugin documentation, and understanding the interaction between timeout configurations, rule duration caps, and network latency. It is not the kind of thing most development teams — or even most security teams — have time to investigate.

## What This Means for Real-World Scanning

DVWA is a toy application with a handful of pages. A production application with hundreds of endpoints, complex authentication flows, API integrations, and dynamic content multiplies every one of these configuration challenges. Consider what we had to get right just for this simple scan:

- **Authentication configuration**: form-based login with anti-CSRF token extraction, session cookie management with the correct security level parameter, verification polling with regex matching, and correct scope inclusion of the login page for re-authentication
- **Scope management**: knowing which paths to exclude (logout, setup, CSRF pages) without accidentally excluding paths the scanner needs
- **Spider tuning**: balancing crawl depth, child limits, and duration across both traditional and Ajax spiders
- **Scan policy**: per-rule strength and threshold settings that match the application's technology stack and vulnerability profile
- **Alert management**: understanding that alert caps silently truncate coverage
- **Rule duration limits**: balancing thoroughness against time-based injection tests that consume entire budgets on timeouts
- **Plugin selection**: choosing from dozens of add-ons (and discovering that some like `frontendscanner` no longer exist)
- **Result interpretation**: reading raw statistics JSON to identify silent failures that the "succeeded" status hides

Each of these is a potential point of failure that produces no error message — just silently degraded results.

## Why We Built Corefix

This experiment crystallized what we had long suspected: the gap between "running a DAST scan" and "running an effective DAST scan" is enormous, and it is almost entirely a configuration problem.

Corefix eliminates this gap. Instead of days of YAML tuning, iterative test runs, and statistics analysis, Corefix delivers comprehensive authenticated scanning with:

- **Zero configuration**: no YAML files, no policy tuning, no rule-by-rule strength adjustments
- **Automatic authentication handling**: session management, token extraction, and re-authentication handled out of the box
- **Intelligent scan policies**: dynamic adjustment of scan depth and payload selection based on the application's technology fingerprint
- **Complete coverage by default**: no silent alert caps, no premature rule termination, no scope misconfigurations
- **Results in minutes**: what took us 3 days and 5 iterations to achieve with ZAP, Corefix delivers in under 2 minutes

The vulnerabilities don't change based on your scanner configuration. SQL injection is SQL injection whether your YAML has `strength: insane` or `strength: medium`. The only question is whether your tool finds it — and whether you have days to spend making sure it does.

**Corefix makes sure it does. Every time. Without the YAML.**

---

*Corefix is built for security engineers who want results, not configuration files, and for development teams who need DAST coverage without becoming DAST experts. [Try Corefix today →](https://app.corefix.dev)*
