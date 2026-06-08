---
hide_title: true
sidebar_label: What is CoreFix?
---

# What is CoreFix?

CoreFix is a security scanning platform that scans your source code, attacks your live web applications, and uses AI to surface the vulnerabilities that actually matter — not hundreds of noisy alerts across five dashboards.

**Free for open source.** All scanners, AI enrichment, unlimited scans. No credit card required.

→ [Sign up](https://app.corefix.dev/signup) · [Schedule a demo](https://cal.com/corefix.dev/30min) · [Join us on X](https://x.com/corefixhq)

---

## Why We Built CoreFix

Security tooling today is fragmented. Code scanners flag theoretical vulnerabilities. Web scanners find real bugs but have no idea which file caused them. Teams juggle 3–5 separate tools, manually triage hundreds of duplicate alerts, and fix almost nothing because there's no clear path from finding to fix.

Traditional pentesting happens quarterly. Security backlogs grow. Developers treat alerts as noise.

We built CoreFix to fix this — one platform that scans code and web applications together, deduplicates across scanners, prioritizes by real exploitability, and runs on every commit.

---

## What CoreFix Does

**Scans your code with 10+ open source scanners** — SAST, secrets detection, dependency vulnerabilities, infrastructure-as-code misconfigurations, and Kubernetes security checks run in parallel. Findings are normalized and deduplicated across scanners automatically.

**Attacks your web application with real payloads** — SQL injection, XSS, SSRF, authentication bypass, TLS misconfigurations, exposed admin panels. If CoreFix says your endpoint is vulnerable, it's because a real payload confirmed it. Not theoretical. Not pattern-matched. Confirmed.

**AI-prioritizes by real exploitability** — every finding passes through a four-stage AI pipeline that scores by actual exploitability, reachability, and data exposure — not just CVSS. Attack chains are discovered, compliance gaps are mapped, and remediation steps are generated.

**Runs on every commit** — scans trigger automatically on every PR, push, or release via the GitHub App, Docker CLI, or CI/CD pipeline. Security runs before code ships.

---

## Our Philosophy

**Zero setup to start** — create an account, enter a URL or connect a repo, hit Run. Your first scan results are ready in minutes.

**Works where you work** — GitHub App, Docker CLI, GitHub Actions, GitLab CI, Jenkins, CircleCI. No new tools to learn.

**Open source at the core** — CoreFix is built on top of world-class open source security tools. We contribute back and acknowledge every project we use.

**AI that helps, not hypes** — AI enrichment deduplicates noise, maps compliance, and generates actionable remediation. It doesn't replace your judgment — it saves you the hours of triage so you can focus on fixing.

---

## Our Vision

Every team — from a solo developer shipping a side project to an enterprise with dozens of repositories — should have access to the same quality of security scanning that Fortune 500 companies pay six figures for.

CoreFix is building toward a world where a confirmed runtime vulnerability is automatically traced to the exact line of code that caused it, and a production-ready fix is opened as a pull request for your team to review and merge.

---

## Coming Soon

- **Runtime-to-code tracing** — map a confirmed web vulnerability to the exact file, function, and line in your source code
- **Auto-fix PRs** — AI-generated code patches opened as pull requests with full codebase context
- **Shadow API detection** — HAR traffic vs OpenAPI spec to surface undocumented endpoints
- **Runtime observability correlation** — application logs correlated with attack payloads during scanning

Full roadmap: [corefix.dev/roadmap](https://corefix.dev/roadmap)

---

## What to Read Next

- [Sign Up & Setup](/docs/sign-up-and-sign-in) — create your account and get started
- [Web Scan in 2 Minutes](/docs/web-scan-quickstart) — run your first web scan
- [Connect GitHub for Code Scanning](/docs/github-integration) — one-click GitHub integration
- [Ways to Scan](/docs/ways-to-scan) — choose the right scanning method for your workflow
- [Use Cases](/docs/use-cases) — see how teams use CoreFix

---

*Built with ❤️ in Bangalore, India — for developers everywhere.*
