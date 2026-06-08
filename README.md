# CoreFix Documentation Site

This folder contains the VitePress documentation site for CoreFix. It powers
the public product docs for onboarding, scan workflows, Docker and CI/CD usage,
Chrome extension guidance, reporting, AI model behavior, pricing, and legal
policies.

The site is a static docs app. Markdown content lives in `docs/`, VitePress
configuration lives in `.vitepress/`, and public assets live in `public/`.

## Contents

- [What This Site Contains](#what-this-site-contains)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Commands](#commands)
- [Configuration](#configuration)
- [Documentation Map](#documentation-map)
- [Authoring Guide](#authoring-guide)
- [Images And Assets](#images-and-assets)
- [Build And Preview](#build-and-preview)
- [Deployment Notes](#deployment-notes)
- [Maintenance Notes](#maintenance-notes)
- [Troubleshooting](#troubleshooting)

## What This Site Contains

CoreFix docs are organized for users who need to understand and operate the
platform:

- Account setup and sign-in.
- Web scan quickstart.
- GitHub App onboarding for code scanning.
- Docker and local CLI scanner usage.
- Code scanning and web scanning reference docs.
- CI/CD examples for GitHub Actions, GitLab CI, Jenkins, and CircleCI.
- Chrome extension recording guide for authenticated web scans.
- Project management and report viewing.
- AI enrichment, supported models, usage, and pricing.
- Tool reference pages for integrated open source scanners.
- Terms, privacy, cookie, refund, security, AI usage, disclaimer, and
  acknowledgement pages.
- Release log pages.

The root `index.md` redirects users to `/docs/introduction`, so the landing page
for the docs experience is the Overview page.

## Project Structure

```text
planning/
  .vitepress/
    config.mts            Active VitePress configuration.
    theme/                Custom VitePress theme, CSS, and footer component.
    dist/                 Generated production build output.
    cache/                Generated Vite/VitePress cache.
  docs/
    assets/               Screenshots and page-specific images.
    tools/                Individual scanner reference pages.
    *.md                  Product, workflow, policy, and reference pages.
    config.mts            Older/alternate config copy; not the active config.
  public/
    dark/                 Dark-mode CoreFix logo assets.
    light/                Light-mode CoreFix logo assets.
    samples/              Public sample payloads.
    logo.png              Legacy/static logo asset.
  guide.md                Secondary guide page.
  index.md                Redirect to /docs/introduction.
  package.json            VitePress scripts and dependencies.
  README.md               This maintainer guide.
```

Important source-of-truth rule:

- Use `.vitepress/config.mts` as the active site configuration.
- Do not treat `docs/config.mts` as the active config unless the project is
  intentionally restructured.
- Do not hand-edit `.vitepress/dist` or `.vitepress/cache`; they are generated
  output.

## Local Setup

Requirements:

- Node.js 18 or newer.
- npm.

Install dependencies:

```bash
npm install
```

Start the docs server:

```bash
npm run docs:dev
```

VitePress will print the local URL, usually:

```text
http://localhost:5173/
```

If the default port is occupied:

```bash
npm run docs:dev -- --port 3000
```

## Commands

```bash
npm run docs:dev     # Start the VitePress development server.
npm run docs:build   # Build the static production site.
npm run docs:preview # Preview the production build locally.
```

The production build is written to:

```text
.vitepress/dist/
```

## Configuration

The active config is `.vitepress/config.mts`.

Current core settings:

| Setting | Current value | Purpose |
| --- | --- | --- |
| `title` | `CoreFix Documentation` | Browser/title metadata. |
| `description` | `CoreFix security scanning documentation` | Site metadata. |
| `base` | `/` | Site deploy base path. |
| `appearance` | `true` | Enables light/dark mode. |
| `search.provider` | `local` | Uses VitePress local search. |
| `markdown.lineNumbers` | `true` | Shows line numbers in code blocks. |

Environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_APP_URL` | `https://app.corefix.dev` | Target for the navbar Login link. |

The repo currently has `.env` with:

```env
VITE_APP_URL=https://app.corefix.dev
```

Navigation links:

- Overview: `/docs/introduction`
- Schedule Demo: `https://cal.com/corefix.dev/30min`
- Login: `VITE_APP_URL`
- Social links: `https://github.com/corefixhq` and `https://x.com/corefixhq`

Branding:

- Navbar logo uses `/light/corefix-logo-light.svg` in light mode.
- Navbar logo uses `/dark/corefix-logo-dark.svg` in dark mode.
- Favicon uses `/light/cf-on-light.svg`.
- Footer logo uses the same light/dark CoreFix wordmark pair.

Markdown plugins:

- `vitepress-plugin-tabs` is enabled in `.vitepress/theme/index.ts` and
  registered in `.vitepress/config.mts`.

## Documentation Map

### Entry And Overview

| File | Purpose |
| --- | --- |
| `index.md` | Redirects to `/docs/introduction`. |
| `guide.md` | Compact guide linking to primary scan paths. |
| `docs/introduction.md` | Main Overview page and card-based entry point. |
| `docs/what-is-corefix.md` | Product positioning and overview. |
| `docs/how-it-works.md` | End-to-end scan workflow and scanner architecture. |

### Getting Started

| File | Purpose |
| --- | --- |
| `docs/sign-up-and-sign-in.md` | Account creation and authentication. |
| `docs/web-scan-quickstart.md` | Fast path for first web scan. |
| `docs/github-integration.md` | Connect GitHub and trigger code scans. |
| `docs/cicd-github-actions.md` | Two-minute GitHub Actions code scan guide. |

### Scanning

| File | Purpose |
| --- | --- |
| `docs/ways-to-scan.md` | Compares dashboard, GitHub App, Docker, and CI/CD. |
| `docs/code-agent-usage.md` | Standalone Docker code scanner reference. |
| `docs/web-agent-usage.md` | Standalone Docker web scanner reference. |
| `docs/docker-cli.md` | Combined Docker/local CLI overview. |
| `docs/cicd-integration.md` | Code scanning CI/CD examples. |
| `docs/cicd-web-scan.md` | Web scanning CI/CD examples. |
| `docs/web-scan-config-reference.md` | `.cfix.web.yaml` reference. |
| `docs/chrome-extension-guide.md` | Extension recording guide for authenticated web scans. |

### Projects And Reports

| File | Purpose |
| --- | --- |
| `docs/creating-a-project.md` | Project creation flows. |
| `docs/managing-projects.md` | Project settings, scans, schedules, and deletion. |
| `docs/reports.md` | Report access, findings, summaries, and exports. |
| `docs/account-usage.md` | Profile, API keys, usage, monthly usage, and build usage. |
| `docs/pricing-and-usage.md` | Cost formulas, credits, and usage aggregation. |

### AI And Models

| File | Purpose |
| --- | --- |
| `docs/ai-enrichment.md` | How AI enriches findings. |
| `docs/models.md` | Supported models, BYOK behavior, and pricing table. |
| `docs/models-matrix.md` | Model availability matrix. |
| `docs/models-pricing.md` | Model pricing breakdown. |
| `docs/ai-usage-policy.md` | Policy for AI processing and provider behavior. |
| `docs/ai-policy.md` | Short policy placeholder/summary. |
| `docs/privacy-protection.md` | Short privacy protection placeholder/summary. |

### Tools

`docs/tools.md` is the scanner overview. Individual tool pages live in
`docs/tools/`:

- `dockle.md`
- `gitleaks.md`
- `grype.md`
- `kics.md`
- `kubescape.md`
- `nmap.md`
- `nuclei.md`
- `openapi-fuzzer.md`
- `opengrep.md`
- `openvas.md`
- `osv-scanner.md`
- `prowler.md`
- `sonarqube.md`
- `testssl.md`
- `zap.md`

### Legal, Policy, And Release Pages

| File | Purpose |
| --- | --- |
| `docs/terms-of-service.md` | Terms of Service. |
| `docs/privacy-policy.md` | Privacy Policy. |
| `docs/cookie-policy.md` | Cookie Policy. |
| `docs/refund-policy.md` | Refund Policy. |
| `docs/security-policy.md` | Security policy placeholder/summary. |
| `docs/disclaimer.md` | Legal and AI output disclaimers. |
| `docs/acknowledgements.md` | Open source scanner acknowledgements. |
| `docs/release-logs.md` | Release log index. |
| `docs/release-v1.0.0.md` | v1.0.0 release notes. |

## Authoring Guide

Use Markdown files under `docs/` for public documentation pages.

Recommended page shape:

```md
---
title: "Page Title"
sidebar_label: Short Sidebar Label
---

# Page Title

Short introduction.

## Section

Content, commands, screenshots, or tables.
```

Common frontmatter used in this repo:

| Field | Purpose |
| --- | --- |
| `title` | Page title metadata. |
| `description` | Page description metadata. |
| `sidebar_label` | Short label for sidebar/search contexts. |
| `hide_title` | Used on pages that render their own first heading. |

Linking rules:

- Prefer absolute site links for docs pages, for example
  `/docs/chrome-extension-guide`.
- Use relative links only for nearby files where the path is obvious.
- Public assets should be referenced from site root, for example
  `/light/corefix-logo-light.svg`.
- Page links should omit `.md` when linking through the rendered site.

Code examples:

- Use fenced code blocks with language identifiers when possible.
- Store secrets as placeholder values such as `<your-api-key>` or
  `cfix_live_xxxxxxxx`.
- Prefer CI variables and secrets in examples over inline real credentials.

Admonitions:

```md
::: warning
Important warning text.
:::

::: info
Helpful implementation note.
:::
```

Tabbed examples are available through `vitepress-plugin-tabs`:

```md
:::tabs
== GitHub Actions

Content for GitHub Actions.

== GitLab CI

Content for GitLab CI.
:::
```

## Images And Assets

Use `public/` for globally referenced static assets:

```text
public/light/corefix-logo-light.svg
public/dark/corefix-logo-dark.svg
public/samples/corefix-extension-har.sample.json
```

Use `docs/assets/` for documentation screenshots that are specific to guides:

```text
docs/assets/login.png
docs/assets/create-project.png
docs/assets/projects/html-report.png
```

Markdown image example:

```md
![Login screen](./assets/login.png)
```

Keep screenshots focused on the UI step they explain. Avoid uploading
screenshots with real customer data, tokens, private repository names, or
production secrets.

## Build And Preview

Build the production site:

```bash
npm run docs:build
```

Preview the built site locally:

```bash
npm run docs:preview
```

The preview command serves `.vitepress/dist`. Run `npm run docs:build` first
when validating production output.

Because this README-only update does not change runtime docs behavior, a build
is optional for README edits. For navigation, theme, Markdown plugin, or content
changes, run the build before pushing.

## Deployment Notes

The current config assumes deployment at the domain root:

```ts
base: "/"
```

Use this value for `https://docs.corefix.dev/` or any root-hosted deployment. If
the site is deployed under a subpath, update `base` in `.vitepress/config.mts`
and retest all absolute links.

Static hosting options include:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- S3-compatible object storage plus CDN
- Any static web host that can serve `.vitepress/dist`

## Maintenance Notes

- Active VitePress config is `.vitepress/config.mts`.
- `docs/config.mts` is not the active config and contains older sidebar data.
- `.vitepress/dist` and `.vitepress/cache` are generated. Avoid staging generated
  output unless intentionally cleaning up repository tracking.
- The worktree may show `.vitepress/cache/deps/_metadata.json` as modified after
  local VitePress activity. Treat it as generated cache noise unless a separate
  cleanup task decides to untrack cache files.
- Keep legal pages aligned with product behavior, especially around repository
  scanning, web scans, Chrome extension HAR capture, AI enrichment, data
  retention, and infrastructure.
- Keep public docs links in sync with app UI links, extension footer links, and
  website footer links.
- When adding a new docs page, update the sidebar in `.vitepress/config.mts` if
  it should be discoverable from navigation.
- When adding a new scanner, update `docs/tools.md`,
  `docs/acknowledgements.md`, and the relevant individual page under
  `docs/tools/`.
- When changing Docker images, versions, scanner names, or CLI flags, update all
  related pages together: code scanner, web scanner, Docker CLI, and CI/CD docs.
- When changing AI model availability or prices, update `docs/models.md`,
  `docs/models-matrix.md`, `docs/models-pricing.md`,
  `docs/pricing-and-usage.md`, and `docs/ai-usage-policy.md`.

## Troubleshooting

### Dev Server Port Is Already In Use

```bash
npm run docs:dev -- --port 3000
```

### Login Link Points To The Wrong App

Set `VITE_APP_URL` before running or building:

```bash
VITE_APP_URL=https://app.corefix.dev npm run docs:dev
```

or update `.env`.

### Search Results Look Stale

Stop the dev server, clear generated cache if needed, then rebuild:

```bash
npm run docs:build
```

If cache files changed, review them carefully before staging. They are generated
and usually should not be committed.

### Images Do Not Load

Check whether the image is in the right asset location:

- Root URLs such as `/light/corefix-logo-light.svg` must exist in `public/`.
- Relative URLs such as `./assets/login.png` must exist relative to the Markdown
  file.

Also verify `base` if deploying under a subpath.

### A Page Builds But Is Missing From Navigation

Add it to the `sidebar` array in `.vitepress/config.mts`.

### Tab Blocks Do Not Render

Confirm both pieces are present:

- `tabsMarkdownPlugin` is registered in `.vitepress/config.mts`.
- `enhanceAppWithTabs(app)` is called in `.vitepress/theme/index.ts`.

### Legal Or Pricing Content Changes

These pages affect customer trust and compliance posture. Review related docs
and UI surfaces before publishing:

- `docs/privacy-policy.md`
- `docs/terms-of-service.md`
- `docs/cookie-policy.md`
- `docs/refund-policy.md`
- `docs/ai-usage-policy.md`
- `docs/pricing-and-usage.md`
- `docs/models.md`
