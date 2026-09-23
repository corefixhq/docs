---
hide_title: true
sidebar_label: Model Pricing
---

## Model Pricing

Two things are billed separately whenever a model is used — for AI enrichment after a scan, or for AI autofix generation (CodeFix): the **provider cost** of the tokens themselves, and CoreFix's **orchestration fee** for running the task.

---

## AI Usage & Billing

**Provider cost** — standard LLM provider rates apply, based on tokens used, at the per-model rates in the tables below.

- **BYOK** (`--openai-api-key`) — $0 billed in CoreFix credits. Your own provider account is billed directly, at their published rates.
- **No BYOK** (CoreFix-hosted) — standard provider rates apply, billed in CoreFix credits.

**Orchestration fee** — CoreFix's fee for running the task, charged in credits as a multiple of the provider cost. This is charged whether or not you bring your own key, since it covers CoreFix running and orchestrating the task, not the tokens themselves.

- **AI enrichment** — provider cost × 0.75 (0.75 credits per $1 of equivalent token usage)
- **AI autofix generation** (CodeFix) — provider cost × 1.5 (1.5 credits per $1 of equivalent token usage)

Putting the two together — where **provider cost** is the dollar value of tokens used, at the standard rates below, regardless of who pays it:

| Task | BYOK | No BYOK |
|---|---|---|
| **AI enrichment** | **0.75×** provider cost, in CoreFix credits (orchestration fee only) — plus your provider bills you directly for the tokens | **1.75×** provider cost, in CoreFix credits (0.75× orchestration fee + 1× provider cost) |
| **AI autofix generation** (CodeFix) | **1.5×** provider cost, in CoreFix credits (orchestration fee only) — plus your provider bills you directly for the tokens | **2.5×** provider cost, in CoreFix credits (1.5× orchestration fee + 1× provider cost) |

> **Tip:** A typical code scan with ~150–200 findings uses approximately 50K–100K total tokens.

---

## LLM Provider Rates

All prices are per **1 million tokens**, and the **Total / 1M** column is what "provider cost" above is calculated from. Only the models accepted by `--model` are listed — see [Supported Models](./models#models-accepted-by---model) for which are available to `corefix code` vs. `corefix web`.

| Model | Provider | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|---|
| `gpt-5-mini` | OpenAI | $0.25 | $2.00 | $2.25 |
| `gpt-5.4-mini` | OpenAI | $0.75 | $4.50 | $5.25 |
| `gpt-5` | OpenAI | $0.625 | $5.00 | $5.625 |
| `claude-haiku-4.5` | Anthropic | $1.00 | $5.00 | $6.00 |
| `gpt-5.4` | OpenAI | $2.50 | $15.00 | $17.50 |
| `claude-sonnet-4.6` | Anthropic | $3.00 | $15.00 | $18.00 |
| `gpt-5.6-luna` | OpenAI | — | — | Pricing not yet published |
| `gpt-5.6-terra` | OpenAI | — | — | Pricing not yet published |
| `claude-sonnet-5` | Anthropic | — | — | Pricing not yet published |
| `bedrock:runtime:claude-haiku-4.5` | AWS Bedrock | — | — | Pricing not yet published |

---

> Prices are subject to change as providers update their rates. Verify current pricing on each provider's website for the most accurate figures.

---

## Related

- [Supported Models](./models) — how model selection works, and the `--model` values accepted by `corefix code` and `corefix web`
- [Model Availability Matrix](./models-matrix)
