---
hide_title: true
sidebar_label: Web Scan Config Reference
---

## Web Scan Config Reference

The `.cfix.web.yaml` file controls how CoreFix scans your web application. This file is dedicated to **web application scanning** only.

Place this file in the directory you mount into the `corefixhq/cfix-web` Docker container at `/web`.

By default, CoreFix scans your application as a web app: a headless Firefox browser is launched to log in and drive the application.

---

## Full YAML Structure

```yaml
includePaths:                           # Optional — regex patterns for in-scope URLs
  - https://app\.example\.com/.*
excludePaths:                           # Optional — regex patterns for URLs to skip
  - https://app\.example\.com/logout.*

headers:                                # Optional — static business headers
  X-Tenant-ID: acme
  X-API-Version: v1

authentication:
  loginPageUrl: https://app.example.com/auth/login   # Login page form URL
  # Verification of login success (polling the /api/me endpoint for a token in the JSON response).
  pollUrl: https://app.example.com/api/me
  loggedInRegex: '"token"'
```

---

## Field Descriptions

### `includePaths` / `excludePaths`

Regex patterns that control which URLs the scanner keeps in scope and which it skips.

```yaml
includePaths:
  - https://app\.example\.com/.*
excludePaths:
  - https://app\.example\.com/logout.*
```

| Field | Description |
|---|---|
| `includePaths` | Regex patterns for URLs that must stay in scope. Use these to filter frontend URLs or backend APIs. Include both the frontend and backend API domains if they differ. |
| `excludePaths` | Regex patterns for URLs to skip. Static assets (`.png`, `.css`, `.jpg`, `.svg`, `.ico`, `.woff2`, etc.) are excluded automatically, so only add application-specific paths here. |

> **Always exclude your logout URL.** Scanning it ends the session mid-scan and every later authenticated request fails.

> **Escape dots in domains** (`\.`) so they match literally instead of acting as a regex wildcard.

---

### `headers`

Static headers sent with every request. If your APIs use custom or business-specific headers, list them here: tenant IDs, client IDs, role names, API versions, feature flags, and the like.

```yaml
headers:
  X-Tenant-ID: acme
  X-API-Version: v1
```

> **Tip:** Open browser DevTools → Network tab → any authenticated request → Request Headers to see every header your app sends to the backend. If a required business header is missing, requests can be silently rejected and the scan runs unauthenticated with no obvious error.

---

### `authentication`

Configures how the scanner logs into your application. A headless Firefox browser is launched to perform the login, so it handles JavaScript-driven forms and redirects.

```yaml
authentication:
  loginPageUrl: https://app.example.com/auth/login
  pollUrl: https://app.example.com/api/me
  loggedInRegex: '"token"'
```

| Field | Description |
|---|---|
| `loginPageUrl` | The URL of the login page form, used directly. |
| `pollUrl` | A backend GET endpoint that requires authentication. The scanner polls it to verify the login succeeded and the session is still valid. |
| `loggedInRegex` | Keyword or regex that appears in the `pollUrl` response only when logged in. **Required whenever `pollUrl` is set.** |

#### `loginPageUrl`

Always point this at the login page form itself. If the login form URL is not given, the scanner can get stuck and authentication can fail.

#### `pollUrl` and `loggedInRegex`

If you set `pollUrl`, you must also set `loggedInRegex`. The scanner sends a GET request to `pollUrl` and checks the response against `loggedInRegex` to confirm authentication.

Pick a value that only appears in a successful authenticated response, such as a field name in the JSON (`"token"`), an email, or a role name. Avoid generic words like `success` that might also appear in error responses.

Use a real backend endpoint, not a frontend page:

- ❌ `https://example.com/#/dashboard` returns an empty HTML shell, because JavaScript never runs
- ❌ `https://example.com/app/home` is a client-side route
- ✅ `https://app.example.com/api/me` is a backend endpoint that returns JSON

> **Tip:** Test the endpoint with curl first to confirm your regex appears in the response:
> ```bash
> curl -X GET https://app.example.com/api/me \
>   -H "Authorization: Bearer <token>"
> ```

---

## Scenario Examples

### Basic Web App Scan

```yaml
includePaths:
  - https://app.example.com/.*
excludePaths:
  - https://app\.example\.com/logout.*

authentication:
  loginPageUrl: https://app.example.com/login
  pollUrl: https://app.example.com/api/me
  loggedInRegex: '"email"'
```

### With Custom Business Headers

```yaml
includePaths:
  - https://app\.example\.com/.*
excludePaths:
  - https://app\.example\.com/logout.*

headers:
  X-Tenant-ID: acme
  X-API-Version: v1

authentication:
  loginPageUrl: https://app.example.com/auth/login
  pollUrl: https://app.example.com/api/me
  loggedInRegex: '"token"'
```

### Frontend and Backend on Different Domains

Use `includePaths` to keep both the frontend and the backend API in scope.

```yaml
includePaths:
  - https://spa\.example\.com/.*
  - https://api\.example\.com/.*
excludePaths:
  - https://spa\.example\.com/logout.*

authentication:
  loginPageUrl: https://spa.example.com/login
  pollUrl: https://api.example.com/v2/user/profile
  loggedInRegex: '"userId"'
```
