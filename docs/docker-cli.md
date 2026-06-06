---
hide_title: true
sidebar_label: Docker / Local CLI
---

## Docker Agent — Overview

CoreFix provides two Docker images for running security scans locally or on any server. Your source code never leaves your environment — only security findings are sent to the CoreFix cloud for AI enrichment, deduplication, and reporting.

| Image | Purpose | Detailed Guide |
|---|---|---|
| `corefixhq/cfix` | Code scanning — SAST, secrets, SCA, IaC, Kubernetes | [Code Scanner — Standalone Usage](./code-agent-usage) |
| `corefixhq/cfix-web` | Web application scanning — DAST, CVEs, port scanning, SSL/TLS | [Web Scanner — Standalone Usage](./web-agent-usage) |

Both images are available on [Docker Hub](https://hub.docker.com/u/corefixhq) and [GitHub Container Registry (GHCR)](https://github.com/orgs/corefixhq/packages).

---

## When to Use Docker / CLI

- Scan a repo locally before pushing to remote
- One-off security audits on any codebase
- Run web scans against staging or production URLs
- Environments without a GitHub App or CI/CD integration
- Air-gapped or restricted environments
- Evaluating CoreFix before setting up a full integration

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- A CoreFix API key and Organization ID — get both from [Account & API Keys](https://app.corefix.dev/settings/api-keys)

---

## Common Environment Variables

The following environment variables are shared by both the code and web scanning agents. They can only be passed via `-e` flags on the Docker command.

| Variable | Required | Description |
|---|---|---|
| `X_CFIX_API_KEY` | **Yes** | Your CoreFix API key |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token for pushing scan results as SARIF to GitHub Code Scanning |
| `DEBUG` | No | Set to `app:*` to enable verbose debug logging |

> **Note:** `GITHUB_TOKEN` is available for both agents. For web scans, this allows pushing DAST findings to your GitHub repository's Code Scanning tab as SARIF, giving you a unified view of code and web findings directly in GitHub.

---

## Bring Your Own Model (BYOK)

Both agents support AI enrichment using CoreFix's built-in model rotation or your own OpenAI-compatible API key.

**If you don't specify a model or API key**, CoreFix automatically selects a model based on your plan — no configuration needed.

**If you provide `--openai-api-key`**, you must also specify `--model`. The scan will fail without it. You pay your provider directly.

```bash
# BYOK — model is required
--openai-api-key sk-proj-xxxxxxxx --model gpt-4o-mini

# No key — CoreFix handles model selection automatically
# (no flags needed)
```

See [Supported Models](https://docs.corefix.dev/docs/models) for the full reference.

---

## CLI Options — Code Scanner (`corefixhq/cfix`)

| Flag | Required | Description |
|---|---|---|
| `[scanner]` | No | Positional argument. Comma-separated scanner names. Default: `osv,iac,secrets,k8s,sast` |
| `--emailids` | No | Comma-separated email addresses to notify when scan completes |
| `--openai-api-key` | No | Your own OpenAI-compatible API key (BYOK) |
| `--model` | No | AI model to use for enrichment. Required when `--openai-api-key` is provided |
| `--github-token` | No | GitHub PAT for pushing SARIF to GitHub Code Scanning |

**Available scanners:**

| Scanner | Flag | What It Covers |
|---|---|---|
| SAST | `sast` | Code vulnerabilities across 30+ languages via OpenGrep |
| Secrets | `secrets` | Hardcoded credentials, API keys, tokens via Gitleaks |
| Dependencies | `osv` | CVEs in open source packages via OSV-Scanner |
| IaC | `iac` | Terraform, Dockerfile, CloudFormation misconfigs via KICS |
| Kubernetes | `k8s` | K8s manifests, RBAC, pod security via Kubescape |

---

## CLI Options — Web Scanner (`corefixhq/cfix-web`)

| Flag | Required | Description |
|---|---|---|
| `[scanner]` | No | Positional argument. Comma-separated scanner names. Default: `nmap,vuln,web` |
| `--target` | Yes | Target URL. Accepts `https://app.com`, `http://IP:8080`, or bare domain |
| `--username` | No | Login username for authenticated scans |
| `--password` | No | Login password for authenticated scans |
| `--token` | No | Bearer token or session cookie — use for OAuth, SSO, MFA, or API scanning |
| `--remote` | No | Remote browser endpoint. `ws://HOST:PORT` for Playwright, `http://HOST:PORT` for Chrome CDP |
| `--cf-browser` | No | Use Cloudflare managed browser. Pass `true` to enable |
| `--emailids` | No | Comma-separated emails to notify on completion |
| `--openai-api-key` | No | Your own OpenAI-compatible API key (BYOK) |
| `--model` | No | AI model to use for enrichment. Required when `--openai-api-key` is provided |
| `--github-token` | No | GitHub PAT for pushing SARIF to GitHub Code Scanning |

**Available scanners:**

| Scanner | Flag | What It Covers |
|---|---|---|
| Port scan | `nmap` | Open ports, services, network discovery via Nmap |
| CVE scan | `vuln` | Known CVEs, misconfigs, exposed panels via Nuclei |
| Web scan | `web` | Smart shorthand — auto-selects sub-scanners based on config |
| DAST (unauth) | `web` | Unauthenticated web crawl and active scan via OWASP ZAP |
| DAST (auth) | `web` | Authenticated web scan using credentials or token via OWASP ZAP. Configure `.cfix.web.yaml` |
| API fuzzing | `web` | API fuzzing against OpenAPI/Swagger spec. Launches automatically (Coming Soon) |
| ZAP API fuzzing | `web` | ZAP-based API fuzzing  (Coming Soon) |
| SSL/TLS | `web` | SSL/TLS configuration and certificate analysis via testssl.sh, Launches automatically if `https` website |

---

## Quick Start

### Code Scanning

```bash
docker run --rm \
  -e X_CFIX_API_KEY=<your-api-key> \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix
```

For the full CLI reference, scanner flags, examples, and output details, see [Code Scanner — Standalone Usage](./code-agent-usage).

### Web Scanning

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=<your-api-key> \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com
```

For the full CLI reference, authentication options, browser setup, and config file details, see [Web Scanner — Standalone Usage](./web-agent-usage).

---

## Viewing Results

After a scan completes, results are available in multiple places:

- **Dashboard** — findings appear automatically at [app.corefix.dev](https://app.corefix.dev) under your project.
- **Local output** — raw, normalized, and enriched results are written to your mounted output directory.
- **Email** — if `--emailids` was passed, recipients receive a password-protected report link (no CoreFix account required).
- **GitHub Code Scanning** — if `GITHUB_TOKEN` was provided, SARIF results are pushed to your repository's Security tab.

---

## Next Steps

- [Code Scanner — Standalone Usage](./code-agent-usage) — full CLI reference for code scanning
- [Web Scanner — Standalone Usage](./web-agent-usage) — full CLI reference for web scanning
- [Code Scanning CI/CD Integration](./cicd-integration) — add code scanning to your pipeline
- [Web Scanning CI/CD Integration](./cicd-web-scan) — add DAST to your pipeline
- [Web Scan Config Reference](./web-scan-config-reference.md) — configure scope, authentication, and coverage
