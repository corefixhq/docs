| Model | Provider | BYOK | Open Source | Paid (auto) | Paid (`--model`) |
|---|---|---|---|---|---|
| `gpt-5.4` | OpenAI | ✓ | — | ✓ | ✓ |
| `gpt-5.4-mini` | OpenAI | ✓ | ✓ | — | ✓ |
| `gpt-5.4-nano` | OpenAI | ✓ | — | — | ✓ |
| `gpt-5.2` | OpenAI | ✓ | — | — | ✓ |
| `gpt-5.1` | OpenAI | ✓ | — | ✓ | ✓ |
| `gpt-5` | OpenAI | ✓ | — | — | ✓ |
| `gpt-5-mini` | OpenAI | ✓ | — | — | ✓ |
| `gpt-5-nano` | OpenAI | ✓ | — | — | ✓ |
| `gpt-4.1-mini` | OpenAI | ✓ | — | — | ✓ |
| `gpt-4.1-nano` | OpenAI | ✓ | — | — | ✓ |
| `gpt-4o` | OpenAI | ✓ | — | ✓ | ✓ |
| `gpt-4o-mini` | OpenAI | ✓ | ✓ | — | ✓ |
| `claude-opus-4.7` | Anthropic | ✓ | — | — | ✓ |
| `claude-opus-4.6` | Anthropic | ✓ | — | — | ✓ |
| `claude-sonnet-4.6` | Anthropic | ✓ | — | ✓ | ✓ |
| `claude-haiku-4.5` | Anthropic | ✓ | ✓ | ✓ | ✓ |
| `deepseek-v4-pro` | DeepSeek | ✓ | — | ✓ | ✓ |
| `deepseek-v4-flash` | DeepSeek | ✓ | ✓ | — | ✓ |
| `bedrock:openai-gpt-120b-oss` | AWS Bedrock | ✓ | ✓ | — | ✓ |
| `bedrock:kimi-k2.5` | AWS Bedrock | ✓ | ✓ | — | ✓ |
| `bedrock:claude-haiku-4.5` | AWS Bedrock | ✓ | — | — | ✓ |
| `bedrock:glm-5` | AWS Bedrock | ✓ | ✓ | — | ✓ |
| `bedrock:glm-4.7` | AWS Bedrock | ✓ | — | — | ✓ |
| `bedrock:glm-4.7-flash` | AWS Bedrock | ✓ | — | — | ✓ |
| `bedrock:minimax-m2.5` | AWS Bedrock | ✓ | — | — | ✓ |
| `bedrock:minimax-m2.1` | AWS Bedrock | ✓ | — | — | ✓ |
| `bedrock:deepseek-v3.2` | AWS Bedrock | ✓ | — | — | ✓ |
| `bedrock:qwen3-vl-235b` | AWS Bedrock | ✓ | ✓ | — | ✓ |
| `kimi-k2.6` | Moonshot | ✓ | — | — | — |
| `kimi-k2.5` | Moonshot | ✓ | — | — | — |
| `minimax-2.7` | MiniMax | ✓ | — | — | — |
| `minimax-2.5` | MiniMax | ✓ | — | — | — |
| `glm-5.1` | GLM (Z.ai) | ✓ | — | — | — |
| `glm-4.7` | GLM (Z.ai) | ✓ | — | — | — |
| `glm-4.7-flashx` | GLM (Z.ai) | ✓ | — | — | — |
| `glm-4.5` | GLM (Z.ai) | ✓ | — | — | — |
| `glm-4-plus` | GLM (Z.ai) | ✓ | — | — | — |
| `grok-4.3` | xAI | ✓ | — | — | — |

**Column legend:**

- **BYOK** — available when you provide `--openai-api-key` with the corresponding provider's key
- **Open Source** — automatically selected from the SaaS rotation pool for free/open source projects
- **Paid (auto)** — automatically selected from the premium rotation pool when no `--model` is specified
- **Paid (`--model`)** — available for paid accounts to pin via `--model` using CoreFix credits (OpenAI, Anthropic, DeepSeek, and Bedrock models only)