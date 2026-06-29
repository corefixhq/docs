---
title: "Security Testing Was Built for a World That No Longer Exists"
description: "A new report confirms what shipping teams already feel: pentests are stale, coverage is invisible, and nobody retests after fixes. Here's what the data says — and what to do about it."
author:
  name: Corefix Team
  role: Security Engineering
date: 2026-06-25
category: Security Research
tags:
  - Security Testing
  - Pentesting
  - DAST
  - AI Security
  - DevSecOps
featured: false
readingTime: 8
cover: /covers/security-test-light.png
---

# Security Testing Was Built for a World That No Longer Exists

*A new report confirms what shipping teams already feel: pentests are stale, coverage is invisible, and nobody retests after fixes. Here's what the data says — and what to do about it.*

---

Aikido Security published their *State of AI in Pentesting* report last week. The findings are uncomfortable but not surprising to anyone shipping software in 2026.

The headline stat: 84% of teams deploying multiple times per day say their pentest findings are outdated by the time they arrive. Not slightly behind — fundamentally irrelevant. The system that was tested doesn't exist anymore.

This isn't a tooling problem. It's a structural mismatch. Security testing was designed around quarterly assessments and monthly release cycles. Software delivery now operates in hours. The gap between those two realities is where vulnerabilities live, undetected, until they become incidents.

Let's look at what the report actually found and what it takes to close that gap.

---

## The Speed Problem Is Worse Than It Sounds

The obvious reading of the report is "pentests are too slow." But the data reveals something more specific.

Only 21% of organizations validate security on every release. The other 79% are deploying code that has never been tested against the version that's actually running. Every deployment between assessments is a gamble — and 96% of organizations acknowledge they're concerned about vulnerabilities slipping through between scheduled tests.

The Lovable CEO put it plainly in the report: teams go from idea to production in hours. When security testing takes weeks to return results, you're testing a system that no longer exists.

This isn't about pentesting being bad. A skilled penetration tester finds things automated tools miss — business logic flaws, complex multi-step attack chains, social engineering vectors. The problem is using pentesting as your *primary* security validation mechanism when you deploy 10 times a day. It's like using a building inspector to check every brick as it's laid. The inspector is valuable, but not at that frequency.

What's needed is automated, continuous validation that runs at deployment speed — with pentesting reserved for the deep, periodic assessments it's designed for.

CoreFix runs 10+ security scanners on every push, every pull request. SAST, secrets detection, dependency scanning, infrastructure-as-code checks, container scanning, and DAST against your live application — all in parallel, all finishing in under 4 minutes. Not a replacement for annual pentests. A replacement for the 364 days between them where nothing gets tested.

---

## Nobody Knows What Was Tested

This stat from the report deserves its own section: 52% of organizations lack visibility into what was tested during a penetration test.

Half of all organizations pay for security testing and don't know what was covered. Was the `/admin` endpoint tested? Was the payment flow tested with authenticated sessions? Were the API endpoints behind the mobile app included? Nobody knows. The pentest report lists what was *found*, not what was *checked*.

This creates a dangerous assumption: "The pentest came back clean, so we're secure." But if the pentest only covered 60% of the application surface, "clean" means "clean in the parts we looked at." The other 40% is unknown.

CoreFix approaches this differently. Every scan produces a coverage report — which endpoints were tested, which were missed, which exist in your codebase but aren't documented. Our API Intelligence feature specifically compares recorded traffic against your OpenAPI specification to surface three categories:

Endpoints that were tested and are documented — your known, validated surface.

Endpoints that are documented but were never accessed — your untested attack surface. These exist in the spec, they're presumably implemented, but nobody has tested them. Not the pentest vendor, not your QA team, not even manually.

Endpoints that were accessed but aren't documented — shadow APIs. Debug routes, admin panels, beta features shipped without documentation. These are the endpoints attackers find first because they're the ones nobody reviewed.

The coverage gap isn't a mystery you discover after an incident. It's a metric you see on every scan.

---

## Fixes Don't Get Verified

The report found that only 40% of organizations promptly verify that vulnerabilities are actually fixed after remediation. The other 60% are operating on assumption — the developer said they fixed it, the ticket got closed, and nobody confirmed the vulnerability is actually gone.

This happens because retesting is manual, expensive, and slow. If you paid for a pentest and received 15 findings, verifying each fix means either paying for another pentest or manually reproducing each vulnerability. Most teams do neither. They close the ticket and move on.

CoreFix eliminates this entirely through continuous scanning. When a developer merges a fix, the next commit triggers a full scan. If the vulnerability is resolved, the finding disappears from the dashboard. If the fix was incomplete or introduced a regression, the finding persists or a new one appears. No manual retesting. No assumptions. Every fix is verified automatically on the next deployment.

This also solves a subtler problem the report highlights: fix validation across the full application. A developer fixes a SQL injection in one endpoint. But the same pattern exists in three other endpoints they didn't know about. A point-in-time pentest would only have flagged the one it found. Continuous scanning catches all four, and continues flagging the remaining three after only one is fixed.

---

## AI Is Creating Security Problems, Not Just Speed Problems

The report's most forward-looking finding: 76% of organizations have had to stop, restrict, or roll back AI-driven behavior in the past 12 months. And 71% said AI or automation made a security issue harder to detect, investigate, or fix.

This goes beyond "AI writes code faster." AI is being embedded into products — chatbots, recommendation engines, document processing, automated workflows. These AI features introduce a new category of security surface that traditional scanners don't cover:

Prompt injection — where user input manipulates the AI's behavior in unintended ways.

Data leakage — where the AI reveals information from its training data, RAG context, or other users' sessions.

Missing guardrails — no output validation, no content filtering, no rate limiting on AI API calls.

Supply chain risk — which models are embedded, from which providers, at which versions, with which known vulnerabilities.

Traditional SAST and DAST tools don't know what an LLM is. They can't flag "this user input is concatenated directly into a prompt template without sanitization" because that's not a pattern they were built to detect.

CoreFix is building AI-specific security capabilities to close this gap. AI BOM (Bill of Materials) inventories every AI component in your codebase — which models, which providers, which frameworks, which data stores are connected. It extends your existing SBOM with an AI-specific layer so compliance teams get a complete picture of both software and AI dependencies.

AI Governance scanning applies static analysis rules specifically designed for AI integration patterns — missing observability on AI calls, sensitive data flowing into prompts without redaction, AI outputs returned to users without validation, no cost controls on inference API calls. Each finding maps to specific governance frameworks (EU AI Act, NIST AI RMF) so it's not just a developer concern but a compliance deliverable.

The 76% of organizations rolling back AI behavior are doing it reactively — after something went wrong. Scanning for AI-specific security issues before deployment is how you avoid being in that statistic.

---

## Triage Is Where Progress Stalls

The report identifies a bottleneck that tools rarely address: even after a finding is validated, assigning it to the right owner creates friction. Security teams find the vulnerability. Then they need to figure out which team owns that code, create a ticket, prioritize it against feature work, and hope it gets addressed before the next assessment.

This handoff is where findings go to die. The report calls it friction. In practice, it's a 47-day average time from finding to fix across the industry.

CoreFix collapses this by generating production-ready fix PRs. The finding isn't a Jira ticket that needs triage, assignment, sprint planning, and eventual attention. It's a pull request opened against the right repository, on the right branch, with the exact code change needed — before/after diffs, line-level explanations, and a confidence score. The "owner" is whoever owns that repo. The "triage" is reviewing the diff. The "remediation" is clicking merge.

This changes the relationship between security findings and engineering time. A traditional finding says "you have a SQL injection on line 42 of auth.js." CoreFix says "here's a PR that replaces the template literal with a parameterized query on line 42 of auth.js, with 98% confidence this resolves the issue without breaking functionality." One creates work. The other completes it.

---

## What Continuous Actually Means

The report concludes that security leaders want more frequent validation — most prefer quarterly, some biannual. This is an improvement over annual pentesting, but it still accepts the fundamental premise that security testing is periodic.

Continuous doesn't mean quarterly. It means every commit. Every pull request. Every deployment. The same way continuous integration means every push triggers a build, continuous security means every push triggers a scan.

CoreFix runs on every push to your repository. SAST scans your code changes. Secrets detection scans your commit. Dependency scanning checks your lockfile. Infrastructure scanning checks your Terraform and Kubernetes configs. Container scanning checks your Docker images. DAST attacks your live application. All in parallel, all in under 4 minutes, all producing deduplicated, AI-prioritized findings with auto-generated fix PRs.

The report's data makes the case clearly: periodic testing leaves gaps, findings arrive stale, fixes don't get verified, and AI is introducing new categories of risk that existing tools don't cover. The answer isn't faster pentests. It's security validation that runs at the speed of deployment.

---

*CoreFix scans your code, your web app, your containers, your APIs, and your AI stack in one pipeline. 10+ scanners, deduplicated findings, auto-fix PRs. First results in 4 minutes.*

*[Get started free →](https://corefix.dev)*
