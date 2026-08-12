---
title: "Choosing an OCR Model for Browser Click Capture: What 45 Workers AI Runs Taught Us"
description: "We tested Llama 4 Scout, Gemma 4, and Kimi K2.7 Code on the same screenshot-to-structured-JSON task. Llama was the only model to pass every schema check — and it also delivered the best latency and observed cost in our test set."
author:
  name: Somil Athole
  # role: Security Engineering
  avatar: /avatars/somil_image.png
date: 2026-08-06
category: Engineering
tags:
  - Workers AI
  - OCR
  - Browser Extension
  - AI Benchmarking
  - Security Automation
featured: false
readingTime: 9
cover: /covers/workers-ai-ocr-model-benchmark-blog-cover.png
---

# Choosing an OCR Model for Browser Click Capture: What 45 Workers AI Runs Taught Us

We tested Llama 4 Scout, Gemma 4, and Kimi K2.7 Code on the same screenshot-to-structured-JSON task. Llama was the only model to pass every schema check—and it also delivered the best latency and observed cost in our test set.

---

## Introduction

A HAR file tells us what a browser requested and what the server returned. It does not always explain what the user saw when they clicked a control, opened a menu, or moved into the next step of a workflow.

That missing visual context matters when recorded browser journeys are later used for authenticated security testing. A request may be technically complete while its purpose remains unclear without the surrounding labels, headings, and layout.

We wanted to add that context without turning browser recording into permanent screenshot storage. The target output was therefore not an image archive or generated HTML. It was a compact, action-linked JSON artifact containing visible text, confidence values, and normalized bounding boxes.

Before selecting a model, we benchmarked three vision-capable models available through Cloudflare Workers AI:

- [`@cf/meta/llama-4-scout-17b-16e-instruct`](https://developers.cloudflare.com/workers-ai/models/llama-4-scout-17b-16e-instruct/)
- [`@cf/google/gemma-4-26b-a4b-it`](https://developers.cloudflare.com/workers-ai/models/gemma-4-26b-a4b-it/)
- [`@cf/moonshotai/kimi-k2.7-code`](https://developers.cloudflare.com/workers-ai/models/kimi-k2.7-code/)

This article explains what we measured, what the results actually support, and why Llama 4 Scout became our implementation choice.

---

## What We Needed From the Model

The model had to do more than recognize words. It had to return a predictable object that downstream code could validate and safely render.

Each response was required to include:

- One overall confidence value from 0 to 1.
- Visible text blocks in natural reading order.
- One confidence value per block.
- Normalized `x`, `y`, `width`, and `height` coordinates from 0 to 1.
- No HTML, CSS, markdown, commentary, or reconstructed pixels.

For a production pipeline, valid JSON is not a cosmetic preference. A response that looks readable to a person but violates the schema cannot be safely processed without adding repair logic, ambiguity, and another source of failure.

That made schema reliability a first-class benchmark metric alongside latency and cost.

---

## Benchmark Design

We used five sanitized browser screenshots. Each screenshot was sent to each model three times, producing:

```text
5 screenshots × 3 models × 3 repetitions = 45 requests
```

All 45 requests ran sequentially through Cloudflare's OpenAI-compatible chat-completions API. Every model received the same OCR task and output contract. We used model-specific production-intended request profiles rather than forcing every model into a configuration already known to truncate or fail.

The shared controls included deterministic or lowest-variance settings where supported, bounded request timeouts, structured response formatting, and no fallback model. Images averaged approximately 178 KB, while serialized requests averaged approximately 240 KB.

The complete benchmark took about 75.1 minutes and reached a terminal result for every planned request.

### Published Token Rates

The cost calculation used Cloudflare's published token rates and did not subtract account-level free allocations.

| Model | Input per million tokens | Cached input | Output per million tokens |
| --- | ---: | ---: | ---: |
| Llama 4 Scout | $0.27 | — | $0.85 |
| Gemma 4 | $0.10 | — | $0.30 |
| Kimi K2.7 Code | $0.95 | $0.19 | $4.00 |

Pricing was snapshotted on July 29, 2026. Current rates are available on the [Cloudflare Workers AI pricing page](https://developers.cloudflare.com/workers-ai/platform/pricing/). Kimi K2.7 Code also requires the Workers Paid plan.

---

## Top-Line Results

| Model | Valid schema | Failed requests | p50 latency | p95 latency | Observed cost per successful screenshot |
| --- | ---: | ---: | ---: | ---: | ---: |
| **Llama 4 Scout** | **15/15 (100%)** | **0** | **44.7 s** | **80.3 s** | **$0.00276** |
| Kimi K2.7 Code | 14/15 (93.3%) | 1 | 69.7 s | 140.0 s | $0.01745 |
| Gemma 4 | 7/15 (46.7%) | 3 | 165.2 s | 235.6 s | $0.00372 |

Across all models, 41 requests returned successful HTTP results, but only 36 produced valid structured JSON. Four requests failed, and five additional responses were invalid for the required contract.

Llama was the only model with no failure, timeout, truncation, or schema-validation error in the sample.

---

## Finding 1: Schema Reliability Changed the Decision

The largest difference was not raw token price. It was whether the response could be used at all.

### Llama 4 Scout

- 15 successful requests.
- 15 valid JSON artifacts.
- No timeouts.
- No truncations.
- No schema failures.

### Kimi K2.7 Code

- 14 valid artifacts.
- One timeout.
- No invalid JSON among completed responses.

### Gemma 4

- 12 successful HTTP responses.
- Only seven valid artifacts.
- Three timeouts.
- Five truncated or schema-invalid responses.

Gemma frequently approached the configured output ceiling. Its valid responses averaged about 132 blocks, with a median of 150—the benchmark's maximum allowed block count. That output expansion increased latency, cost, and truncation risk.

This is an important operational lesson: a model with lower published token rates can still be more expensive per usable result if it generates substantially more output or fails the response contract.

---

## Finding 2: Llama Was the Fastest at Both Typical and Tail Latency

Average latency alone can hide the slow requests users actually notice, so we compared both median and p95 latency.

| Model | Mean | p50 | p95 | Maximum |
| --- | ---: | ---: | ---: | ---: |
| **Llama 4 Scout** | **47.0 s** | **44.7 s** | **80.3 s** | 96.1 s |
| Kimi K2.7 Code | 79.8 s | 69.7 s | 140.0 s | 236.1 s |
| Gemma 4 | 160.0 s | 165.2 s | 235.6 s | 235.6 s |

Llama's median response was approximately 36% faster than Kimi's and 73% faster than Gemma's. Its p95 was also approximately 43% lower than Kimi's and 66% lower than Gemma's.

For asynchronous processing, tens of seconds may be acceptable. Several minutes per click—and repeated timeout risk—is much harder to absorb when a recording contains many interactions.

---

## Finding 3: Actual Output Volume Mattered More Than List Price

The three models processed the same images, but their output behavior differed significantly.

| Model | Mean input tokens | Mean output tokens | Mean valid blocks |
| --- | ---: | ---: | ---: |
| **Llama 4 Scout** | 2,496 | **2,457** | **44.9** |
| Kimi K2.7 Code | 2,798 | 4,035 | 80.1 |
| Gemma 4 | 444 | 12,252 | 131.9 |

Gemma had the lowest published token rates and the smallest reported input-token count. However, its much larger outputs outweighed that advantage. Kimi produced more compact output than Gemma but remained substantially more expensive because of its higher output-token rate.

The full 45-request benchmark cost approximately **$0.3304** before any free allocation.

Based on the observed successful-run averages, projected processing costs were:

| Volume | Llama 4 Scout | Gemma 4 | Kimi K2.7 Code |
| ---: | ---: | ---: | ---: |
| 1,000 screenshots | **$2.76** | $3.72 | $17.45 |
| 10,000 screenshots | **$27.63** | $37.20 | $174.54 |
| 100,000 screenshots | **$276.27** | $371.99 | $1,745.44 |
| 1,000,000 screenshots | **$2,762.71** | $3,719.93 | $17,454.41 |

These are model-inference projections from this test set, not full product operating costs. They exclude storage, queue, Worker, network, monitoring, and future pricing changes.

---

## Finding 4: Repetition Revealed Different Stability Profiles

Running each image three times let us compare whether a model returned similar text and layout for the same input.

| Model | Text repeat consistency | Layout repeat consistency |
| --- | ---: | ---: |
| Llama 4 Scout | 83.6% | **65.2%** |
| Kimi K2.7 Code | **86.2%** | 53.9% |
| Gemma 4 | 33.6% | 40.0% |

Kimi produced the highest text repeat consistency, while Llama produced the highest layout repeat consistency. Gemma varied substantially across repetitions.

Repeat consistency is not the same as OCR accuracy. A model can consistently return the same incorrect text or coordinates. We use this metric only to measure stability, not correctness.

---

## Why We Selected Llama 4 Scout

Llama was not selected because it won one isolated metric. It provided the strongest operational balance across the metrics the current pipeline can measure reliably:

1. **Schema reliability:** 15 valid artifacts from 15 attempts.
2. **Latency:** Lowest median and p95 latency.
3. **Observed cost:** Lowest cost per successful screenshot in the sample.
4. **Output control:** Fewer output tokens and fewer blocks than the alternatives.
5. **Layout stability:** Highest repeat consistency for bounding-box layout.
6. **Deployment fit:** Vision and structured-output support through the existing Workers AI API.

Kimi was competitive on structured-output reliability and slightly stronger on text repeat consistency, but it was slower and roughly 6.3 times more expensive per successful screenshot in this sample. Gemma's published token price was attractive, but truncation and schema reliability made it unsuitable for this specific contract and configuration.

For the next stage of Corefix Security Recorder development, we therefore selected:

```text
@cf/meta/llama-4-scout-17b-16e-instruct
```

---

## What This Benchmark Does Not Prove

The benchmark is complete for its 45 planned requests, but its evidence is still exploratory.

Only five unique screenshots were used, below our decision-ready target of ten. More importantly, the screenshots did not yet have independently reviewed ground-truth annotations. We therefore cannot publish defensible values for:

- Character or word error rate.
- Text precision, recall, or F1.
- Block-detection precision or recall.
- Bounding-box intersection-over-union accuracy.
- Accuracy across languages, responsive layouts, or dense application screens.

The model choice is an operational decision based on reliability, latency, output behavior, repeat consistency, and observed cost—not a claim that Llama has the highest OCR accuracy in every environment.

The next benchmark phase will add reviewed annotations and a larger screenshot set before making comparative accuracy claims.

---

## From Temporary Screenshot to Interaction Code

The intended pipeline keeps pixels temporary and retains only structured, redacted output:

```text
Accepted browser click
        ↓
Masked viewport capture
        ↓
Temporary retry storage
        ↓
Temporary R2 object
        ↓
Llama structured OCR
        ↓
Schema validation + redaction
        ↓
Action-linked UI JSON
        ↓
Temporary screenshot deletion
```

The final artifact contains the action identifier, sanitized page URL, viewport dimensions, click position, model metadata, confidence values, visible text blocks, and normalized layout coordinates. It does not contain screenshot pixels, base64 image data, generated HTML, or generated CSS.

This gives recorded security workflows more context while keeping raw visual data out of the long-term artifact.

---

## What Users Should Expect

The resulting interaction data is designed to complement HAR traffic—not replace it.

HAR remains the source of truth for requests, responses, headers, timing, and navigation traffic. Interaction code adds the user-facing context around a click: what labels were visible, where text appeared, and which action the layout belonged to.

That combination can help downstream security analysis distinguish between technically similar requests triggered by different UI paths. It also provides a more understandable timeline when reviewing recorded sessions.

OCR remains best effort. Low-confidence text, unusual fonts, overlays, animation, and complex responsive layouts can still reduce quality. The artifact should support analysis, not be treated as a pixel-perfect reconstruction of the page.

---

## Summary

Our 45-run Workers AI benchmark produced five practical conclusions:

1. **Schema reliability matters as much as model intelligence.** An unusable response is a failed response.
2. **Published token price does not predict actual request cost.** Output volume can reverse the expected ranking.
3. **Tail latency matters for click-heavy recordings.** Llama had the lowest p50 and p95 latency.
4. **Consistency is useful but is not accuracy.** Ground truth is still required for quality claims.
5. **Llama offered the best deployable balance for this workflow.** It was the only model with 100% valid structured output while also being the fastest and least expensive in the sample.

The result is not the end of the evaluation. It is the point where the evidence was strong enough to choose an implementation path—and clear enough to define the next, stricter benchmark.
