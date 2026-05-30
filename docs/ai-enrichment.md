---
title: "AI-Enriched Findings"
description: "How the AI enrichment pipeline transforms raw scanner output into prioritized, actionable security intelligence — with attack chains, risk scores, and remediation guidance."
---

# AI-Enriched Findings

## Overview

When you submit scanner findings to `/api/enrich`, they pass through a four-stage AI pipeline that adds context a raw scan cannot provide: deduplication across scanners, risk scoring, compliance mapping, exploitability analysis, attack chain discovery, and an executive brief.

The output is stored per-job and retrieved via `/api/enrich/status`. Findings are returned sorted by **composite priority** — the most urgent issue is always first.

```
Raw findings  →  Dedup  →  Enrich  →  Correlate  →  Prioritize  →  Enriched output
```

---

## Job lifecycle

Poll `/api/enrich/status` with the `job_id` returned from the submission call. The `status` field progresses through these states:

| Status          | Meaning                                       |
| --------------- | --------------------------------------------- |
| `processing`    | Job accepted, queued                          |
| `deduplicating` | Merging duplicate findings across scanners    |
| `enriching`     | Adding risk scores, impact, remediation       |
| `correlating`   | Building attack chains, classifying findings  |
| `prioritizing`  | Generating priority notes and executive brief |
| `completed`     | Results ready — `result` field is populated   |
| `failed`        | Pipeline error — `error` field explains why   |

> Results are deleted from storage once retrieved. Fetch them once and store locally.

---

## Raw finding vs enriched finding

A **raw finding** is what a scanner emits. An **enriched finding** is that same object with AI-generated fields merged in, plus metadata from dedup and correlation.

### Raw finding (scanner output)

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
  "refs": ["https://cwe.mitre.org/data/definitions/798.html"],
  "locations": [
    {
      "file": "config/deploy.rb",
      "startLine": 42,
      "code": "access_key = 'AKIA...'"
    }
  ]
}
```

### Enriched finding (after pipeline)

The same object now carries every AI-generated field, dedup metadata, chain membership, and a priority rank:

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
  "refs": ["https://cwe.mitre.org/data/definitions/798.html"],
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
      "Rotate the AWS key immediately via the IAM console — assume it is compromised.",
      "Remove the hardcoded value from config/deploy.rb.",
      "Inject the credential via an environment variable or secrets manager (AWS Secrets Manager, Vault).",
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

## Enriched fields reference

### Identity and ranking

| Field               | Type           | Description                                                                               |
| ------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| `findingId`         | string         | Stable ID for this finding within the job, e.g. `FINDING-0001`                            |
| `priorityRank`      | number         | 1-based rank after sorting by composite priority (1 = most urgent)                        |
| `compositePriority` | number (0–100) | Computed score combining AI risk, exploit class, chain membership, and production context |

### AI risk assessment

| Field          | Type           | Description                                                                                    |
| -------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| `aiRiskScore`  | number (1–100) | Composite risk considering CVSS, exploitability, data sensitivity, and test/production context |
| `aiRiskRating` | string         | `CRITICAL` (90–100) · `HIGH` (70–89) · `MEDIUM` (40–69) · `LOW` (20–39) · `INFO` (1–19)        |

### Impact

```json
"impact": {
  "confidentiality": "HIGH | MEDIUM | LOW | NONE",
  "integrity": "HIGH | MEDIUM | LOW | NONE",
  "availability": "HIGH | MEDIUM | LOW | NONE",
  "scope": "Changed | Unchanged",
  "description": "Plain-language description of what an attacker achieves."
}
```

### Compliance

An array of frameworks this finding violates.
