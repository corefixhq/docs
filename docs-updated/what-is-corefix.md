# What is CoreFix?

> **Find it at runtime. Fix it in code.**

CoreFix is a security scanning platform that attacks your web applications and scans your source code — then surfaces the vulnerabilities that actually matter, not hundreds of noisy alerts across five dashboards.

---

## The Problem

Security tooling today is fragmented and reactive.

Code scanners read your source code and flag theoretical vulnerabilities. Web scanners attack your running app and find real bugs — but have no idea which file or line caused them. Teams juggle 3-5 separate tools, manually triage hundreds of duplicate alerts, and fix almost nothing because there's no automated path from finding to fix.

Traditional pentesting happens quarterly. Observability tools only catch issues *after* they've already hit production users. Security backlogs grow. Developers treat alerts as noise.

---

## What CoreFix Does

### Scans your code with 10+ open source scanners

SAST (OpenGrep), secrets (Gitleaks), dependencies (OSV-Scanner), infrastructure-as-code (KICS), and Kubernetes manifests (Kubescape) run in parallel against your repository. Every finding is normalized into a common format and deduplicated across scanners. Instead of 400 raw alerts across four dashboards, you see the findings that actually matter.

### Attacks your web application with real payloads

CoreFix sends real attack payloads to your running web application — SQL injection, XSS, SSRF, authentication bypass, TLS misconfigurations, exposed admin panels. If CoreFix says your `/api/auth/login` is vulnerable to SQL injection, it's because a real payload confirmed it on your staging environment. Not theoretical. Not pattern-matched. Confirmed.

### AI-prioritizes by real exploitability

Every finding is enriched by an AI pipeline that scores by actual exploitability, reachability, and data exposure — not just CVSS. Your team sees what needs attention, ranked correctly.

### Runs in your CI/CD pipeline — on every push

Scans trigger automatically on every PR, push, or release via the GitHub App or Docker CLI. Security runs in the test environment before code ships. Not quarterly. Not after an incident. Every commit.

---

## Coming Soon

CoreFix is actively building the runtime-to-code fix loop:

- **Trace runtime findings to source code** — a confirmed web vulnerability mapped to the exact file, function, and line that caused it
- **Auto-fix PRs** — production-ready code patches generated with full codebase context, opened as pull requests for your team to review and merge
- **Shadow API detection** — HAR traffic vs OpenAPI spec to surface undocumented endpoints
- **Runtime observability correlation** — application logs correlated with attack payloads during scanning

Full roadmap: [corefix.dev/roadmap](https://corefix.dev/roadmap)

---

## Pricing

**Free for open source.** All scanners, AI enrichment, unlimited scans. No credit card required.

**Pay as you go for private repos.** Runtime at $0.03/min + LLM usage. No seats, no monthly fees. Credits never expire.

[See full pricing →](https://corefix.dev/pricing)

---

*Built with ❤️ in Bangalore, India — for developers everywhere.*
