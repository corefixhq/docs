---
title: "Release v1.3.0"
---

# CoreFix v1.3.0

**Release Date:** June 25th, 2026.

## Added

- **ZAP Pre-Auth Check** — runs before ZAP scanning starts to identify authentication failures or verification failures ahead of time.
- **Custom Scanner Profiles** — run targeted scans from the frontend or via the CI/CD pipeline using `--scanner-profile`. Profiles can be customized around specific vulnerability classes such as SQLi, XSS, Broken Access Control, Path Traversal, SSRF, and more.
- **Extended ZAP Coverage** — ZAP scans now support run durations of up to 6 hours.

### New Scanners

- **Container Scanning** via Grype and Dockle.
- **SonarQube integration** for code vulnerabilities, code smells, code hotspots, and taint analysis.

## Changed

- Nothing to report in this release.

## Bug Fixes

- Nothing to report in this release.
