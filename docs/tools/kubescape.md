---
hide_title: true
sidebar_label: Kubescape
---

## Tool Information

| Field                  | Details                                                                          |
| ---------------------- | -------------------------------------------------------------------------------- |
| Tool                   | Kubescape                                                                        |
| Category               | Kubernetes Security & Compliance                                                 |
| License                | Apache License 2.0                                                               |
| Source Code            | [https://github.com/kubescape/kubescape](https://github.com/kubescape/kubescape) |
| Official Documentation | [https://kubescape.io/docs](https://kubescape.io/docs)                           |
| Website                | [https://kubescape.io](https://kubescape.io)                                     |

Kubescape is an open-source Kubernetes security platform that scans clusters, YAML manifests, and Helm charts for misconfigurations, vulnerabilities, and compliance violations. It supports industry frameworks including NSA-CISA, MITRE ATT&CK, and CIS Benchmarks.

---

## Dashboards Using This Tool

| Dashboard               |
| ----------------------- |
| Kubernetes Security     |
| Code Scanning |
<!-- | Cloud Workload Scanning | -->

---

## Scanners Available

### Kubernetes Configuration & Hardening Scan

Audits Kubernetes cluster configurations and workload definitions against security hardening guidelines.

The scanner:

* Evaluates pod security contexts, privilege escalation settings, and network policies
* Checks against **NSA-CISA Kubernetes Hardening Guidance** and **CIS Kubernetes Benchmark**
* Identifies insecure default configurations across namespaces and workloads

This helps organizations enforce **cluster-level security standards and hardening baselines**.

---

### RBAC & Access Control Analysis

Reviews Role-Based Access Control (RBAC) policies to identify overly permissive access.

The scanner detects:

* Excessive cluster-admin bindings
* Wildcard permissions granted to service accounts
* Insecure cross-namespace access configurations
* Misconfigured admission controllers

---

### Compliance Framework Scanning

Maps cluster posture against recognized compliance and security frameworks.

Supported frameworks include:

* NSA-CISA Kubernetes Hardening
* MITRE ATT&CK for Containers
* CIS Benchmarks
* SOC 2
* PCI-DSS

---

## Scanner Options

| Option                                          | Description                                                                                  |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Enable Top-level vulnerability scanning         | Runs an additional top-level vulnerability scan across the Kubernetes cluster                |
| Save vulnerabilities with information/log level | Saves findings at the information and log severity level for full audit visibility           |
| Save all scan artifacts for later reference     | Retains all raw scan artifacts so results can be reviewed or exported at a later time        |
