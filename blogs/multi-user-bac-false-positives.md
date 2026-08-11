---
title: "Part 2 — Hunting Ghosts: Killing False Positives in Multi-User Access-Control Scanning"
description: "How DeepTraQ went from \"the scanner found 6 critical IDORs!\" to \"the scanner found 6 critical IDORs, and here's cryptographic-grade proof each one is real.\""
author:
  name: Corefix Team
  role: Security Engineering
date: 2026-08-06
category: DAST
tags:
  - Access Control
  - IDOR
  - BOLA
  - Authentication
  - False Positives
  - Scanner Engineering
featured: false
readingTime: 9
cover: /covers/multi-user-bac-false-positives-cover.png
---

# Part 2 — Hunting Ghosts: Killing False Positives in Multi-User Access-Control Scanning

*How DeepTraQ went from "the scanner found 6 critical IDORs!" to "the scanner found 6 critical IDORs, and here's cryptographic-grade proof each one is real."*

---

## Why multi-user is where the real bugs live

Most of a vulnerability scanner's "6,000 checks" are pattern matches: known CVEs, fingerprints, missing headers, reflected payloads. Useful, commoditized, and — crucially — **stateless**. You send a request, you look at the response, you decide.

**Broken Access Control (BAC)** is different. It's the #1 category in the OWASP Top 10, and it is fundamentally a *relational* property: *can user B do something only user A should be able to do?* You cannot answer that with one request. You need **at least two authenticated identities** and a way to compare what each of them is allowed to see and change:

- **Vertical privilege escalation** — a low-privilege user reaching an admin-only function.
- **Horizontal IDOR / BOLA** — user B reading or writing user A's objects.
- **Session bypass** — one valid session leaking another user's resources.

This is also where automated scanners are weakest, because doing it correctly means driving several real sessions at once. DeepTraQ leaned into exactly this — and immediately hit the failure mode that makes most tools quietly disable their BAC checks: **false positives so convincing they look like real findings.**

This post is the story of that failure mode, how we proved it was a false positive, and the two-layer fix that now makes our multi-user findings self-verifying.

---

## The setup

DeepTraQ authenticates through a real headless browser (it has to — modern SPAs log in via JavaScript, not form posts), then drives OWASP ZAP with generated scripts that replay requests **as** specific users. Against an intentionally-vulnerable target we configured three accounts:

| Role | Account |
| --- | --- |
| Admin (owner) | `admin@…` |
| Regular user (probe) | `jim@…` |
| Second regular user | `bender@…` |

The scanner dutifully produced a beautiful report:

> 🔴 **Vertical privilege escalation** — `GET /rest/2fa/status` returned owner `admin`'s privileged response to low-privilege user `jim` (anchor `admin@…`).
>
> 🔴 **Horizontal IDOR** — `jim` retrieved `admin`'s object `/api/Addresss/3`.
>
> 🔴 **Session bypass** — `jim` received `admin`'s resources at `/profile`, `/rest/wallet/balance`, `/rest/order-history`…

Six criticals, high confidence. Ship it, right?

---

## The tell that something was wrong

One finding didn't smell right. `/rest/2fa/status` is a **strictly self-scoped** endpoint — it returns *your own* two-factor status based on *your own* token. There is no `id` in the URL to tamper with. For `jim`'s request to return `admin@…`, one of two things had to be true:

1. The application genuinely leaks the admin's email to any authenticated user (a real, if unusual, bug), **or**
2. `jim`'s request wasn't actually being sent as `jim`.

A thirty-second experiment settled it. We minted `jim`'s **real** token by logging in directly, then hit the two endpoints ourselves:

```bash
JIM=$(curl -s -X POST https://target/rest/user/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"jim@…","password":"…"}' | jq -r '.authentication.token')

curl -s https://target/rest/2fa/status  -H "Authorization: Bearer $JIM"   # → "email": "jim@…"   ✓ correct
curl -s https://target/api/Addresss/3   -H "Authorization: Bearer $JIM"   # → "Malicious activity detected." 🚫 blocked
```

The application was **behaving perfectly**. `jim`'s real token saw `jim`'s data, and `jim` was actively *blocked* from the admin's address. Every one of those "critical IDORs" was a **ghost** — an artifact of our own tooling.

---

## Root cause: session bleed

The generated ZAP scripts asked ZAP to send a request "as `jim`" via `setRequestingUser(jim)`. Under **browser-based authentication** with auto-detected session management, that mechanism turned out to be unreliable: the probe request went out carrying the **admin's** session, not `jim`'s.

So the oracle was comparing *admin-vs-admin* and — unsurprisingly — finding identical responses. It concluded "user B accessed user A's data" when in reality **user B was silently impersonating user A**. We call this **session bleed**.

### Why our existing guard didn't catch it

We already had an anti-bleed guard. It refused to run a comparison unless the two users' sessions were *distinct*:

```js
// old logic (simplified)
function sessionsDistinct(a, b) {
  return a.token !== b.token;   // different token strings → different users?  ✗
}
```

The fatal assumption is buried in that comment. **Modern apps re-mint a fresh token on every login.** Two consecutive logins *as the same admin* produce two *different* JWT strings (different `iat`, different signature). So even a fully-bled "admin and admin" pair looked reassuringly "distinct," and the guard waved it through.

> **The core lesson:** token *distinctness* is not identity *distinctness*. Comparing credentials tells you the strings differ; it does not tell you **who those credentials belong to**.

---

## The fix, in two layers

We treated this as two separate problems — *stop lying* and *actually work* — and solved each independently so they degrade gracefully.

### Layer 1 — Identity assertion (stop the false positives)

Before trusting any session, resolve **who it actually is**. Every app that has a login also has a "who am I" endpoint (`/whoami`, `/me`, `/session`). We already capture one during discovery. So the guard was rewritten to compare *server-confirmed principals*, not token strings:

1. For each captured session, call the identity endpoint with that session's credentials.
2. Extract the principal (email / username) from the response.
3. Only run the A/B comparison if **both** sessions resolve, **and** they resolve to **different, expected** identities.

Applied to the ghost finding: both "admin" and "jim" resolved to `admin@…` — same principal — **comparison skipped, no finding raised.** The false positive is structurally impossible to emit.

Critically, this layer needs **nothing but the whoami URL** we already have. It is a pure safety check with no new dependencies — it makes the scanner honest even when we can't yet make it complete.

### Layer 2 — Per-user token injection (restore real detection)

Layer 1 stops the lies, but on a target where every probe is bled, it also means the scanner finds *nothing* — honest, but not useful. To get **true** BAC coverage we had to guarantee the probe carries the probe's real session.

Rather than trust ZAP's session juggling, the orchestrator now **logs in as each user itself** during discovery (one lightweight browser login per extra user) and captures each user's genuine bearer token. Those tokens are injected into the generated scripts, so "send as `jim`" literally attaches `jim`'s token. The identity assertion from Layer 1 then *confirms* it resolved to `jim` before any comparison runs.

The two layers reinforce each other:

| Situation | Layer 1 (identity assert) | Layer 2 (injected token) | Outcome |
| --- | --- | --- | --- |
| Bled probe, no injected tokens | catches it | — | **Skip** (no false positive) |
| Correct injected tokens | confirms distinct principals | probe carries real session | **Run** (real finding) |
| Injected token resolves to the wrong user | catches the mismatch | — | **Skip** (bleed caught even if capture erred) |
| No identity endpoint available (legacy) | falls back to string-distinctness | — | Original behavior preserved |

The result is a report where every cross-user finding comes with an implicit proof: *"user B's token provably belongs to user B, yet it reached user A's object."* That sentence is the difference between a finding a security engineer trusts and one they delete.

---

## A second, smaller ghost

While hunting the big one, the same scan flagged *"Sensitive data in response body: password"* on the **login** endpoint. Also a false positive — the check matched the bare word `password` as a substring, and a login flow naturally involves that word (in the request, in field names, in our own probe traffic).

The fix generalizes a good rule: **don't flag the presence of a word, flag the leak of a value.** The check now only fires when a sensitive field carries a real, quoted value (`"password":"<hash>"`), and it skips credential/token fields on authentication endpoints, where handling them is the entire point. Same philosophy as the main fix: *require evidence of the actual bad thing, not a proxy for it.*

---

## What we'd tell anyone building multi-user checks

1. **Verify identity, never infer it.** Don't assume a distinct token, cookie, or credential means a distinct user. Resolve the principal from the server and compare *that*.
2. **A cross-user finding must carry its own proof.** "B saw A's data" is only meaningful if you can also assert "B was really B." Bake that assertion into the detector, not the reviewer's workflow.
3. **Make the honest path the default, the complete path an enhancement.** Layer 1 works everywhere with zero new inputs; Layer 2 adds coverage when it can. A scanner that finds less but never lies beats one that finds more and cries wolf.
4. **Match the evidence to the claim.** Flag leaked *values*, not vocabulary. Flag honored *overrides*, not headers that were merely sent. Every rung of confidence you skip becomes someone's wasted afternoon.
5. **Keep a thirty-second manual oracle in your back pocket.** One `curl` with a real token told us more than the entire automated report. When a finding looks too clean, reproduce it by hand before you trust it.

False positives aren't just noise — they're the reason teams turn off exactly the checks that catch the highest-severity bugs. The work isn't only finding access-control flaws; it's finding them in a way people believe.

---

*Filed under: access control, IDOR/BOLA, authentication, scanner engineering, false-positive reduction.*
