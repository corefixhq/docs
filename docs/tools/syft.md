---
hide_title: true
sidebar_label: Syft
---

## Tool Information

| Field                  | Details                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| Tool                   | Syft                                                                 |
| Category               | SBOM (Software Bill of Materials) Generator                          |
| License                | Apache License 2.0                                                   |
| Source Code            | [https://github.com/anchore/syft](https://github.com/anchore/syft)   |
| Official Documentation | [https://github.com/anchore/syft#readme](https://github.com/anchore/syft#readme) |
| Website                | [https://anchore.com](https://anchore.com)                           |

Syft is an open-source tool for generating a Software Bill of Materials (SBOM) from container images, filesystems, and source directories. It catalogs every package and dependency it finds — OS packages and language-specific libraries alike — into a structured, standardized inventory that downstream tools like Grype can consume for vulnerability matching.

---

## Dashboards Using This Tool

| Dashboard          |
| ------------------ |
| Code Scanning |

---

## Scanners Available

### Container Image SBOM Generation

Catalogs every package inside a container image, layer by layer.

The scanner:

* Detects OS packages across distributions (Alpine, Debian, RHEL, Ubuntu, and more)
* Detects language-specific dependencies (Python, Node.js, Java, Go, Ruby, .NET, and more)
* Captures package name, version, and origin metadata for each component found

---

### Filesystem & Source SBOM Generation

Generates an SBOM directly from a local filesystem, directory, or source archive without requiring a built container image.

The scanner:

* Walks lock files and manifests to enumerate declared dependencies
* Identifies installed packages present on disk
* Produces a component inventory suitable for supply chain audits

---

### Standardized SBOM Output

Outputs the generated inventory in industry-standard formats so it can be consumed by other tools or stored for compliance.

The scanner:

* Supports SPDX and CycloneDX output formats
* Provides input directly usable by vulnerability matchers such as Grype
* Enables tracking of software composition over time for supply chain risk management
