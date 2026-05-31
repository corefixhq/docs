---
hide_title: true
sidebar_label: Prowler
---

## Tool Information

| Field                  | Details                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Tool                   | Prowler                                                                                    |
| Category               | Cloud Security Posture Management (CSPM)                                                   |
| License                | Apache License 2.0                                                                         |
| Source Code            | [https://github.com/prowler-cloud/prowler](https://github.com/prowler-cloud/prowler)       |
| Official Documentation | [https://docs.prowler.com/introduction](https://docs.prowler.com/introduction)             |
| Website                | [https://prowler.com](https://prowler.com)                                                 |

Prowler is an open-source cloud security tool that performs security assessments, audits, and compliance checks across AWS, Azure, and GCP environments. It evaluates cloud configurations against industry benchmarks and security best practices to detect misconfigurations before they are exploited.

---

## Dashboards Using This Tool

| Dashboard               |
| ----------------------- |
| Kubernetes Security     |
| Cloud Misconfigurations |
<!-- | Cloud Workload Scanning | -->

---

## Scanners Available

### Cloud Configuration Audit

Performs a comprehensive review of cloud account configurations to detect security misconfigurations.

The scanner:

* Evaluates IAM policies, storage bucket permissions, and network security group rules
* Identifies publicly exposed resources, unencrypted storage, and overly permissive access controls
* Checks logging, monitoring, and alerting configurations for visibility gaps

This helps organizations identify and remediate **cloud misconfigurations that expose infrastructure to attack**.

---

### Compliance Framework Assessment

Maps cloud configurations against recognized compliance standards and security frameworks.

Supported frameworks include:

* CIS AWS, Azure, and GCP Benchmarks
* NIST 800-53
* ISO 27001
* SOC 2
* PCI-DSS
* GDPR
* HIPAA
* AWS Well-Architected Framework

---

### Identity & Access Management (IAM) Review

Analyzes IAM configurations across cloud accounts to detect excessive privileges and access risks.

The scanner detects:

* Root account usage without MFA
* IAM users with broad administrative permissions
* Unused credentials and access keys
* Missing password policies and rotation enforcement
* Cross-account trust relationships with overly broad permissions

---

## Scanner Options

| Option                                          | Description                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Enable Top-level vulnerability scanning         | Runs an additional top-level vulnerability scan across the cloud environment                 |
| Save vulnerabilities with information/log level | Saves findings at the information and log severity level for full audit visibility           |
| Save all scan artifacts for later reference     | Retains all raw scan artifacts so results can be reviewed or exported at a later time        |
