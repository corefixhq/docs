---
title: "Release Logs"
---

# Release Logs

## Current Release

**Version:** v2.3.0  
**Release Date:** October 27, 2026

CoreFix v2.3.0 broadens web app testing with the OWASP Penetration Testing Kit and a browser-based client spider, fixes cases where web scans could hang, and enables the AI-native Opengrep rule set for all code scans.

[Read the full v2.3.0 release notes](/docs/release-v2.3.0.html)

## Highlights

- **OWASP PTK integration** — web scans add client-side SAST and IAST analysis and extra DAST checks to the existing ZAP active scan.
- **Client spider** — crawls your app in a real browser to discover pages, routes and requests that only appear after JavaScript runs.
- **More reliable web scans** — fixed cases where a scan could hang and never finish.
- **AI-native Opengrep rule set** — 600+ rules now enabled for all code scans, covering major languages and AI application security.

## Release History

| Version | Release Date | Key Highlights |
|---|---:|---|
| [v2.3.0](/docs/release-v2.3.0.html) | October 27, 2026 | OWASP ZAP PTK integration, client spider, ZAP hang fixes, AI-native Opengrep rule set (600+ rules) |
| [v2.2.0](/docs/release-v2.2.0.html) | October 26, 2026 | Zero-config PR scanning, `@corefixhq` PR bot commands, PR tracking in the dashboard, Fix Findings action, webhook loop fix |
| [v2.1.0](/docs/release-v2.1.0.html) | October 22, 2026 | Automatic PR and push scanning, automatic fix PRs with lifecycle management, Windows CLI support |
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

- [Web Scanner — Standalone Usage](/docs/web-agent-usage.html)
- [Multi-User Scanning](/docs/web-scan-multi-user.html)
