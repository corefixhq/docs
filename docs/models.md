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
| **Paid account** — `--model` specified | The specified model is used, if it's a supported cloud model (see below) |
| **Any account** — `--openai-api-key` provided | `--model` is **required**. Any model from the full [BYOK supported list](#all-supported-models-byok) can be used. You pay your provider directly |

---

## CoreFix Cloud Models

These models are hosted and managed by CoreFix — no API key needed. They are split into two pools.

### SaaS Rotation Pool (Free / Open Source)

Used automatically for free and open source projects. Models are randomly selected from this pool based on availability and cost efficiency. You cannot pin a specific model from this pool.

| Model | Provider |
|---|---|
| `bedrock:openai-gpt-120b-oss` | AWS Bedrock (OpenAI OSS) |
| `bedrock:kimi-k2.5` | AWS Bedrock (Moonshot) |
| `claude-haiku-4.5` | Anthropic |
| `bedrock:glm-5` | AWS Bedrock (GLM) |
| `gpt-4o-mini` | OpenAI |
| `gpt-5.4-mini` | OpenAI |
| `deepseek-v4-flash` | DeepSeek |
| `bedrock:qwen3-vl-235b` | AWS Bedrock (Qwen) |

### Premium Rotation Pool (Paid Accounts)

Used for paid accounts when no `--model` is specified. Models are randomly selected from this pool, weighted toward higher quality models.

| Model | Provider |
|---|---|
| `claude-haiku-4.5` | Anthropic |
| `gpt-5.1` | OpenAI |
| `gpt-5.4` | OpenAI |
| `claude-sonnet-4.6` | Anthropic |
| `deepseek-v4-pro` | DeepSeek |
| `gpt-4o` | OpenAI |

### Pinning a Model (Paid Accounts)

Paid accounts can use `--model` to pin to any model from the premium pool above, or any of the following additional models available on the CoreFix cloud from OpenAI, Anthropic, DeepSeek, and AWS Bedrock:

| Model | Provider |
|---|---|
| `gpt-5.4-nano` | OpenAI |
| `gpt-5.2` | OpenAI |
| `gpt-5` | OpenAI |
| `gpt-5-mini` | OpenAI |
| `gpt-5-nano` | OpenAI |
| `gpt-4.1-mini` | OpenAI |
| `gpt-4.1-nano` | OpenAI |
| `gpt-4o-mini` | OpenAI |
| `gpt-5.4-mini` | OpenAI |
| `claude-opus-4.6` | Anthropic |
| `claude-opus-4.7` | Anthropic |
| `deepseek-v4-flash` | DeepSeek |
| `bedrock:openai-gpt-120b-oss` | AWS Bedrock |
| `bedrock:kimi-k2.5` | AWS Bedrock |
| `bedrock:minimax-m2.5` | AWS Bedrock |
| `bedrock:minimax-m2.1` | AWS Bedrock |
| `bedrock:glm-5` | AWS Bedrock |
| `bedrock:glm-4.7` | AWS Bedrock |
| `bedrock:glm-4.7-flash` | AWS Bedrock |
| `bedrock:deepseek-v3.2` | AWS Bedrock |
| `bedrock:qwen3-vl-235b` | AWS Bedrock |
| `bedrock:claude-haiku-4.5` | AWS Bedrock |

> **Note:** Pinning to a model uses CoreFix credits. Higher-tier models consume credits faster.

---

## All Supported Models (BYOK)

When you bring your own API key via `--openai-api-key`, you can use any model from the full provider list below. You must also specify `--model`. Your provider charges apply directly — no CoreFix credits are consumed for the AI portion.

### OpenAI

| Model | Flag Value |
|---|---|
| GPT-5.4 | `gpt-5.4` |
| GPT-5.4 mini | `gpt-5.4-mini` |
| GPT-5.4 nano | `gpt-5.4-nano` |
| GPT-5.2 | `gpt-5.2` |
| GPT-5.1 | `gpt-5.1` |
| GPT-5 | `gpt-5` |
| GPT-5 mini | `gpt-5-mini` |
| GPT-5 nano | `gpt-5-nano` |
| GPT-4.1 mini | `gpt-4.1-mini` |
| GPT-4.1 nano | `gpt-4.1-nano` |
| GPT-4o | `gpt-4o` |
| GPT-4o mini | `gpt-4o-mini` |

### Anthropic

| Model | Flag Value |
|---|---|
| Claude Opus 4.7 | `claude-opus-4.7` |
| Claude Opus 4.6 | `claude-opus-4.6` |
| Claude Sonnet 4.6 | `claude-sonnet-4.6` |
| Claude Haiku 4.5 | `claude-haiku-4.5` |

### DeepSeek

| Model | Flag Value |
|---|---|
| DeepSeek V4 Pro | `deepseek-v4-pro` |
| DeepSeek V4 Flash | `deepseek-v4-flash` |

### Moonshot (Kimi)

| Model | Flag Value |
|---|---|
| Kimi K2.6 | `kimi-k2.6` |
| Kimi K2.5 | `kimi-k2.5` |

### MiniMax

| Model | Flag Value |
|---|---|
| MiniMax M2.7 | `minimax-2.7` |
| MiniMax M2.5 | `minimax-2.5` |

### GLM (Z.ai)

| Model | Flag Value |
|---|---|
| GLM 5.1 | `glm-5.1` |
| GLM 4.7 | `glm-4.7` |
| GLM 4.7 FlashX | `glm-4.7-flashx` |
| GLM 4.5 | `glm-4.5` |
| GLM 4 Plus | `glm-4-plus` |

### xAI (Grok)

| Model | Flag Value |
|---|---|
| Grok 4.3 | `grok-4.3` |

### AWS Bedrock

Use these when your `--openai-api-key` is a Bedrock API key generated from the AWS Bedrock console.

| Model | Flag Value |
|---|---|
| OpenAI GPT-120B OSS | `bedrock:openai-gpt-120b-oss` |
| Kimi K2.5 | `bedrock:kimi-k2.5` |
| MiniMax M2.5 | `bedrock:minimax-m2.5` |
| MiniMax M2.1 | `bedrock:minimax-m2.1` |
| GLM 5 | `bedrock:glm-5` |
| GLM 4.7 | `bedrock:glm-4.7` |
| GLM 4.7 Flash | `bedrock:glm-4.7-flash` |
| DeepSeek V3.2 | `bedrock:deepseek-v3.2` |
| Qwen3 VL 235B | `bedrock:qwen3-vl-235b` |
| Claude Haiku 4.5 | `bedrock:claude-haiku-4.5` |

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
