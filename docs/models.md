---
hide_title: true
sidebar_label: Supported Models
---

## Supported Models

CoreFix uses AI models to enrich, deduplicate, correlate, and prioritize security findings after each scan. The model used depends on whether you have CoreFix credits available, whether you specify `--model`, and whether you bring your own API key (BYOK).

---

## How CoreFix Talks to Models

CoreFix uses models in two different places, and each talks to them differently:

- **AI enrichment** (deduplication, enrichment, and prioritization after a scan) always goes through CoreFix's own endpoint, `https://app.corefix.dev/api/llm/v1/chat/completions`, which internally calls OpenAI or Anthropic depending on the model selected — including under BYOK, where the endpoint uses your key to make that call. Enrichment never goes through OpenCode.
- **CodeFix** (`--patch`, AI autofix generation) runs through **OpenCode**, the AI agent bundled inside the CoreFix scanner images (see [Installing the CoreFix CLI](./install-cli)).
  - **By default**, OpenCode also sends its requests to that same CoreFix endpoint, and CoreFix picks the model for you.
  - **With BYOK** (`--openai-api-key`), OpenCode instead routes its requests directly to your own provider — OpenAI or Anthropic — using your key.

Either way, under BYOK you pay your provider directly and CoreFix never sees your key.

---

## How Model Selection Works

Selection is driven by whether your organization has **CoreFix credits available** — not by plan name. A Free-plan account that has purchased pay-as-you-go credits gets the same Premium-pool selection as a Pro or Teams account; a Free-plan account with no credits gets the Standard pool.

| Scenario | What Happens |
|---|---|
| No `--model`, no `--openai-api-key` — no credits available | A model is randomly selected from the **Standard pool** (Works only for open-source) |
| No `--model`, no `--openai-api-key` — credits available | A model is randomly selected from the **Premium pool** for higher quality enrichment |
| `--model` specified, no `--openai-api-key` — credits available | The specified model is used, if it's a supported model (Standard or Premium pool) |
| `--model` specified, no `--openai-api-key` — no credits available | Ignored — a model is selected automatically from the Standard pool (Works only for open-source) |
| `--openai-api-key` provided (BYOK) | `--model` is **required**. The scan fails without it. The specified model is used via your key — provided it's a supported model (Standard or Premium pool) — routed directly to your provider |

```bash
# BYOK — must include --model
corefix code --openai-api-key sk-proj-xxxxxxxx --model gpt-5-mini
```

---

## Rotation Pools

When CoreFix selects a model for you automatically (no `--model`), it picks at random from one of two pools:

| Pool | Used when | Models |
|---|---|---|
| **Standard pool** | No credits available | `gpt-5-mini`, `gpt-5.4-mini`, `gpt-5.6-luna`, `bedrock:runtime:claude-haiku-4.5`, `claude-haiku-4.5` |
| **Premium pool** | Credits available | `gpt-5`, `gpt-5.4`, `gpt-5.6-terra`, `claude-sonnet-4.6`, `claude-sonnet-5` |

Together, the Standard and Premium pools are exactly the 10 models `--model` accepts — see [Model Availability Matrix](./models-matrix) for pool membership alongside code/web availability.

---

## Models Accepted by `--model`

| Command | Models |
|---|---|
| `corefix code` | `gpt-5-mini`, `gpt-5.4-mini`, `gpt-5.6-luna`, `bedrock:runtime:claude-haiku-4.5`, `claude-haiku-4.5`, `gpt-5`, `gpt-5.4`, `gpt-5.6-terra`, `claude-sonnet-4.6`, `claude-sonnet-5` |
| `corefix web` | `gpt-5-mini`, `gpt-5.4-mini`, `gpt-5`, `gpt-5.4`, `claude-haiku-4.5`, `claude-sonnet-4.6` |

For availability per plan and per-model pricing, see the [Model Availability Matrix](./models-matrix) and [Model Pricing](./models-pricing).

---

## Skip AI Analysis Entirely

Pass `--ignore-ai-analysis` to skip the AI pipeline — this covers deduplication, enrichment of findings, and AI-based prioritization. Raw and normalized findings are still written to `~/.corefix/scan-results`, but no enriched report or AI-based prioritization is generated.

```bash
corefix code --ignore-ai-analysis
```

---

## Examples

### Automatic model selection

```bash
corefix code
```

### Paid account — pin to a specific model

```bash
corefix code --model gpt-5.4
```

### BYOK — bring your own OpenAI key

```bash
corefix code --openai-api-key sk-proj-xxxxxxxx --model gpt-5.4-mini
```

### BYOK — bring your own Anthropic key

```bash
corefix code --openai-api-key sk-ant-xxxxxxxx --model claude-sonnet-4.6
```

---

## Related

- [Model Availability Matrix](./models-matrix) — full model list by provider and plan
- [Model Pricing](./models-pricing) — per-model token pricing
- [CoreFix CLI — Overview](./docker-cli)
- [Code Scanner — Standalone Usage](./code-agent-usage)
- [Web Scanner — Standalone Usage](./web-agent-usage)
