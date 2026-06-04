---
hide_title: true
sidebar_label: Web Scan Config Reference
---

## Web Scan Config Reference

The web scan configuration file allows you to control the scope, authentication, API scanning, and depth of your web application scans. Place this file in the same directory you mount into the `corefixhq/cfix-web` Docker container.

---

## Full Example

```yaml
scope:
  entryUrls:
    - "https://staging.example.com/"
  excludePaths:
    - "https://staging.example.com/logout"
    - "https://staging.example.com/admin/reset"

authentication:
  loginPageUrl: "https://staging.example.com/login"

openapi:
  targetUrl: https://api.example.com

options:
  advanced_security_checks: true
  coverage: "moderate"
```

---

## Configuration Blocks

The config file has four top-level blocks. Not all are required — use only the blocks relevant to your scan type.

| Block | Use When |
|---|---|
| `scope` | Scanning a website where you want to include or exclude specific URLs |
| `authentication` | Scanning a website with credentials and you want to specify the login page |
| `openapi` | Scanning an API using a Swagger/OpenAPI spec file |
| `options` | Controlling scan depth, coverage level, and advanced checks |

---

## `scope`

Defines which URLs the scanner should crawl and which it should skip. **Use this only for website scanning where credentials are provided.** For API-only scanning, skip this block.

```yaml
scope:
  entryUrls:
    - "https://staging.example.com/"
  excludePaths:
    - "https://staging.example.com/logout"
    - "https://staging.example.com/login"
    - "https://staging.example.com/setup"
    - "https://staging.example.com/admin/csrf.*"
```

| Field | Description |
|---|---|
| `entryUrls` | List of URLs where the scanner begins crawling. Typically your application's home page or landing page. |
| `excludePaths` | List of URLs or URL patterns to skip during scanning. Supports regex patterns (e.g. `.*csrf.*`). Use this to prevent the scanner from hitting logout pages, setup wizards, password reset flows, or any endpoint that could disrupt the authenticated session. |

> **Tip:** Always exclude your logout URL when running authenticated scans — otherwise the scanner may log itself out mid-scan and lose coverage.

---

## `authentication`

Specifies where the login page is located so the scanner can find and use the login form. **Use this only for website scanning where credentials are provided via `--username` and `--password`.** For API-only scanning, skip this block.

```yaml
authentication:
  loginPageUrl: "https://staging.example.com/login"
```

| Field | Description |
|---|---|
| `loginPageUrl` | Full URL of the login page. The scanner navigates here to enter credentials and establish an authenticated session before crawling the rest of the application. |

---

## `openapi`

Configures API scanning using a Swagger or OpenAPI specification file. **When scanning APIs, ignore the `scope` and `authentication` blocks** — they are meant for website scanning only.

```yaml
openapi:
  targetUrl: https://api.example.com
```

| Field | Description |
|---|---|
| `targetUrl` | The base URL where the API is running. The scanner uses this as the target for all API endpoints defined in the spec file. |

### Providing the OpenAPI Spec File

The scanner looks for the OpenAPI/Swagger spec file in the same directory mounted to the container. Place your spec file (e.g. `openapi.json`, `swagger.yaml`) alongside the config file in the mounted directory.

Alternatively, if your API serves the spec file publicly (e.g. at `https://api.example.com/swagger.json`), the scanner can fetch it directly from the `targetUrl`.

---

## `options`

Controls scan depth, coverage, and advanced security checks. This block applies to both website and API scanning.

```yaml
options:
  advanced_security_checks: true
  coverage: "moderate"
```

### `advanced_security_checks`

When set to `true`, the scanner enables additional ZAP scripts and runs in headless memory mode. This performs deeper vulnerability detection but consumes more memory and takes longer to complete.

| Value | Behavior |
|---|---|
| `true` | Additional ZAP scripts enabled, deeper checks, higher memory and time usage |
| `false` | Standard scanning without additional scripts |

### `coverage`

Controls how deeply the scanner crawls your application and how long it spends on each check. Higher coverage means more pages discovered, more vulnerability checks per rule, and longer scan times.

| Level | Crawl Depth | URLs per Page | Expected Coverage | Scan Duration | Best For |
|---|---|---|---|---|---|
| `quick` | 5 levels | 25 | 10–20% | Up to 5 min | Fast smoke test, CI/CD gating, quick validation |
| `normal` | 10 levels | 50 | 60–70% | Up to 15 min | Standard CI/CD pipeline scans |
| `moderate` | 10 levels | 50 | 60–70% | Up to 30 min | Balanced depth with more thorough rule checking |
| `high` | 20 levels | 75 | 90–95% | Up to 45 min | Pre-release audits, comprehensive coverage |
| `veryHigh` | 25 levels | 100 | 95–99% | Up to 60 min | Full security audit, compliance scans, penetration testing prep |

**Detailed breakdown:**

| Level | Max Alerts per Rule | Rule Duration Limit | Description |
|---|---|---|---|
| `quick` | 1 | 1 min | Minimal alerts, scan rules run very briefly. Best for a rapid check before merge. |
| `normal` | 3 | 2 min | Moderate alert depth. Good default for automated pipelines. |
| `moderate` | 5 | 3 min | More time per rule, catches issues that `normal` might skip. |
| `high` | 5 | 5 min | Deep crawling with longer rule execution. Finds edge-case vulnerabilities. |
| `veryHigh` | 10 | 10 min | Maximum depth and duration. Discovers nearly everything at the cost of scan time. |

Coverage also affects **Nuclei template scanning**. Higher coverage levels enable additional vulnerability check categories:

| Level | Nuclei Template Categories |
|---|---|
| `quick` | Misconfig, exposure, CVE, takeover, default-login, tech |
| `normal` / `moderate` | All of quick + SSL, TLS |
| `high` / `veryHigh` | All of above + HTTP, CORS, XSS, SQLi, SSRF, redirect, LFI, RFI, token, secret, WordPress (core, plugins, themes) |

---

## Usage Scenarios

### Website with Authentication

Use `scope`, `authentication`, and `options`. Provide `--username` and `--password` via CLI flags.

```yaml
scope:
  entryUrls:
    - "https://staging.example.com/"
  excludePaths:
    - "https://staging.example.com/logout"

authentication:
  loginPageUrl: "https://staging.example.com/login"

options:
  coverage: "moderate"
```

```bash
docker run --rm --network host \
  -e X_CFIX_API_KEY=... -e ORG_ID=... -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web -v ~/scan-results:/output \
  corefixhq/cfix-web:latest web \
  --target https://staging.example.com \
  --username admin --password secret
```

### Website without Authentication

Use `scope` and `options` only. Skip `authentication`.

```yaml
scope:
  entryUrls:
    - "https://public-site.example.com/"

options:
  coverage: "high"
```

```bash
docker run --rm --network host \
  -e X_CFIX_API_KEY=... -e ORG_ID=... -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web -v ~/scan-results:/output \
  corefixhq/cfix-web:latest web \
  --target https://public-site.example.com
```

### API Scanning with OpenAPI Spec

Use `openapi` and `options` only. Skip `scope` and `authentication`. Place your OpenAPI/Swagger spec file in the same directory.

```yaml
openapi:
  targetUrl: https://api.example.com

options:
  coverage: "normal"
```

```bash
# Place openapi.json or swagger.yaml in the current directory
docker run --rm --network host \
  -e X_CFIX_API_KEY=... -e ORG_ID=... -e X_CFIX_API_URL=https://api.corefix.dev \
  -v $(pwd):/web -v ~/scan-results:/output \
  corefixhq/cfix-web:latest web \
  --target https://api.example.com \
  --token "Bearer eyJhbGciOi..."
```

### Quick CI/CD Smoke Test

Use `options` with `quick` coverage for fast pipeline gating:

```yaml
options:
  coverage: "quick"
```

### Full Security Audit

Use `options` with `veryHigh` coverage and `advanced_security_checks` enabled:

```yaml
scope:
  entryUrls:
    - "https://staging.example.com/"
  excludePaths:
    - "https://staging.example.com/logout"

authentication:
  loginPageUrl: "https://staging.example.com/login"

options:
  advanced_security_checks: true
  coverage: "veryHigh"
```

> **Note:** `veryHigh` with `advanced_security_checks: true` provides the most comprehensive scan but can take up to 60+ minutes and requires significant memory. Schedule these for nightly or weekly runs rather than on every commit.
