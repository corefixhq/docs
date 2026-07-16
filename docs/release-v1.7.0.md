---
title: "Release Logs"
---

# Release Logs

## Current Release

**Version:** v1.7.0  
**Release Date:** July 17, 2026

CoreFix v1.7.0 builds on the unified scanning platform with a new malicious package scanner, deeper chat integrations, and several reliability fixes across API threat intelligence and OpenAPI spec handling.


## Highlights

- **Malicious Package Scanner** for Python, NPM, Ruby gems, Golang, GitHub Actions, and VSCode extensions.
- **Slack and Teams integration** for scan notifications and alerts.
- **AI fallback detection** for `pollUrl` and `loggedInRegex` — when AI detection fails, CoreFix now falls back to comparing response diffs of authenticated URLs.
- **Baseline OpenAPI spec backup** — a copy of the baseline OpenAPI spec file is now saved to R2 for recovery and comparison.
- Various bug fixes in API threat intelligence and OpenAPI spec generation/enrichment workflows.
- Latest version of Chrome extension published at: https://chromewebstore.google.com/detail/corefix-security-recorder/chibaoiobkclhiieocggohhofcmcejgi

## Added

- **Malicious Package Scanner** for Python, NPM, Ruby gems, Golang, GitHub Actions, and VSCode extensions.
- **Slack and Teams integration** for scan notifications and alerts.
- **AI fallback detection** for `pollUrl` and `loggedInRegex` — when AI detection fails, CoreFix now falls back to comparing response diffs of authenticated URLs.

## Changed

- Added code to save a copy of the baseline OpenAPI spec file in R2.

## Bug Fixes

- Fixed bugs in API threat intelligence.
- Fixed OpenAPI spec file generation.
- Fixed updating of enriched OpenAPI spec files.
- Fixed bugs related to Slack and Teams integration.

## Release History

| Version | Release Date | Key Highlights |
|---|---:|---|
| [v1.7.0](/docs/release-v1.7.0) | July 17, 2026 | Malicious package scanner, Slack/Teams integration, AI fallback detection, OpenAPI baseline backup to R2, and bug fixes |
| [v1.0.0](/docs/release-v1.0.0) | June 2, 2026 | First public CoreFix release with code scanning, web scanning, AI enrichment, reports, and Chrome Extension support |

## Related Documentation Updates

- [Docker / Local CLI](/docs/docker-cli)
- [GitHub Integration](/docs/github-integration)
- [Chrome Extension Guide](/docs/chrome-extension-guide)
- [Web Application Scanning](/docs/web-agent-usage.md)
- [Code Scanning](/docs/code-agent-usage.md)
