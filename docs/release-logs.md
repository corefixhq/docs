---
title: "Release Logs"
---

# Release Logs

## Current Release

**Version:** v1.7.0  
**Release Date:** July 17, 2026

CoreFix v1.7.0 builds on the unified scanning platform with a new malicious package scanner, deeper chat integrations, and several reliability fixes across API threat intelligence and OpenAPI spec handling.

[Read the full v1.7.0 release notes](/docs/release-v1.7.0.html)

## Highlights

- **Malicious Package Scanner** for Python, NPM, Ruby gems, Golang, GitHub Actions, and VSCode extensions.
- **Slack and Teams integration** for scan notifications and alerts.
- **AI fallback detection** for `pollUrl` and `loggedInRegex` — when AI detection fails, CoreFix now falls back to comparing response diffs of authenticated URLs.
- **Baseline OpenAPI spec backup** — a copy of the baseline OpenAPI spec file is now saved to R2 for recovery and comparison.
- Various bug fixes in API threat intelligence and OpenAPI spec generation/enrichment workflows.
- Latest version of Chrome extension published at: https://chromewebstore.google.com/detail/corefix-security-recorder/chibaoiobkclhiieocggohhofcmcejgi

## Bug Fixes

- Fixed issues in API threat intelligence detection.
- Fixed OpenAPI spec file generation.
- Fixed updating of enriched OpenAPI spec files.
- Fixed bugs related to Slack and Teams integration.

## Release History

| Version | Release Date | Key Highlights |
|---|---:|---|
| [v1.7.0](/docs/release-v1.7.0.html) | July 17, 2026 | Malicious package scanner, Slack/Teams integration, AI fallback detection, OpenAPI baseline backup to R2, and bug fixes |
| [v1.6.0](/docs/release-v1.6.0.html) | July 15, 2026 | AI GOV Scanner, AI BOM, auto-populated API threat intelligence dashboard, Vercel sandbox attack API (Labs), deterministic web scan config |
| [v1.5.0](/docs/release-v1.5.0.html) | July 13th, 2026 | Exploit verification, Python PoC generation, Playwright-based PoC/exploit screenshots to R2 and DB, OAuth complex bypass via header injection, Labs auto-project creation and queuing |
| [v1.4.0](/docs/release-v1.4.0.html) | July 4th, 2026 | HAR recording dashboard, SBOM integration and dashboard, package health scoring, Labs dashboard with one-click vulnerable app deployment |
| [v1.3.0](/docs/release-v1.3.0.html) | June 25th, 2026 | ZAP pre-auth check, custom scanner profiles (CLI/CI-CD), extended ZAP coverage up to 6 hrs, container scanning (Grype, Dockle), SonarQube integration |
| [v1.2.0](/docs/release-v1.2.0.html) | June 23rd, 2026 | Scanner logs to R2, live scanner logs in frontend, ZAP policy tuning, bug fixes in API keys and workspace management |
| [v1.1.0](/docs/release-v1.1.0.html) | June 12th, 2026 | API keys, workspace creation and invites, triggers, cron jobs, CI/CD integrations, free credits, credit calculation |
| [v1.0.0](/docs/release-v1.0.0.html) | June 2, 2026 | First public CoreFix release with code scanning, web scanning, AI enrichment, reports, and Chrome Extension support |

## Related Documentation Updates

- [Docker / Local CLI](/docs/docker-cli.html)
- [GitHub Integration](/docs/github-integration.html)
- [Chrome Extension Guide](/docs/chrome-extension-guide.html)
- [Web Application Scanning](/docs/web-agent-usage.html)
- [Code Scanning](/docs/code-agent-usage.html)
