---
hide_title: true
sidebar_label: AI Usage Policy
---

CoreFix Agent is an AI-powered security assistant designed to support vulnerability management, asset scanning, research, and automation. It leverages multiple Large Language Models (LLMs) — including OpenAI, Claude, Gemini, Mistral, DeepSeek, Cloudflare OSS Llama 70B, Mistral 24B, Qwen 2.5 SQL Coder, and DeepSeek 32B — orchestrated through LangChain pipelines and our custom agent framework.

This document outlines how AI is used, what protections are in place, and what you can expect when interacting with CoreFix AI.

### 1. What data can the AI Agent access?

The AI Agent activates when you perform an action such as:

* Submitting a query in the chat interface
* Running vulnerability or code scans
* Generating reports or triage recommendations
* Using automation tools (patching scripts, firewall scans, asset discovery)

When triggered, the AI Agent may temporarily access:

* Vulnerability scan results
* Asset metadata (on-prem servers, firewalls, endpoints, websites, cloud workloads)
* Code snippets for continuous code scanning
* Research data collected from open sources (internet crawling, citations included in responses)

Sensitive data such as IPs, emails, usernames, and tokens is automatically masked before sending context to the LLM.

### 2. Is my data used to train the AI models?

**No.**

* CoreFix does not use customer data to train any third-party or proprietary models.
* All AI queries are inference-only. Data may be sent to models for generating responses, but it is never stored or retrained into the model weights.
* Only anonymized and aggregated feedback data (submitted voluntarily via AI Feedback Portal) is used to fine-tune CoreFix's guardrails and workflows.

### 3. Where is my data processed and stored?

* All customer data resides in their own data centers and chosen geographic regions.
* When context is passed to an AI model, processing occurs in US-East region for performance reasons.
* No data is retained on third-party model servers.
* Masking ensures personally identifiable or sensitive security data never leaves the customer's infrastructure in raw form.

### 4. How is data secured when sent to the AI system?

* **Encryption:** All traffic is encrypted in transit (TLS 1.2/1.3) and at rest.
* **Access Controls:** Only authorized CoreFix services interact with AI models.
* **Isolation:** Each AI request is authenticated and isolated to the requesting tenant.
* **Masking:** Sensitive fields like IP addresses, emails, and secrets are automatically redacted.

### 5. Compliance with Security & Privacy Standards

* CoreFix follows GDPR, ISO 27001, and SOC 2 aligned security practices.
* Data sub-processing is limited to AI inference and does not introduce additional storage or retention.
* No queries, responses, or histories are visible to account administrators unless explicitly enabled by the customer.

### 6. How are AI models protected against adversarial attacks?

* **LLM Guardrails:** Protect against prompt injection, prompt leaking, data exfiltration, and adversarial manipulation.
* **Context Filtering:** Ensures only authorized and sanitized data is injected into model prompts.
* **Jailbreak Prevention:** Models are configured in a restricted execution mode — they synthesize text but cannot execute harmful commands.
* **Continuous Monitoring:** Suspicious prompts and responses are flagged for review to prevent exploitation.

### 7. Can AI responses be inaccurate?

**Yes.** While CoreFix uses best-in-class models and retrieval pipelines, AI is not 100% reliable:

* Responses may contain hallucinations, outdated info, or incomplete context.
* Citations and resources are included where possible, but users should verify facts before acting on AI recommendations.
* AI outputs are intended to augment, not replace, human judgment in cybersecurity decision-making.

### 8. Accuracy & Quality Controls

To reduce inaccuracies, CoreFix implements:

* **Model Benchmarking:** Regular evaluation of supported models against vulnerability/security datasets.
* **Automated Consistency Checks:** Cross-verification of scan results with rule-based engines.
* **Human-in-the-Loop Review:** Optional workflow for CISOs/security teams to approve AI-generated reports.
* **Feedback Loop:** Continuous updates based on Formbricks feedback and community discussions.

### 9. Pricing

AI usage is billed at a flat rate of **$20 per 1 million tokens**, regardless of which underlying model is used.

### 10. Can AI be disabled?

**Yes.** Customers can disable the AI Agent at the account level if they prefer not to send any data to third-party AI services. Reports and scans can still be generated using CoreFix's rule-based engines without AI enhancements.

### 11. How to provide feedback?

* Submit structured feedback via Formbricks survey
* Share open-ended suggestions in the AI Feedback category of our Community Forum

Feedback is used to improve CoreFix AI's accuracy, usability, and safety.

### Summary

CoreFix AI Agent enhances vulnerability management by combining multi-model LLMs with strict data masking, encryption, compliance safeguards, and guardrails. Your data remains secure and private, never used for training, and all AI outputs should be cross-verified for accuracy.
