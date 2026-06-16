---
title: "Benchmarking LLMs for Security Vulnerability Remediation"
description: "We tested leading LLMs on real-world security vulnerability remediation tasks. Here's what we found about accuracy, context handling, and which models to trust."
author:
  name: CoreFix Team
  role: AI Research
date: 2026-06-12
category: AI & Automation
tags:
  - LLM
  - AI
  - Benchmarking
  - Vulnerability Management
  - Security Research
featured: false
readingTime: 5
cover: /covers/llm-benchmark.png
---

**Not all LLMs are equal when it comes to security. We ran the numbers.**

---

AI-assisted vulnerability remediation is only as good as the model doing the assisting. As CoreFix integrates LLM capabilities into our vulnerability management platform, we needed to know: which models actually produce correct, safe fixes for real security findings?

We built a benchmark of 150 real-world vulnerability remediation tasks drawn from actual scanner findings — SQL injection, XSS, SSRF, insecure deserialization, hardcoded secrets, and more — and evaluated the leading models on three criteria: fix correctness, security completeness, and contextual accuracy.

## What We Measured

**Fix correctness**: Does the suggested fix actually resolve the vulnerability without breaking the surrounding code?

**Security completeness**: Does the fix address only the surface finding, or does it reason about related attack vectors? A SQL injection fix that parameterizes the query but leaves a second injection point in the same function scores lower than one that addresses both.

**Contextual accuracy**: Does the model use the surrounding code context correctly? A fix that imports a library not present in the project, or uses an API that doesn't match the framework version, fails this criterion even if the security logic is sound.

## Results

| Model | Fix Correctness | Security Completeness | Contextual Accuracy |
|-------|----------------|----------------------|---------------------|
| Claude Opus 4.8 | 91% | 88% | 85% |
| GPT-4o | 87% | 79% | 81% |
| Gemini 1.5 Pro | 83% | 74% | 78% |
| Claude Sonnet 4.6 | 89% | 84% | 83% |
| Llama 3.1 70B | 71% | 65% | 69% |
| Mistral Large | 74% | 68% | 71% |

These numbers represent averages across all 150 tasks. Performance varied significantly by vulnerability class.

## Where Models Excel and Fail

**SQL Injection**: All frontier models (Claude, GPT-4o, Gemini) performed well — correctness rates above 90%. This is unsurprising; SQL injection is heavily represented in training data and parameterized queries are a well-established pattern.

**SSRF**: Performance dropped sharply across all models. The challenge is that correct SSRF remediation requires understanding the application's threat model — whether the fix should be a URL allowlist, DNS rebinding protection, metadata service blocking, or a combination — and models struggle with this context-dependent reasoning. Even Claude Opus 4.8 dropped to 74% correctness on SSRF tasks.

**Insecure Deserialization**: The most variable category. The correct fix depends entirely on the programming language, the serialization library in use, and the available alternatives. Models that correctly identified the library and its safe alternatives performed well; models that suggested generic serialization advice without library-specific guidance scored poorly.

**Hardcoded Secrets**: Near-perfect performance across all frontier models — 95%+ correctness. Removing a hardcoded credential and recommending environment variable or secrets manager usage is a pattern models handle reliably. The contextual accuracy metric was most useful here: models that suggested AWS Secrets Manager when the codebase used Vault, or vice versa, lost points.

## The Context Window Effect

One of the clearest findings was the impact of context window size on contextual accuracy. When we provided only the vulnerable function in isolation, contextual accuracy dropped significantly — models made reasonable suggestions that didn't fit the actual codebase. When we provided the full file (and for smaller codebases, the dependency manifest and framework configuration), accuracy improved substantially.

This has direct implications for how AI-assisted remediation should be implemented. Sending only the vulnerability finding and the affected line to a model is not enough. Effective LLM-assisted remediation requires:

- The full file containing the vulnerable code
- Import statements and dependency context
- Framework version and available library versions
- Adjacent functions that interact with the vulnerable code
- The original vulnerability description and scanner evidence

CoreFix assembles this context automatically before calling any LLM, which is why our in-product AI suggestions consistently outperform the same models used with minimal context.

## Model Selection for Production Use

Based on our benchmark, our recommendations for security remediation use cases:

**For highest accuracy**: Claude Opus 4.8. Leads on both fix correctness and security completeness, particularly on complex vulnerability classes like SSRF and deserialization.

**For speed/cost balance**: Claude Sonnet 4.6. Within 2-3 percentage points of Opus on most metrics, significantly faster response times. The right choice for high-volume use cases.

**For self-hosted or privacy-constrained deployments**: Llama 3.1 70B. Performance gap is real (roughly 20 percentage points below frontier on complex vulnerability classes), but acceptable for simple, well-understood vulnerability categories. Not recommended for production security use without human review.

## What This Means for AI-Assisted Security

The benchmark results confirm something we suspected: the variance between models on security tasks is significantly larger than on general coding tasks. A model that scores 90% on HumanEval might score 65% on SSRF remediation. General coding benchmarks do not predict security remediation performance.

For teams evaluating AI security tooling, we recommend:
1. **Test on your actual vulnerability classes**, not general benchmarks
2. **Measure contextual accuracy**, not just whether the suggested fix looks plausible
3. **Always include human review** for complex vulnerability classes (SSRF, deserialization, business logic flaws)
4. **Evaluate the context assembly** as much as the model — how the tool provides context to the model matters as much as model selection

AI-assisted remediation is genuinely useful today. The models are good enough that they meaningfully reduce the time-to-fix for common vulnerability classes. But "good enough" means 87-91% on the categories where they excel — with real failure modes on the hard cases. The best implementations pair AI suggestions with developer review, not AI suggestions as a replacement for review.

---

*CoreFix integrates LLM-assisted remediation with full codebase context assembly across all major models. [Try a free scan](https://app.corefix.dev) to see AI-assisted remediation on your actual vulnerabilities.*
