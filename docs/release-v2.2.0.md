---
title: "Release Logs"
---

# Release Logs

## Current Release

**Version:** v2.2.0  
**Release Date:** October 26, 2026

CoreFix v2.2.0 makes the GitHub App fully zero-config and brings fix review into GitHub. Pull requests are scanned with no agent, CLI or CI setup, you can accept, reject and apply fixes with `@corefixhq` comments, and the dashboard gains PR tracking and a Fix Findings action.

## Highlights

- **Zero-config PR scanning** — with the GitHub App installed, opening a PR launches a scan, and a fix PR when auto-fix is configured.
- **`@corefixhq` PR bot commands** — review and apply fixes directly from GitHub, in sync with the dashboard.
- **Pull request details in the dashboard** — fix PRs are tracked and kept up to date automatically.
- **Fix Findings action** — projects without auto-fix can fix the findings of a manual scan from the dashboard, without rescanning.

## GitHub App — Zero-Config Scanning

### Zero-Config PR Scanning

- With the Corefix GitHub App installed, opening a pull request launches a scan automatically. No agent, CLI or CI setup is needed.
- If the project has auto-fix configured, the Code Fix Agent also runs and raises a fix PR against the feature branch.
- New commits pushed to an open PR are rescanned at most once an hour. Commits that arrive sooner are picked up automatically once the hour has passed.

### Push Scans on Specific or Custom Branches

- Pushes to the default release branches, or to a project's custom branch patterns, launch a scan.
- Push scans are scan-only: no auto-fix is performed.

### Fixed — Repeated Scans

- Fixed an issue where Corefix's own fix branches could trigger another scan. Corefix now ignores events from bots, so it never scans its own fix branches, commits or comments.

---

## GitHub PR Bot Commands

You can now review Corefix fixes directly from a GitHub pull request by commenting:

- `@corefixhq accept`: accepts the fix for the file or commit.
- `@corefixhq reject`: rejects the fix.
- `@corefixhq unreject`: undoes a rejection and returns the fix to pending.
- `@corefixhq apply`: rebuilds the fix PR from your review decisions, keeping the fixes for every file you didn't reject.
- `@corefixhq status`: posts a summary of the review state of every file in the fix PR.

Accept, reject and unreject work on PR review comments and commit comments. Apply and status work on PR comments. Decisions made on GitHub and in the dashboard stay in sync.

---

## Pull Request Details in the Dashboard

- Fix PRs raised by Corefix are now linked to the scan that produced them, so the dashboard can show their details.
- PR status (open, merged, closed) is kept up to date automatically from GitHub.

---

## Fix Findings From the Dashboard

- After a manual scan from the dashboard, projects without auto-fix configured now see a **Fix Findings** option.
- It fixes the findings of that scan without rescanning.

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
