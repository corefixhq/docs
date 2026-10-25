---
title: "Release Logs"
---

# Release Logs

## Current Release

**Version:** v2.2.0  
**Release Date:** October 26, 2026

CoreFix v2.2.0 makes the GitHub App fully zero-config and brings fix review into GitHub. Pull requests are scanned with no agent, CLI or CI setup, you can accept, reject and apply fixes with `@corefixhq` comments, and the dashboard gains PR tracking and a Fix Findings action.

[Read the full v2.2.0 release notes](/docs/release-v2.2.0.html)

## Highlights

- **Zero-config PR scanning** — with the GitHub App installed, opening a PR launches a scan, and a fix PR when auto-fix is configured.
- **`@corefixhq` PR bot commands** — review and apply fixes directly from GitHub, in sync with the dashboard.
- **Pull request details in the dashboard** — fix PRs are tracked and kept up to date automatically.
- **Fix Findings action** — projects without auto-fix can fix the findings of a manual scan from the dashboard, without rescanning.


## Release History




| Version | Release Date | Key Highlights |
|---|---:|---|
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

- [GitHub Integration](/docs/github-integration.html)
- [CodeFix — Automated Remediation](/docs/auto-remediation.html)
