---
title: "Release Logs"
---

# Release Logs

## Current Release

**Version:** v2.0.0  
**Release Date:** October 6, 2026

CoreFix v2.0.0 is a major platform release. Scanning now runs through `corefix`, a single Go-based CLI that replaces raw `docker run` commands, CodeFix can autofix vulnerabilities directly in your code, and web application testing gains multi-user, RBAC, and broken access control (BAC) coverage.

## Highlights

- **CoreFix CLI** — a single Go-based binary that abstracts away complex `docker run` commands for both code and web scanning.
- **Autofixes dashboard** added to the frontend, for reviewing and tracking CodeFix remediation across your projects.
- **CodeFix agent** that autofixes vulnerabilities in your code. Currently handles secrets, SAST, code hotspots/bugs, IaC, and Kubernetes manifest file fixes.
- **Multi-user and access control testing** for web apps — RBAC and BAC testing, backed by additional custom ZAP scripts.

## Added

- `corefix`, a Go-based CLI for running CoreFix code and web scanners without hand-writing Docker commands.
- An Autofixes dashboard in the frontend for CodeFix remediation.
- CodeFix autofix support for secrets, SAST, code hotspots/bugs, IaC, and Kubernetes manifest findings.
- Multi-user web app testing, with RBAC and BAC (broken access control) testing via custom ZAP scripts.

## Release History

| Version | Release Date | Key Highlights |
|---|---:|---|
| [v2.0.0](/docs/release-v2.0.0.html) | October 6, 2026 | CoreFix CLI, Autofixes dashboard, CodeFix autofix agent, multi-user/RBAC/BAC web testing |
| [v1.7.0](/docs/release-v1.7.0.html) | July 17, 2026 | Malicious package scanner, Slack/Teams integration, AI fallback detection, OpenAPI baseline backup to R2, and bug fixes |
| [v1.6.0](/docs/release-v1.6.0.html) | July 15, 2026 | AI GOV Scanner, AI BOM, auto-populated API threat intelligence dashboard, Vercel sandbox attack API (Labs), deterministic web scan config |
| [v1.5.0](/docs/release-v1.5.0.html) | July 13th, 2026 | Exploit verification, Python PoC generation, Playwright-based PoC/exploit screenshots to R2 and DB, OAuth complex bypass via header injection, Labs auto-project creation and queuing |
| [v1.4.0](/docs/release-v1.4.0.html) | July 4th, 2026 | HAR recording dashboard, SBOM integration and dashboard, package health scoring, Labs dashboard with one-click vulnerable app deployment |
| [v1.3.0](/docs/release-v1.3.0.html) | June 25th, 2026 | ZAP pre-auth check, custom scanner profiles (CLI/CI-CD), extended ZAP coverage up to 6 hrs, container scanning (Grype, Dockle), SonarQube integration |
| [v1.2.0](/docs/release-v1.2.0.html) | June 23rd, 2026 | Scanner logs to R2, live scanner logs in frontend, ZAP policy tuning, bug fixes in API keys and workspace management |
| [v1.1.0](/docs/release-v1.1.0.html) | June 12th, 2026 | API keys, workspace creation and invites, triggers, cron jobs, CI/CD integrations, free credits, credit calculation |
| [v1.0.0](/docs/release-v1.0.0.html) | June 2, 2026 | First public CoreFix release with code scanning, web scanning, AI enrichment, reports, and Chrome Extension support |

## Related Documentation Updates

- [CoreFix CLI — Overview](/docs/docker-cli.html)
- [Installing the CoreFix CLI](/docs/install-cli.html)
- [CodeFix — Automated Remediation](/docs/auto-remediation.html)
- [Multi-User Scanning](/docs/web-scan-multi-user.html)
- [Web Scanner — Standalone Usage](/docs/web-agent-usage.html)
