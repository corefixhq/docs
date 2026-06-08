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
| **Web App Scanning** | No `openapi` block, or `openapi` + `authentication` together | Required | Required (except `browser` type) | Required | Optional |
| **API Scanning** | Planned for `openapi` present + no `authentication` block. Currently unavailable | Not required | `Authorization` required | Not required | Required, but currently has no effect |

---

## Full YAML Structure

```yaml
developer: true                         # Always true

scope:                                  # Required for web app scanning. Not required for API scanning.
  entryUrls:                            # Required — URLs where spidering starts
    - "https://example.com"
  includePaths:                         # Optional — regex patterns for in-scope URLs
    - "https://example.com.*"
  excludePaths:                         # Optional — regex patterns for URLs to skip
    - "https://example.com/logout.*"

headers:                                # Required for json/form types and API scanning. Optional for browser type.
  Authorization: "Bearer {%json:token%}" # Use Authorization OR Cookie, not both

authentication:                         # Required for web app scanning. Omit for pure API scanning.
  type: "json"                          # Required — json | form | browser
  loginPageUrl: "..."                   # Required (all types)
  loginBackendUrl: "..."                # Required for json and form. Optional for browser.
  bodyTemplate: "..."                   # Required for json and form. Optional for browser.
  pollUrl: "..."                        # Optional — recommended for session verification
  loggedInRegex: "..."                  # Required (all types)
  loggedOutRegex: "..."                 # Optional

csrf:                                   # Optional — only needed for cookie/session-based apps with CSRF protection
  httpHeader: "X-CSRF-TOKEN"

openapi:                                # Optional — for API endpoint discovery
  targetUrl: "..."                      # Required if openapi block is present
  apiUrl: "..."                         # Optional — URL where spec is served
```

---

## Field Requirements Summary

### Top-Level Blocks

| Block | Web App (`json`/`form`) | Web App (`browser`) | API Scanning |
|---|---|---|---|
| `scope.entryUrls` | Required | Required | Not required |
| `headers` | Required | Optional | Required |
| `authentication` | Required | Required | Not required |
| `csrf` | Optional | Optional | Not required |
| `openapi` | Optional | Optional | Required |

### `headers`

| Field | `json` / `form` | `browser` | API Scanning |
|---|---|---|---|
| `Authorization` or `Cookie` | Required (one of them) | Optional | `Authorization` required |

### `authentication` Fields

| Field | `json` | `form` | `browser` |
|---|---|---|---|
| `type` | Required | Required | Required |
| `loginPageUrl` | Required | Required | Required |
| `loggedInRegex` | Required | Required | Required |
| `loginBackendUrl` | Required | Required | Optional |
| `bodyTemplate` | Required | Required | Optional |
| `pollUrl` | Optional | Optional | Optional |
| `loggedOutRegex` | Optional | Optional | Optional |

> `pollUrl` is optional but recommended. If omitted, the scanner warns that session polling will be skipped and relies solely on `loggedInRegex` matched against the login response.

---

## Field Descriptions

### `developer`

Always set to `true`. Enables developer scan mode.

```yaml
developer: true
```

---

### `scope`

Controls which URLs the scanner crawls and which it skips. Required for all web app scanning modes.

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

Headers injected on every scan, spider, and poll request after login. These are **not** sent on the login request itself — for login-specific headers, use `authentication.headers`.

```yaml
headers:
  Authorization: "Bearer {%json:token%}"
  tenant-id: "1"
  login-id: "iV5356"
```

> **Check your browser DevTools → Network tab → any authenticated request → Request Headers** to see all headers your app sends to the backend. Missing even one required header causes ZAP requests to be silently rejected — the scan runs as unauthenticated with no obvious error.

#### Dynamic Headers

Values that change every login — tokens, session IDs. Use `{%json:...%}` placeholders to extract from the login response body. ZAP can only extract values that look like JWT/Bearer tokens. Short strings and numbers **cannot** be extracted dynamically.

```yaml
# Login response: {"token": "eyJ..."}
Authorization: "Bearer {%json:token%}"

# Login response: {"accessToken": "eyJ..."}
Authorization: "Bearer {%json:accessToken%}"

# Login response: {"data": {"token": "eyJ..."}}
Authorization: "Bearer {%json:data.token%}"

# Login response: {"Authorization": "eyJ..."}
Authorization: "{%json:Authorization%}"
```

For cookie-based auth (Django, Rails, PHP) instead of Bearer tokens:

```yaml
Cookie: "SESSIONID={%cookie:SESSIONID%}"
```

Use **either** `Authorization` or `Cookie` — not both.

#### Static Headers

Values fixed per user or tenant — IDs, codes, role names. Hardcode these directly. ZAP will not extract them from the login response.

```yaml
tenant-id: "1"
login-id: "iV5356"
customer-name: "SBIBANK"
Role: "admin"
Version: "1.1.0"
X-Client-ID: "web"
```

> ✅ `tenant-id: "1"` — hardcoded, works
> ❌ `tenant-id: "{%json:results.tenantId%}"` — short string, will not be extracted

---

### `authentication`

Configures how the scanner logs into your application.

```yaml
authentication:
  type: "json"
  loginPageUrl: "https://example.com/login"
  loginBackendUrl: "https://api.example.com/auth/login"
  bodyTemplate: |
    {
      "username": "{identifier}",
      "password": "{password}"
    }
  pollUrl: "https://api.example.com/user/profile"
  pollFrequency: 10
  loggedInRegex: "success|profile|dashboard"
  loggedOutRegex: "Unauthorized|Invalid"
```

#### `type`

Choose based on how your application handles login:

| Type | How It Works | Best For |
|---|---|---|
| `json` | POSTs credentials to a backend API endpoint, receives a token (JWT/Bearer) in the response body | React, Angular, Vue SPAs with REST APIs, mobile backends |
| `form` | Submits login via a traditional HTML `<form>`, server responds with a session cookie | Django, Rails, PHP, older Java apps |
| `browser` | Launches a real headless browser to perform login. Handles JavaScript-driven forms, redirects, SSO, OAuth, MFA. Captures more URLs than `json` because the browser executes JavaScript and records all network traffic during login | Complex auth flows, anything that breaks with `json` or `form` |

#### `loginPageUrl`

The URL a user visits in their browser to see the login page. Required for all types.

- `form` — ZAP fetches this page to find the HTML form fields.
- `browser` — ZAP opens this URL in the headless browser to start the login flow.
- `json` — Not used during the actual login request, but required for context.

> For SPA apps, the login URL may contain a `#` fragment (e.g. `/#/auth/login`). This is fine for `browser` auth but has no meaning for `json` or `form` since everything after `#` never reaches the server.

#### `loginBackendUrl`

The actual API endpoint that receives login credentials as an HTTP POST. Required for `json` and `form` types.

```yaml
loginBackendUrl: "https://api.example.com/auth/login"
```

#### `bodyTemplate`

The request payload sent to `loginBackendUrl`. Required for `json` and `form` types. Modify the **JSON key names** to match your application's login payload — do not change `{identifier}` or `{password}`, they are internal placeholders replaced with real credentials at scan time.

```yaml
bodyTemplate: |
  {
    "username": "{identifier}",
    "password": "{password}"
  }
```

Check your browser DevTools → Network tab → login request → Request Payload to see the exact keys your server expects. Some apps require extra fields — if these are missing, login will silently fail even if credentials are correct:

```yaml
bodyTemplate: |
  {
    "email": "{identifier}",
    "password": "{password}",
    "clientId": "web",
    "isAdmin": false
  }
```

#### `authentication.headers` (Optional)

Headers required on the **login request itself** (not on subsequent scan requests — those go in the top-level `headers` block).

```yaml
authentication:
  type: "json"
  loginBackendUrl: "https://api.example.com/auth/login"
  headers:
    tenant-id: "1"
```

#### Post-Login Verification

After login, ZAP needs to confirm authentication succeeded. Three options:

**Option 1 — Verify against the login response directly (simplest, best for `json`)**

Leave `pollUrl` empty. Set `loggedInRegex` to a keyword in the login endpoint's own response body.

```yaml
authentication:
  type: "json"
  loginBackendUrl: "https://api.example.com/auth/login"
  bodyTemplate: |
    { "username": "{identifier}", "password": "{password}" }
  loggedInRegex: "token|success"
  loggedOutRegex: "Unauthorized|Invalid"
```

**Option 2 — Poll a protected endpoint (recommended)**

Set `pollUrl` to a backend API endpoint that requires authentication. ZAP periodically GETs this URL and checks the response against `loggedInRegex`.

```yaml
pollUrl: "https://api.example.com/user/profile"
pollFrequency: 10
loggedInRegex: "success|profile|dashboard"
loggedOutRegex: "Unauthorized|Invalid"
```

> **Never use SPA frontend URLs for `pollUrl`:**
> - ❌ `https://example.com/#/dashboard` — returns an empty HTML shell, JavaScript never executes
> - ❌ `https://example.com/app/home` — SPA client-side route
> - ✅ `https://api.example.com/user/profile` — actual backend endpoint
> - ✅ `https://api.example.com/dashboard/data` — actual backend endpoint
>
> `pollUrl` must be a **GET** endpoint — ZAP poll always sends a GET request.

**Option 3 — Auto-detect**

Remove `pollUrl`, `loggedInRegex`, and `loggedOutRegex` entirely. ZAP automatically identifies login/logout indicators from traffic. Works best with `browser` and `form` auth. Unreliable with `json` — prefer Option 1.

> **Tip:** If using `pollUrl`, test the endpoint manually first with curl to confirm your regex appears in the response:
> ```bash
> curl -X GET https://api.example.com/user/profile \
>   -H "Authorization: Bearer <token>"
> ```

#### `loggedInRegex` / `loggedOutRegex`

| Field | Description |
|---|---|
| `loggedInRegex` | Keyword or regex that only appears in a successful authenticated response. Use something specific like an email, role name, or status message rather than generic words like "success" that might appear in error responses. |
| `loggedOutRegex` | Keyword or regex that appears when credentials are wrong or the session has expired. Check your app by intentionally using wrong credentials and noting the response. |

---

### `csrf`

Required for HTML-based applications that use cookie/session auth with CSRF protection. **SPA apps using JWT Bearer tokens are not affected by CSRF and can skip this block.**

```yaml
csrf:
  httpHeader: "X-CSRF-TOKEN"
```

How it works: ZAP fetches pages during spidering, the script extracts the CSRF token from the response (header, cookie, or body), and injects it into every subsequent request. Without this, requests return 403 and the scan fails silently.

#### `httpHeader`

The header name to inject on every outgoing request with the extracted CSRF token. Check DevTools → Network → any XHR request → Request Headers to find the exact name.

**Common values by framework:**

| Framework | Header Name |
|---|---|
| Spring, Generic | `X-CSRF-TOKEN` |
| Django | `X-CSRFToken` |
| Angular, Laravel | `X-XSRF-TOKEN` |
| ASP.NET | `RequestVerificationToken` |

#### Extraction Method

Choose **one** of the following. If none is provided, built-in patterns auto-detect common frameworks (Spring, Django, Rails, Laravel, Angular, ASP.NET).

**`responseHeader`** — Server sends a CSRF token in a response header:

```yaml
csrf:
  httpHeader: "X-CSRF-TOKEN"
  responseHeader: "x-csrf-token"
```

**`cookieName`** — Server sets CSRF token as a cookie (Double Submit Cookie pattern):

```yaml
csrf:
  httpHeader: "X-CSRFToken"
  cookieName: "csrftoken"         # Django
```

```yaml
csrf:
  httpHeader: "X-XSRF-TOKEN"
  cookieName: "XSRF-TOKEN"       # Angular, Laravel
```

**`extractRegex`** — CSRF token is embedded in HTML response body:

```yaml
# Meta tag (Spring)
extractRegex: '<meta[^>]+name="_csrf"[^>]+content="([^"]+)"'

# Meta tag (Rails)
extractRegex: '<meta[^>]+name="csrf-token"[^>]+content="([^"]+)"'

# Hidden input field
extractRegex: '<input[^>]+name="_csrf"[^>]+value="([^"]+)"'

# JSON in script tag (Meta/Instagram)
extractRegex: '"csrf_token"\s*:\s*"([^"]+)"'
```

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

---

## Scenario Examples

### SPA with JWT Auth (React, Angular, Vue)

```yaml
developer: true

scope:
  entryUrls:
    - "https://api.example.com"
    - "https://app.example.com"
  includePaths:
    - "https://api.example.com.*"
    - "https://app.example.com.*"
  excludePaths:
    - "https://app.example.com/logout.*"

headers:
  Authorization: "Bearer {%json:token%}"

authentication:
  type: "json"
  loginPageUrl: "https://app.example.com/login"
  loginBackendUrl: "https://api.example.com/auth/login"
  bodyTemplate: |
    {
      "email": "{identifier}",
      "password": "{password}"
    }
  loggedInRegex: "token"
  pollUrl: "https://api.example.com/user/profile"
```

### Traditional HTML App (Django, Rails, PHP)

```yaml
developer: true

scope:
  entryUrls:
    - "https://example.com"
  excludePaths:
    - "https://example.com/logout.*"

headers:
  Cookie: "PHPSESSID={%cookie:PHPSESSID%}; security=low;"

authentication:
  type: "form"
  loginPageUrl: "https://example.com/login"
  loginBackendUrl: "https://example.com/login"
  loggedInRegex: "dashboard|welcome"
  loggedOutRegex: "Unauthorized|login"
  pollUrl: "https://example.com/index.php"

csrf:
  httpHeader: "X-CSRFToken"
  cookieName: "csrftoken"
```

### Complex Auth (SSO, OAuth, MFA)

```yaml
developer: true

scope:
  entryUrls:
    - "https://example.com"
  excludePaths:
    - "https://example.com/logout.*"

authentication:
  type: "browser"
  loginPageUrl: "https://example.com/login"
  loggedInRegex: "success"
  loggedOutRegex: "Invalid"
```

### API Scanning with OpenAPI Spec (Not Currently Available)

```yaml
developer: true

headers:
  Authorization: "Bearer <token>"

openapi:
  targetUrl: "https://api.example.com"
  apiUrl: "https://api.example.com/v3/api-docs"
```

### API Scanning + Web App Scanning Combined (Not Currently Available)

When API testing becomes available, both `openapi` and `authentication` blocks together will run both web app auth scanning and OpenAPI-based endpoint discovery. Today, the `openapi` block has no effect.

```yaml
developer: true

scope:
  entryUrls:
    - "https://api.example.com"

headers:
  Authorization: "Bearer {%json:token%}"

authentication:
  type: "json"
  loginPageUrl: "https://app.example.com/login"
  loginBackendUrl: "https://api.example.com/auth/login"
  bodyTemplate: |
    { "email": "{identifier}", "password": "{password}" }
  loggedInRegex: "token"

openapi:
  targetUrl: "https://api.example.com"
  apiUrl: "https://api.example.com/v3/api-docs"
```
