---
hide_title: true
sidebar_label: Supported Models
---

## Supported Models

CoreFix uses AI models to enrich, deduplicate, correlate, and prioritize security findings after each scan. The model used depends on your plan, whether you specify `--model`, and whether you bring your own API key.

---

## How Model Selection Works

| Scenario | What Happens |
|---|---|
| **Free / Open source project** — no `--model`, no `--openai-api-key` | A model from the **SaaS Rotation Pool** is randomly selected |
| **Free / Open source project** — `--model` specified | Ignored. A SaaS rotation model is selected automatically |
| **Paid account** — no `--model`, no `--openai-api-key` | A model from the **Premium Rotation Pool** is randomly selected |
| **Paid account** — `--model` specified | The specified model is used, if it's a supported cloud model |
| **Any account** — `--openai-api-key` provided | `--model` is **required**. Any model from the full [BYOK list](#all-supported-models-byok) can be used. You pay your provider directly |

---

## Model Availability & Pricing

| Model | Provider | BYOK | Open Source | Paid (auto) | Paid (`--model`) | Total / 1M |
|---|---|---|---|---|---|---|
| `gpt-5.4` | OpenAI | ✓ | — | ✓ | ✓ | $17.50 |
| `gpt-5.4-mini` | OpenAI | ✓ | ✓ | — | ✓ | $5.25 |
| `gpt-5.4-nano` | OpenAI | ✓ | — | — | ✓ | $1.45 |
| `gpt-5.2` | OpenAI | ✓ | — | — | ✓ | $15.75 |
| `gpt-5.1` | OpenAI | ✓ | — | ✓ | ✓ | $11.25 |
| `gpt-5` | OpenAI | ✓ | — | — | ✓ | $5.625 |
| `gpt-5-mini` | OpenAI | ✓ | — | — | ✓ | $2.25 |
| `gpt-5-nano` | OpenAI | ✓ | — | — | ✓ | $0.45 |
| `gpt-4.1-mini` | OpenAI | ✓ | — | — | ✓ | $2.00 |
| `gpt-4.1-nano` | OpenAI | ✓ | — | — | ✓ | $0.25 |
| `gpt-4o` | OpenAI | ✓ | — | ✓ | ✓ | $12.50 |
| `gpt-4o-mini` | OpenAI | ✓ | ✓ | — | ✓ | $0.75 |
| `claude-opus-4.7` | Anthropic | ✓ | — | — | ✓ | $30.00 |
| `claude-opus-4.6` | Anthropic | ✓ | — | — | ✓ | $30.00 |
| `claude-sonnet-4.6` | Anthropic | ✓ | — | ✓ | ✓ | $18.00 |
| `claude-haiku-4.5` | Anthropic | ✓ | ✓ | ✓ | ✓ | $6.00 |
| `deepseek-v4-pro` | DeepSeek | ✓ | — | ✓ | ✓ | $5.22 |
| `deepseek-v4-flash` | DeepSeek | ✓ | ✓ | — | ✓ | $0.42 |
| `bedrock:openai-gpt-120b-oss` | AWS Bedrock | ✓ | ✓ | — | ✓ | $0.75 |
| `bedrock:kimi-k2.5` | AWS Bedrock | ✓ | ✓ | — | ✓ | $3.60 |
| `bedrock:claude-haiku-4.5` | AWS Bedrock | ✓ | — | — | ✓ | $6.00 |
| `bedrock:glm-5` | AWS Bedrock | ✓ | ✓ | — | ✓ | $4.20 |
| `bedrock:glm-4.7` | AWS Bedrock | ✓ | — | — | ✓ | $2.80 |
| `bedrock:glm-4.7-flash` | AWS Bedrock | ✓ | — | — | ✓ | $0.47 |
| `bedrock:minimax-m2.5` | AWS Bedrock | ✓ | — | — | ✓ | $1.50 |
| `bedrock:minimax-m2.1` | AWS Bedrock | ✓ | — | — | ✓ | $1.50 |
| `bedrock:deepseek-v3.2` | AWS Bedrock | ✓ | — | — | ✓ | $2.47 |
| `bedrock:qwen3-vl-235b` | AWS Bedrock | ✓ | ✓ | — | ✓ | $1.10 |
| `kimi-k2.6` | Moonshot | ✓ | — | — | — | $4.95 |
| `kimi-k2.5` | Moonshot | ✓ | — | — | — | — |
| `minimax-2.7` | MiniMax | ✓ | — | — | — | $1.48 |
| `minimax-2.5` | MiniMax | ✓ | — | — | — | $1.30 |
| `glm-5.1` | GLM (Z.ai) | ✓ | — | — | — | $5.80 |
| `glm-4.7` | GLM (Z.ai) | ✓ | — | — | — | — |
| `glm-4.7-flashx` | GLM (Z.ai) | ✓ | — | — | — | — |
| `glm-4.5` | GLM (Z.ai) | ✓ | — | — | — | — |
| `glm-4-plus` | GLM (Z.ai) | ✓ | — | — | — | — |
| `grok-4.3` | xAI | ✓ | — | — | — | $3.75 |

**Column legend:**

- **BYOK** — available when you provide `--openai-api-key` with the corresponding provider's key
- **Open Source** — automatically selected from the SaaS rotation pool for free/open source projects
- **Paid (auto)** — automatically selected from the premium rotation pool when no `--model` is specified
- **Paid (`--model`)** — available for paid accounts to pin via `--model` using CoreFix credits (OpenAI, Anthropic, DeepSeek, and Bedrock models only)
- **Total / 1M** — combined input + output cost per 1 million tokens

> **Tip:** A typical code scan with ~150–200 findings uses approximately 50K–100K total tokens. Pinning to a higher-tier model consumes CoreFix credits faster.

---

## Detailed Pricing Breakdown

All prices are per **1 million tokens**. These apply when CoreFix processes your findings through AI enrichment. If you bring your own API key (BYOK), your provider charges you directly at their published rates.

### OpenAI

| Model | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|
| `gpt-5.4` | $2.50 | $15.00 | $17.50 |
| `gpt-5.4-mini` | $0.75 | $4.50 | $5.25 |
| `gpt-5.4-nano` | $0.20 | $1.25 | $1.45 |
| `gpt-5.2` | $1.75 | $14.00 | $15.75 |
| `gpt-5.1` | $1.25 | $10.00 | $11.25 |
| `gpt-5` | $0.625 | $5.00 | $5.625 |
| `gpt-5-mini` | $0.25 | $2.00 | $2.25 |
| `gpt-5-nano` | $0.05 | $0.40 | $0.45 |
| `gpt-4o` | $2.50 | $10.00 | $12.50 |
| `gpt-4o-mini` | $0.15 | $0.60 | $0.75 |
| `gpt-4.1-mini` | $0.40 | $1.60 | $2.00 |
| `gpt-4.1-nano` | $0.05 | $0.20 | $0.25 |

### Anthropic

| Model | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|
| `claude-opus-4.7` | $5.00 | $25.00 | $30.00 |
| `claude-opus-4.6` | $5.00 | $25.00 | $30.00 |
| `claude-sonnet-4.6` | $3.00 | $15.00 | $18.00 |
| `claude-haiku-4.5` | $1.00 | $5.00 | $6.00 |

### DeepSeek

| Model | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|
| `deepseek-v4-pro` | $1.74 | $3.48 | $5.22 |
| `deepseek-v4-flash` | $0.14 | $0.28 | $0.42 |

### Moonshot (Kimi)

| Model | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|
| `kimi-k2.6` | $0.95 | $4.00 | $4.95 |

### MiniMax

| Model | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|
| `minimax-2.7` | $0.28 | $1.20 | $1.48 |
| `minimax-2.5` | $0.15 | $1.15 | $1.30 |

### GLM (Z.ai)

| Model | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|
| `glm-5.1` | $1.40 | $4.40 | $5.80 |

### xAI (Grok)

| Model | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|
| `grok-4.3` | $1.25 | $2.50 | $3.75 |

### AWS Bedrock

| Model | Input / 1M | Output / 1M | Total / 1M |
|---|---|---|---|
| `bedrock:claude-haiku-4.5` | $1.00 | $5.00 | $6.00 |
| `bedrock:glm-5` | $1.00 | $3.20 | $4.20 |
| `bedrock:kimi-k2.5` | $0.60 | $3.00 | $3.60 |
| `bedrock:glm-4.7` | $0.60 | $2.20 | $2.80 |
| `bedrock:deepseek-v3.2` | $0.62 | $1.85 | $2.47 |
| `bedrock:minimax-m2.5` | $0.30 | $1.20 | $1.50 |
| `bedrock:minimax-m2.1` | $0.30 | $1.20 | $1.50 |
| `bedrock:qwen3-vl-235b` | $0.22 | $0.88 | $1.10 |
| `bedrock:openai-gpt-120b-oss` | $0.15 | $0.60 | $0.75 |
| `bedrock:glm-4.7-flash` | $0.07 | $0.40 | $0.47 |

### Cheapest to Most Expensive

| Model | Provider | Total / 1M |
|---|---|---|
| `gpt-4.1-nano` | OpenAI | $0.25 |
| `deepseek-v4-flash` | DeepSeek | $0.42 |
| `gpt-5-nano` | OpenAI | $0.45 |
| `bedrock:glm-4.7-flash` | AWS Bedrock | $0.47 |
| `gpt-4o-mini` | OpenAI | $0.75 |
| `bedrock:openai-gpt-120b-oss` | AWS Bedrock | $0.75 |
| `bedrock:qwen3-vl-235b` | AWS Bedrock | $1.10 |
| `minimax-2.5` | MiniMax | $1.30 |
| `gpt-5.4-nano` | OpenAI | $1.45 |
| `minimax-2.7` | MiniMax | $1.48 |
| `bedrock:minimax-m2.5` | AWS Bedrock | $1.50 |
| `bedrock:minimax-m2.1` | AWS Bedrock | $1.50 |
| `gpt-4.1-mini` | OpenAI | $2.00 |
| `gpt-5-mini` | OpenAI | $2.25 |
| `bedrock:deepseek-v3.2` | AWS Bedrock | $2.47 |
| `bedrock:glm-4.7` | AWS Bedrock | $2.80 |
| `bedrock:kimi-k2.5` | AWS Bedrock | $3.60 |
| `grok-4.3` | xAI | $3.75 |
| `bedrock:glm-5` | AWS Bedrock | $4.20 |
| `kimi-k2.6` | Moonshot | $4.95 |
| `deepseek-v4-pro` | DeepSeek | $5.22 |
| `gpt-5.4-mini` | OpenAI | $5.25 |
| `gpt-5` | OpenAI | $5.625 |
| `glm-5.1` | GLM | $5.80 |
| `claude-haiku-4.5` | Anthropic | $6.00 |
| `bedrock:claude-haiku-4.5` | AWS Bedrock | $6.00 |
| `gpt-5.1` | OpenAI | $11.25 |
| `gpt-4o` | OpenAI | $12.50 |
| `gpt-5.2` | OpenAI | $15.75 |
| `gpt-5.4` | OpenAI | $17.50 |
| `claude-sonnet-4.6` | Anthropic | $18.00 |
| `claude-opus-4.6` | Anthropic | $30.00 |
| `claude-opus-4.7` | Anthropic | $30.00 |

> Prices are subject to change as providers update their rates.

---

## All Supported Models (BYOK)

When you bring your own API key via `--openai-api-key`, you can use any model from the full provider list below. You must also specify `--model`. Your provider charges apply directly — no CoreFix credits are consumed for the AI portion.

### OpenAI

`gpt-5.4` · `gpt-5.4-mini` · `gpt-5.4-nano` · `gpt-5.2` · `gpt-5.1` · `gpt-5` · `gpt-5-mini` · `gpt-5-nano` · `gpt-4.1-mini` · `gpt-4.1-nano` · `gpt-4o` · `gpt-4o-mini`

### Anthropic

`claude-opus-4.7` · `claude-opus-4.6` · `claude-sonnet-4.6` · `claude-haiku-4.5`

### DeepSeek

`deepseek-v4-pro` · `deepseek-v4-flash`

### Moonshot (Kimi)

`kimi-k2.6` · `kimi-k2.5`

### MiniMax

`minimax-2.7` · `minimax-2.5`

### GLM (Z.ai)

`glm-5.1` · `glm-4.7` · `glm-4.7-flashx` · `glm-4.5` · `glm-4-plus`

### xAI (Grok)

`grok-4.3`

### AWS Bedrock

Use these when your `--openai-api-key` is a Bedrock API key generated from the AWS Bedrock console.

`bedrock:openai-gpt-120b-oss` · `bedrock:kimi-k2.5` · `bedrock:minimax-m2.5` · `bedrock:minimax-m2.1` · `bedrock:glm-5` · `bedrock:glm-4.7` · `bedrock:glm-4.7-flash` · `bedrock:deepseek-v3.2` · `bedrock:qwen3-vl-235b` · `bedrock:claude-haiku-4.5`

---

## Examples

### Free / open source — automatic model selection

```bash
docker run --rm \
  -e X_CFIX_API_KEY=... \
  -v $(pwd):/code -v ~/scan-results:/output \
  corefixhq/cfix:latest
```

### Paid account — pin to a specific model

```bash
docker run --rm \
  -e X_CFIX_API_KEY=... \
  -v $(pwd):/code -v ~/scan-results:/output \
  corefixhq/cfix:latest \
  --model gpt-5.4
```

### BYOK — bring your own OpenAI key

```bash
docker run --rm \
  -e X_CFIX_API_KEY=... \
  -v $(pwd):/code -v ~/scan-results:/output \
  corefixhq/cfix:latest \
  --openai-api-key sk-proj-xxxxxxxx \
  --model gpt-5.4-mini
```

### BYOK — bring your own Anthropic key

```bash
docker run --rm \
  -e X_CFIX_API_KEY=... \
  -v $(pwd):/code -v ~/scan-results:/output \
  corefixhq/cfix:latest \
  --openai-api-key sk-ant-xxxxxxxx \
  --model claude-sonnet-4.6
```

### BYOK — bring your own AWS Bedrock key

```bash
docker run --rm \
  -e X_CFIX_API_KEY=... \
  -v $(pwd):/code -v ~/scan-results:/output \
  corefixhq/cfix:latest \
  --openai-api-key <bedrock-api-key> \
  --model bedrock:claude-haiku-4.5
```