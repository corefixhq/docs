# CoreFix — How It Works

CoreFix is offered as a **SaaS solution**. All security findings from code or web scans are pushed to the cloud for review.

> **Privacy Note:** No source code is retained. Only small code snippets may be saved as part of security findings to provide context for remediation.

---

## Ways to Run Scans

### 1. GitHub Integration (Automated)

CoreFix integrates directly with GitHub. For every pull request raised, or on a matching push to a configured branch, a full scan is automatically triggered — no manual steps required.

### 2. CLI Agent via Docker (Local / On-Premise)

Pull the CoreFix CLI agent image from Docker Hub and run it directly against your source code:

```bash
# Pull the image
docker pull corefix/cli-agent:latest

# Run against your source code
docker run --rm -v $(pwd):/app corefix/cli-agent:latest
```

The agent mounts into your source directory and executes all configured scans locally, then pushes findings to the cloud.

### 3. Web Application Scanning via Docker

To scan a running web application:

1. Create a `.ci.web.yaml` configuration file and place it in a dedicated folder.
2. Optionally include your OpenAPI spec file or HAR files in the same folder for deeper coverage.
3. Launch the web scanner agent via Docker, pointing it at your config folder.

The scanner will use your configuration to perform authenticated and unauthenticated scans against your live application.

### 4. CI/CD Pipeline Integration

The same Docker CLI agent can be integrated into any CI/CD pipeline with minimal setup. Example with GitHub Actions:

```yaml
- name: CoreFix Security Scan
  run: |
    docker run --rm -v ${{ github.workspace }}:/app \
      -e COREFIX_API_KEY=${{ secrets.COREFIX_API_KEY }} \
      corefix/cli-agent:latest
```

Compatible with GitHub Actions, GitLab CI, Jenkins, CircleCI, and any other pipeline that supports Docker.

### 5. Manual Scans & Scheduling (Dashboard)

From the CoreFix web dashboard, you can:

- **Run on demand** — hit the **Run** button after creating a project to trigger an immediate scan.
- **Schedule scans** — configure recurring scans on a flexible schedule:
  - Daily
  - Weekly
  - Monthly
  - Custom cron expression

---

## How a Scan Works End-to-End

```
Your Code / Web App
        │
        ▼
┌───────────────────────────────┐
│   Open Source Scanners        │
│   (all launched in parallel)  │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│   AI Enrichment Layer         │
│  • Deduplication              │
│  • Enrichment                 │
│  • Cross-scanner correlation  │
│  • Prioritization             │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│   HTML Report Generated       │
│   + Pushed to Cloud           │
└───────────────────────────────┘
        │
        ▼
  Email notification sent
  ├── HTML report (public link, valid 1 hour)
  └── Project results link (password-protected)
```

All applicable open source scanners are launched simultaneously for each scan type. Results flow into the AI enrichment layer, which deduplicates overlapping findings, enriches them with context, correlates signals across scanners, and prioritizes findings by severity and exploitability.

---

## Open Source Scanners

CoreFix is powered by industry-standard open source security tools.

### Code Scanning

| Tool | Purpose | License |
|---|---|---|
| **OpenGrep** | Static analysis (SAST) — finds injection flaws, insecure patterns, hardcoded credentials, and logic bugs across 30+ languages | LGPL-2.1 |
| **Gitleaks** | Secret detection — scans full git history across every commit and branch for leaked API keys, tokens, and passwords | MIT |
| **OSV-Scanner** | Software composition analysis (SCA) — identifies known vulnerabilities in open source dependencies using Google's OSV database, with reachability analysis | Apache-2.0 |
| **KICS** | Infrastructure as Code scanning — detects misconfigurations in Terraform, CloudFormation, Ansible, Helm, Dockerfiles, and Kubernetes manifests | Apache-2.0 |
| **Kubescape** | Kubernetes security auditing — checks manifests, RBAC, network policies, and pod security against NSA-CISA, MITRE ATT&CK, and CIS benchmarks | Apache-2.0 |

### Web Application Scanning

| Tool | Purpose | License |
|---|---|---|
| **OWASP ZAP** | Dynamic analysis (DAST) — authenticated and unauthenticated active/passive scanning for OWASP Top 10 vulnerabilities in live applications | Apache-2.0 |
| **Nuclei** | Template-based scanning — runs 8,000+ templates to detect known CVEs, exposed admin panels, default credentials, and misconfigurations | MIT |
| **Nmap** | Network reconnaissance — maps open ports, identifies services and versions, and reveals network-level attack surface | NPSL/GPLv2 |
| **testssl.sh** | TLS/SSL analysis — checks protocol support, cipher strength, certificate validity, HSTS, and known TLS vulnerabilities (Heartbleed, POODLE, etc.) | GPL-2.0 |
| **SSLyze** | SSL/TLS auditing — deep analysis of certificate chains, key strength, cipher ordering, and compliance standards | AGPL-3.0 |

### Coming Soon

| Tool | Purpose | License |
|---|---|---|
| Grype | Container image vulnerability scanning | Apache-2.0 |
| Dockle | Container image best practices linting | Apache-2.0 |
| SonarQube (OSS) | Code quality and security analysis | LGPL-3.0 |

---

## Viewing Results

After each scan completes:

- An **email notification** is sent with a link to the HTML report.
- The HTML report is **publicly accessible for 1 hour** via a time-limited link.
- Full results are available at your **project's permanent link**, protected by a password.
- All findings can be browsed directly in the **CoreFix cloud dashboard**.

---

*Questions? Reach out at [hello@corefix.dev](mailto:hello@corefix.dev)*
