---
title: "Release v1.5.0"
---

# CoreFix v1.5.0

**Release Date:** July 13th, 2026.

## Added

- **Exploit verification** for web application findings that are generated during scans.
- **PoC generation in Python** for identified web app findings.
- **Screenshot-based evidence storage** — PoC and exploit verification screenshots are now captured using Playwright and saved to both R2 and the database.
- **OAuth complex bypass** support via header injection and `--token` usage.

## Changed

- Added default lab passwords in **Labs**.
- Labs now automatically creates projects and queues them for scanning in the lab environment on Vercel sandbox.

## Bug Fixes

- No bugs found for fixing in this release.