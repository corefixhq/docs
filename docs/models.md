# Models

The following models are used in the **Free / Standard plan** rotation pool. Weights reflect relative traffic allocation.

| Model | Provider | Weight | Input ($/1M) | Output ($/1M) | Total ($/1M)† |
|---|---|---|---|---|---|
| `bedrock:openai-gpt-120b-oss` | AWS Bedrock (OpenAI) | 40 | $0.15 | $0.60 | $0.75 |
| `bedrock:kimi-k2.5` | AWS Bedrock (Moonshot AI) | 28 | $0.60 | $3.00 | $3.60 |
| `claude-haiku-4.5` | Anthropic | 18 | $1.00 | $5.00 | $6.00 |
| `bedrock:glm-5` | AWS Bedrock (Zhipu AI) | 15 | $1.00 | $3.20 | $4.20 |
| `gpt-4o-mini` | OpenAI | 10 | $0.15 | $0.60 | $0.75 |
| `gpt-5.4-mini` | OpenAI | 7 | $0.75 | $4.50 | $5.25 |
| `deepseek-v4-flash` | DeepSeek | 5 | $0.14 | $0.28 | $0.42 |
| `bedrock:qwen3-vl-235b` | AWS Bedrock (Alibaba) | 5 | $0.22 | $0.88 | $1.10 |

† Total = Input + Output rates combined (per 1M tokens each).

> **Bring Your Own Key (BYOK):** Users who supply their own API key can select any of the models listed above — including premium models not included in the default rotation — and are billed at the provider's standard rates.
