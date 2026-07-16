---
title: "Release v1.6.0"
---

# CoreFix v1.6.0

**Release Date:** July 15, 2026

## Added

- **AI GOV Scanner** — governance scanning for AI models and pipelines.
- **AI BOM** (Bill of Materials) — inventory and tracking of AI components used across scanned projects.
- **API Threat Intelligence Dashboard** now populates automatically once a recording session is stopped via the Chrome Extension.

## Changed

- Added a new API for attacking Vercel sandboxes, available as part of **Labs** for testing web app security features.

## Deprecated

- Deprecated the AI-based web scan config file. Web scan configuration is now more deterministic, driven by traffic recorded via Playwright. AI is now used only for detecting additional `pollUrls` or regex patterns.

## Bug Fixes

- No bugs found for fixing in this release.