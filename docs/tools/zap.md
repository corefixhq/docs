---
hide_title: true
sidebar_label: OWASP ZAP
---


## Tool Information

| Field             | Details                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Tool              | OWASP ZAP                                                                                    |
| Category          | Web Application Security Scanner                                                             |
| License           | Apache License 2.0                                                                           |
| Source Code       | [https://github.com/zaproxy/zaproxy](https://github.com/zaproxy/zaproxy)                     |
| Documentation     | [https://www.zaproxy.org/docs/](https://www.zaproxy.org/docs/)                               |
| Community Scripts | [https://github.com/zaproxy/community-scripts](https://github.com/zaproxy/community-scripts) |

OWASP ZAP is a widely used dynamic application security testing (DAST) tool for detecting vulnerabilities in web applications and APIs.

---

## Dashboards Using This Tool

| Dashboard       |
| --------------- |
| Web Application |

---

## Scanners Available

### Unauthenticated Scan

Scans public-facing web applications and APIs for **OWASP Top 10 vulnerabilities** such as:

* SQL Injection
* Cross-Site Scripting (XSS)
* Security misconfigurations

This scan does **not require login credentials**.

---

### Authenticated (Credentialed) Scan

Performs deeper security testing using login credentials.

This scan helps identify vulnerabilities across:

* Authenticated user areas
* Role-based access control
* Protected APIs
* Business logic flaws

---

### OWASP ZAP Web & API Scanner

Actively scans web applications and APIs for security vulnerabilities including:

* Injection flaws
* XSS
* Broken authentication
* Security misconfigurations

---

## Scanner Options

| Option                                | Description                                                                |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Run Aggressive Web Scanning           | Enables extended crawling and active attack testing                        |
| Scan Infrastructure Layer             | Detect vulnerable services, weak SSL, and infrastructure misconfigurations |
| Scan for Known Vulnerabilities (CVEs) | Identify vulnerable services and dependencies with known exploits          |
| Enable Advanced Security Checks       | Enables advanced testing modules during **Authenticated scans**            |



