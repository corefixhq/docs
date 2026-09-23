---
title: "Credit Metering"
description: "How CoreFix meters and rates credit consumption for scans, autofix runs, lab sessions, and AI usage"
---

# Credit Metering

## Usage & Credit Rates

Every scan, autofix run, or lab session consumes CoreFix credits at a metered rate.

::: tip Runtime is metered the same way everywhere
Runtime credits are based purely on how many minutes a build — a code scan, a web scan, or an autofix run — actually takes, whether it runs locally via the `corefix` CLI or on CoreFix's SaaS platform. Where it runs doesn't change how much it costs.
:::

| Metered | Rate | Remarks |
|---|---|---|
| Scan time | 0.025 credits/min | A 4-minute code scan ≈ 0.1 credits |
| Autofix runtime | 0.05 credits/min | 2× scan rate — agentic fix generation runs longer than a straight scan |
| API / HAR processing | 0.025 credits/min | Same rate as scan time |
| Lab environment runtime | 0.1 credits/min | Vercel-hosted labs (DVWA, Juice Shop, etc.) — meant for short, occasional practice runs |
| AI enrichment | Provider cost × 1.75 | ≈1.75 credits per $1 of tokens |
| AI autofix generation | Provider cost × 2.5 | ≈2.5 credits per $1 of tokens — auto code fixes |

> The two AI rows above are the default (no BYOK) rate. Bringing your own key (`--openai-api-key`) lowers them to 0.75× and 1.5× respectively — CoreFix only charges its orchestration fee, and your provider bills you directly for the tokens. See [Model Pricing](./models-pricing#ai-usage--billing) for the full breakdown and per-model token rates.

### Examples

A build's total credits are runtime credits (scan/autofix/API-HAR/lab minutes) plus AI credits (enrichment/autofix generation), added together.

**Code scan, no BYOK** — a 6-minute scan whose findings cost $0.40 of tokens to enrich:

```
Runtime:       6 min × 0.025 credits/min      = 0.15 credits
AI enrichment: $0.40 × 1.75                   = 0.70 credits
                                               -------------
Total                                         = 0.85 credits
```

**Code scan, with BYOK** — same scan, but with `--openai-api-key` supplied. The provider cost drops to $0, billed by your provider directly; only the orchestration fee is charged in credits:

```
Runtime:       6 min × 0.025 credits/min      = 0.15 credits
AI enrichment: $0.40 × 0.75                   = 0.30 credits
                                               -------------
Total                                         = 0.45 credits   (+ $0.40 billed by your provider)
```

**Autofix run (`--patch`), no BYOK** — a 10-minute autofix run generating $0.60 of tokens:

```
Autofix runtime:      10 min × 0.05 credits/min   = 0.5 credits
AI autofix generation: $0.60 × 2.5                = 1.5 credits
                                                   -------------
Total                                             = 2.0 credits
```

**Lab session** — a 15-minute practice run against a hosted lab (e.g. Juice Shop):

```
Lab environment runtime: 15 min × 0.1 credits/min = 1.5 credits
```

**Open source project, no credits available** — an 8-minute scan. Runtime is free forever on the open source plan, and with no credits available, enrichment runs on the Standard pool at no charge:

```
Runtime:       8 min → free (open source plan) = 0 credits
AI enrichment: no credits available            = 0 credits
                                                -------------
Total                                          = 0 credits
```

**Open source project, with purchased credits** — same 8-minute scan, but the project has bought pay-as-you-go credits. Runtime is still free — that doesn't change — but enrichment now draws on those credits at the normal rate, same as any paid account:

```
Runtime:       8 min → free (open source plan) = 0 credits
AI enrichment: $0.40 × 1.75                    = 0.70 credits
                                                -------------
Total                                          = 0.70 credits
```

---
