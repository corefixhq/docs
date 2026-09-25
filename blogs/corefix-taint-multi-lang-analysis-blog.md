---
title: "How CoreFix Closes the Gap Between Generic SAST and Real Vulnerabilities: A Taint Analysis Deep Dive"
description: "Generic SAST rule packs were never taught your framework's idioms. We built 276 hand-modeled taint rules across 5 languages and 20 frameworks, then benchmarked them on five vulnerable-by-design apps: +82% critical findings, +60% total."
author:
  name: Mahidhar
  # role: Security Engineering
  avatar: /avatars/Mahidhar_img.png
date: 2026-09-23
category: SAST
tags:
  - Opengrep
  - Taint Analysis
  - SAST
  - Static Analysis
  - Security Research
featured: false
readingTime: 8
cover: /covers/corefix-multi-lang-taint-analysis-blog-cover.png
---

Static analysis tools have a dirty secret: **most of them are pattern matchers wearing a taint-analysis costume.** They ship with generic rule packs — "SQL injection," "XSS," "command injection" — that look impressive on a feature list but were never taught what your actual framework's request object looks like, or which of its ORM/query-builder calls are dangerous.

We ran an experiment across five languages to measure exactly how big that gap is, and what closing it does to real-world detection rates.

## The Problem: Generic Rules Don't Know Your Framework

Opengrep (the OSS engine underlying most modern SAST tooling) ships with registry configs like `p/security-audit` and `p/owasp-top-ten`. These are broad, framework-agnostic rule packs, and its taint engine (`--taint-intrafile`) is genuinely capable of tracing how untrusted data flows from a source to a dangerous sink — **but only for the sources and sinks someone explicitly modeled.**

That's the catch. A generic ruleset knows that `connection.query()` or `cursor.execute()` are dangerous SQL sinks in the abstract. It usually does **not** know that:

- `models.sequelize.query(...)` in a Sequelize-backed Express app is a SQL sink
- `jdbcTemplate.query(...)` in a Spring controller is a SQL sink
- `Yii::$app->db->createCommand(...)` in a Yii2 PHP app is a SQL sink
- `db.Query(...)` behind a Gin/Echo/Chi context in Go is fed by tainted request input
- `@RequestParam`-annotated Spring parameters, or `@Query()`-decorated NestJS parameters, are tainted request input in the first place

The engine isn't the bottleneck. The **rule content** is. Without framework-specific source/sink modeling, taint analysis silently does nothing on the exact code patterns real applications are built from.

## What We Built

CoreFix closes this gap with a custom Opengrep taint-mode rule library: **276 hand-modeled rules across 5 languages and 20 frameworks** — Python (Django, Flask, FastAPI), Node.js/TypeScript (Express, NestJS, Fastify), Java (Spring, JAX-RS), Golang (Gin, Echo, Fiber, Chi, Beego), and PHP (Laravel, Symfony, CodeIgniter, Yii2, CakePHP), each with a framework-agnostic fallback tier for uncovered code.

Every rule models a real source → sink → sanitizer chain for that framework specifically, covering SQL injection, command injection, SSRF, path traversal / LFI, XSS, server-side template injection, XXE, insecure deserialization, NoSQL injection, open redirect, CRLF injection, unrestricted file upload, and a few ecosystem-specific classes (prototype pollution for Node, LDAP injection for Java). A minimal example of what that looks like for a Django SQL injection rule:

```yaml
mode: taint
pattern-sources:
  - pattern: request.GET.get(...)
  - pattern: request.POST.get(...)
pattern-sinks:
  - pattern: $CURSOR.execute($QUERY)
    focus-metavariable: $QUERY
pattern-sanitizers:
  - pattern: django.db.connection.ops.quote_name(...)
```

Nothing exotic — just precise knowledge of what "untrusted input" and "dangerous call" actually look like in that framework's idioms, instead of a generic guess.

We wired this in additively, alongside Opengrep's existing registry configs (`--config auto`, `p/security-audit`, `p/owasp-top-ten`), so it's a strict superset of what a stock Opengrep setup already finds — not a replacement.

## The Benchmark

We ran full scans of five industry-standard vulnerable-by-design applications — one per language — with and without the custom taint rules, everything else held constant (same Opengrep version, same registry configs, same target checkout).

| Target | Language | Critical (without → with) | Total findings (without → with) |
|---|---|---|---|
| **OWASP Juice Shop** | Node.js / TypeScript | 18 → **59** (+228%) | 77 → **195** (+153%) |
| **WebGoat** | Java | 38 → **56** (+47%) | 196 → **319** (+63%) |
| **PyGoat** | Python | 25 → **37** (+48%) | 152 → **192** (+26%) |
| **DVWA** | PHP | 42 → **70** (+67%) | 82 → **111** (+35%) |
| **go-test-bench** | Golang | 3 → **8** (+167%) | 23 → **30** (+30%) |
| **Aggregate (all 5)** | — | **126 → 230 (+82%)** | **530 → 847 (+60%)** |

Across five languages and five independent benchmark applications, **critical-severity findings increased 82% and total findings increased 60%** after adding the custom taint rules — not cherry-picked from a single best case, but the combined result across every target tested.

The critical-severity jump is the headline in most of these: **Juice Shop's critical findings more than tripled**, almost entirely from SQL injection and XSS patterns that generic rules simply had no sink modeling for — Sequelize/Knex query-builder calls, template-literal-built SQL, and unescaped response writes that stock Opengrep configs walked right past. **DVWA's critical findings jumped 67%** while medium-severity barely moved, a coherent signal since DVWA's bugs are specifically classic SQLi/command-injection/XSS — exactly the classes the PHP rules target. WebGoat and PyGoat show the same pattern on the Java and Python/Django side.

Scan time overhead for loading and running an additional 276 rules: roughly **8–30%** across targets, well within normal CI budget.

## Why This Matters

Every one of these additional critical findings represents a real vulnerability class — SQLi, XSS, command injection, SSRF — that a stock Opengrep configuration, and by extension any tool built on top of it without doing this modeling work, would have missed entirely. Not because the underlying dataflow engine can't trace it, but because nobody told it where to look.

This is the core of CoreFix's approach: deterministic, auditable taint analysis that's actually taught your stack's idioms, rather than a generic ruleset hoping your code happens to match a pattern written for someone else's framework.

## What's Next

This taint rule library handles intra-file, intra-function dataflow — the case where source and sink live in the same function. The next phase of this work extends detection to **inter-procedural** flows, where tainted data crosses file and function boundaries before reaching a sink, using call-graph resolution paired with bounded LLM reasoning to catch the business-logic and multi-hop vulnerability classes that pure pattern matching structurally cannot reach.

We'll publish those results as they land.
