---
hide_title: true
sidebar_label: Complex Auth (OAuth/MFA) Config Reference
---

## Scanning Complex Apps (OAuth, MFA) — Token & Cookie Injection

Some applications can't be logged into automatically — OAuth flows, SSO redirects to a third-party identity provider, or MFA challenges. For these, CoreFix skips the login step entirely: you supply an already-authenticated Authorization header or Cookie value yourself, and the scanner injects it into every request instead of driving a login flow.

There is **no automatic detection** for this mode. You must build the `.cfix.web.yaml` file below yourself, mount it to `/web`, and pass the token via `--token`.

::: warning
Do **not** add an `openapi` block to this config. `openapi` switches the scanner into API Scanning (spec-based endpoint discovery) instead of Web App Scanning — adding it here will cause your scan to run as an OpenAPI scan rather than a crawl of your app using the injected token/cookie. Keep this config to `scope`, `headers`, and `authentication.pollUrl` only.
:::

### When to use this

- OAuth / SSO / MFA logins that can't be scripted through a login form
- Apps where credential-based auth (`authentication.type: browser` + `loginPageUrl` in [Web Scan Config Reference](./web-scan-config-reference)) fails or isn't possible
- You already have a way to obtain a valid session — browser DevTools, a login script, a service account token

---

## Full YAML Structure

```yaml
developer: true                         # Always true

scope:                                  # Required — same as Web App Scanning
  entryUrls:
    - "https://example.com"
  includePaths:
    - "https://example.com.*"
  excludePaths:
    - "https://example.com/logout.*"

headers:                                # Business headers only, plus Cookie — see below
  tenant-id: "1"

authentication:                         # Required for complex web apps
  pollUrl: "..."                        # Required — session verification endpoint
```

There is no `authentication.type` or `loginPageUrl` here — there's no login flow for the scanner to drive, so those fields are omitted entirely. The only thing `authentication` needs is `pollUrl`.

`authentication.pollUrl` is **required** in this mode. Since there are no credentials and no login step to observe, `pollUrl` is the only way the scanner can confirm the token/cookie you supplied is actually valid and authenticated — without it, a bad or expired token would fail silently and the scan would run unauthenticated with no obvious error.

---

## Supplying the Token — `--token`

Pass the credential via the `--token` flag (or `TOKEN` environment variable) on the `corefixhq/cfix-web` container — not in the YAML. Whether it's a Bearer token or a Cookie value, and whether `Cookie` also needs to go in `headers`, depends on what your app actually uses:

| Your app uses | What to do |
|---|---|
| **Authorization header only** (Bearer/JWT) | Pass the token via `--token`. Do not add `Authorization` to `headers`. |
| **Cookie only** (session cookie, no Authorization header) | Pass the cookie value via `--token`. |
| **Both** an Authorization header and a Cookie together | Pass the Bearer token via `--token`, and add `Cookie` under `headers` in the yaml. |

The rule of thumb: if an Authorization header is used at all, it always goes through `--token`. Cookie only goes through `--token` when it's the sole auth mechanism — if a Bearer token is also present, the Cookie moves to `headers` and `--token` carries the Bearer token instead.

### Authorization header only

```yaml
headers:
  tenant-id: "1"

authentication:
  pollUrl: "https://api.example.com/user/profile"
```

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://example.com \
  --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Cookie only

```yaml
headers:
  tenant-id: "1"

authentication:
  pollUrl: "https://example.com/api/session"
```

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://example.com \
  --token "SESSIONID=abc123; security=low"
```

### Both Authorization header and Cookie

Some apps authenticate with a Bearer token *and* a session cookie together. In that case, the Cookie goes under `headers`, and the Bearer token still goes via `--token`.

```yaml
headers:
  Cookie: "SESSIONID=abc123; security=low"
  tenant-id: "1"

authentication:
  pollUrl: "https://api.example.com/user/profile"
```

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target https://example.com \
  --token "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Getting the Token or Cookie

1. Log into the application manually in your browser.
2. Open DevTools → Network tab → any authenticated request.
3. Under **Request Headers**, copy the `Authorization` header value (for `--token`) and/or the `Cookie` header value (for the `headers` block, if both are used).
4. Confirm `authentication.pollUrl` returns an authenticated response with that same header/cookie before running a full scan — test it with curl:

```bash
curl -X GET https://api.example.com/user/profile \
  -H "Authorization: Bearer <token>"
```

> Tokens and cookies obtained this way are usually short-lived. If a scan starts failing auth partway through, the token/cookie may have expired — grab a fresh one and re-run.

---

## Related

- [Web Scan Config Reference](./web-scan-config-reference)
- [Web Scanner — Standalone Usage](./web-agent-usage)
