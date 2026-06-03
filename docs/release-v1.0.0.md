# Release Notes

## v1.0.0 — June 2, 2026

We are excited to ship the first public release of **Corefix** — a unified security scanning platform that combines open-source scanners, AI-powered analysis, and a SaaS reporting backend into a single Docker-based workflow. Pull one image, add one step to your pipeline, and get AI-enriched security findings with attack chains, prioritization, and compliance mapping delivered to your inbox.

---

### Code Scanning — 5 Scanners in One Image

The `corefix-scanner` Docker image bundles five battle-tested open-source tools:

- **OSV Scanner** for dependency vulnerabilities across all major package ecosystems
- **Gitleaks** for hardcoded secrets and credentials in source code and git history
- **KICS** for Infrastructure-as-Code misconfigurations (Terraform, CloudFormation, Kubernetes, Dockerfiles)
- **Kubescape** for Kubernetes security posture against NSA/CISA and MITRE ATT&CK benchmarks
- **Opengrep** (Semgrep-compatible) for static application security testing across all major languages

Run all five or pick any combination. No installation beyond Docker required — one `docker run` and your code is scanned.

### Web / DAST Scanning — 4 Scanners, Zero Setup

The `corefix-web-scanner` Docker image brings dynamic application security testing to any live URL:

- **Nmap** for port and service discovery
- **Nuclei** for CVE detection, misconfigurations, and exposed panels across 7 000+ templates
- **OWASP ZAP** for full web application scanning — unauthenticated or fully authenticated
- **testssl.sh** for SSL/TLS configuration and certificate analysis

Point it at your staging URL and it handles the rest. Supports authenticated scanning via username/password, bearer tokens, or auto-discovered login flows. Works with REST APIs too — drop in your OpenAPI spec and it fuzzes every endpoint.

### Drop Into Any CI/CD Pipeline

Both scanners integrate into any CI/CD platform in minutes:

- **GitHub Actions, GitLab CI, Jenkins, CircleCI, Travis CI, Azure DevOps, Bitbucket Pipelines** — ready-to-paste pipeline templates for all of them
- Code scanning triggers on push or PR; web scanning runs after your deploy step targets the live URL
- Secrets managed via each platform's native secret store — no credentials in pipeline files

You can also run both scanners locally as a CLI agent on any Linux machine with Docker installed.

### AI Enrichment — From Raw Findings to Actionable Intelligence

Every scan result passes through a four-stage AI pipeline before it reaches you:

1. **Deduplication** — findings reported by multiple scanners are merged into one, eliminating noise
2. **Enrichment** — each finding gets an AI risk score (0–100), full CIA impact triad, plain-language description, and step-by-step remediation with ready-to-use code fixes
3. **Correlation** — findings are classified by exploit class and connected into multi-step attack chains showing exactly how an attacker moves from initial access to impact
4. **Prioritization** — a composite priority score surfaces the findings that matter most, with an executive brief naming the 3–5 actions that need to happen within 24 hours

The result: fewer findings to triage, clear remediation paths, and attack chain context that raw scanner output can never provide.

### Compliance Mapping Built In

Every enriched finding is automatically mapped to the compliance frameworks it violates — OWASP, SOC2, PCI-DSS, HIPAA, GDPR, NIST 800-53, CIS, ISO-27001, and MITRE ATT&CK — with specific control IDs and violation descriptions. No manual mapping required.

### Beautiful HTML Security Reports

After every scan, Corefix generates a fully self-contained HTML report and emails it to your team. Reports include:

- **Severity summary** and scanner breakdown at a glance
- **Enriched findings** with AI priority ranking (P1–P15), risk scores, remediation steps, and compliance badges
- **Attack graph** — an interactive visualization of multi-step attack chains; hover nodes to trace paths, click to jump to the finding detail
- **Raw findings** tab for full audit transparency
- Dark/light mode; direct signed-URL access (5 hours) or login-based access via the Reports Portal

### Bring Your Own AI Key — or Use Ours

Corefix runs on a managed AI SaaS that automatically rotates across multiple providers and models — no configuration needed. For full control, two options are available:

- **Credits plan** — pin any model in the catalog with `--model`, billed per use
- **BYOK (Bring Your Own Key)** — pass `--openai-api-key` and `--model` to route enrichment through your own API key

Supported providers: OpenAI, Anthropic, DeepSeek, AWS Bedrock, Moonshot AI (Kimi), Z.AI (GLM), MiniMax, and X.AI (Grok). The managed SaaS handles model selection automatically for everyone else.

### Chrome Extension for Authenticated Web Scanning

The Corefix Chrome Extension lets you record real browser sessions as HAR files and automatically upload them to your project. The web scanner uses these recordings to drive authenticated DAST against flows that synthetic crawlers can't reach — post-login pages, multi-step workflows, single-page app routes.

### Usage Visibility and Cost Transparency

Every build shows its AI token consumption, API call count, LLM cost, and pipeline duration — visible per build, per project, and per month in the Account dashboard. Set usage alerts to stay on top of spend. All usage data retained for 24 months with CSV export.

---

*Corefix is built by CorefixHQ. For questions, documentation, or support, visit [corefix.dev](https://corefix.dev).*
