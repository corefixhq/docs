# AI Usage Policy

**Effective Date:** June 02, 2026
**Last Updated:** June 02, 2026

This policy describes how CoreFix uses artificial intelligence and large language models (LLMs) in the platform, what data is sent to AI providers, how model selection works, and your options for controlling AI usage.

---

## 1. How CoreFix Uses AI

CoreFix uses large language models to enhance security scan results through an AI enrichment pipeline. This includes:

- **Finding normalization** — converting raw scanner outputs from 10+ tools into a unified format
- **Deduplication** — identifying and merging duplicate findings across different scanners
- **Risk scoring** — assessing real-world exploitability beyond static CVSS scores
- **Prioritization** — ranking findings by contextual risk, reachability, and exposure
- **Remediation suggestions** — generating fix recommendations and code patches
- **Report enrichment** — producing human-readable summaries and explanations of findings

AI is a tool in our pipeline, not a replacement for human judgment. **CoreFix is AI-powered and can make mistakes. Always review, validate, and test AI-generated outputs before applying them to your codebase.** [Learn more about AI limitations](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on).

---

## 2. AI Providers and Models

CoreFix connects to the following providers for model inference:

| Provider | Access Method | Used For |
|---|---|---|
| **OpenAI** | Direct API | GPT-5.x, GPT-4.x series |
| **Anthropic** | Direct API | Claude Haiku, Sonnet, Opus |
| **DeepSeek** | Direct API | DeepSeek v4 series (flash, pro) |
| **AWS Bedrock** | Managed API | Multi-model access (see below) |

### Models Available on AWS Bedrock

AWS Bedrock serves as our primary inference infrastructure, providing access to models from multiple providers:

| Model | Original Provider |
|---|---|
| Claude Haiku 4.5 | Anthropic |
| OpenAI GPT 120b OSS | OpenAI |
| Kimi K2.5 | Moonshot AI |
| GLM-5 | Z.AI |
| DeepSeek v3.2 | DeepSeek |
| Qwen3 VL 235B | Alibaba |
| MiniMax M2.5 | MiniMax |

### Chinese-Origin Models

CoreFix supports several models from Chinese AI providers, all accessed through AWS Bedrock (hosted in US infrastructure) or direct APIs:

- **Qwen3 VL 235B** (Alibaba) — via AWS Bedrock
- **GLM-5, GLM-4.7** (Z.AI / Zhipu) — via AWS Bedrock and BYOK direct API
- **Kimi K2.5, K2.6** (Moonshot AI) — via AWS Bedrock and BYOK direct API
- **DeepSeek v3.2, v4-flash, v4-pro** (DeepSeek) — via AWS Bedrock and direct API
- **MiniMax M2.5, M2.7** (MiniMax) — via AWS Bedrock and BYOK direct API

When these models are accessed through AWS Bedrock, data is processed within AWS US infrastructure. When accessed via direct API (DeepSeek direct, or BYOK for Moonshot/Z.AI/MiniMax), data is sent to the provider's API endpoints. Users should consider their data residency requirements when selecting models.

---

## 3. Model Selection by Plan

### Open Source Plan (Free)

Models are automatically selected and rotated from the following pool, weighted by cost, availability, and quality:

- GPT-4o mini (OpenAI)
- GPT-5.4 mini (OpenAI)
- Claude Haiku 4.5 (Anthropic)
- DeepSeek v4-flash (DeepSeek)
- GPT 120b OSS (OpenAI, via Bedrock)
- Kimi K2.5 (Moonshot, via Bedrock)
- GLM-5 (Z.AI, via Bedrock)
- Qwen3 VL 235B (Alibaba, via Bedrock)

You cannot pin a specific model on the free plan.

### Credits Plan (Pay as You Go)

If no model is specified via the `--model` flag, models are randomly selected from the premium pool, which includes higher-quality models for better security analysis:

- GPT-5.4, GPT-5.1, GPT-4o (OpenAI)
- Claude Sonnet 4.6, Claude Haiku 4.5 (Anthropic)
- DeepSeek v4-pro (DeepSeek)
- Claude Haiku 4.5 on AWS Bedrock

You may pin any supported model explicitly using the `--model` flag. The full model catalog is available in our [Supported Models documentation](https://docs.corefix.dev/docs/models).

### BYOK (Bring Your Own Key)

All managed models remain accessible, plus additional direct-provider models are unlocked:

- Moonshot AI: Kimi K2.5, K2.6
- Z.AI: GLM-5.1, GLM-4.5, GLM-4.7, GLM-4.7-flashx, GLM-4-plus
- MiniMax: MiniMax-2.5, MiniMax-2.7
- X.AI: Grok-4.3

---

## 4. What Data Is Sent to AI Providers

When a scan's findings are processed through the AI enrichment pipeline, the following data is sent to the selected LLM provider:

- **Finding metadata** — vulnerability type, severity, CWE identifier, scanner attribution
- **File paths and line numbers** — location of the finding in your repository
- **Code snippets** — the specific lines of code relevant to the finding (typically 5-20 lines of context around the vulnerable line)
- **Vulnerability descriptions** — explanations from the scanner about the nature of the issue

The following data is **never** sent to AI providers:

- Your full source code or repository contents
- Your credentials, API keys, or authentication tokens
- Your personal information (email, name, account details)
- Other users' data or findings

---

## 5. Data Training Policy

**CoreFix does not use your findings data, code snippets, or scan results to train any AI model.**

Your data is sent to LLM providers exclusively for real-time inference (generating enrichment, risk scores, and fix suggestions) and is not retained by CoreFix for training purposes.

### Provider Data Agreements

Currently, there are no formal data processing agreements (DPAs) between CoreFix and the LLM API providers (OpenAI, Anthropic, DeepSeek, AWS Bedrock) specifically prohibiting them from using API inputs for training. However:

- **OpenAI** — as of their current API terms, data sent via their API is not used for training by default
- **Anthropic** — their API usage policy states API data is not used for training
- **AWS Bedrock** — operates under AWS's data protection terms; customer data is not used for model training
- **DeepSeek** — their API terms should be reviewed; we recommend BYOK users with strict data requirements use Bedrock-hosted models instead of DeepSeek direct API

As CoreFix matures, we plan to establish formal data processing agreements with all AI providers explicitly prohibiting the use of our customers' data for training. This policy will be updated when those agreements are in place.

If CoreFix decides to fine-tune a custom model in the future, we will update this AI Usage Policy before collecting or using any customer data for that purpose. We will not use customer data for model training without explicit opt-in consent.

---

## 6. BYOK Pricing

When you use Bring Your Own Key (BYOK):

- You pay your LLM provider directly for token usage
- CoreFix charges a flat **50% fee** (0.5×) of the LLM token cost for AI pipeline orchestration, prompt routing, result parsing, and enrichment logic
- Runtime costs ($0.025/min) apply regardless of BYOK status

When you use CoreFix-managed keys (credits plan):

- CoreFix pays the LLM provider on your behalf
- A **1.75× markup** on provider token cost is applied, covering both token cost and orchestration

---

## 7. AI Output Disclaimer

AI-generated outputs from CoreFix — including risk scores, prioritization rankings, remediation suggestions, and code fix patches — are generated by third-party large language models and are provided on an **as-is basis**.

**CoreFix is AI-powered and can make mistakes.** Specifically:

- Risk scores and prioritization may not accurately reflect the true severity of a vulnerability in your specific context
- Code fix suggestions may introduce bugs, break functionality, or not fully remediate the vulnerability
- AI-generated explanations may be inaccurate, incomplete, or misleading
- Deduplication may incorrectly merge distinct findings or fail to merge duplicates

**You are responsible for reviewing, validating, and testing all AI-generated output before applying it to production code.** CoreFix is a tool to assist security teams, not a replacement for human security review.

[Learn more about AI limitations →](https://support.anthropic.com/en/articles/8525154-claude-is-providing-incorrect-or-misleading-responses-what-s-going-on)

---

## 8. Changes to This Policy

We may update this AI Usage Policy as our AI capabilities, model selection, and provider relationships evolve. Material changes — particularly regarding data training or new data sharing with providers — will be communicated via email and posted on the Service.

---

## 9. Contact

For questions about our AI usage, data processing, or model selection, contact us at:

**Email:** hello@corefix.dev
