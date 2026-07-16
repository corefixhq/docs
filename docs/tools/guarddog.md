---
hide_title: true
sidebar_label: GuardDog
---



## Tool Information

| Field       | Details                                                                |
| ----------- | ----------------------------------------------------------------------- |
| Tool        | GuardDog                                                                 |
| Category    | Malicious Package Detection                                             |
| License     | Apache License 2.0                                                      |
| Source Code | [https://github.com/DataDog/guarddog](https://github.com/DataDog/guarddog) |

GuardDog identifies **malicious packages** across PyPI, npm, Go, GitHub Actions, VS Code extensions, and Ruby gems by combining heuristic and Semgrep-based static analysis with metadata checks.

---

## Dashboards Using This Tool

| Dashboard     |
| ------------- |
| Code Scanning |

---

## Scanners Available

### Malicious Package Scan

Analyzes package manifests and dependency sources to detect **supply chain threats**, including:

* Malicious PyPI packages
* Malicious npm packages
* Malicious Go packages
* Malicious GitHub Actions
* Malicious VS Code extensions
* Malicious Ruby gems

Detections cover behaviors such as:

* Obfuscated or suspicious code
* Exfiltration of credentials or sensitive data
* Typosquatting and metadata anomalies
* Known malicious indicators



