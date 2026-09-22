---
hide_title: true
sidebar_label: Model Matrix
---

## Model Availability Matrix

Which models `--model` accepts, whether each is available to `corefix code`, `corefix web`, or both, and which rotation pool it belongs to. See [Supported Models](./models) for how automatic selection and BYOK work, and [Model Pricing](./models-pricing) for rates.

| Model | Provider | `corefix code` | `corefix web` | Rotation Pool | Open Source Projects | Paid Plans (Pro / Teams) |
|---|---|---|---|---|---|---|
| `gpt-5-mini` | OpenAI | ✓ | ✓ | Standard | ✓ | ✓ |
| `gpt-5.4-mini` | OpenAI | ✓ | ✓ | Standard | ✓ | ✓ |
| `gpt-5.6-luna` | OpenAI | ✓ | — | Standard | ✓ | ✓ |
| `bedrock:runtime:claude-haiku-4.5` | AWS Bedrock | ✓ | — | Standard | ✓ | ✓ |
| `claude-haiku-4.5` | Anthropic | ✓ | ✓ | Standard | ✓ | ✓ |
| `gpt-5` | OpenAI | ✓ | ✓ | Premium | — | ✓ |
| `gpt-5.4` | OpenAI | ✓ | ✓ | Premium | — | ✓ |
| `gpt-5.6-terra` | OpenAI | ✓ | — | Premium | — | ✓ |
| `claude-sonnet-4.6` | Anthropic | ✓ | ✓ | Premium | — | ✓ |
| `claude-sonnet-5` | Anthropic | ✓ | — | Premium | — | ✓ |

::: warning OpenCode (CodeFix)
Whether a model can be used for `--patch` / AI autofix generation, which runs through OpenCode (see [How CoreFix Talks to Models](./models#how-corefix-talks-to-models)), is separate from the table above. `bedrock:runtime:claude-haiku-4.5` is the one exception — OpenCode can't use AWS Bedrock models, so it isn't available for CodeFix even though it's a supported model for AI enrichment (which always goes through CoreFix's endpoint, not OpenCode). Every other model in the table works for both.
:::

**Rotation Pool** is which pool CoreFix picks from when auto-selecting a model (no `--model` passed): **Standard** when your organization has no CoreFix credits available, **Premium** when it does — regardless of plan name; a Free-plan account with purchased pay-as-you-go credits gets Premium-pool selection too. See [How Model Selection Works](./models#how-model-selection-works).

**Open Source Projects** and **Paid Plans** show what this looks like in the common case: an open source project with no purchased credits only ever gets **Standard**-pool models — auto-selected, and any explicit `--model` pin is ignored, same as [How Model Selection Works](./models#how-model-selection-works) describes for "no credits available". A **Pro or Teams** plan has credits by default, so all ten models — both pools — are available to it, whether auto-selected (Premium) or pinned explicitly with `--model` (either pool).

All ten models above are available:

- **Via BYOK** — pass `--openai-api-key` together with `--model`, provided the model is one of the ten above. See [How CoreFix Talks to Models](./models#how-corefix-talks-to-models).
- **By pinning explicitly** — with credits available, pass `--model` to use any of the ten directly (from either pool), no BYOK required, billed in CoreFix credits.

Without credits and without BYOK, `--model` is ignored and a model is selected automatically from the Standard pool.

---

## Related

- [Supported Models](./models)
- [Model Pricing](./models-pricing)
