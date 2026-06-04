---
hide_title: true
sidebar_label: AI Enrichment
---

## AI Enrichment

Every scan in CoreFix — code or web — passes through a four-stage AI pipeline that transforms raw scanner output into prioritized, actionable security intelligence. The AI adds context that raw scanners cannot provide: deduplication across tools, risk scoring, compliance mapping, exploitability analysis, attack chain discovery, and an executive brief.

The final output is sorted by **composite priority** — the most urgent issue is always first.

---

## How It Works

After all scanners complete, their raw findings are collected and passed through the AI pipeline in four sequential stages.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SCANNER OUTPUT                              │
│  OpenGrep · Gitleaks · OSV-Scanner · KICS · Kubescape             │
│  OWASP ZAP · Nuclei · Nmap · testssl.sh · SSLyze                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 1 — DEDUPLICATION                                           │
│                                                                     │
│  Multiple scanners often flag the same issue. The AI merges         │
│  duplicate findings across scanners into a single entry,            │
│  preserving the strongest evidence from each source.                │
│                                                                     │
│  Example: Gitleaks and OpenGrep both find the same hardcoded        │
│  AWS key in config/deploy.rb → merged into one finding with         │
│  both scanners cited.                                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 2 — ENRICHMENT                                              │
│                                                                     │
│  Each deduplicated finding is enriched with:                        │
│  • AI risk score (1–100) and risk rating                            │
│  • Impact analysis (confidentiality, integrity, availability)       │
│  • Exploitability assessment (complexity, auth required, EPSS)      │
│  • Compliance mapping (PCI-DSS, SOC2, OWASP, CIS, etc.)            │
│  • Context analysis (production vs test code, false positive check) │
│  • Remediation steps with code fix suggestions                      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 3 — CORRELATION                                             │
│                                                                     │
│  The AI looks across all findings to discover attack chains —       │
│  sequences of vulnerabilities that, when combined, enable a         │
│  larger attack.                                                     │
│                                                                     │
│  Example: Hardcoded AWS key (initial access) + open S3 bucket       │
│  (lateral movement) + no CloudTrail logging (persistence)           │
│  → "AWS Key → S3 Exfiltration → Ransomware" attack chain.          │
│                                                                     │
│  Each finding is classified into an exploit class and tagged         │
│  with its role in any chains it belongs to.                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 4 — PRIORITIZATION                                          │
│                                                                     │
│  All findings are ranked by composite priority, which factors in:   │
│  • AI risk score                                                    │
│  • Exploit class severity                                           │
│  • Attack chain membership (chain anchors rank higher)              │
│  • Production vs test context                                       │
│  • Exploitability and EPSS score                                    │
│                                                                     │
│  An executive brief is generated summarizing the overall risk       │
│  posture, top findings, and recommended actions.                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ENRICHED OUTPUT                                                    │
│                                                                     │
│  • Findings sorted by priority (most urgent first)                  │
│  • Attack chains with severity and kill-chain mapping               │
│  • Executive brief for stakeholders                                 │
│  • HTML report generated and pushed to cloud                        │
│  • Email notification sent with report link                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Pipeline Status

During AI processing, the scan status progresses through these stages visible in the dashboard:

| Status | What's Happening |
|---|---|
| `processing` | Scan complete, findings queued for AI |
| `deduplicating` | Merging duplicate findings across scanners |
| `enriching` | Adding risk scores, impact, remediation |
| `correlating` | Building attack chains, classifying findings |
| `prioritizing` | Generating priority rankings and executive brief |
| `completed` | Results ready to view |

---

## What the AI Adds to Each Finding

A raw finding from a scanner contains the basics — vulnerability name, severity, file location, and a description. After AI enrichment, that same finding is augmented with the fields below.

### Risk Assessment

| Field | Description |
|---|---|
| **AI Risk Score** | Composite score (1–100) combining CVSS, exploitability, data sensitivity, and production context |
| **AI Risk Rating** | `CRITICAL` (90–100), `HIGH` (70–89), `MEDIUM` (40–69), `LOW` (20–39), `INFO` (1–19) |
| **Composite Priority** | Final ranking score (0–100) factoring in risk, exploit class, chain membership, and context |
| **Priority Rank** | 1-based position in the sorted findings list (1 = most urgent) |

### Impact Analysis

For each finding, the AI assesses the impact on the CIA triad:

| Field | Values |
|---|---|
| **Confidentiality** | HIGH, MEDIUM, LOW, NONE |
| **Integrity** | HIGH, MEDIUM, LOW, NONE |
| **Availability** | HIGH, MEDIUM, LOW, NONE |
| **Scope** | Changed (affects systems beyond the vulnerable component) or Unchanged |
| **Description** | Plain-language explanation of what an attacker achieves |

### Exploitability

| Field | Description |
|---|---|
| **Is Exploitable** | Whether this vulnerability can be exploited in practice |
| **Exploit Complexity** | LOW, MEDIUM, HIGH — how difficult the exploit is |
| **Requires Auth** | Whether authentication is needed to exploit |
| **Requires User Interaction** | Whether a user must take action for the exploit to succeed |
| **Known Exploits** | Whether public exploits exist |
| **Attack Vector** | NETWORK, ADJACENT, LOCAL, PHYSICAL |
| **EPSS Score** | Exploit Prediction Scoring System probability (0–1) |

### Compliance Mapping

Each finding is mapped to relevant compliance frameworks and their specific controls:

- PCI-DSS
- SOC2
- OWASP Top 10
- CIS Benchmarks
- NIST
- And others as applicable

### Context Analysis

The AI evaluates whether the finding is likely to be a real issue or a false positive:

| Field | Description |
|---|---|
| **Is Test Code** | Whether the finding is in test files or fixtures |
| **Is Sample Config** | Whether the finding is in example or template configuration |
| **Is Production** | Whether the finding is in production code paths |
| **False Positive Likelihood** | LOW, MEDIUM, HIGH |
| **Reasoning** | Explanation of why the AI reached its conclusion |

### Remediation

| Field | Description |
|---|---|
| **Priority** | IMMEDIATE, HIGH, MEDIUM, LOW |
| **Steps** | Ordered list of specific actions to fix the issue |
| **Code Fix** | Suggested code change where applicable |
| **Automatable** | Whether the fix can be automated |
| **Effort Estimate** | LOW, MEDIUM, HIGH |

### Attack Chains

If a finding is part of an attack chain, it includes:

| Field | Description |
|---|---|
| **Chain ID** | Unique identifier for the chain |
| **Chain Name** | Descriptive name (e.g. "AWS Key → S3 Exfiltration → Ransomware") |
| **Chain Severity** | Overall severity of the chain |
| **Role** | The finding's role: `initial_access`, `lateral_movement`, `persistence`, `exfiltration`, etc. |

### Deduplication Metadata

| Field | Description |
|---|---|
| **Merged From** | List of scanners that detected this same issue |
| **Dedup Reason** | Why the AI determined these were the same finding |
| **Merged Count** | Number of raw findings merged into this one |

---

## Example — Before and After

### Raw Finding (Scanner Output)

```json
{
  "name": "Hardcoded AWS Access Key",
  "severity": 4,
  "threat": "HIGH",
  "scanner": "gitleaks",
  "description": "AWS access key found in source file.",
  "category": "secret",
  "cwe": "CWE-798",
  "cvss": 9.1,
  "locations": [
    {
      "file": "config/deploy.rb",
      "startLine": 42,
      "code": "access_key = 'AKIA...'"
    }
  ]
}
```

### Enriched Finding (After AI Pipeline)

```json
{
  "name": "Hardcoded AWS Access Key",
  "severity": 4,
  "threat": "HIGH",
  "scanner": "gitleaks",
  "description": "AWS access key found in source file.",
  "category": "secret",
  "cwe": "CWE-798",
  "cvss": 9.1,
  "locations": [
    {
      "file": "config/deploy.rb",
      "startLine": 42,
      "code": "access_key = 'AKIA...'"
    }
  ],
  "findingId": "FINDING-0001",
  "priorityRank": 1,
  "compositePriority": 98,
  "aiRiskScore": 95,
  "aiRiskRating": "CRITICAL",
  "impact": {
    "confidentiality": "HIGH",
    "integrity": "HIGH",
    "availability": "MEDIUM",
    "scope": "Changed",
    "description": "Attacker gains full AWS account access; can exfiltrate data, spin up resources, or pivot to other services."
  },
  "compliance": [
    {
      "framework": "PCI-DSS",
      "controls": ["Requirement 6.3.2", "Requirement 8.6"],
      "requirement": "Hardcoded credentials violate PCI-DSS secret management requirements."
    },
    {
      "framework": "SOC2",
      "controls": ["CC6.1"],
      "requirement": "Access credentials must not be stored in source code."
    }
  ],
  "remediation": {
    "priority": "IMMEDIATE",
    "steps": [
      "Rotate the AWS key immediately via the IAM console.",
      "Remove the hardcoded value from config/deploy.rb.",
      "Inject the credential via an environment variable or secrets manager.",
      "Audit CloudTrail for any usage of this key in the last 90 days."
    ],
    "automatable": true,
    "effortEstimate": "LOW",
    "codefix": "access_key = ENV['AWS_ACCESS_KEY_ID']"
  },
  "exploitability": {
    "isExploitable": true,
    "exploitComplexity": "LOW",
    "requiresAuth": false,
    "requiresUserInteraction": false,
    "knownExploits": true,
    "attackVector": "NETWORK",
    "epssScore": 0.94
  },
  "contextAnalysis": {
    "isTestCode": false,
    "isSampleConfig": false,
    "isProduction": true,
    "falsePositiveLikelihood": "LOW",
    "reasoning": "File is in an active deployment config path with a real-looking key prefix (AKIA), not a test fixture."
  },
  "exploitClass": "EXPOSED_SECRETS",
  "exploitClassReason": "Live AWS key in a production deploy config; directly usable without additional steps.",
  "priorityNote": "Fix immediately — this key is in a production deploy config, anchors an attack chain, and has an EPSS score of 0.94.",
  "attackChains": [
    {
      "chainId": "chain-1",
      "chainName": "AWS Key → S3 Exfiltration → Ransomware",
      "chainSeverity": "CRITICAL",
      "role": "initial_access"
    }
  ],
  "mergedFrom": ["gitleaks", "opengrep"],
  "dedupReason": "Same AWS key detected by both gitleaks and opengrep in the same file.",
  "mergedCount": 2
}
```

---

## Executive Brief

After prioritization, the AI generates an executive brief included in every report. It summarizes:

- Overall risk posture of the project
- Total findings broken down by severity
- Top critical findings requiring immediate attention
- Attack chains discovered and their potential business impact
- Compliance gaps across applicable frameworks
- Recommended next steps

This brief is designed for stakeholders who need the security picture without reading individual findings.