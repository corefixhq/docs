---
hide_title: true
sidebar_label: Web Scan Config Reference
---

## Web Scan Config Reference

::: warning Limitation
This reference documents how API testing will be performed with the `openapi` block. API testing is not currently available, so the `openapi` block has no effect today.
:::

The `.cfix.web.yaml` file controls how CoreFix scans your web application. The scanner operates in one of two modes depending on the blocks present — **Web App Scanning** or planned **API Scanning**. This page documents what each field does, which fields are required per mode, and example configs for common scenarios.

Place this file in the directory you mount into the `corefixhq/cfix-web` Docker container at `/web`.

---

## Scanning Modes

| Mode | When It Applies | `scope` | `headers` | `authentication` | `openapi` |
|---|---|---|---|---|---|
| **Web App Scanning** | No `openapi` block, or `openapi` + `authentication` together | Required | Business headers only | Required | Optional |
| **API Scanning** | Planned for `openapi` block present. Currently unavailable | Required | Business headers, plus `Authorization`/`Cookie` if your spec needs them | Optional, but recommended (`pollUrl` only) | Required, but currently has no effect |

---

## Full YAML Structure

```yaml
developer: true                         # Always true

scope:                                  # Required for both Web App and API scanning
  entryUrls:                            # Required — URLs where spidering starts
    - "https://example.com"
  includePaths:                         # Optional — regex patterns for in-scope URLs
    - "https://example.com.*"
  excludePaths:                         # Optional — regex patterns for URLs to skip
    - "https://example.com/logout.*"

headers:                                # Business headers only. Add Authorization/Cookie only if the openapi block is present and your spec needs them.
  tenant-id: "1"

authentication:                         # Required for Web App Scanning. Optional (but recommended) for API Scanning.
  type: "browser"                       # Always "browser". Omit entirely for API scanning.
  loginPageUrl: "..."                   # Required for Web App Scanning. Not needed for API scanning.
  pollUrl: "..."                        # Required — session verification endpoint
  loggedInRegex: "..."                  # Recommended
  loggedOutRegex: "..."                 # Recommended — combine multiple failure conditions with OR

openapi:                                # Planned for API Scanning — endpoint discovery from a spec. Not currently available.
  targetUrl: "..."                      # Required if openapi block is present
  apiUrl: "..."                         # Optional — URL where spec is served
```

---

## Field Requirements Summary

### Top-Level Blocks

| Block | Web App Scanning | API Scanning (planned, not currently available) |
|---|---|---|
| `scope.entryUrls` | Required | Required |
| `headers` | Business headers only | Business headers, plus `Authorization`/`Cookie` if the spec needs them |
| `authentication` | Required | Optional, but recommended |
| `openapi` | Optional | Required, but currently has no effect |

### `authentication` Fields

| Field | Web App Scanning | API Scanning (planned, not currently available) |
|---|---|---|
| `type` | Required — always `browser` | Omit |
| `loginPageUrl` | Required | Omit |
| `pollUrl` | Required | Required (this is the only field needed) |
| `loggedInRegex` | Recommended | Not applicable |
| `loggedOutRegex` | Recommended | Not applicable |

> For API Scanning, the `authentication` block is optional, but it's always recommended to include one with just `pollUrl` set — this lets the scanner verify that requests it sends against the spec are actually authenticated. **API Scanning is planned and not currently available**, so this has no effect today.

---

## Field Descriptions

### `developer`

Always set to `true`. Enables developer scan mode.

```yaml
developer: true
```

---

### `scope`

Controls which URLs the scanner crawls and which it skips. Required for both Web App and API Scanning — this block does not change between modes.

```yaml
scope:
  entryUrls:
    - "https://example.com"
  includePaths:
    - "https://example.com.*"
    - "https://api.example.com.*"
  excludePaths:
    - "https://example.com/logout.*"
```

| Field | Description |
|---|---|
| `entryUrls` | URLs where spidering/crawling starts. For single-domain apps, `--target` is sufficient and this can match it. For multi-domain apps, list all domains here. |
| `includePaths` | Regex patterns for URLs that must stay in scope. Include both frontend and backend API domains if they differ. For SPAs, the backend API domain is more important since all actual functionality lives in API endpoints. |
| `excludePaths` | Regex patterns for URLs to skip. Static assets (`.png`, `.css`, `.jpg`, `.svg`, `.ico`, `.woff2`, etc.) are excluded automatically — only add application-specific paths here. |

> **Always exclude your logout URL** when running authenticated scans — ZAP scanning it will kill the session mid-scan and cause all subsequent authenticated requests to fail.

#### SPA Applications (React, Angular, Vue)

Use the base domain URL in `entryUrls`. Avoid hash routes like `/#/dashboard` — the traditional spider ignores everything after `#` since it never reaches the server. Browser auth will naturally start from `loginPageUrl` and capture traffic from there.

#### Multi-Domain Apps — URL Order Matters

ZAP uses the **first URL** in `entryUrls` as the primary site for auth reporting. If your login API is on a different domain than your frontend, **put the login domain first** — otherwise the auth report will show the wrong domain and authentication will appear to fail even when it succeeds.

```yaml
# React app on spa.example.com, login API on backend.example.com
entryUrls:
  - "https://backend.example.com"    # login domain FIRST
  - "https://spa.example.com"        # app domain second
includePaths:
  - "https://backend.example.com.*"
  - "https://spa.example.com.*"
```

> `includePaths` order does not affect this — only `entryUrls` order matters.

---

### `headers`

Headers injected on every scan, spider, and poll request after login.

**Only list static, business-specific headers here** — tenant IDs, client IDs, role names, feature flags, and the like. Do **not** put `Authorization` or `Cookie` here for Web App Scanning: the `browser` authentication type captures and replays the session itself, so it doesn't need them.

```yaml
headers:
  tenant-id: "1"
  login-id: "iV5356"
  customer-name: "SBIBANK"
  X-Client-ID: "web"
```

The one exception is planned **API Scanning** (not currently available): when the `openapi` block is present, include `Authorization` and/or `Cookie` alongside your business headers if the spec requires them. Some APIs authenticate with both together — a bearer token *and* a session cookie — so add whichever your spec actually needs.

```yaml
headers:
  Authorization: "Bearer <token>"
  Cookie: "SESSIONID=<session-id>"
  tenant-id: "1"
```

> **Check your browser DevTools → Network tab → any authenticated request → Request Headers** to see all headers your app sends to the backend. Missing even one required business header causes requests to be silently rejected — the scan runs as unauthenticated with no obvious error.

> ✅ `tenant-id: "1"` — hardcoded, works
> ❌ `Authorization: "Bearer <token>"` in a Web App Scanning config with no `openapi` block — unnecessary, `browser` auth handles the session for you

---

### `authentication`

Configures how the scanner logs into your application. `type` is always `browser` — it launches a real headless browser to perform login, so it handles most JavaScript-driven forms, redirects, SSO, OAuth, and MFA without any extra configuration.

> If your login flow can't be driven this way (e.g. an OAuth/MFA flow with no scriptable form), see [Scanning Complex Apps (OAuth, MFA) — Token & Cookie Injection](./web-scan-complex-auth) for bypassing login entirely with a pre-authenticated `--token`.

```yaml
authentication:
  type: browser
  loginPageUrl: "https://example.com/login"
  pollUrl: "https://api.example.com/v2/user/profile"
  loggedOutRegex: >-
    (Invalid credentials)|(token expired)|(HTTP/1\.1 401 Unauthorized)|(HTTP/1\.1 401)|(401 Unauthorized)|(name="password")|(Location:\s*.*\/login)
  loggedInRegex: (HTTP/1\.1 200)|(HTTP/2(\.0)? 200)|(HTTP/3(\.0)? 200)
```

#### `type`

Always `browser`. Required for Web App Scanning; omit the whole `authentication` block's `type`/`loginPageUrl` pair for planned API Scanning (see below — not currently available).

#### `loginPageUrl`

The URL a user visits in their browser to see the login page. ZAP opens this URL in the headless browser to start the login flow. **Required for Web App Scanning.**

> For SPA apps, the login URL may contain a `#` fragment (e.g. `/#/auth/login`) — this is fine, since `browser` auth executes JavaScript and follows client-side routing.

#### `pollUrl`

A backend API endpoint that requires authentication. ZAP periodically GETs this URL after login and checks the response against `loggedInRegex`/`loggedOutRegex` to confirm the session is still valid. **Required** for Web App Scanning, and recommended for planned API Scanning (not currently available).

```yaml
pollUrl: "https://api.example.com/v2/user/vessel"
```

> **Never use SPA frontend URLs for `pollUrl`:**
> - ❌ `https://example.com/#/dashboard` — returns an empty HTML shell, JavaScript never executes
> - ❌ `https://example.com/app/home` — SPA client-side route
> - ✅ `https://api.example.com/v2/user/profile` — actual backend endpoint
>
> `pollUrl` must be a **GET** endpoint — ZAP poll always sends a GET request.

> **Tip:** Test the endpoint manually first with curl to confirm your regex appears in the response:
> ```bash
> curl -X GET https://api.example.com/v2/user/profile \
>   -H "Authorization: Bearer <token>"
> ```

#### `loggedInRegex` / `loggedOutRegex`

| Field | Description |
|---|---|
| `loggedInRegex` | Keyword or regex that only appears in a successful authenticated response — an HTTP status line (`HTTP/1.1 200`), an email, a role name, or a status message. Avoid generic words like "success" that might also appear in error responses. |
| `loggedOutRegex` | Keyword or regex that appears when the session is no longer valid — wrong credentials **or** an expired token. |

**Recommendation:** combine multiple failure conditions into `loggedOutRegex` with `|` alternation — one pattern for a failed login attempt, another for token expiry:

```yaml
loggedOutRegex: >-
  (Invalid credentials)|(token expired)|(HTTP/1\.1 401
  Unauthorized)|(HTTP/1\.1 401)|(401
  Unauthorized)|(name="password")|(Location:\s*.*\/login)
```

If your app returns `HTTP 401` for both a wrong login and an expired token, the scanner already detects `401 Unauthorized` automatically — the explicit `401` patterns above are a belt-and-suspenders fallback. But if token expiry returns something **other than 401** (a `200` with an error body, a redirect, a custom message like `"token expired"`), you must add that exact message to `loggedOutRegex` yourself, or the scanner won't notice the session died.

---

### `openapi`

::: warning Limitation
The `openapi` block is documented for upcoming API testing. It currently has no effect.
:::

Imports API endpoint definitions from an OpenAPI/Swagger spec. Gives ZAP complete knowledge of all documented endpoints — including POST/PUT/DELETE with exact request body schemas — without relying on the spider to discover them. Combined with HAR files, this enables shadow API detection.

Supported formats: OpenAPI 2.0 (Swagger), OpenAPI 3.0, YAML or JSON.

```yaml
openapi:
  targetUrl: "https://api.example.com"
  apiUrl: "https://api.example.com/v3/api-docs"
```

| Field | Description |
|---|---|
| `targetUrl` | The deployed server URL to scan. Overrides any `localhost` or internal IPs in the spec's `servers` block. Required when the `openapi` block is present. |
| `apiUrl` | URL where the spec is served by the running application (see common endpoints below). |
| `apiFile` | Path to a spec file mounted in the container. Use when the spec is not publicly exposed. |

Provide either `apiUrl` to fetch the spec from the live application, or drop the spec file (`.json` or `.yaml`) in the mounted `/web` directory — the scanner detects it automatically.

**Common spec endpoints by framework:**

| Framework | Endpoint |
|---|---|
| Spring Boot | `/v3/api-docs` or `/v2/api-docs` |
| FastAPI | `/openapi.json` |
| Django | `/api/schema/` |
| Express | `/api-docs` |
| Laravel | `/api/documentation` |

When `openapi` support ships, remember that `headers` may need `Authorization` and/or `Cookie` in addition to your business headers — some specs authenticate with both at once (see [`headers`](#headers) above).

---

## Scenario Examples

### Web App Scanning — Browser Auth

```yaml
developer: true

scope:
  entryUrls:
    - https://demo-oq.ishipplus.cloud
  includePaths:
    - https://demo-oq.ishipplus.cloud.*
  excludePaths:
    - https://demo-oq\.ishipplus\.cloud/logout.*

headers: {}

authentication:
  type: browser
  loginPageUrl: https://demo-oq.ishipplus.cloud/login
  pollUrl: https://demo-oq.ishipplus.cloud/v2/user/vessel
  loggedOutRegex: >-
    (Invalid credentials)|(token expired)|(HTTP/1\.1 401
    Unauthorized)|(HTTP/1\.1 401)|(401
    Unauthorized)|(name="password")|(Location:\s*.*\/login)
  loggedInRegex: (HTTP/1\.1 200)|(HTTP/2(\.0)? 200)|(HTTP/3(\.0)? 200)
```

### Web App Scanning — With Business Headers

```yaml
developer: true

scope:
  entryUrls:
    - "https://app.example.com"
  excludePaths:
    - "https://app.example.com/logout.*"

headers:
  tenant-id: "1"
  X-Client-ID: "web"

authentication:
  type: browser
  loginPageUrl: "https://app.example.com/login"
  pollUrl: "https://api.example.com/user/profile"
  loggedInRegex: "(HTTP/1\\.1 200)|(HTTP/2(\\.0)? 200)"
  loggedOutRegex: "(Invalid credentials)|(token expired)|(HTTP/1\\.1 401)"
```

### API Scanning with OpenAPI Spec (Not Currently Available)

```yaml
developer: true

scope:
  entryUrls:
    - "https://api.example.com"

headers:
  tenant-id: "1"

authentication:
  pollUrl: "https://api.example.com/v3/user/profile"

openapi:
  targetUrl: "https://api.example.com"
  apiUrl: "https://api.example.com/v3/api-docs"
```

### API Scanning — Spec Requires Both Authorization and Cookie (Not Currently Available)

```yaml
developer: true

scope:
  entryUrls:
    - "https://api.example.com"

headers:
  Authorization: "Bearer <token>"
  Cookie: "SESSIONID=<session-id>"
  tenant-id: "1"

authentication:
  pollUrl: "https://api.example.com/v3/user/profile"

openapi:
  targetUrl: "https://api.example.com"
  apiUrl: "https://api.example.com/v3/api-docs"
```

### API Scanning + Web App Scanning Combined (Not Currently Available)

When API testing becomes available, `openapi` and `authentication` (with `type: browser` and `loginPageUrl`) together will run both web app auth scanning and OpenAPI-based endpoint discovery in one pass. Today, the `openapi` block has no effect.

```yaml
developer: true

scope:
  entryUrls:
    - "https://api.example.com"

headers:
  tenant-id: "1"

authentication:
  type: browser
  loginPageUrl: "https://app.example.com/login"
  pollUrl: "https://api.example.com/user/profile"
  loggedInRegex: "(HTTP/1\\.1 200)"
  loggedOutRegex: "(Invalid credentials)|(token expired)|(HTTP/1\\.1 401)"

openapi:
  targetUrl: "https://api.example.com"
  apiUrl: "https://api.example.com/v3/api-docs"
```
