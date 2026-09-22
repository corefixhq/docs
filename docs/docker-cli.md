---
hide_title: true
sidebar_label: CoreFix CLI
---

## CoreFix CLI — Overview

`corefix` is a single command-line tool that runs the CoreFix code and web security scanners on your machine or any server. It wraps the CoreFix scanner Docker images, so you get the same scanners without writing `docker run` commands, mounting volumes or passing environment variables by hand. Your source code never leaves your environment — only security findings are sent to the CoreFix cloud for AI enrichment, deduplication, and reporting.

| Command | Purpose | Image used | Detailed Guide |
|---|---|---|---|
| `corefix code` | Code scanning — SAST, secrets, SCA, IaC, Kubernetes, containers, malware, AI BOM | `corefixhq/cfix` | [Code Scanner — Standalone Usage](./code-agent-usage) |
| `corefix web` | Web application scanning — DAST, CVEs, port scanning, SSL/TLS | `corefixhq/cfix-web` | [Web Scanner — Standalone Usage](./web-agent-usage) |

Both images are published on [Docker Hub](https://hub.docker.com/u/corefixhq). `corefix` pulls and runs them for you.

---

## When to Use the CLI

- Scan a repo locally before pushing to remote
- One-off security audits on any codebase
- Run web scans against staging or production URLs
- Fix findings automatically with CodeFix (`--patch`) and open a pull request (`--pr`)
- Environments without a GitHub App or CI/CD integration
- Evaluating CoreFix before setting up a full integration

---

## Prerequisites

- A CoreFix account — sign up at [app.corefix.dev](https://app.corefix.dev)
- The `corefix` binary on your `PATH` — see below

::: tip Docker isn't a prerequisite
You don't need to install [Docker](https://docs.docker.com/get-docker/) yourself — `corefix` uses it to run the scanners, and installs it automatically if it's missing when you run the install command below.
:::

### Install

```bash
curl -fsSL https://get.corefix.dev/corefix | sudo sh
```

This installs `corefix` at `/usr/local/bin`, installs Docker if it's missing, and pulls the scanner images. See [Installing the CoreFix CLI](./install-cli) for details.

Verify the install:

```bash
corefix --version
```

---

## Authentication

`corefix` needs a CoreFix API key. There are two ways to provide one.

### Option 1 — Log in with your browser (recommended)

```bash
corefix login
```

This opens your browser, signs you in to CoreFix, and saves the session to `~/.corefix/session.json`. You do this once per machine; the session is then used by both `corefix code` and `corefix web`. No manual API key export is needed.

`corefix` mounts `$HOME/.corefix` into the scanner container automatically, so the scanner picks up your login without any extra configuration.

### Option 2 — Set `CFIX_API_KEY`

Create an API key in [Account & API Keys](https://app.corefix.dev/settings/api-keys) and export it:

```bash
export CFIX_API_KEY=<your-api-key>
corefix code
```

Use this in CI/CD pipelines, containers and other environments where a browser isn't available.

> **Order of lookup:** `corefix` reads `~/.corefix/session.json` first and falls back to `$CFIX_API_KEY`. If a machine has a saved login and you want a different key to be used, remove `~/.corefix/session.json`.

---

## Commands

| Command | Description |
|---|---|
| `corefix login` | Log in to CoreFix using your browser. Covers both code and web scanning |
| `corefix code status` | Print the last known scan status (branch, commit and patch state) as JSON |
| `corefix code [<scanner>[,<scanner>...]] [flags]` | Run code scanners |
| `corefix web [<scanner>[,<scanner>...]] [flags]` | Run web scanners |
| `corefix update` | Pull the latest scanner images |
| `corefix --version` | Print the `corefix` version |

---

## Quick Start

### Code Scanning

Run from the root of the repository you want to scan:

```bash
corefix login           # once per machine
corefix code
```

With no scanner specified, all code scanners run. For the full reference, scanner details, CodeFix and examples, see [Code Scanner — Standalone Usage](./code-agent-usage).

### Web Scanning

```bash
corefix web --target https://your-app.com
```

With no scanner specified, `nmap,vuln,web` run. `--target` is required. For authentication options, browser setup, and config file details, see [Web Scanner — Standalone Usage](./web-agent-usage).

---

## Common Flags

These flags work with both `corefix code` and `corefix web`.

| Flag | Required | Description |
|---|---|---|
| `[scanner]` | No | Positional argument. Comma-separated scanner names |
| `--openai-api-key <key>` | No | Your own OpenAI API key (BYOK) |
| `--model <name>` | No | Model used for AI analysis. Required when `--openai-api-key` is provided |
| `--github-token <token>` | No | GitHub Personal Access Token — pushes scan results as SARIF to GitHub Code Scanning, and is required for `--pr` |
| `--ignore-ai-analysis` | No | Skip the AI pipeline — deduplication, enrichment, and AI-based prioritization. Raw/normalized findings are still written to the results directory. Default: `false` |

> **Note:** `--github-token` is available for both commands. For web scans, this allows pushing DAST findings to your GitHub repository's Code Scanning tab as SARIF, giving you a unified view of code and web findings directly in GitHub.

---

## Bring Your Own Model (BYOK)

Both commands support AI enrichment using CoreFix's built-in model rotation or your own OpenAI API key.

**If you don't specify a model or API key**, CoreFix automatically selects a model based on your plan — no configuration needed.

**If you provide `--openai-api-key`**, you must also specify `--model`. The scan will fail without it. You pay your provider directly.

```bash
# BYOK — model is required
corefix code --openai-api-key sk-proj-xxxxxxxx --model gpt-5-mini

# No key — CoreFix handles model selection automatically
corefix code
```

**Models accepted by `--model`:**

| Command | Models |
|---|---|
| `corefix code` | `gpt-5-mini`, `gpt-5.4-mini`, `gpt-5.6-luna`, `bedrock:runtime:claude-haiku-4.5`, `claude-haiku-4.5`, `gpt-5`, `gpt-5.4`, `gpt-5.6-terra`, `claude-sonnet-4.6`, `claude-sonnet-5` |
| `corefix web` | `gpt-5-mini`, `gpt-5.4-mini`, `gpt-5`, `gpt-5.4`, `claude-haiku-4.5`, `claude-sonnet-4.6` |

See [Supported Models](https://docs.corefix.dev/docs/models) for the full reference.

---

## Code Scanner Options

`corefix code [<scanner>[,<scanner>...]] [flags]` — runs the `corefixhq/cfix` image.

| Flag | Required | Description |
|---|---|---|
| `[scanner]` | No | Positional argument. Comma-separated scanner names. Default: `osv,iac,secrets,k8s,sast,sonar,container,ai,malware` |
| `--container <names>` | No | Comma-separated container image names to scan. `corefix` mounts the host Docker socket so the scanner can read local images |
| `--patch` | No | Fix the previous pending scan, or scan and fix when no pending scan exists. Default: `false` |
| `--rescan` | No | Scan the current checkout again. Add `--patch` to also fix findings. Default: `false` |
| `--pr` | No | Create a pull request after remediation. Requires `--github-token`. Default: `false` |
| `--in-place` | No | Apply fixes directly in the current repository instead of an isolated worktree. Default: `false` |

Plus the [common flags](#common-flags) above.

**What `corefix code` does for you:**

- Runs the scanner container as your own user (`--user "$(id -u):$(id -g)"`), so files it writes are owned by you rather than root.
- Mounts `$HOME/.corefix` automatically, so the scanner is authenticated with your `corefix login` session.
- Only when `--container` is used, mounts the Docker socket (`-v /var/run/docker.sock:/var/run/docker.sock`), so the scanner can access your local Docker daemon and pull images directly — no credentials to your container registry are needed.

**Available scanners:**

| Scanner | Flag | What It Covers |
|---|---|---|
| SAST | `sast` | Code vulnerabilities across 30+ languages via OpenGrep |
| Secrets | `secrets` | Hardcoded credentials, API keys, tokens via Gitleaks |
| Dependencies | `osv` | CVEs in open source packages via OSV-Scanner |
| IaC | `iac` | Terraform, Dockerfile, CloudFormation misconfigs via KICS |
| Kubernetes | `k8s` | K8s manifests, RBAC, pod security via Kubescape |
| SonarQube | `sonar` | Security hotspot, bug, code smell, and vulnerability rules |
| Container | `container` | Container image vulnerabilities and Dockerfile CIS benchmarking |
| AI BOM / AI Governance | `ai` | AI Bill of Materials (AI BOM) and AI governance scan across source code |
| Malware | `malware` | Malware within Python, NPM (JS), Golang, Ruby gems, GitHub Actions, and VS Code extensions, plus cross-package supply chain risk detection |

---

## Web Scanner Options

`corefix web [<scanner>[,<scanner>...]] [flags]` — runs the `corefixhq/cfix-web` image.

::: warning Limitation
For the web scanner, `--token` works today for **complex web application authentication** (OAuth, SSO, MFA) — CoreFix bypasses username/password credentials and injects the provided Authorization/Cookie value into every request. It is still reserved and has no effect for **API testing** (the `openapi` block); that remains unavailable.
:::

| Flag | Required | Description |
|---|---|---|
| `[scanner]` | No | Positional argument. Comma-separated scanner names. Default: `nmap,vuln,web` |
| `--target <url>` | Yes | Host URL to scan. Accepts `https://app.com`, `http://IP:8080`, or a bare domain like `corefix.dev` |
| `--username <user>` | No | Valid username of the target. Repeatable — the first is the admin/privileged user; extra pairs are regular roles used for broken-access-control (BAC) testing. See [Multi-User Scanning](./web-scan-multi-user) |
| `--password <password>` | No | Valid password for the target. Pass once per `--username`, in the same order |
| `--token <token>` | No | Valid bearer token or cookie for complex auth applications (OAuth, SSO, MFA), in place of `--username`/`--password`. Still reserved and has no effect for API testing |
| `--coverage <tier>` | No | Scan depth: `quick`, `normal`, `moderate`, `high`, `veryhigh`, `max`, `extreme`, `exhaustive`, `unlimited`. Auto-detected by default. See [`--coverage`](./web-agent-usage#coverage-optional) |
| `--scanner-profile <profile>` | No | Which active scan rules to run: `all` (default), `all_vuln`, `sqli`, `xss`, `injection`, `path_traversal`, `access_control`, `passive_only`, `quick_active`, `ssl`. See [Scanner Profiles](./web-agent-usage#scanner-profiles) |
| `--latest-har` | No | Use only the latest HAR recording session for scanning. If omitted, all available HAR sessions are used. Default: `false` |

Plus the [common flags](#common-flags) above.

::: warning Working Directory and Networking
`corefix web` mounts your current directory into the scanner (so `.cfix.web.yaml` and `.har` files are picked up) and sets up the Docker networking for you — including `--network host` where it's needed to reach a local browser. You don't need to pass any Docker flags. Run it from your project root.
:::

**Available scanners:**

| Scanner | Flag | What It Covers |
|---|---|---|
| Port scan | `nmap` | Open ports, services, network discovery via Nmap |
| CVE scan | `vuln` | Known CVEs, misconfigs, exposed panels via Nuclei |
| Web scan | `web` | Smart shorthand — auto-selects sub-scanners based on target and config |
| DAST (unauth) | `zap` | Unauthenticated web crawl and active scan via OWASP ZAP |
| DAST (auth) | `zap-auth` | Authenticated web scan using credentials or a token via OWASP ZAP. Configure `.cfix.web.yaml` |
| API fuzzing | `fuzzer` | API fuzzing against an OpenAPI/Swagger spec (Coming Soon) |
| ZAP API fuzzing | `zap-fuzzer` | ZAP-based API fuzzing (Coming Soon) |
| SSL/TLS | `testssl` | SSL/TLS configuration and certificate analysis via testssl.sh. Added automatically by `web` for `https` targets |

---

## Updating

Pull the latest scanner images:

```bash
corefix update
```

---

## Viewing Results

After a scan completes, results are available in multiple places:

- **Dashboard** — findings appear automatically at [app.corefix.dev](https://app.corefix.dev) under your project.
- **Local output** — raw, normalized, and enriched results are written to `~/.corefix/scan-results`.
- **GitHub Code Scanning** — if `--github-token` was provided, SARIF results are pushed to your repository's Security tab.

To check where the last code scan and any CodeFix patch stand, run:

```bash
corefix code status
```

---

## Running the Images Directly (CI/CD)

`corefix` is a wrapper around the `corefixhq/cfix` and `corefixhq/cfix-web` images, and those images can still be run directly with `docker run`, as the web scanning CI/CD guide does. In that case the API key is passed to the container as the `X_CFIX_API_KEY` environment variable, and you mount your project and an output directory yourself:

```bash
docker run --rm \
  -e X_CFIX_API_KEY=<your-api-key> \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix
```

For pipelines, the [Code Scanning CI/CD Integration](./cicd-integration) guide installs and runs the `corefix` CLI instead; see also [Web Scanning CI/CD Integration](./cicd-web-scan).

---

## Next Steps

- [Code Scanner — Standalone Usage](./code-agent-usage) — full reference for `corefix code`
- [Container Scanning](./container) — scan container images with `--container`
- [Web Scanner — Standalone Usage](./web-agent-usage) — full reference for `corefix web`
- [Multi-User Scanning](./web-scan-multi-user) — test for BOLA, IDOR and broken access control
- [Code Scanning CI/CD Integration](./cicd-integration) — add code scanning to your pipeline
- [Web Scanning CI/CD Integration](./cicd-web-scan) — add DAST to your pipeline
- [Web Scan Config Reference](./web-scan-config-reference.md) — configure scope, authentication, and coverage
