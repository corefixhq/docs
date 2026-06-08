# Web Scanner — Standalone Usage

Run the CoreFix web security scanner against any live URL. Performs DAST (Dynamic Application Security Testing) — no source code required.

::: warning Limitation
`--token` is reserved for upcoming API scanning and complex web application authentication. In that mode, CoreFix will ask ZAP to inject the provided token into every request instead of using username/password credentials. This capability is under development and is not currently available, so passing `--token` or `TOKEN` has no effect today.
:::

**Current version:** `v1.0.0` · **Commit:** `26141d48`

---

## Pull the Image

### Docker Hub

```bash
docker pull corefixhq/cfix-web               # latest
docker pull corefixhq/cfix-web:latest        # latest (explicit)
docker pull corefixhq/cfix-web:1.0.0         # specific version
docker pull corefixhq/cfix-web:26141d48      # specific commit SHA
```

→ [hub.docker.com/r/corefixhq/cfix-web](https://hub.docker.com/r/corefixhq/cfix-web)

### GitHub Container Registry (GHCR)

```bash
docker pull ghcr.io/corefixhq/cfix-web:latest       # latest
docker pull ghcr.io/corefixhq/cfix-web:1.0.0        # specific version
docker pull ghcr.io/corefixhq/cfix-web:26141d48     # specific commit SHA
```

→ [github.com/orgs/corefixhq/packages/container/package/cfix-web](https://github.com/orgs/corefixhq/packages/container/package/cfix-web)

---

## Quick Start

`X_CFIX_API_KEY` are required. Get them from your [Account & API Keys](https://app.corefix.dev/settings/api-keys) page.

```bash
docker run --rm \
  -e X_CFIX_API_KEY=<your-api-key> \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com
```

`--target` is mandatory. Everything else is optional.

---

## Full Command Reference

```bash
docker run --rm \
  [--network host] \
  -e X_CFIX_API_KEY=<your-api-key> \
  [-e USERNAME=<username>] \
  [-e PASSWORD=<password>] \
  [-e TOKEN=<bearer-token>] \
  [-e GITHUB_TOKEN=<github-pat>] \
  -v $(pwd):/web \
  -v <output-dir>:/output \
  corefixhq/cfix-web [scanners] \
  --target <url> \
  [--username <user>] \
  [--password <pass>] \
  [--token <bearer-token>] \
  [--openai-api-key <key>] \
  [--model <model-name>] \
  [--github-token <github-pat>]
  [--coverage <quick|normal|moderate|high|veryhigh>]
```

> Add `--network host` only when using `credentials` for authenticated scans and to connect to a browser running on your host machine.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `X_CFIX_API_KEY` | **Yes** | Your CoreFix API key. Found in [Account & API Keys](https://app.corefix.dev/settings/api-keys) |
| `USERNAME` | No | Alternative to `--username` flag |
| `PASSWORD` | No | Alternative to `--password` flag |
| `TOKEN` | No | Reserved for planned API scanning and complex web app token injection. Currently has no effect |
| `GITHUB_TOKEN` | No | GitHub PAT for uploading results as SARIF to GitHub Code Scanning |

---

## Volume Mounts

| Mount | Description |
|---|---|
| `-v $(pwd):/web` | Project directory. The scanner reads `.cfix.web.yaml`, `.har`, and OpenAPI spec files from here. Run from your project root. |
| `-v ~/scan-results:/output` | Local directory where scan reports and results are written |

---

## Scanners

Pass a comma-separated list as the first argument. Defaults to `nmap,vuln,web` if omitted.

| Value | Tool | What it scans |
|---|---|---|
| `nmap` | Nmap | Port scanning, open services, network discovery |
| `vuln` | Nuclei | CVEs, misconfigurations, exposed admin panels |
| `web` | ZAP / testssl | Smart shorthand — auto-selects sub-scanners (see below) |
| `zap` | OWASP ZAP | Unauthenticated web crawl and active scan |
| `zap-auth` | OWASP ZAP | Authenticated web scan using credentials |
| `fuzzer` | openapi-fuzzer | API fuzzing against an OpenAPI/Swagger spec (coming soon) |
| `zap-fuzzer` | ZAP | ZAP-based API fuzzing (coming soon) |
| `testssl` | testssl.sh | SSL/TLS configuration and certificate analysis |

### How `web` expands automatically

- Target is `https://` → `testssl` is added
- `.cfix.web.yaml` has an `openapi` key → planned to use `fuzzer` + `zap-fuzzer`; currently the `openapi` block has no effect
- Credentials provided → uses `zap-auth`
- No credentials → uses `zap` (unauthenticated)

---

## CLI Options

### `--target` **(required)**

The URL to scan. Accepts HTTP and HTTPS, with or without a port.

```bash
--target https://your-app.com
--target http://192.168.1.100:8080/
--target http://74.225.252.175:4200/
```

### `--username` / `--password` (optional)

Login credentials for authenticated scanning. Can also be passed as `USERNAME` / `PASSWORD` environment variables.

```bash
--username admin --password s3cr3t

# Or via env
-e USERNAME=admin -e PASSWORD=s3cr3t
```

### `--token` (optional)

Reserved for future API scanning and complex web application testing where username/password login is impractical. The planned behavior is to ask ZAP to inject the supplied token into every request. This is under development and not currently available, so `--token` and the `TOKEN` environment variable have no effect today.

```bash
--token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Or via env
-e TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### `--coverage` (optional)

Controls scan depth and duration.

- For **authenticated scans**, CoreFix automatically determines coverage based on application complexity if not specified. If explicitly set, the specified value is used.

```bash
--coverage moderate
```

| Value | Expected Coverage | Scan Duration | Best For |
|---|---|---|---|
| `quick` | 10–20% | Up to 5 min | CI/CD gating, smoke tests |
| `normal` | 60–70% | Up to 15 min | Standard pipeline scans |
| `moderate` | 60–70% | Up to 30 min | Balanced depth, thorough rules |
| `high` | 90–95% | Up to 45 min | Pre-release audits |
| `veryHigh` | 95–99% | Up to 60 min | Full security audits, compliance |


---

## Browser for Authenticated Scans

When credentials are provided, the scanner uses a real browser to handle login flows, JavaScript rendering, and session management.

The scanner automatically detects the browser setup — no flags needed:

1. If Chromium is running locally on port `9222`, the scanner connects to it automatically.
2. If no local browser is detected, the scanner falls back to a **Cloudflare managed browser** with zero setup required.

### Using the Cloudflare Browser (Default)

No installation or configuration needed. If you don't launch Chromium locally, the scanner automatically uses a managed browser on Cloudflare Workers. Just run your scan as normal:

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com \
  --username admin \
  --password s3cr3t
```

### Using a Local Chromium Browser (Optional)

If you prefer to use a local browser for performance or network reasons, install Chromium and its dependencies, then launch it in headless mode before running the scan.

**Install Chromium on Ubuntu:**

```bash
sudo apt update
sudo apt install -y \
  chromium-browser \
  ca-certificates \
  fonts-liberation \
  libasound2t64 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libu2f-udev \
  libvulkan1 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxkbcommon0 \
  libxrandr2 \
  wget \
  xdg-utils
```

**Launch Chromium in headless mode on port 9222:**

```bash
chromium-browser \
  --remote-debugging-port=9222 \
  --remote-debugging-address=0.0.0.0 \
  --headless \
  --no-sandbox
```

**Run the scanner with `--network host` so it can reach the local browser:**

```bash
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com \
  --username admin \
  --password s3cr3t
```

> **Note:** `--network host` is required when using a local Chromium browser so the container can reach port 9222 on the host.


---

## AI Models

Same behaviour as the code scanner — see [AI Models](./code-agent-usage#ai-models) for the full logic.

**If you provide `--openai-api-key`:**
- `--model` is required
- You pay your provider directly
- See [Supported Models →](https://docs.corefix.dev/docs/models)

```bash
--openai-api-key sk-proj-xxxxxxxx --model gpt-4o-mini
```

### `--github-token` (optional)

Upload scan results as a SARIF file to GitHub Code Scanning. Can also be passed as the `GITHUB_TOKEN` environment variable.

```bash
--github-token ghp_xxxxxxxxxxxx

# Or via env (preferred for CI)
-e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
```

---

## Examples

### Unauthenticated scan

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com
```

### Authenticated scan with credentials + Cloudflare browser

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com \
  --username admin \
  --password s3cr3t
```

### Planned token-based scan (not currently available)

`--token` is documented for future API scanning and complex web app auth. It does not affect scans today.

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com \
  --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Authenticated scan with remote Chromium on host

```bash
# Step 1 — launch Chromium on your host
chromium-browser \
  --remote-debugging-port=9222 \
  --remote-debugging-address=0.0.0.0 \
  --headless \
  --no-sandbox

# Step 2 — run the scanner
docker run --rm \
  --network host \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com \
  --username admin \
  --password s3cr3t \
  --remote http://host.docker.internal:9222
```

### Specific scanners only

```bash
# SSL check only
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web testssl \
  --target https://your-app.com

# Port scan + CVEs only
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web nmap,vuln \
  --target https://your-app.com
```

### Scan with email report + BYOK model

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com \
  --openai-api-key sk-proj-xxxxxxxx \
  --model gpt-4o-mini
```

### Upload results to GitHub Code Scanning

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -e GITHUB_TOKEN=ghp_xxxxxxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://your-app.com
```

---

## Configuration File: `.cfix.web.yaml`

Place this file in the directory mounted to `/web` to configure authentication and scan scope.

### Minimal config (recommended)

CoreFix derives the full auth flow automatically using Playwright + AI. Requires `--username` and `--password`.

```yaml
authentication:
  loginPageUrl: https://your-app.com/login

scope:
  entryUrls:
    - https://your-app.com/dashboard
```

### OpenAPI / API fuzzing

The `openapi` key documents the planned API fuzzing workflow. API testing is not currently available, so the `openapi` block has no effect today.

```yaml
openapi:
  url: https://your-app.com/api/openapi.json
```

When API testing becomes available, you will also be able to drop a `.yaml`, `.yml`, or `.json` OpenAPI/Swagger spec file directly into the mounted `/web` directory for CoreFix to detect automatically.

---

## HAR Files

HAR files recorded from your browser guide authenticated scanning for SPAs and complex flows.

- Drop `.har` files into the directory mounted to `/web`
- Or record them via the [CoreFix Chrome Extension](./chrome-extension-guide) — they are pulled automatically at scan time

---

## Output

Results are written to your `/output` mount:

| File | Contents |
|---|---|
| `results.json` | Raw findings from all scanners |
| `normalized.json` | Normalized findings across all tools |
| `enriched_results.json` | AI-enriched findings with risk scores and remediation |
| `.cfix.web.full.yaml` | Derived full auth config (when minimal config is used) |
| `discovery.json` | Playwright session discovery details |

---

## Related

- [Code Scanner — Standalone Usage](./code-agent-usage.md)
- [Chrome Extension Guide](./chrome-extension-guide)
- [CI/CD Integration](./cicd-web-scan)
- [Supported Models](./models)
- [Pricing & Usage](./pricing-and-usage)
