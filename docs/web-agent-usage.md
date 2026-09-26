# Web Scanner — Standalone Usage

Run the CoreFix web security scanner against any live URL using the `corefix` CLI. Performs DAST (Dynamic Application Security Testing) — no source code required. `corefix web` runs the `corefixhq/cfix-web` image for you — no `docker run` commands, volume mounts or environment variables to manage.

::: warning Limitation
`--token` works today for **complex web application authentication** (OAuth, SSO, MFA) — ZAP injects the provided Authorization/Cookie value into every request instead of using username/password credentials. It is still reserved for upcoming **API scanning** and has no effect there; the `openapi` block remains unavailable.
:::

Check your installed version with `corefix --version`, and pull the latest scanner images with `corefix update`.

---

## Setup

You need [Docker](https://docs.docker.com/get-docker/) running and the `corefix` binary on your `PATH`. See [CoreFix CLI — Overview](./docker-cli) for installation.

### Log in

```bash
corefix login
```

This opens your browser, signs you in to CoreFix, and saves your session to `~/.corefix/session.json`. One login covers both code and web scanning, and you only do it once per machine.

Alternatively, skip the login and export an API key. See [Creating an API Key](./api_docs):

```bash
export CFIX_API_KEY=<your-api-key>
```

`corefix` reads `~/.corefix/session.json` first and falls back to `$CFIX_API_KEY`.

### Update the scanner images

```bash
corefix update
```

Docker Hub: [hub.docker.com/r/corefixhq/cfix-web](https://hub.docker.com/r/corefixhq/cfix-web)

---

## Quick Start

```bash
corefix web --target https://your-app.com
```

`--target` is mandatory. Everything else is optional.

---

## Full Command Reference

```bash
corefix web [<scanner>[,<scanner>...]] \
  --target <url> \
  [--username <user> --password <pass>]... \
  [--token <bearer-token-or-cookie>] \
  [--openai-api-key <key>] \
  [--model <model-name>] \
  [--ignore-ai-analysis] \
  [--github-token <github-pat>] \
  [--coverage <quick|normal|moderate|high|veryhigh|max|extreme|exhaustive|unlimited>] \
  [--scanner-profile <profile>] \
  [--latest-har]
```

---

## Authentication and Output

| Item | Description |
|---|---|
| API key | Read from `~/.corefix/session.json` (created by `corefix login`), falling back to the `CFIX_API_KEY` environment variable |
| Project directory | Run `corefix web` from your project root. The scanner reads `.cfix.web.yaml` and `.har` files from the current directory |
| Results | Scan reports and results are written to `~/.corefix/scan-results` |

`$HOME/.corefix` is mounted into the scanner automatically, so it is authenticated with your `corefix login` session.

::: warning Working Directory and Networking
`corefix web` mounts your current directory into the scanner and sets up the Docker networking for you — including `--network host` where it's needed to reach a local browser. You don't need to pass any Docker flags. Run it from your project root.
:::

---

## Scanners

Pass a comma-separated list as the first argument. Defaults to `nmap,vuln,web` if omitted.

| Value | Tool | What it scans |
|---|---|---|
| `nmap` | Nmap | Port scanning, open services, network discovery |
| `vuln` | Nuclei | CVEs, misconfigurations, exposed admin panels |
| `web` | ZAP / testssl | Smart shorthand — auto-selects sub-scanners (see below) |
| `zap` | OWASP ZAP | Unauthenticated web crawl and active scan |
| `zap-auth` | OWASP ZAP | Authenticated web scan using credentials or a token |
| `fuzzer` | Fuzzer | API fuzzing against an OpenAPI/Swagger spec (coming soon) |
| `zap-fuzzer` | ZAP | ZAP-based API fuzzing (coming soon) |
| `testssl` | testssl.sh | SSL/TLS configuration and certificate analysis |

### How `web` expands automatically

- Target is `https://` → `testssl` is added
- `.cfix.web.yaml` has an `openapi` key → planned to use `fuzzer` + `zap-fuzzer`; currently the `openapi` block has no effect
- Credentials (`--username`/`--password`) or a `--token` are provided → uses `zap-auth`
- Neither is provided → uses `zap` (unauthenticated)

---

## CLI Options

### `--target` **(required)**

The URL to scan. Accepts HTTP and HTTPS, with or without a port, or a bare domain.

```bash
--target https://your-app.com
--target http://192.168.1.100:8080/
--target http://74.225.252.175:4200/
--target your-app.com
```

### `--username` / `--password` (optional)

Login credentials for authenticated scanning.

```bash
--username admin --password s3cr3t
```

**Repeat both flags up to 3 times** to run a multi-user scan — the first pair is always treated as the admin/privileged user; extra pairs are regular roles used for broken-access-control (BAC) testing. Pass `--password` once per `--username`, in the same order. This is required to detect BOLA/IDOR and access control vulnerabilities that only appear across sessions. See [Multi-User Scanning](./web-scan-multi-user) for the combination test matrix and full examples.

### `--token` (optional)

A valid bearer token or cookie, for complex web application authentication (OAuth, SSO, MFA) where username/password login can't be automated. ZAP injects the supplied Authorization or Cookie value into every request instead of performing a credential-based login. See [Scanning Complex Apps (OAuth, MFA) — Token & Cookie Injection](./web-scan-complex-auth) for the full config reference and rules on when to use a Bearer token vs. a Cookie.

`--token` is still reserved and has no effect for planned API scanning (the `openapi` block).

```bash
--token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### `--coverage` (optional)

Controls scan depth and duration, for **authenticated scans** and **Nuclei vulnerability scans** (`vuln`).

By default, CoreFix detects the coverage tier automatically from the complexity of the application — the number of unique paths found in HAR files and discovery. Set `--coverage` to force more or less coverage.

```bash
--coverage moderate
```

Accepted values: `quick`, `normal`, `moderate`, `high`, `veryhigh`, `max`, `extreme`, `exhaustive`, `unlimited`.

| Value | Expected Coverage | Time Impact | Best For |
|---|---|---|---|
| `quick` | 10–20% | +15 min | CI/CD gating, smoke tests |
| `normal` | 60–70% | +30 min | Standard pipeline scans |
| `moderate` | 60–70% | +45 min | Balanced depth, thorough rules |
| `high` | 90–95% | +75 min | Pre-release audits |
| `veryhigh` | 95–99% | +90 min | Full security audits, compliance |
| `max` | 99–99.9% | +120 min | Maximum crawl depth and rule strength short of exhaustive |
| `extreme` | 99–99.9% | +240 min | Deep enterprise-scale audits |
| `exhaustive` | 99.9–100% | +360 min | Exhaustive, compliance-grade full coverage |
| `unlimited` | 100% | up to +720 min | Every rule runs to completion — the highest tier, above `exhaustive` |

> "Time Impact" is the additional time the coverage level adds on top of the base scan, not a total scan duration cap.

`unlimited` has no cap on alerts per rule and allows each rule up to 60 minutes. The whole scan is bounded by a 12-hour (720 min) safety limit, which should rarely be reached.

| Level | Max Alerts / Rule | Rule Duration Limit |
|---|---|---|
| `quick` | 5 | 2 min |
| `normal` | 5 | 2 min |
| `moderate` | 8 | 5 min |
| `high` | 10 | 5 min |
| `veryhigh` | 10 | 10 min |
| `max` | 10 | 15 min |
| `extreme` | 15 | 20 min |
| `exhaustive` | 15 | 30 min |
| `unlimited` | No limit | 60 min |

Coverage also determines which Nuclei template categories are enabled:

| Coverage | Nuclei Template Categories |
|---|---|
| `quick` | Misconfig, exposure, CVE, takeover, default-login, tech |
| `normal` / `moderate` | All of above + SSL, TLS |
| `high` / `veryhigh` / `max` / `extreme` / `exhaustive` / `unlimited` | All of above + HTTP, CORS, XSS, SQLi, SSRF, redirect, LFI, RFI, token, secret, WordPress (core, plugins, themes) |

### `--scanner-profile` (optional)

Controls which active scan rules are executed. See [Scanner Profiles](#scanner-profiles) below for the full list of values.

```bash
--scanner-profile sqli
```

### `--latest-har` (optional)

Use only the latest [Chrome extension](./chrome-extension-guide) HAR recording session for the scan. If omitted, all available HAR sessions are used. If only one recording exists, this flag has no effect. Default: `false`.

```bash
--latest-har
```

---

## Scanner Profiles

`--scanner-profile` controls *which active scan rules* run within the `zap` / `zap-auth` scan, independent of the `--coverage` depth setting. Use it to focus a scan on a specific vulnerability class instead of running the full rule set.

```bash
--scanner-profile sqli
```

| Value | Profile | What it runs | Duration |
|---|---|---|---|
| `all` (default) | All Security Checks | Run all active and passive scan rules | 60–120 min |
| `sqli` | SQL Injection | SQL Injection, SQLite, MySQL, PostgreSQL, Oracle injection tests | 15–30 min |
| `xss` | Cross-Site Scripting (XSS) | Reflected, Persistent, and DOM-based XSS detection | 15–25 min |
| `injection` | Command & Code Injection | OS Command Injection, Server-Side Code Injection, SSTI, Expression Language | 15–25 min |
| `path_traversal` | Path Traversal & File Inclusion | Local/Remote File Inclusion, Path Traversal, Source Code Disclosure | 10–20 min |
| `access_control` | Broken Access Control | IDOR, CORS misconfiguration, HTTP method tampering, privilege escalation | 10–15 min |
| `passive_only` | Passive Scan Only | No active attacks. Headers, cookies, SSL, information disclosure only | 2–5 min |
| `quick_active` | All Checks (Lightweight) | All scan rules at medium strength, skipping heavy SQL/XSS deep testing | 20–40 min |

> `all_vuln` and `ssl` are also accepted values for `--scanner-profile` but aren't currently surfaced in the profile picker UI.

---

## Browser for Authenticated Scans

When credentials are provided, the scanner uses a real browser to handle login flows, JavaScript rendering, and session management.

The scanner automatically detects the browser setup — no flags needed:

1. If Chromium is running locally on port `9222`, the scanner connects to it automatically.
2. If no local browser is detected, the scanner falls back to a **Cloudflare managed browser** with zero setup required.

### Using the Cloudflare Browser (Default)

No installation or configuration needed. If you don't launch Chromium locally, the scanner automatically uses a managed browser on Cloudflare Workers. Just run your scan as normal:

```bash
corefix web \
  --target https://your-app.com \
  --username admin \
  --password s3cr3t
```

### Using a Local Chromium Browser (Optional)

If you prefer to use a local browser for performance or network reasons, install Chromium and its dependencies, then launch it in headless mode before running the scan.

**For Ubuntu 22.04:**

> If you are using a different version of Ubuntu, refer to the official Chromium and Playwright documentation to install the appropriate Chromium package and its required dependencies.

```bash
sudo apt update
sudo apt install -y \
  chromium-browser \
  ca-certificates \
  fonts-liberation \
  libasound2 \
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

**Then run the scan as usual** — the scanner detects the browser on port `9222` and connects to it:

```bash
corefix web \
  --target https://your-app.com \
  --username admin \
  --password s3cr3t
```

---

## AI Models

Same behaviour as the code scanner — see [AI Models](./code-agent-usage#ai-models) for the full logic.

**If you provide `--openai-api-key`:**
- `--model` is required
- You pay your provider directly
- See [Supported Models →](https://docs.corefix.dev/docs/models)

```bash
--openai-api-key sk-proj-xxxxxxxx --model gpt-5-mini
```

**Models accepted by `--model` for web scans:** `gpt-5-mini`, `gpt-5.4-mini`, `gpt-5`, `gpt-5.4`, `claude-haiku-4.5`, `claude-sonnet-4.6`

**Skip AI analysis entirely:**

Pass `--ignore-ai-analysis` to skip the AI pipeline — this covers deduplication, enrichment of findings, and AI-based prioritization. Raw and normalized findings are still written to `~/.corefix/scan-results`, but no enriched report or AI-based prioritization is generated.

### `--ignore-ai-analysis` (optional)

Skip the AI pipeline — deduplication, enrichment of findings, and AI-based prioritization are all skipped. Useful for faster runs, or when you only need raw/normalized findings without AI enrichment. Cannot be combined meaningfully with `--openai-api-key` / `--model`, since there is no enrichment step to run those against. Default: `false`.

```bash
--ignore-ai-analysis
```

### `--github-token` (optional)

Upload scan results as a SARIF file to GitHub Code Scanning.

```bash
--github-token ghp_xxxxxxxxxxxx

# In CI, read it from a secret
--github-token "$GITHUB_TOKEN"
```

---

## Examples

### Unauthenticated scan

```bash
corefix web --target https://your-app.com
```

### Authenticated scan with credentials

```bash
corefix web \
  --target https://your-app.com \
  --username admin \
  --password s3cr3t
```

### Multi-user scan (BOLA / IDOR / access control)

The first `--username`/`--password` pair is the admin; the rest are regular users. See [Multi-User Scanning](./web-scan-multi-user).

```bash
corefix web \
  --target https://your-app.com \
  --username admin@example.com --password 'admin-pass' \
  --username jim@example.com --password 'jim-pass'
```

### Complex auth scan with token/cookie injection

For OAuth, SSO, or MFA flows that can't be scripted, obtain a valid Authorization/Cookie value yourself and pass it via `--token` instead of `--username`/`--password`. Requires an `authentication.pollUrl` in `.cfix.web.yaml` — see [Scanning Complex Apps (OAuth, MFA) — Token & Cookie Injection](./web-scan-complex-auth).

```bash
corefix web \
  --target https://your-app.com \
  --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Authenticated scan with Chromium on the host

```bash
# Step 1 — launch Chromium on your host
chromium-browser \
  --remote-debugging-port=9222 \
  --remote-debugging-address=0.0.0.0 \
  --headless \
  --no-sandbox

# Step 2 — run the scanner; it detects the browser on port 9222
corefix web \
  --target https://your-app.com \
  --username admin \
  --password s3cr3t
```

### Specific scanners only

```bash
# SSL check only
corefix web testssl --target https://your-app.com

# Port scan + CVEs only
corefix web nmap,vuln --target https://your-app.com
```

### Set the scan depth with `--coverage`

```bash
corefix web vuln --target https://staging.example.com --coverage high
```

### Bring your own API key

```bash
corefix web \
  --target https://your-app.com \
  --openai-api-key sk-proj-xxxxxxxx \
  --model gpt-5-mini
```

### Skip AI analysis

```bash
corefix web \
  --target https://your-app.com \
  --ignore-ai-analysis
```

### Scan a specific vulnerability class with `--scanner-profile`

```bash
corefix web \
  --target https://your-app.com \
  --scanner-profile sqli
```

### Scan using only the latest Chrome extension HAR recording

```bash
corefix web \
  --target https://your-app.com \
  --latest-har
```

### Upload results to GitHub Code Scanning

```bash
corefix web \
  --target https://your-app.com \
  --github-token ghp_xxxxxxxxxxxx
```

### Use in scripts and CI

```bash
export CFIX_API_KEY=<your-api-key>
corefix web --target https://staging.example.com --coverage normal
```

---

## Configuration File: `.cfix.web.yaml`

Place this file in the directory you run `corefix web` from to configure authentication and scan scope.

### Minimal config (recommended)

CoreFix derives the full auth flow automatically using Playwright + AI. Requires `--username` and `--password`.

```yaml
authentication:
  type: browser
  loginPageUrl: https://your-app.com/login
  pollUrl: https://your-app.com/v2/session/profile
  loggedInRegex: Logged In successfully
  loggedOutRegex: (Wrong Credentials)|(Token expired)

scope:
  entryUrls:
    - https://your-app.com/dashboard
  includePaths:
    - https://your-app.com/dashboard.*
```

### OpenAPI / API fuzzing

The `openapi` key documents the planned API fuzzing workflow. API testing is not currently available, so the `openapi` block has no effect today.

```yaml
openapi:
  url: https://your-app.com/api/openapi.json
```

:::
When API testing becomes available, you will also be able to drop a `.yaml`, `.yml`, or `.json` OpenAPI/Swagger spec file directly into your project directory for CoreFix to detect automatically.
:::

---

## HAR Files

HAR files recorded from your browser guide authenticated scanning for SPAs and complex flows.

- Drop `.har` files into the directory you run `corefix web` from
- Or record them via the [CoreFix Chrome Extension](./chrome-extension-guide) — they are pulled automatically at scan time

By default, if multiple HAR recording sessions are available, all of them are used together for comprehensive scan coverage. Pass `--latest-har` to use only the most recent recording session instead — useful when older recordings are stale or no longer represent the current app flow. If only one recording session exists, `--latest-har` has no effect.

---

## Output

Results are written to `~/.corefix/scan-results`:

| File | Contents |
|---|---|
| `results.json` | Raw findings from all scanners |
| `normalized.json` | Normalized findings across all tools |
| `enriched_results.json` | AI-enriched findings with risk scores and remediation |
| `.cfix.web.full.yaml` | Derived full auth config (when minimal config is used) |
| `discovery.json` | Playwright session discovery details |

---

## Related

- [CoreFix CLI — Overview](./docker-cli)
- [Code Scanner — Standalone Usage](./code-agent-usage.md)
- [Multi-User Scanning](./web-scan-multi-user)
- [Web Scan Config Reference](./web-scan-config-reference)
- [Scanning Complex Apps (OAuth, MFA) — Token & Cookie Injection](./web-scan-complex-auth)
- [Chrome Extension Guide](./chrome-extension-guide)
- [CI/CD Integration](./cicd-web-scan)
- [Supported Models](./models)
- [Credit Components](./pricing-and-usage)
