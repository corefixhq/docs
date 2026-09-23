---
hide_title: true
sidebar_label: Multi-User Scanning
---

## Multi-User Web App Scanning (BOLA, IDOR, Auth Bypass)

A single-user authenticated scan can only test what one identity is allowed to see. It can't tell you whether user A can reach user B's data, or whether a low-privilege session can reach an admin-only action — those bugs only exist *between* sessions. Multi-user scanning runs the scan with multiple sets of credentials at once and cross-tests every pair of sessions against each other.

::: tip Why this matters
**Broken Access Control** is #1 in the OWASP Top 10 (2021), and **BOLA (Broken Object Level Authorization)** is #1 in the OWASP API Security Top 10. Both are cross-session vulnerability classes — a scanner authenticated as a single user structurally cannot find them, since there's no second identity to attempt cross-access with.
:::

### What It Catches

- **BOLA / IDOR** — one user accessing or modifying another user's objects by ID
- **Broken Access Control** — reaching endpoints or actions outside the current session's privilege level
- **Authentication bypass**
- **Session bypass** — horizontal privilege escalation (user → user) and vertical privilege escalation (user → admin)

### Requirements

- Only supported for **login-based** frontend applications — SPAs or traditional HTML apps with a login form (i.e. credential-based `browser` authentication, not [token/cookie injection](./web-scan-complex-auth) and not pure API scanning).
- Up to **3 users** total.
- **The first set of credentials provided is always the admin user.** Any additional users (up to 2 more) are treated as regular users.

---

## Running from the CLI

Pass `--username` / `--password` as repeated pairs — once per user, in order. The first pair is always the admin.

```bash
docker run --rm \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/web \
  -v ~/scan-results:/output \
  corefixhq/cfix-web \
  --target "http://36.50.82.120:3000/#/login" \
  --username admin@juice-sh.op --password admin123 \
  --username jim@juice-sh.op --password 'ncc-1701' \
  --coverage quick \
  --ignore-ai-analysis
```

For a third user, repeat the pair a third time:

```bash
  --username admin@juice-sh.op --password admin123 \
  --username jim@juice-sh.op --password 'ncc-1701' \
  --username bender@juice-sh.op --password 'OhG0d' \
```

| Pairs passed | Result |
|---|---|
| 1 | Standard single-user authenticated scan — no cross-session testing |
| 2 | 1 admin + 1 regular user |
| 3 (max) | 1 admin + 2 regular users |

---

## Test Matrix — How Combinations Are Attacked

Given user indices `0` (admin), `1` (regular), `2` (regular), the scanner cross-tests every unique pair of sessions against each other — not just admin vs. each user:

| Combination | What's tested |
|---|---|
| `(0, 1)` | Can user 1's session reach admin (0)'s data/actions? Can admin (0)'s session improperly reach user 1's data? |
| `(0, 2)` | Same, between admin (0) and user 2 |
| `(1, 2)` | Can user 1's session access user 2's private data or vice versa — horizontal privilege escalation / IDOR between two regular users |

Each pair is tested in both directions for session bypass, IDOR, and access control violations, so a 3-user scan covers all three combinations shown above.

---

## From the Dashboard (Web UI)

The same setup is available when configuring a scan from the CoreFix dashboard: add up to 3 sets of credentials. The **first credential field is always the admin user**, matching the `--username`/`--password` order used on the CLI.

---

## Related

- [Web Scanner — Standalone Usage](./web-agent-usage)
- [Web Scan Config Reference](./web-scan-config-reference)
- [Scanning Complex Apps (OAuth, MFA) — Token & Cookie Injection](./web-scan-complex-auth)
