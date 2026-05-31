# Docker / Local CLI

Run CoreFix scanners entirely on your local machine or any server — no CI/CD pipeline required. Your source code never leaves your environment. Only findings are sent to the CoreFix dashboard for AI enrichment, deduplication, and reporting.

## When to use Docker / CLI

- Scan a repo locally before pushing to remote
- One-off security audits on any codebase
- Environments without a GitHub App or CI/CD integration
- Air-gapped or restricted environments
- Evaluating CoreFix before setting up a full integration

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- A CoreFix API key — get one from your [dashboard](https://app.corefix.dev)
- Your Organization ID — visible in dashboard settings

---

## Code Scanning

### Pull the image

```bash
# Latest stable
docker pull cfix:latest

# Or use shorthand
docker pull cfix

# Specific version
docker pull cfix:1.0.0
```

### Run a scan

Navigate to your project directory, then run:

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  cfix:latest \
  --emailids you@example.com \
  --model gpt-4o-mini
```

The scan mounts your current directory (`$(pwd)`) into the container as `/code`. Results are written to `~/scan-results` on your host machine and also sent to your CoreFix dashboard.

### Run specific scanners only

By default, all five code scanners run in parallel: `osv,iac,secrets,k8s,sast`

To run specific scanners, pass the scanner names as the first argument:

```bash
# Secrets and SAST only
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  cfix:latest secrets,sast \
  --emailids you@example.com \
  --model gpt-4o-mini
```

**Available scanners:**

| Scanner | Flag | What it covers |
|---|---|---|
| SAST | `sast` | Code vulnerabilities via OpenGrep |
| Secrets | `secrets` | Hardcoded credentials via Gitleaks |
| Dependencies | `osv` | CVEs in open source packages via OSV-Scanner |
| IaC | `iac` | Terraform, Dockerfile, CloudFormation via KICS |
| Kubernetes | `k8s` | K8s manifests, RBAC, pod security via Kubescape |

### Use your own AI key (BYOK)

Pass your own OpenAI-compatible API key to avoid using CoreFix credits for AI enrichment:

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  cfix:latest \
  --emailids you@example.com \
  --openai-api-key sk-YOUR_OPENAI_KEY \
  --model gpt-4o-mini
```

### Code scan options

| Flag | Required | Description |
|---|---|---|
| `--emailids` | No | Comma-separated email addresses to notify when scan completes |
| `--openai-api-key` | No | Your own OpenAI-compatible API key (BYOK) |
| `--model` | No | AI model to use for enrichment (see [Supported Models](/docs/models)) |

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `X_CFIX_API_KEY` | Yes | Your CoreFix API key from the dashboard |
| `ORG_ID` | Yes | Your Organization ID from dashboard settings |
| `X_CFIX_API_URL` | Yes | CoreFix API endpoint: `https://api.corefix.dev` |
| `DEBUG` | No | Set to `app:*` to enable verbose debug logging |

---

## Web Scanning

### Pull the image

```bash
# Latest stable
docker pull cfix-web:latest

# Or use shorthand
docker pull cfix-web

# Specific version
docker pull cfix-web:1.0.0
```

### Run an unauthenticated quick scan

The fastest way to get results — no credentials needed:

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web \
  -v ~/scan-results-web:/output \
  cfix-web:latest web \
  --target https://your-app.com \
  --emailids you@example.com \
  --model gpt-4o-mini
```

::: tip
`--network host` is required for web scanning so the container can reach your target URL, including local or staging environments on your network.
:::

### Run an authenticated scan

Provide credentials to scan behind login:

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web \
  -v ~/scan-results-web:/output \
  cfix-web:latest web \
  --target https://your-app.com \
  --username admin \
  --password yourpassword \
  --emailids you@example.com \
  --model gpt-4o-mini
```

### Use a bearer token or session cookie

For complex auth flows — OAuth, SSO, MFA — bypass credential login and provide a session token directly:

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web \
  -v ~/scan-results-web:/output \
  cfix-web:latest web \
  --target https://your-app.com \
  --token "Bearer eyJhbGciOiJIUzI1NiIs..." \
  --emailids you@example.com \
  --model gpt-4o-mini
```

---

## Browser Options for Web Scanning

Web scanning requires a browser to crawl your application. CoreFix supports three browser modes.

### Option 1 — Cloudflare Browser (recommended, zero setup)

Use CoreFix's managed Cloudflare browser. No local browser installation needed, no extra flags:

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web \
  -v ~/scan-results-web:/output \
  cfix-web:latest web \
  --target https://your-app.com \
  --cf-browser true \
  --emailids you@example.com
```

### Option 2 — Remote Playwright Server

Launch a Playwright server on your host, then connect to it from the container. Keeps the Docker image lean.

**Start the Playwright server on your host:**

```bash
npx playwright launch-server --port 9323
```

**Run the scan connecting to it:**

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web \
  -v ~/scan-results-web:/output \
  cfix-web:latest web \
  --target https://your-app.com \
  --remote ws://localhost:9323 \
  --emailids you@example.com
```

### Option 3 — Remote Chrome via CDP

Launch Chrome in headless mode on your host and connect via Chrome DevTools Protocol:

**Start Chrome on your host:**

```bash
# Google Chrome
google-chrome \
  --remote-debugging-port=9222 \
  --headless \
  --no-sandbox

# Or Chromium
chromium-browser \
  --remote-debugging-port=9222 \
  --remote-debugging-address=0.0.0.0 \
  --headless \
  --no-sandbox
```

**Run the scan connecting to it:**

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web \
  -v ~/scan-results-web:/output \
  cfix-web:latest web \
  --target https://your-app.com \
  --remote http://localhost:9222 \
  --emailids you@example.com
```

::: info Auto-detection
CoreFix auto-detects the remote browser type from the URL — `ws://` for Playwright, `http://` for CDP. No extra flags needed.
:::

---

## Web scan options

| Flag | Required | Description |
|---|---|---|
| `--target` | Yes | Target URL. Accepts `https://app.com`, `http://IP:8080`, or bare domain `app.com` |
| `--username` | No | Login username for authenticated scans |
| `--password` | No | Login password for authenticated scans |
| `--token` | No | Bearer token or session cookie — use for OAuth, SSO, MFA flows |
| `--remote` | No | Remote browser endpoint. `ws://HOST:9323` for Playwright, `http://HOST:9222` for CDP |
| `--cf-browser` | No | Use Cloudflare managed browser. Pass `true` to enable |
| `--emailids` | No | Comma-separated emails to notify on completion |
| `--openai-api-key` | No | Your own OpenAI-compatible API key (BYOK) |
| `--model` | No | AI model to use for enrichment |

---

## Supported Models

Pass any of these to `--model`:

| Model | Flag value | Best for |
|---|---|---|
| GPT-4o mini | `gpt-4o-mini` | Fast, cost-efficient enrichment |
| GPT-5.4 mini | `gpt-5.4-mini` | Balanced accuracy and cost |
| Minimax 2.5 | `minimax-2.5` | Alternative provider |
| GLM 5.1 | `glm-5.1` | Alternative provider |
| Kimi 2.6 | `kimi-2.6` | Alternative provider |
| Grok 4.3 | `grok-4.3` | Alternative provider |

::: tip Free plan models
Open source projects on the free plan can use: `gpt-4o-mini`, `gpt-5.4-mini`, `deepseek-v4-flash`, and `gpt-120b-oss`.
:::

---

## Viewing Results

After a scan completes:

- **Dashboard** — findings appear automatically at [app.corefix.dev](https://app.corefix.dev) under your project
- **Local output** — raw results written to your mounted output directory (`~/scan-results` or `~/scan-results-web`)
- **Email** — if `--emailids` was passed, a summary report is sent on completion

---

## Full Examples

### Scan a Node.js project locally, secrets and SAST only

```bash
cd ~/projects/my-api

docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  cfix:latest secrets,sast \
  --emailids you@example.com \
  --model gpt-4o-mini
```

### Full authenticated web scan with Cloudflare browser

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web \
  -v ~/scan-results-web:/output \
  cfix-web:latest web \
  --target https://staging.my-app.com \
  --username admin \
  --password secret \
  --cf-browser true \
  --emailids security@mycompany.com \
  --model gpt-5.4-mini
```

### Debug mode — verbose output

```bash
docker run --rm \
  -e DEBUG=app:* \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  cfix:latest \
  --emailids you@example.com \
  --model gpt-4o-mini
```

---

## Available Docker Images

| Image | Tag | Purpose |
|---|---|---|
| `cfix` | `latest` | Code scanning (SAST, secrets, SCA, IaC, K8s) |
| `cfix` | `1.0.0` | Specific version of code scanner |
| `cfix-web` | `latest` | Web application scanning (DAST, CVEs, recon, SSL) |
| `cfix-web` | `1.0.0` | Specific version of web scanner |

Pull from Docker Hub:

```bash
docker pull cfix:latest
docker pull cfix-web:latest
```

---

## Next Steps

- [Set up CI/CD integration](/docs/cicd-integration) — auto-scan on every push
- [Chrome Extension](/docs/chrome-extension-guide) — capture HAR files for deep authenticated web scanning
- [Supported Models](/docs/models) — full model reference
- [Pricing & Usage](/docs/pricing-and-usage) — understand how credits are consumed
