---
title: "Smart ZAP Context: Authenticated Scanning Without the Configuration Hell"
description: "How CoreFix automates OWASP ZAP context creation for authenticated scans—eliminating hours of manual setup and dramatically improving scan coverage."
author:
  name: CoreFix Team
  role: Security Engineering
date: 2026-06-07
category: Engineering
tags:
  - ZAP
  - Authentication
  - DAST
  - Engineering
  - Web Scanning
featured: false
readingTime: 9
cover: /covers/smart-zap-context.png
---

**Authenticated scanning is where DAST tools earn their keep — and where most teams give up on configuration.**

---

The single biggest gap between a DAST scan that finds real vulnerabilities and one that misses them is authentication. An unauthenticated scan of a modern web application is like running a security audit on a bank lobby and calling it done without checking the vault. The interesting attack surface — the transactions, the account data, the administrative functions — all sits behind login.

OWASP ZAP supports authenticated scanning through its concept of "contexts": configuration objects that define how to authenticate, which URLs require authentication, which cookies or tokens carry session state, and how to detect when a session has expired. Building a ZAP context correctly is one of the most involved configuration tasks in the tool — and getting it wrong means running hours of scans against unauthenticated redirects.

This post describes how CoreFix's Smart ZAP Context system automates the entire process.

## What a ZAP Context Actually Does

Before diving into automation, it helps to understand what ZAP contexts contain. A context is a named scope that tells ZAP:

1. **Which URLs are in scope**: defined by inclusion and exclusion regex patterns. Only URLs matching included patterns and not excluded patterns receive active testing.

2. **How to authenticate**: ZAP supports several authentication methods — form-based, HTTP/NTLM, JSON body, script-based, and manual (HAR import). Each method requires different configuration: which field is the username, which is the password, where is the form action URL, what are the additional fixed parameters.

3. **How to detect authentication failures**: ZAP needs to know what an unauthenticated response looks like so it can re-authenticate when a session expires during scanning. This is typically a regex matching the login page content, a specific response header, or an HTTP status code.

4. **Session management**: which request mechanism carries the session (cookies, headers, HTTP auth), and whether ZAP should manage the session itself or rely on the application's session handling.

5. **Users**: the credentials (username, password) to use for the scan.

6. **Anti-CSRF tokens**: if the login form includes CSRF protection, ZAP needs to know the token field name so it can extract and include the current token in each authentication request.

Setting all of this up manually through ZAP's GUI or YAML automation framework requires understanding each of these concepts in depth, reading documentation for every application-specific variation, and iterative testing to verify that sessions are being maintained correctly.

## The Smart Context Approach

CoreFix's Smart ZAP Context system takes a different approach: instead of asking users to configure authentication, it observes authentication happening and learns from it.

### Phase 1: Browser Observation

When you add a target to CoreFix, the platform launches a browser session and asks you to perform your normal login flow. During this session, CoreFix captures a complete HAR (HTTP Archive) file — the same format used by browser developer tools — containing every request and response, including authentication flows.

The observation phase captures:
- The exact URL, method, and headers of the login request
- The form field names for username, password, and any additional parameters
- The response cookies set after successful authentication
- Anti-CSRF token field names (identified by looking for fields with values that change between page loads)
- The URL of pages that require authentication (to populate the include patterns)
- The URL of the logout endpoint (to add to the exclude list)

### Phase 2: Context Generation

From the captured HAR, CoreFix generates a complete ZAP context configuration. This involves several analytical steps:

**Authentication method detection**: CoreFix examines the login request to determine which authentication method applies. A `Content-Type: application/x-www-form-urlencoded` login POST → form-based authentication. A `Content-Type: application/json` POST with `{"username": ..., "password": ...}` → JSON body authentication. HTTP `Authorization` header present → HTTP auth.

**Scope construction**: CoreFix analyzes which URLs in the HAR required authenticated cookies to return non-redirect responses, and constructs inclusion patterns from these. Standard logout URLs, static assets, and URLs that returned the same content both authenticated and unauthenticated are identified and handled appropriately.

**Verification regex generation**: CoreFix looks at the login page content and extracts a phrase that is present on the login page but absent from authenticated pages — typically a heading like "Sign In" or "Log in to your account". This becomes the authentication verification regex.

**Anti-CSRF configuration**: If any form submissions in the HAR contain tokens that vary between requests, CoreFix identifies the field names and configures ZAP to extract and include the current token value.

The output is a complete ZAP automation YAML with context configuration that would have taken hours to produce manually:

```yaml
contexts:
  - name: "target-app-authenticated"
    urls:
      - "https://app.example.com"
    includePaths:
      - "https://app.example.com/.*"
    excludePaths:
      - "https://app.example.com/logout.*"
      - "https://app.example.com/auth/sign-out.*"
    authentication:
      method: form
      parameters:
        loginPageUrl: "https://app.example.com/login"
        loginRequestUrl: "https://app.example.com/auth/session"
        loginRequestBody: "email={%username%}&password={%password%}&_csrf={%csrf_token%}"
      verificationUrl: "https://app.example.com/dashboard"
      pollFrequency: 60
      pollUnits: REQUESTS
    sessionManagement:
      method: cookie
    users:
      - name: "scan-user"
        credentials:
          username: "${SCAN_USERNAME}"
          password: "${SCAN_PASSWORD}"
    technology:
      - Language.JavaScript
      - Db.MySQL
    antiCsrfTokens:
      - _csrf
```

### Phase 3: Verification and Scan

Before running the full active scan, CoreFix validates the generated context by running a lightweight authentication check: it authenticates using the generated configuration, requests a known authenticated URL, and verifies the response. If authentication fails, CoreFix reports the specific failure point — wrong login URL, incorrect field name, missing CSRF token — before spending time on a full scan.

Once verified, the scan runs against the authenticated context with appropriate active scan policies.

## What This Eliminates

The complexity of ZAP context configuration is not just the initial setup. It is the iterative debugging cycle that consumes hours:

**Session drop detection**: Without proper authentication failure detection, ZAP silently scans unauthenticated pages when sessions expire. There is no error — just degraded results that look like a complete scan. With Smart ZAP Context, authentication failures are detected and re-authentication happens automatically.

**CSRF token mishandling**: A missing anti-CSRF token field means every authentication attempt after the first one fails (the first succeeds because it extracts a token from the initial page load; subsequent attempts use a stale token). This is particularly insidious because the first authenticated request may succeed, making it appear that authentication is working.

**Scope misconfigurations**: Including the logout URL in scope causes ZAP to actively scan it, which logs the session out mid-scan. Excluding the login URL prevents re-authentication. Smart ZAP Context handles both automatically.

**Method detection failures**: Using form-based authentication configuration against a JSON API login (or vice versa) produces authentication failures that can be mistaken for network issues or application errors. Automatic method detection eliminates this class of error entirely.

## Real Impact: A Case Study

A CoreFix customer running DAST on their SaaS product had been using ZAP directly for quarterly security assessments. Their manual ZAP setup took 2-3 hours to configure correctly for each new application version, and they regularly discovered mid-analysis that sessions had dropped and the scan had continued unauthenticated.

After switching to CoreFix with Smart ZAP Context:

- **Setup time**: reduced from 2-3 hours to 8 minutes (the time to complete the observed login flow)
- **Authenticated coverage**: increased from approximately 60% of URLs (40% were hit unauthenticated due to session management issues) to 98%
- **Vulnerabilities found**: 3.2x increase in authenticated-only findings, including two critical IDOR vulnerabilities that had been missed in previous unauthenticated scans

The IDOR findings are particularly significant: these vulnerabilities exist only in authenticated application logic, making them completely invisible to unauthenticated scans. They are also among the most commonly exploited web vulnerabilities in production breaches.

## Technical Implementation Notes

For teams interested in the technical details of the context generation:

**HAR analysis** uses a streaming parser to handle large session recordings without loading the entire archive into memory. Requests are categorized by response characteristics: requests returning Set-Cookie headers with session tokens are candidates for session management configuration; requests with 302 redirects to the login URL are candidates for authentication verification.

**Token variability detection** works by comparing form field values across multiple requests to the same endpoint. Fields with values that change between requests are treated as dynamic tokens (CSRF or nonce values); fields with constant values are treated as fixed parameters.

**URL pattern generation** uses a frequency-based approach: URL components that appear across many authenticated requests are generalized to patterns; components that appear in only one or two URLs are kept literal. This prevents both overly broad patterns (which would include unrelated URLs) and overly specific patterns (which would miss URL variations).

**Re-authentication polling** is configured conservatively by default — every 60 requests — because the cost of an unnecessary authentication check is much lower than the cost of a session drop that goes undetected.

## Conclusion

Authenticated DAST scanning should not require deep expertise in ZAP context configuration. The authentication knowledge that ZAP needs — login URL, field names, session cookies, CSRF tokens — is observable from normal login behavior. Smart ZAP Context makes that observation automatic, turning hours of configuration into minutes of browser interaction.

The result is comprehensive authenticated scanning that finds the vulnerabilities that matter: those in the parts of your application that actually handle user data, financial transactions, and sensitive operations. Behind the login page is where the real attack surface lives.

---

*CoreFix handles the full DAST configuration lifecycle automatically. [Schedule a demo](https://cal.com/corefix.dev/30min) to see authenticated scanning in action on your application.*
