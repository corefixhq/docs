---
hide_title: true
sidebar_label: Ways to Scan
---

## Ways to Scan

CoreFix offers multiple ways to run security scans depending on your workflow, environment, and how much setup you want to do. All methods push findings to the CoreFix cloud for AI enrichment, deduplication, and reporting.

---

## At a Glance

| Method | Setup Required | Best For |
|---|---|---|
| [Dashboard — Manual Run](#dashboard-manual-run) | None | Quick one-off scans, evaluating CoreFix |
| [GitHub App](#github-app) | One click | Continuous code scanning on every PR and push |
| [CoreFix CLI](#corefix-cli) | One install command | Local scans, pre-push checks, air-gapped environments |
| [CI/CD Pipeline](#cicd-pipeline) | Pipeline config | Automated scanning baked into existing workflows |

---

## Dashboard — Zero Setup

The simplest way to scan. No installations, no configuration files, no infrastructure needed — just a browser.

Create a project from the dashboard, enter your target URL or connect your repository, and hit **Run**. CoreFix launches all applicable scanners immediately.

- **Code scan** — connect your repository, select a branch, and run.
- **Web scan** — enter a URL, optionally provide credentials, and run. For deeper authenticated scans, install the optional [Chrome Extension](/docs/chrome-extension-guide) to record network traffic and capture complex login flows.
- **Scheduled scans** — set a recurring schedule from Project Settings (daily, weekly, biweekly, monthly, or a custom cron expression) so scans run automatically on your cadence.

**→** [Web Scan in 2 Minutes](/docs/web-scan-quickstart) · [Managing Projects](/docs/managing-projects)

---

## GitHub App

Zero configuration. One click connects your GitHub repository and CoreFix handles the rest.

Once installed, CoreFix can automatically trigger a full code scan on every pull request or push to a configured branch — no CI/CD pipeline needed. The GitHub App is the fastest way to get continuous security coverage on a codebase.

**→** [Connect GitHub for Code Scanning](/docs/github-integration)

---

## CoreFix CLI

Run the CoreFix scanner locally with `corefix`, a single binary that installs with one command:

```bash
curl -fsSL https://get.corefix.dev/corefix | sudo sh
```

- `corefix code` — code scanning (SAST, secrets, SCA, IaC, Kubernetes, containers, malware, AI BOM)
- `corefix web` — web application scanning (DAST, CVEs, port scanning, SSL/TLS)

Your source code never leaves your environment. Only findings are sent to CoreFix for enrichment and reporting.

Good for evaluating CoreFix on an existing codebase, scanning before pushing to remote, or running in environments without a GitHub App or CI/CD integration.

**→** [Installing the CLI](/docs/install-cli) · [CoreFix CLI — Overview](/docs/docker-cli) · [Code Scanning](/docs/code-agent-usage) · [Web Scanning](/docs/web-agent-usage)

---

## CI/CD Pipeline

Drop the CoreFix CLI into any existing pipeline as a step or standalone job. Supports GitHub Actions, GitLab CI, Jenkins, and CircleCI.

- **Code scanning** — runs after checkout, scans the repository, pushes results to CoreFix.
- **Web scanning** — runs after deploy, targets the live staging URL, pushes results to CoreFix.

Results from every pipeline run appear in the CoreFix dashboard under your project automatically.

**→** [Code Scanning CI/CD](/docs/cicd-integration) · [Web Scanning CI/CD](/docs/cicd-web-scan)

---

## Not Sure Which to Use?

- **Just want to try CoreFix quickly** → [Web Scan in 2 Minutes](/docs/web-scan-quickstart)
- **Want code scanning with no CI/CD setup** → [GitHub App](/docs/github-integration)
- **Want to scan locally before pushing** → [CoreFix CLI](/docs/docker-cli)
- **Want scanning baked into your pipeline** → [CI/CD Integration](/docs/cicd-integration)
- **Want deep authenticated or API web scanning** → [Web Scan Config Reference](./web-scan-config-reference.md)
