---
title: "You Shipped in a Weekend. You'll Get Sued on Monday."
description: "The vibe coding era has a security problem — and prompting your AI to 'check for vulnerabilities' isn't fixing it."
author:
  name: Corefix Team
  role: Security Engineering
date: 2026-06-26
category: Security Research
tags:
  - Vibe Coding
  - AI Security
  - DAST
  - DevSecOps
  - Security Testing
featured: false
readingTime: 9
cover: /covers/vibe-coding-light.png
---

# You Shipped in a Weekend. You'll Get Sued on Monday.

*The vibe coding era has a security problem — and prompting your AI to "check for vulnerabilities" isn't fixing it.*

---

A post went viral last week. A developer with 20+ years of experience shared a pre-launch security checklist for AI-assisted builders. The reactions were split. Half the replies said "this is obvious." The other half said "I shipped last week without doing any of this."

That second group is the one getting sued.

The post itself was solid advice — enable Row Level Security, test failure paths, validate on the server, don't put API keys in the frontend. All correct. But the recommended solution for most of these was the same: prompt your AI to check for it.

Here's the problem with that approach: **the AI that wrote the vulnerability is not going to reliably find the vulnerability.**

This isn't a knock on AI-assisted development. We use it. Our customers use it. It's genuinely faster. But there's a difference between using AI to build and using AI to verify what it built. That's asking the student to grade their own exam.

Let's walk through what actually goes wrong and what actually fixes it.

---

## "Review my app as a security specialist"

This is point 4 from the checklist. The idea is to paste your code into an LLM and ask it to find security issues.

This works sometimes. It catches the obvious stuff — a missing CORS header, an exposed secret in a config file, a SQL query built with string concatenation. But it has three fundamental limitations that make it dangerous to rely on as your security strategy.

First, it's non-deterministic. Run the same prompt twice, get different results. A real scanner produces the same output every time. You need that consistency to know when something new appears or when a fix actually resolved the issue.

Second, it has no runtime context. An LLM reading your source code can't tell you that your `/api/admin/reset-cache` endpoint is actually reachable from the public internet, or that your authentication middleware has a bypass on three routes you forgot about, or that the npm package you installed last week has a known critical CVE. Static code review — whether human or AI — misses entire categories of vulnerabilities that only surface when the app is running.

Third, it hallucinates findings. It'll flag something as "critical SQL injection" when the code is actually using parameterized queries correctly. And it'll miss an actual injection three lines down because the pattern didn't match what it learned in training. You can't triage findings you can't trust.

The right model is: deterministic scanners find the issues, AI explains them and generates fixes. That's what CoreFix does — 10+ security scanners running in parallel, findings deduplicated and AI-prioritized, with production-ready fix PRs opened automatically.

---

## The Checklist, Automated

Let's map the viral checklist against what actually catches each issue at scale.

**Row Level Security (point 2).** "Open DevTools and read your entire database" isn't hypothetical — it happens every week to Supabase apps shipped without RLS policies. This is a configuration issue, not a code issue. CoreFix's infrastructure-as-code scanner (KICS) catches missing security policies in your Supabase config, Terraform files, and cloud resource definitions. Not just "you should enable RLS" — it tells you which tables are exposed and generates the policy to fix it.

**Test the failure paths (point 3).** Wrong password 5x, reset for nonexistent emails, duplicate signups. These are authentication bypass vectors. CoreFix's web scanner (ZAP) runs authenticated scans against your live application, testing exactly these flows — not as a manual checklist but as automated attack simulation. Every time you push code, not just when you remember to test.

**OWASP vulnerabilities (point 5).** SQL injection, XSS, broken authentication, broken access control. This is the core of what DAST scanners do. CoreFix runs OWASP ZAP and Nuclei against your live app, testing for the full OWASP Top 10. But here's what the checklist misses: OWASP Top 10 isn't something you check once before launch. New code introduces new vulnerabilities. CoreFix runs on every push, every PR. Continuous scanning, not a one-time review.

**Client-side validation (point 6).** "Attackers disable JS and hit your API directly." CoreFix's SAST scanner (OpenGrep) flags API endpoints where server-side validation is missing — not by checking if validation exists somewhere in your codebase, but by tracing whether the specific input reaching a dangerous function (database query, file operation, system command) has been validated on the server path. If validation only exists in your React component but not in your Express handler, that's a finding.

**Leaked secrets (points 7 and 8).** API keys in frontend code, `.env` values exposed, secrets in logs. CoreFix runs Gitleaks across your entire repo and commit history. Not just the current state — every commit ever made. That API key you hardcoded in commit #3 and removed in commit #47 is still in your git history and still exploitable. Gitleaks catches it. CoreFix opens a PR to rotate it.

**Vulnerable dependencies (not on the checklist, but should be).** The post didn't mention this. Every `npm install`, every `pip install`, every dependency your AI suggested — any of them could have known CVEs. CoreFix runs OSV-Scanner against your dependency tree and flags packages with known vulnerabilities, with severity scoring and fix PRs that bump to patched versions.

**Rate limiting (point 9).** "Watched a Supabase bill jump from $20 to $200 in a day." CoreFix's web scanner tests for missing rate limits on your API endpoints. It detects endpoints that accept unlimited requests without throttling. But rate limiting is a code pattern — it needs to exist in your route handlers. CoreFix's SAST rules flag API routes with no rate limiting middleware applied.

---

## What the Checklist Can't Cover

The viral post is a good starting point. But it's a human checklist, which means it covers what the author thought of. Here's what it misses that bites vibe coders hardest:

**Container security.** If you're deploying with Docker (and most Vercel/Railway/Fly.io deployments use containers under the hood), your base image might ship with 47 known vulnerabilities. CoreFix runs Grype and Dockle against your container images — scanning the full dependency tree inside the image, not just your application code.

**Infrastructure misconfigurations.** Your Terraform config, your Kubernetes manifests, your Dockerfile, your cloud IAM policies. These aren't application code, but a misconfigured S3 bucket or an overly permissive IAM role is just as exploitable as a SQL injection. CoreFix scans IaC files with KICS and Kubescape.

**Shadow APIs.** You built 47 API endpoints. Your OpenAPI spec documents 39 of them. The other 8 — the debug routes, the admin panels, the beta features you shipped without documentation — those are the ones attackers find first because nobody reviewed them. CoreFix's API Intelligence feature compares your actual traffic (recorded via browser extension) against your API spec and surfaces every undocumented endpoint, including which frontend button triggers it.

**Your AI stack itself.** If you're building with LLMs (and as a vibe coder, you are), your AI integration has its own attack surface. Prompt injection, data leakage through RAG pipelines, missing output validation, no cost controls on API calls. CoreFix's AI BOM inventories every AI component in your codebase, and AI Governance scans flag missing guardrails — no observability, no PII redaction, no output sanitization.

---

## The Actual Workflow

Here's what "secure vibe coding" looks like with CoreFix:

You build your app the way you already do — fast, with AI assistance, shipping features every day. You connect your GitHub repo to CoreFix once. That's 30 seconds.

Every push, every PR, CoreFix runs 10+ scanners in parallel. SAST for code vulnerabilities. Gitleaks for secrets. OSV-Scanner for vulnerable dependencies. KICS for infrastructure misconfigs. Kubescape for Kubernetes issues. ZAP and Nuclei against your live app. Grype and Dockle for container security. Full SBOM generation with Syft. All automated, all in the background.

Findings are deduplicated across scanners — the same SQL injection found by both OpenGrep and SonarQube becomes one finding, not two alerts in two dashboards. AI prioritizes by actual exploitability, not theoretical severity. You see 12 actionable findings instead of 400 noisy alerts.

For each finding, CoreFix generates a production-ready fix and opens a PR. Not "you should use parameterized queries" — actual code changes, with before/after diffs and confidence scores. Review it, merge it, move on.

The whole thing takes 4 minutes from push to fix PR.

---

## The Real Talk

Vibe coding isn't going away. AI-assisted development is genuinely faster and the output is getting better every month. The developers shipping full products in a weekend are building real businesses.

But "move fast and break things" has a different meaning when you have real users, real data, and real legal liability. GDPR fines start at €10 million. CCPA lawsuits start at $100 per user per incident. A data breach doesn't just cost money — it kills trust, and for a solo builder or small team, trust is the entire business.

The fix isn't to slow down. It's to automate the boring stuff that protects you.

You don't manually check for XSS. You don't manually grep for API keys. You don't manually test every auth flow after every code change. You set up a scanner that does it on every push, opens PRs to fix what it finds, and lets you keep shipping at the speed you're already going.

That's what CoreFix does. Build fast. Ship secure. Don't get sued.

---

*CoreFix scans your code, your web app, your APIs, and your AI stack in one pipeline. Free for open source. First results in 4 minutes.*

*[Get started free →](https://corefix.dev)*
