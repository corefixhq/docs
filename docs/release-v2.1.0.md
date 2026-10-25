---
title: "Release Logs"
---

# Release Logs

## Current Release

**Version:** v2.1.0  
**Release Date:** October 22, 2026

CoreFix v2.1.0 makes scanning automatic. The GitHub App now scans pull requests and release-branch pushes on its own, raises and manages CodeFix fix PRs, and the CoreFix CLI gains a native Windows binary.

## Highlights

- **Automatic pull request scanning** — opening a PR or pushing new commits starts a scan of the PR branch.
- **Automatic fix PRs** — PR scans can raise a CoreFix fix PR against your feature branch, and Corefix keeps it in step as your PR is merged or closed.
- **Push scanning on release branches** — pushes to `main`, `master`, `develop`, `release/*` and `hotfix/*` are scanned by default.
- **Windows support for the CoreFix CLI** — a native Windows binary (amd64 and arm64).

## GitHub App — Automatic Scanning

### Pull Request Scanning

- Opening a pull request, or pushing new commits to one, now starts a security scan of the PR branch automatically.
- A branch is rescanned at most once per hour, and a commit that has already been scanned is never scanned again.
- Commits that only change docs, images or other non-code files don't trigger a rescan.
- Add `[skip scan]` to the PR title to skip the scan.
- Scanning on PR open and on new commits can be turned on or off per project.
- Pull requests from forks are skipped.

### Automatic Fix PRs

- PR scans can run the Code Fix Agent and raise a CoreFix fix PR against the feature branch. This follows the project's auto-fix setting and is on by default.
- Manual scans from the dashboard only scan; they never change code or raise PRs.

### Fix PR Lifecycle

Corefix keeps fix PRs tidy as your feature PR moves forward:

- **Fix PR merged first:** the fixes reach the target branch together with your feature.
- **Feature PR merged while the fix PR is still open:** Corefix moves the fix onto the target branch (for example `develop`) and retargets the fix PR. If there are conflicts, it comments on the PR asking you to resolve them.
- **Feature PR closed without merging:** Corefix closes the fix PR and deletes its branch.

### No Scan Loops

- Corefix never scans its own work, including its fix branches and fix PRs, so a scan never triggers another scan.

### Push Scanning on Release Branches

- Pushes and merges to `main`, `master`, `develop`, `release/*` and `hotfix/*` are scanned by default. Each project can set its own branch patterns or turn push scans off.
- Push scans are scan-only: they never change code or raise PRs.
- To avoid unnecessary scans, a branch is scanned at most once per hour. A push that arrives sooner isn't lost; it is scanned automatically once the hour has passed.
- Newly created branches, such as a release branch cut from `develop`, are always scanned.

### Scheduled Scans Removed

- The old periodic scan schedules (`hourly`, `daily`, `weekly` and similar) no longer run. Scans are now triggered by pull requests, pushes and manual runs.

---

## Code Scanning

- Fixed an issue where code scans ran only some of the scanners. Code scans now run the full scanner set.
- Code scans now run without AI processing.

---

## Corefix CLI

### Windows Support

- The Corefix CLI now ships a native Windows binary (amd64 and arm64), installable from PowerShell with `iwr https://get.corefix.dev/install.ps1 | iex`.
- Fixed a git issue with the fix output created during a scan, so it remains a valid git repository wherever it's opened, including from the CoreFix VS Code extension on Windows. This also applies to Linux and macOS.

## Release History




| Version | Release Date | Key Highlights |
|---|---:|---|
| [v2.1.0](/docs/release-v2.1.0.html) | October 22, 2026 | Automatic PR and push scanning, automatic fix PRs with lifecycle management, deferred push scan scheduler, Windows CLI support |
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
- [Installing the CoreFix CLI](/docs/install-cli.html)
- [CoreFix CLI — Overview](/docs/docker-cli.html)
