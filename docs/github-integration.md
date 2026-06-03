# CoreFix — Security Scanning & AI Enrichment

> **Find it at runtime. Fix it in code.**

CoreFix automatically scans your repositories on every push, PR, or release. Ten open-source scanners run in parallel — SAST, secrets, dependencies, IaC, Kubernetes, DAST, CVEs, recon, and SSL. Findings are normalized, deduplicated across all tools, and AI-prioritized so your team sees the vulnerabilities that actually matter, not 400 noisy alerts.

---

## At a Glance

- **Smart scan triggers** — every push and PR to configured branches scans automatically via webhook. Zero YAML, zero infrastructure.
- **10+ scanners in parallel** — OpenGrep, Gitleaks, OSV-Scanner, KICS, Kubescape for code. OWASP ZAP, Nuclei, Nmap, testssl.sh, SSLyze for web.
- **AI enrichment** — findings normalized, deduplicated, and ranked by real exploitability across all scanners.
- **PR comments** — inline security feedback without leaving GitHub. Block merges on critical findings.
- **Self-hosted agent** — run scanners in your own CI/CD. Code never leaves your environment.
- **Shareable reports** — full HTML reports for your team and stakeholders.

---

CoreFix is a security scanning platform that automatically scans your repositories on every push, PR, or release. Ten open-source scanners run in parallel, findings are normalized and deduplicated across all tools, and AI enrichment surfaces only the vulnerabilities that actually matter — so your team spends time fixing, not triaging.

---

## How It Works

Install the CoreFix GitHub App and select your repositories. From that point, every push and pull request matching your configured branches triggers a full security scan automatically. No YAML to write. No infrastructure to manage. First results in under 4 minutes.

The scan pipeline:

1. **Scan** — 10+ specialized scanners run in parallel across your codebase
2. **Normalize** — all findings converted to a single common format
3. **Deduplicate** — cross-scanner duplicates removed automatically
4. **AI Prioritize** — findings ranked by real exploitability, not just CVSS score
5. **Report** — top vulnerabilities surfaced in your dashboard and as PR comments

---

## What Gets Scanned

### Code Security
| Scanner | Category | What it finds |
|---|---|---|
| OpenGrep | SAST | Injection flaws, insecure patterns, logic bugs across 30+ languages |
| Gitleaks | Secrets | API keys, tokens, passwords in source code and git history |
| OSV-Scanner | SCA | Known CVEs in open source dependencies with reachability analysis |
| KICS | IaC | Misconfigurations in Terraform, CloudFormation, Dockerfile, Helm |
| Kubescape | Kubernetes | RBAC issues, pod security, NSA-CISA and CIS benchmark violations |

### Web Application Security
| Scanner | Category | What it finds |
|---|---|---|
| OWASP ZAP | DAST | SQL injection, XSS, SSRF, auth bypass — against your running app |
| Nuclei | CVE Scanning | 8,000+ templates for known CVEs and misconfigurations |
| Nmap | Recon | Open ports, exposed services, network attack surface |
| testssl.sh | SSL/TLS | Protocol support, cipher strength, Heartbleed, POODLE, ROBOT |
| SSLyze | TLS | Certificate chain, key strength, OCSP stapling |

---

## Key Features

### Smart Scan Triggers
Every push and PR to a configured branch triggers a scan automatically via webhook. Scan the full repository for deep baseline coverage, or run faster PR-scoped scans for rapid feedback. Schedule full scans daily or weekly to catch vulnerabilities introduced by dependency updates even without a code change.

### AI Enrichment Pipeline
Raw scanner output contains noise. CoreFix's AI pipeline enriches every finding with:
- **Reachability analysis** — is this vulnerable code actually called?
- **Exploitability check** — can this be triggered from outside?
- **Contextual risk scoring** — severity adjusted for your specific codebase and exposure
- **Cross-scanner correlation** — a finding detected by both ZAP and OpenGrep is grouped as one confirmed issue with evidence from both

The result: instead of 400 raw alerts, you see the 15 that actually need attention.

### Unified Dashboard
All findings from all scanners in one place. Filter by severity, scanner, file, or vulnerability type. Click any finding for full details, exploit evidence, and remediation guidance. Share shareable HTML reports with your team or security stakeholders.

### PR Comments
Findings appear as inline PR comments so developers get security feedback without leaving GitHub. Critical and high-severity findings can be configured to block merge until resolved.

### Self-Hosted Agent
Prefer to keep your source code inside your own environment? Use the CoreFix self-hosted Docker agent. Scanners run inside your CI/CD pipeline — GitHub Actions, Jenkins, GitLab Runners, CircleCI, and more. Only findings (never source code) are sent to CoreFix for AI enrichment and reporting.

---

## Upcoming Features

### Automatic Code Fixes with PR Generation
CoreFix will analyze each finding with full codebase context and generate a production-ready fix — then open a pull request on your repository. Review the diff, check the confidence score, and merge when ready. Starting with Node.js and Python frameworks (Express, Next.js, Fastify, Django, FastAPI).

### Web Application Vulnerabilities → Code Fixes
A confirmed exploit found in your running web application — a SQL injection on `/api/auth/login` — will be traced back to the exact source code line that caused it, and a fix PR will be opened automatically. The runtime-to-code fix loop that doesn't exist in any other tool yet.

### Runtime Vulnerabilities → Code Fixes
Deploy a lightweight observability agent in your test environment with one command. Attack payloads injected during scanning are correlated with application logs in real time — confirmed exploits are traced to source code and fixed automatically.

### Observability Errors → Code Fixes
Connect your existing Sentry, Datadog, New Relic, or Elastic stack. CoreFix correlates runtime errors and anomalies from your observability data back to source code and generates fix PRs — bringing the "logs to fix" loop into your security workflow.

---

## From Reactive to Proactive

Traditional security runs on a calendar — quarterly pentests, annual audits, manual reviews after an incident. CoreFix shifts security left into your development workflow, running on every push and PR so vulnerabilities are caught before they reach production.

| | Traditional | CoreFix |
|---|---|---|
| When it runs | Quarterly / on-demand | Every push, PR, and release |
| Who runs it | SecOps or external pentesters | Fully automated |
| Time to first finding | Days to weeks | Under 4 minutes |
| Coverage | Point-in-time snapshot | Continuous |
| Exposure window | Days to months | Zero — pre-production |

Stay updated with the latest threats and CVEs automatically. As new vulnerability signatures are added to scanners and Nuclei templates, every subsequent scan picks them up — no configuration changes required.

---

## Pricing

**Free for open source projects.** All scanners, AI enrichment, and reports included. No credit card required.

**Pay as you go for private repositories.** No seat pricing, no monthly subscription, no annual contracts.

- **Runtime:** $0.03 per minute of scan time — covers all scanner execution, containers, networking, and storage
- **LLM usage:** Provider token cost × 1.75 markup — covers AI enrichment, risk scoring, and fix generation
- **Bring Your Own Key (BYOK):** Connect your own OpenAI, Anthropic, or other API key. You pay your provider directly — CoreFix charges 0.5× of token cost for orchestration only. *(Coming soon)*
- **Credits never expire.** Scans pause when balance hits zero — no surprise overages.

Top up anytime from $10. Full pricing details at [corefix.dev/pricing](https://corefix.dev/pricing).

---

## Links

- **Website:** [corefix.dev](https://corefix.dev)
- **Documentation:** [docs.corefix.dev](https://docs.corefix.dev)
- **Pricing:** [corefix.dev/pricing](https://corefix.dev/pricing)

---

## Open Source Acknowledgements

CoreFix is built on top of world-class open source security tools. We are grateful to the maintainers of OpenGrep, Gitleaks, OSV-Scanner, KICS, Kubescape, OWASP ZAP, Nuclei, Nmap, testssl.sh, and SSLyze. Full attributions and license details at [docs.corefix.dev/acknowledgements](https://docs.corefix.dev/acknowledgements).

---

*Built with ❤️ in Bangalore, India — for developers everywhere.*
