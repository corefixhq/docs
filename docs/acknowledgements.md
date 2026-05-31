# Open Source Acknowledgements

CoreFix is built on top of world-class open source security tools.
We are grateful to the maintainers and contributors of each project listed below.
All tools are used in accordance with their respective licenses.

---

## Code Scanning

These tools run during every code scan across your repository.

### OpenGrep
**Purpose:** Static application security testing (SAST). Finds injection flaws,
insecure patterns, hardcoded credentials, and logic bugs across 30+ languages
by analyzing source code semantically.
**License:** LGPL-2.1
**Repository:** [github.com/opengrep/opengrep](https://github.com/opengrep/opengrep)

---

### Gitleaks
**Purpose:** Secret detection. Scans your entire git history — every commit,
every branch — for hardcoded API keys, tokens, passwords, and credentials
that should never have been committed.
**License:** MIT
**Repository:** [github.com/gitleaks/gitleaks](https://github.com/gitleaks/gitleaks)

---

### OSV-Scanner
**Purpose:** Software composition analysis (SCA). Identifies known
vulnerabilities in your open source dependencies using Google's OSV
database. Includes reachability analysis to confirm whether vulnerable
code paths are actually called in your application.
**License:** Apache-2.0
**Repository:** [github.com/google/osv-scanner](https://github.com/google/osv-scanner)

---

### KICS (Keeping Infrastructure as Code Secure)
**Purpose:** Infrastructure as Code security scanning. Detects
misconfigurations in Terraform, CloudFormation, Ansible, Helm charts,
Dockerfiles, and Kubernetes manifests before they reach production.
**License:** Apache-2.0
**Repository:** [github.com/Checkmarx/kics](https://github.com/Checkmarx/kics)

---

### Kubescape
**Purpose:** Kubernetes security scanning. Audits Kubernetes manifests,
RBAC policies, network policies, and pod security configurations against
NSA-CISA hardening guidelines, MITRE ATT&CK, and CIS benchmarks.
**License:** Apache-2.0
**Repository:** [github.com/kubescape/kubescape](https://github.com/kubescape/kubescape)

---

## Web Application Scanning

These tools run during web scans against your running application.

### OWASP ZAP (Zed Attack Proxy)
**Purpose:** Dynamic application security testing (DAST). The world's most
widely used web application scanner. Performs authenticated and
unauthenticated active scanning, passive scanning, and spidering to find
OWASP Top 10 vulnerabilities including SQL injection, XSS, SSRF, and
authentication bypass in your live application.
**License:** Apache-2.0
**Repository:** [github.com/zaproxy/zaproxy](https://github.com/zaproxy/zaproxy)

---

### Nuclei
**Purpose:** Template-based vulnerability scanning. Runs 8,000+ community
and curated templates to detect known CVEs, exposed admin panels, default
credentials, misconfigured services, and cloud misconfigurations against
your web application and infrastructure.
**License:** MIT
**Repository:** [github.com/projectdiscovery/nuclei](https://github.com/projectdiscovery/nuclei)

---

### Nmap (Network Mapper)
**Purpose:** Network reconnaissance and port scanning. Maps open ports,
identifies running services and their versions, detects operating system
fingerprints, and reveals the network-level attack surface of your
application and infrastructure.
**License:** NPSL / Modified GPLv2 (see [nmap.org/book/man-legal.html](https://nmap.org/book/man-legal.html))
**Repository:** [github.com/nmap/nmap](https://github.com/nmap/nmap)

---

### testssl.sh
**Purpose:** TLS/SSL configuration testing. Comprehensive analysis of your
HTTPS configuration — protocol support (TLS 1.0/1.1/1.2/1.3), cipher
suite strength, certificate validity, HSTS, OCSP stapling, and known TLS
vulnerabilities including Heartbleed, POODLE, BEAST, ROBOT, and DROWN.
**License:** GPL-2.0
**Repository:** [github.com/drwetter/testssl.sh](https://github.com/drwetter/testssl.sh)

---

### SSLyze
**Purpose:** SSL/TLS configuration auditing. Python-based deep analysis of
certificate chains, key strength, cipher suite ordering, session
resumption, and compliance with security standards. Complements testssl.sh
with programmatic output for automated analysis.
**License:** AGPL-3.0
**Repository:** [github.com/nabla-c0d3/sslyze](https://github.com/nabla-c0d3/sslyze)

---

## Coming Soon

The following tools are integrated and will be available in upcoming releases.

| Tool | Purpose | License |
|---|---|---|
| Grype | Container image vulnerability scanning | Apache-2.0 |
| Dockle | Container image best practices linting | Apache-2.0 |
| SonarQube (OSS) | Code quality and security analysis | LGPL-3.0 |

---

## License Summary

| Tool | Category | License |
|---|---|---|
| OpenGrep | SAST | LGPL-2.1 |
| Gitleaks | Secrets | MIT |
| OSV-Scanner | SCA | Apache-2.0 |
| KICS | IaC | Apache-2.0 |
| Kubescape | Kubernetes | Apache-2.0 |
| OWASP ZAP | DAST | Apache-2.0 |
| Nuclei | CVE Scanning | MIT |
| Nmap | Recon | NPSL/GPLv2 |
| testssl.sh | SSL/TLS | GPL-2.0 |
| SSLyze | SSL/TLS | AGPL-3.0 |

---

*If you are a maintainer of any tool listed above and have questions about
how CoreFix uses your project, please reach out at
[hello@corefix.dev](mailto:hello@corefix.dev).*