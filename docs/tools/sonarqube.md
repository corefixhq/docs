---
hide_title: true
sidebar_label: SonarQube
---

## Tool Information

| Field                  | Details                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| Tool                   | SonarQube                                                                                      |
| Category               | Static Application Security Testing (SAST)                                                    |
| License                | GNU LGPL v3 (Community Edition) / Commercial                                                  |
| Source Code            | [https://github.com/SonarSource/sonarqube](https://github.com/SonarSource/sonarqube)           |
| Official Documentation | [https://docs.sonarsource.com/sonarqube](https://docs.sonarsource.com/sonarqube)               |
| Website                | [https://www.sonarsource.com/products/sonarqube](https://www.sonarsource.com/products/sonarqube) |

SonarQube is a leading static application security testing platform that continuously inspects code quality and security across programming languages. It detects bugs, vulnerabilities, code smells, and security hotspots in source code through static analysis.

---

## Dashboards Using This Tool

| Dashboard     |
| ------------- |
| Code Scanning |

---

## Scanners Available

### Static Application Security Testing (SAST)

Performs deep static analysis of source code to identify security vulnerabilities before deployment.

The scanner detects:

* Injection vulnerabilities (SQL, command, LDAP, XPath)
* Cross-site scripting (XSS) and output encoding issues
* Insecure cryptographic usage and weak cipher configurations
* Authentication and authorization flaws
* Hardcoded credentials and sensitive data exposure

---

### Code Quality & Security Hotspot Analysis

Identifies code patterns that may represent security risks and require developer review.

The scanner flags:

* Security hotspots requiring manual review
* Insecure default configurations in frameworks
* Missing input validation and sanitization
* Vulnerable third-party API usage patterns

---

### Multi-language Security Scanning

Provides security coverage across a wide range of programming languages within a single scan.

Supported languages include:

* Java, Kotlin, Scala
* JavaScript, TypeScript
* Python, Ruby, PHP
* C, C++, C#
* Go, Swift

---

## Scanner Options

| Option                                          | Description                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Save vulnerabilities with information/log level | Saves findings at the information and log severity level for full audit visibility           |
| Save all scan artifacts for later reference     | Retains all raw scan artifacts so results can be reviewed or exported at a later time        |
