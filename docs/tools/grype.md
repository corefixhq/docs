---
hide_title: true
sidebar_label: Grype
---

## Tool Information

| Field                  | Details                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| Tool                   | Grype                                                                |
| Category               | Container & Dependency Vulnerability Scanner                         |
| License                | Apache License 2.0                                                   |
| Source Code            | [https://github.com/anchore/grype](https://github.com/anchore/grype) |
| Official Documentation | [https://github.com/anchore/grype#readme](https://github.com/anchore/grype#readme) |
| Website                | [https://anchore.com](https://anchore.com)                           |

Grype is an open-source vulnerability scanner for container images and filesystems. It matches discovered packages and dependencies against known vulnerability databases including CVE, NVD, and OS-specific advisories to detect security risks in both application code and base images.

---

## Dashboards Using This Tool

| Dashboard          |
| ------------------ |
| Code Scanning |

---

## Scanners Available

### Container Image Vulnerability Scan

Scans container images layer by layer to identify vulnerable packages in both the operating system and application dependencies.

The scanner:

* Detects vulnerabilities in OS packages (Alpine, Debian, RHEL, Ubuntu, and more)
* Identifies insecure application dependencies across language ecosystems
* Matches findings against NVD, CVE, and distribution-specific security advisories

This helps teams identify and remediate **vulnerable software shipped inside container images** before deployment.

---

### Filesystem & Dependency Scan

Scans a local filesystem or software artifact for known vulnerabilities in installed packages.

The scanner detects:

* Vulnerable language packages (Python, Node.js, Java, Go, Ruby, .NET)
* Outdated OS-level packages with known CVEs
* Vulnerable dependencies declared in lock files and manifests

---

### SBOM-Based Vulnerability Matching

Uses a Software Bill of Materials (SBOM) as the input to perform vulnerability matching without re-scanning the artifact.

The scanner:

* Accepts SBOM formats including SPDX and CycloneDX
* Cross-references all listed components against vulnerability databases
* Identifies risk in supply chain dependencies declared in the SBOM
