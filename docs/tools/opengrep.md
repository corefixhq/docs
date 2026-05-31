---
hide_title: true
sidebar_label: OpenGrep
---

## Tool Information

| Field                  | Details                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| Tool                   | OpenGrep                                                                     |
| Category               | Static Code Analysis / Semantic Pattern Detection                            |
| License                | LGPL-2.1 License                                                             |
| Source Code            | [https://github.com/opengrep/opengrep](https://github.com/opengrep/opengrep) |
| Official Documentation | [https://opengrep.dev](https://opengrep.dev)                                 |
| Website                | [https://opengrep.dev](https://opengrep.dev)                                 |

OpenGrep is a fast, open-source static analysis engine that detects security vulnerabilities and code quality issues using semantic pattern matching. It supports a wide range of programming languages and integrates into CI/CD pipelines to catch issues early in the development lifecycle.

---

## Dashboards Using This Tool

| Dashboard     |
| ------------- |
| Code Scanning |

---

## Scanners Available

### Semantic Code Pattern Scanner

Analyzes source code using semantic rules to detect security vulnerabilities and anti-patterns.

The scanner identifies:

* Injection vulnerabilities (SQL, command, LDAP)
* Insecure cryptographic usage
* Hardcoded credentials and sensitive data exposure
* Dangerous function calls and unsafe API usage
* Cross-site scripting (XSS) and input validation flaws

---

### Dependency & Supply Chain Pattern Analysis

Scans code patterns related to third-party library usage and dependency handling.

The scanner detects:

* Unsafe deserialization patterns
* Insecure dependency loading
* Known vulnerable code patterns introduced via third-party packages
* Outdated or deprecated API usage that introduces risk

---

### Custom Rule Detection

Supports organization-defined rules for enforcing internal security policies.

Examples include:

* Enforcing approved cryptographic libraries
* Detecting proprietary secret patterns
* Flagging deprecated internal APIs
* Ensuring compliance with internal secure coding standards

---

## Scanner Options

| Option                                          | Description                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Save vulnerabilities with information/log level | Saves findings at the information and log severity level for full audit visibility           |
| Save all scan artifacts for later reference     | Retains all raw scan artifacts so results can be reviewed or exported at a later time        |
