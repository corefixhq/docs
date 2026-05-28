# DeepTraq Web Scanner — Standalone Usage

Run the DeepTraq web security scanner directly on any machine with Docker installed. It performs DAST (Dynamic Application Security Testing) against a live URL — no source code required.

---

## Quick Start

Scan a public URL with all default scanners:

```bash
docker run --rm \
  -e ORG_ID=<your-org-id> \
  -e X_CFIX_API_KEY=<your-api-key> \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner \
  --target https://example.com
```

---

## Full Command Reference

```bash
docker run --rm \
  [--add-host=host.docker.internal:host-gateway] \
  -e ORG_ID=<your-org-id> \
  -e X_CFIX_API_KEY=<your-api-key> \
  [-e X_CFIX_API_URL=<custom-api-url>] \
  [-e DEBUG=app:*] \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner [scanner] \
  --target <url> \
  [--username <user>] \
  [--password <pass>] \
  [--token <bearer-token>] \
  [--remote <browser-endpoint>] \
  [--cf-browser] \
  [--emailids <email1,email2>] \
  [--openai-api-key <key>] \
  [--model <model-name>]
```

> Add `--add-host=host.docker.internal:host-gateway` only when using `--remote` to connect to a browser running on your host machine.

---

## Environment Variables

| Variable | Required | Secret | Description |
|---|---|---|---|
| `ORG_ID` | Yes | No | Your DeepTraq organization ID |
| `X_CFIX_API_KEY` | Yes | **Yes** | DeepTraq platform API key |
| `X_CFIX_API_URL` | No | No | Override the API endpoint. Defaults to production |
| `USERNAME` | No | **Yes** | Alternative to `--username` flag |
| `PASSWORD` | No | **Yes** | Alternative to `--password` flag |
| `ACCESS_TOKEN` | No | **Yes** | Alternative to `--token` flag |
| `OPENAI_API_KEY` | No | **Yes** | Alternative to `--openai-api-key` flag |
| `DEBUG` | No | No | Set to `app:*` for verbose output |

---

## Volume Mounts

| Mount | Purpose |
|---|---|
| `-v $(pwd):/web` | Project directory — DeepTraq reads `.cfix.web.yaml`, `.har`, and OpenAPI spec files from here |
| `-v ~/scan-results:/output` | Where scan results, reports, and discovered config are written |

---

## Arguments

### `[scanner]` — Positional (optional)

Comma-separated list of scanners. Defaults to `nmap,vuln,web` if omitted.

| Value | Tool | What it scans |
|---|---|---|
| `nmap` | Nmap | Port scanning, open services, network discovery |
| `vuln` | Nuclei | CVEs, misconfigurations, exposed panels |
| `web` | ZAP / testssl | Full web app scan — expands automatically (see below) |
| `zap` | OWASP ZAP | Unauthenticated web crawl and active scan |
| `zap-auth` | OWASP ZAP | Authenticated web scan using credentials |
| `fuzzer` | openapi-fuzzer | API fuzzing against an OpenAPI/Swagger spec |
| `zap-fuzzer` | ZAP | ZAP-based API fuzzing |
| `testssl` | testssl.sh | SSL/TLS configuration and certificate analysis |

#### How `web` expands

The `web` scanner is a smart shorthand that auto-selects the right sub-scanners:

- Target is `https://` → `testssl` is added automatically
- `.cfix.web.yaml` has `openapi` key (no `authentication`+`scope`) → uses `fuzzer` + `zap-fuzzer`
- Otherwise → uses `zap` (unauthenticated) or `zap-auth` (with credentials)

### `--target` (required)

The URL to scan. Accepts HTTP and HTTPS, with or without a port.

```
--target https://example.com
--target http://192.168.1.100:8080/
--target http://74.225.252.175:4200/
```

### `--username` / `--password` (optional)

Credentials for authenticated scanning. DeepTraq uses these to log in and scan protected pages.

```bash
--username admin --password s3cr3t
```

Can also be set via `USERNAME` and `PASSWORD` environment variables.

### `--token` (optional)

A valid bearer token or session cookie. Use this for complex auth flows where login via username/password is impractical — the scanner uses the session directly.

```bash
--token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Can also be set via the `ACCESS_TOKEN` environment variable.

### `--remote` (optional)

Connect to a browser running outside the container instead of launching one internally. Keeps the Docker image lean and is required when the scanner needs to reach a browser on the host.

Two protocols are auto-detected from the URL:

**Playwright server** (WebSocket):
```bash
# On the host:
npx playwright launch-server --port 9323

# In the docker run command:
--add-host=host.docker.internal:host-gateway
--remote ws://host.docker.internal:9323
```

**Chrome / Chromium CDP** (HTTP):
```bash
# On the host:
google-chrome --remote-debugging-port=9222 --headless --no-sandbox
# or:
chromium-browser --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --headless --no-sandbox

# In the docker run command:
--add-host=host.docker.internal:host-gateway
--remote http://host.docker.internal:9222
```

### `--cf-browser` (optional)

Use Cloudflare's managed browser instead of launching or connecting to Chrome/Chromium. Useful when you don't want to install a browser at all.

```bash
--cf-browser
```

### `--emailids` (optional)

Comma-separated email addresses to receive the scan report.

```bash
--emailids security@example.com,dev@example.com
```

### `--openai-api-key` / `--model` (optional)

Bring your own API key for AI-powered finding enrichment. If omitted, DeepTraq uses its own model rotation automatically.

> If you provide `--openai-api-key`, you **must** also provide `--model`. Omitting `--model` will cause an error.

Supported models: `gpt-4o-mini`, `gpt-5.4-mini`, `minimax-2.5`, `glm-5.1`, `kimi-2.6`, `grok-4.3`

---

## Configuration File: `.cfix.web.yaml`

Place this file in the directory mounted to `/web`. It configures authentication and scan scope. Three formats are supported:

### Minimal config (recommended starting point)

DeepTraq derives the full authentication config automatically using Playwright + AI. Requires `--username` and `--password`.

```yaml
authentication:
  loginPageUrl: https://example.com/login

scope:
  entryUrls:
    - https://example.com/dashboard
```

### Developer config (full control)

Provide the complete authentication flow manually — headers, CSRF tokens, verification URLs, etc.

```yaml
developer: true
authentication:
  type: form
  loginPageUrl: https://example.com/login
  # ... full config
```

### OpenAPI / API fuzzing

If your config has an `openapi` key but no `authentication` + `scope`, the scanner switches to API fuzzing mode:

```yaml
openapi:
  url: https://example.com/api/openapi.json
```

You can also drop a `.yaml`, `.yml`, or `.json` OpenAPI/Swagger spec file directly into the mounted `/web` directory — DeepTraq detects it automatically.

---

## HAR Files

HAR files recorded from your browser can be used to guide the authenticated scan:

- Drop `.har` files into the directory mounted to `/web`
- Or upload them via the DeepTraq browser extension — they are pulled automatically at scan time

---

## Examples

### Unauthenticated scan of a public site

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxxxxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner \
  --target https://example.com
```

### Authenticated scan with credentials

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxxxxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner \
  --target https://example.com \
  --username admin \
  --password s3cr3t
```

### Authenticated scan using a bearer token

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxxxxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner \
  --target https://example.com \
  --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Run specific scanners only

```bash
# Port scan + vulnerability check only
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxxxxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner nmap,vuln \
  --target https://example.com

# SSL check only
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxxxxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner testssl \
  --target https://example.com
```

### Scan with remote Chrome browser on the host

```bash
# Start Chrome on your host first:
google-chrome --remote-debugging-port=9222 --headless --no-sandbox

# Then run the scanner:
docker run --rm \
  --add-host=host.docker.internal:host-gateway \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxxxxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner \
  --target https://example.com \
  --username admin \
  --password s3cr3t \
  --remote http://host.docker.internal:9222
```

### Scan with your own AI model and email report

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxxxxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  deeptraq-web-scanner \
  --target https://example.com \
  --openai-api-key sk-proj-xxxxxxxxxxxxxxxx \
  --model gpt-4o-mini \
  --emailids security@example.com
```

---

## Output

Results are written to the `/output` mount:

| File | Contents |
|---|---|
| `results.json` | Raw findings from all scanners |
| `normalized.json` | Normalized findings across all tools |
| `enriched_results.json` | AI-enriched findings with context and remediation |
| `.cfix.web.full.yaml` | Derived full auth config (when minimal config is used) |
| `discovery.json` | Playwright discovery session details |
| `*.har` | HAR files pulled from the DeepTraq platform |
