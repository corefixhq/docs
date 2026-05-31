---
title: "v1.0.0 Release - Vitest Documentation"
---

## v1.0.1 — 12 Nov 2025

### Initial Platform Release

This release introduced the first stable version of the **DeepTraQ vulnerability management platform**.

### Added

#### Core Platform

- Multi-tenant platform architecture
- Authentication, signup workflows, and MFA support
- Background job processing for vulnerability scans
- API layer and service-based architecture

#### Security Scanning Engine

Baseline vulnerability scanning capabilities:

- **Network scanning**
  - Nmap
  - OpenVAS
  - Nuclei

- **Web vulnerability scanning**
  - OWASP ZAP

- **Software Composition Analysis**
  - DeepTraQ proprietary dependency scanner

#### Infrastructure

- CI/CD automation using GitHub Actions
- Kubernetes-based deployments
- Artifact storage using S3
- Logging and monitoring via AWS CloudWatch and Sentry

#### AI Platform

- First version of the **DeepTraQ AI analysis engine** supporting:
  - OpenAI
  - Claude
  - Gemini
  - DeepSeek
  - Mistral
  - Qwen
  - LLaMA models
- AI-based vulnerability reasoning and patch generation
- Real-time streaming responses via WebSockets
- Custom web search engine for vulnerability intelligence

### Security

- MFA support for authentication
- Secure token-based AI model access
- WebSocket authentication with JWT

### Fixed

- Production bugs discovered in the **initial platform release**
- Corrected **risk overview query issues**
- Fixed inconsistencies in **code security dashboard summaries**
