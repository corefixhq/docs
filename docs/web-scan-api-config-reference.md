---
hide_title: true
sidebar_label: API Scan Config Reference
---

## API Scan Config Reference

The `.cfix.web.yaml` file for **API testing** uses the same structure as the [Web Scan Config Reference](./web-scan-config-reference), with two differences:

1. `openapi: true` is always set.
2. The `authentication` block logs in by calling your **backend login API** directly, extracting the token from the JSON response, and sending it with every request. No browser login is involved.

Place this file in the directory you mount into the `corefixhq/cfix-web` Docker container at `/web`.

---

## Full YAML Structure

```yaml
openapi: true                           # Always true for API testing

headers:                                # Static business headers sent with every scan request
  X-Hospital-Group: medicore
  X-API-Version: v1

authentication:
  loginBackendUrl: http://localhost:8787/auth/login   # Backend API that returns the token
  jsonPath: token                                     # Where the token sits in the login response
  authTokenPrefix: Bearer                             # "Bearer", "JWT", or "" for no prefix
  bodyTemplate: |
    {
      "username": "{%username%}",
      "password": "{%password%}"
    }

  # Headers for the login request only (if needed). Not sent with later requests.
  headers:
    X-Hospital-Group: medicore
    X-API-Version: v1

  # Verification of login success (polling the /api/me endpoint for a token in the JSON response).
  pollUrl: http://localhost:8787/api/me
  loggedInRegex: '"token"'

includePaths:                           # Optional — regex patterns for the APIs to scan
  - https://example.com/api/v1/patients.*

excludePaths:                           # Optional — regex patterns for URLs to skip
  - https://example.com/logout.*
```

The API under test is the URL you pass with `--target`.

---

## Field Descriptions

### `openapi`

Always set to `true`. This puts the scan in API testing mode.

```yaml
openapi: true
```

---

### `headers`

Static headers sent with **every request after login**, such as tenant IDs, client IDs, API versions and feature flags.

```yaml
headers:
  X-Hospital-Group: medicore
  X-API-Version: v1
```

> The `headers` key at the top level applies to the rest of the scan requests. Headers needed only by the login request go under `authentication.headers`.

---

### `authentication`

Instead of driving a login page, the scanner sends a request to your login API, reads the token from the response, and attaches it to all later requests.

| Field | Description |
|---|---|
| `loginBackendUrl` | The backend API endpoint that accepts credentials and returns a token. It can be on the same domain as `--target` or a separate auth service. |
| `jsonPath` | Path to the token inside the login response JSON. See [jsonPath examples](#jsonpath). |
| `authTokenPrefix` | Prefix placed before the token in the auth header, such as `Bearer` or `JWT`. Use an empty string (`""`) if no prefix is used. |
| `bodyTemplate` | The JSON body sent to `loginBackendUrl`. Use the placeholders described [below](#bodytemplate). |
| `headers` | Optional. Custom headers for the login request only. Not sent with subsequent requests. |
| `pollUrl` | A backend GET endpoint that requires authentication. Used to verify the login worked and the session is still valid. |
| `loggedInRegex` | Keyword or regex that appears in the `pollUrl` response only when logged in. **Required whenever `pollUrl` is set.** |

#### `jsonPath`

`jsonPath` is the path to the token in the login response, using dots for keys and `[n]` for array positions.

**Token directly under a `token` key:**

```json
{ "token": "eyJhbGciOi..." }
```

```yaml
jsonPath: token
```

**Token inside a nested object:**

```json
{
  "data": {
    "version": 1,
    "jwt": { "token": "eyJhbGciOi...", "algo": "HS256", "expiry": 1735689600 },
    "user": "alice",
    "timezone": "india"
  },
  "status": "ok",
  "msg": "login ok"
}
```

```yaml
jsonPath: data.jwt.token
```

**Token inside an array:**

```json
{
  "data": {
    "jwt": [
      { "token": "eyJhbGciOi...", "algo": "HS256", "expiry": 1735689600, "type": "shortlived" },
      { "token": "dGhpcyBpcyBh...", "type": "refresh" }
    ],
    "user": "alice",
    "timezone": "india"
  }
}
```

```yaml
jsonPath: data.jwt[0].token
```

Here `[0]` picks the short-lived access token, not the refresh token.

#### `authTokenPrefix`

The scheme placed before the token in the `Authorization` header.

```yaml
authTokenPrefix: Bearer     # Authorization: Bearer <token>
authTokenPrefix: JWT        # Authorization: JWT <token>
authTokenPrefix: ""         # Authorization: <token>
```

#### `bodyTemplate`

The JSON body for the login request. The placeholders are filled from the credentials you pass on the command line:

| Placeholder | Filled from |
|---|---|
| `{%username%}` | `--username` |
| `{%password%}` | `--password` |

Always use these placeholders as the **values**. You can change the JSON **keys** to match what your API expects, such as `email` or `login`, but do not replace the placeholder values with real credentials.

```yaml
# Login API expects "email" instead of "username"
bodyTemplate: |
  {
    "email": "{%username%}",
    "password": "{%password%}"
  }
```

If your login API needs more fields, add them to the template as custom keys. Any other custom values you pass on the command line can be injected the same way.

#### `authentication.headers`

Some login endpoints need their own headers, such as a tenant or API version. Put them here. They are sent **only with the login request**.

```yaml
authentication:
  headers:
    X-Hospital-Group: medicore
```

Headers that every later request needs belong in the top-level `headers` block instead. If both the login request and the scan requests need the same header, list it in both places.

#### `pollUrl` and `loggedInRegex`

If you set `pollUrl`, you must also set `loggedInRegex`. The scanner sends a GET request to `pollUrl` and checks the response against `loggedInRegex` to confirm the token is accepted.

```yaml
pollUrl: http://localhost:8787/api/me
loggedInRegex: '"token"'
```

Pick a value that only appears in a successful authenticated response, such as a JSON field name, an email, or a role name. Avoid generic words like `success` that might also appear in error responses.

> **Tip:** Test both calls with curl first. Confirm the login response contains the token at your `jsonPath`, then confirm `pollUrl` returns your `loggedInRegex` with that token:
> ```bash
> curl -X POST http://localhost:8787/auth/login \
>   -H "Content-Type: application/json" \
>   -d '{"username":"alice","password":"secret"}'
>
> curl -X GET http://localhost:8787/api/me \
>   -H "Authorization: Bearer <token>"
> ```

---

### `includePaths` / `excludePaths`

By default, every endpoint in your OpenAPI spec is scanned. Use these regex patterns to scan only a selected set of APIs.

| Field | Description |
|---|---|
| `includePaths` | Regex patterns for the URLs to scan. Only endpoints from the spec that match are targeted. |
| `excludePaths` | Regex patterns for URLs to skip. Static assets are excluded automatically, so only add application-specific paths. |

**Select a few APIs with `includePaths`:**

```yaml
includePaths:
  - https://api\.example\.com/v1/patients.*
  - https://api\.example\.com/v1/appointments.*
```

**Or exclude everything you don't want scanned with `excludePaths`:**

```yaml
excludePaths:
  - https://api\.example\.com/v1/admin.*
  - https://api\.example\.com/v1/billing.*
  - https://api\.example\.com/logout.*
```

Use whichever is shorter for your case: `includePaths` when you want a small set of APIs, `excludePaths` when you want most of the spec except a few paths.

> **Always exclude your logout URL.** Scanning it ends the session mid-scan and every later authenticated request fails.

---

## Scenario Examples

### Token at the Top Level

```yaml
openapi: true

authentication:
  loginBackendUrl: https://api.example.com/auth/login
  jsonPath: token
  authTokenPrefix: Bearer
  bodyTemplate: |
    {
      "username": "{%username%}",
      "password": "{%password%}"
    }
  pollUrl: https://api.example.com/api/me
  loggedInRegex: '"email"'

excludePaths:
  - https://api\.example\.com/logout.*
```

### Nested Token, Business Headers, and Login-Only Headers

```yaml
openapi: true

headers:
  X-Hospital-Group: medicore
  X-API-Version: v1

authentication:
  loginBackendUrl: https://auth.example.com/v1/login
  jsonPath: data.jwt.token
  authTokenPrefix: Bearer
  bodyTemplate: |
    {
      "email": "{%username%}",
      "password": "{%password%}"
    }
  headers:
    X-Hospital-Group: medicore
  pollUrl: https://api.example.com/v1/user/profile
  loggedInRegex: '"userId"'

excludePaths:
  - https://api\.example\.com/logout.*
```

### Scan Only Selected APIs

```yaml
openapi: true

authentication:
  loginBackendUrl: https://api.example.com/auth/login
  jsonPath: token
  authTokenPrefix: Bearer
  bodyTemplate: |
    {
      "username": "{%username%}",
      "password": "{%password%}"
    }
  pollUrl: https://api.example.com/api/me
  loggedInRegex: '"email"'

includePaths:
  - https://api\.example\.com/v1/patients.*
  - https://api\.example\.com/v1/appointments.*
```

### Token in an Array, Custom Prefix

```yaml
openapi: true

authentication:
  loginBackendUrl: https://api.example.com/login
  jsonPath: data.jwt[0].token
  authTokenPrefix: JWT
  bodyTemplate: |
    {
      "username": "{%username%}",
      "password": "{%password%}"
    }
  pollUrl: https://api.example.com/me
  loggedInRegex: '"username"'
```

### No Token Prefix

```yaml
openapi: true

authentication:
  loginBackendUrl: https://api.example.com/login
  jsonPath: access_token
  authTokenPrefix: ""
  bodyTemplate: |
    {
      "username": "{%username%}",
      "password": "{%password%}"
    }
  pollUrl: https://api.example.com/me
  loggedInRegex: '"username"'
```
