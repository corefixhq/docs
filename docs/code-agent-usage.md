# Code Scanner — Standalone Usage

Run the CoreFix code scanner on any machine with Docker installed. No other dependencies required.

**Current version:** `v1.0.0` · **Commit:** `26141d48`

---

## Pull the Image

### Docker Hub

```bash
docker pull corefixhq/cfix               # latest
docker pull corefixhq/cfix:latest        # latest (explicit)
docker pull corefixhq/cfix:1.0.0         # specific version
docker pull corefixhq/cfix:26141d48      # specific commit SHA
```

→ [hub.docker.com/r/corefixhq/cfix](https://hub.docker.com/r/corefixhq/cfix)

### GitHub Container Registry (GHCR)

```bash
docker pull ghcr.io/corefixhq/cfix:latest       # latest
docker pull ghcr.io/corefixhq/cfix:1.0.0        # specific version
docker pull ghcr.io/corefixhq/cfix:26141d48     # specific commit SHA
```

→ [github.com/orgs/corefixhq/packages/container/package/cfix](https://github.com/orgs/corefixhq/packages/container/package/cfix)

---

## Quick Start

```bash
docker run --rm \
  -e ORG_ID=<your-org-id> \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix
```

![Terminal Successful Execution](./assets/terminal-successful-exec.png)

---

## Full Command Reference

```bash
docker run --rm \
  -e ORG_ID=<your-org-id> \
  -e X_CFIX_API_KEY=<your-api-key> \
  [-e GITHUB_TOKEN=<github-pat>] \
  -v $(pwd):/code \
  -v <output-dir>:/output \
  corefixhq/cfix [scanners] \
  [--emailids <email1,email2>] \
  [--openai-api-key <key>] \
  [--model <model-name>] \
  [--github-token <github-pat>]
```

The screenshot below shows the command being run from the root folder of a repository — in this case a Chef repo is used as the target.

![Example Usage](./assets/terminal-cmd.png)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ORG_ID` | **Yes** | Your CoreFix organization ID. Found in [Account & API Keys](https://app.corefix.dev/settings/api-keys) |
| `X_CFIX_API_KEY` | **Yes** | Your CoreFix API key. Found in [Account & API Keys](https://app.corefix.dev/settings/api-keys) |
| `GITHUB_TOKEN` | No | GitHub PAT for uploading results as SARIF to GitHub Code Scanning |

---

## Volume Mounts

| Mount | Description |
|---|---|
| `-v $(pwd):/code` | Mounts your project root (source code or repo) into the container at `/code`. Run from your repository root. |
| `-v ~/scan-results:/output` | Local directory where scan reports are written after the scan completes |

---

## Scanners

Pass a comma-separated list as the first argument. Defaults to all scanners if omitted: `osv,iac,secrets,k8s,sast`

| Value | Tool | What it finds |
|---|---|---|
| `sast` | OpenGrep | Code vulnerabilities across 30+ languages |
| `secrets` | Gitleaks | Hardcoded credentials, API keys, tokens |
| `osv` | OSV-Scanner | Dependency CVEs with reachability analysis |
| `iac` | KICS | Terraform, Dockerfile, Helm, CloudFormation misconfigs |
| `k8s` | Kubescape | Kubernetes RBAC, pod security, CIS benchmarks |

---

## AI Models

CoreFix automatically selects an AI model for enrichment based on your account. You don't need to configure anything — but you can override if needed.

**If you don't specify a model or API key:**
- Open source plan → a standard model is randomly selected from the open source pool
- Paid plan → a premium model is randomly selected for higher quality enrichment

**If you specify `--model` without `--openai-api-key`:**
- Paid plan → that model is used if supported
- Open source plan → the model flag is silently ignored and a standard model is selected

**If you specify `--openai-api-key`:**
- `--model` is required. The scan will fail without it.
- The specified model is used via your key. You pay your provider directly.
- See [Supported Models →](https://docs.corefix.dev/docs/models) for the full list of models available with BYOK.

```bash
# BYOK — must include --model
--openai-api-key sk-proj-xxxxxxxx --model gpt-4o-mini
```

---

## CLI Options

### `--emailids` (optional)

Send the scan report to one or more email addresses on completion. Recipients receive a password-protected report link — no CoreFix account required.

```bash
--emailids you@example.com,security@yourcompany.com
```

### `--openai-api-key` (optional)

Your own OpenAI-compatible API key. Requires `--model`. See [AI Models](#ai-models) above.

### `--model` (optional)

Override the AI model used for enrichment. See [Supported Models](https://docs.corefix.dev/docs/models).

### `--github-token` (optional)

GitHub Personal Access Token for uploading scan results as a SARIF file to GitHub Code Scanning. Can also be passed as the `GITHUB_TOKEN` environment variable.

```bash
# As a flag
--github-token ghp_xxxxxxxxxxxx

# As an environment variable (preferred for CI)
-e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
```

---

## Examples

### All scanners

```bash
docker run --rm \
  -e ORG_ID=your-org-id \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix
```

### Specific scanners only

```bash
# Secrets and SAST
docker run --rm \
  -e ORG_ID=your-org-id \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix secrets,sast

# Dependencies and IaC only
docker run --rm \
  -e ORG_ID=your-org-id \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix osv,iac
```

### Email report on completion

```bash
docker run --rm \
  -e ORG_ID=your-org-id \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix \
  --emailids you@example.com
```

### Bring your own API key

```bash
docker run --rm \
  -e ORG_ID=your-org-id \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix \
  --openai-api-key sk-proj-xxxxxxxx \
  --model gpt-4o-mini
```

### Upload results to GitHub Code Scanning

```bash
docker run --rm \
  -e ORG_ID=your-org-id \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -e GITHUB_TOKEN=ghp_xxxxxxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix
```

- Example of Logs showing successful sarif upload.

```
[*] Uploading 51 findings to GitHub...
[*] Repo: chef Branch: main Commit: d1e9ce21e1f7925b9c489aa137ffd57bb788b87f
[+] SARIF accepted. Status URL: https://api.github.com/repos/mai1x9/chef/code-scanning/sarifs/e98d6b64-5f70-11f1-9ac1-06c8a1baee39
[*] SARIF processing status: complete
[+] SARIF processing complete. Errors: []
[+] SARIF uploaded to GitHub Security tab
    https://github.com/mai1x9/chef/security/code-scanning
```


### Full example with all options

```bash
docker run --rm \
  -e ORG_ID=your-org-id \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -e GITHUB_TOKEN=ghp_xxxxxxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix secrets,sast,osv \
  --emailids you@example.com \
  --openai-api-key sk-proj-xxxxxxxx \
  --model gpt-4o-mini
```

- Below Screenshot shows successful run of the scanners and results being sent for AI for enrichment.
![Terminal Logs](./assets/terminal-logs.png)

### Pin to a specific version

```bash
docker run --rm \
  -e ORG_ID=your-org-id \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  corefixhq/cfix:1.0.0
```

### Detailed Agent logs output.

```
ubuntu@ubuntu-dev-vulnscanner-1:~/chef$ docker run --rm -e X_CFIX_API_KEY=cfix_live_f8c5b8e3ce7ddae5ac86a225a528498b53cae927585cf2615a2d0890e4529b920b1e4a98630206de279785b4893efaabca -e ORG_ID=b7a526b4-7f14-46c8-b309-759ecf2d93f6 -e GITHUB_TOKEN=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  -v $(pwd):/code -v ~/scan-results:/output cfix-test --openai-api-key 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 --model gpt-5.4-mini
◇ injected env (7) from config/.env // tip: ⌁ auth for agents [www.vestauth.com]
[+] Local scan mode — using mounted /code
Scanner endpoint:  https://deeptraq-api-test.cloud-e5c.workers.dev
=> API key verification result: { success: true, error: undefined, credits_remaining: -1.050649 }
[+] API key verification successful.
The following scanners to be launched:  osv,iac,secrets,k8s,sast
Collecting git metadata from repo at: /code
[+] Detected open source repository. Repo: chef
[+] Git metadata collected: {
  repo: 'chef',
  branch: 'main',
  commit_sha: 'd1e9ce21e1f7925b9c489aa137ffd57bb788b87f',
  short_sha: 'd1e9ce21e1',
  commit_message: 'Create osv-scanner.yml',
  author_name: 'Sai Mahidhar',
  author_email: 'mahidhar@fusiontech.in',
  committer_name: 'GitHub',
  committer_email: 'noreply@github.com',
  remote_url: 'https://github.com/mai1x9/chef.git',
  build_uuid: 'd47f0996-200f-4bfd-9a8f-0f597089b024',
  org_id: 'b7a526b4-7f14-46c8-b309-759ecf2d93f6',
  started_at: '2026-06-03T17:19:53.717Z',
  is_open_source: true,
  projectType: 'code'
}
==> Starting scanner: osv
Starting direct execution for scanner: osv
[17:19:56.314] INFO (1): Starting the Code Vuln scan. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:19:56.314Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"osv-local-scan","scanner":"codevuln"}
Scan job completed successfully for osv.
✅ Scan Done successfully for: osv


==> Starting scanner: iac
Starting direct execution for scanner: iac
[17:20:03.040] INFO (1): Vulnerabilities Scan done. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:20:03.040Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"osv-local-scan","scanner":"codevuln","vulnerabilities":43}
[17:20:03.042] INFO (1): Starting the IaC scan. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:20:03.042Z","namespace":"bullmq","repo":"/code","options":{"log":true,"artifacts":true,"credentials":{},"scan_category":"git"},"workspace":"workspace-default","scanName":"iac-local-scan","scanner":"IaC"}
Scan job completed successfully for iac.
✅ Scan Done successfully for: iac


==> Starting scanner: secrets
Starting direct execution for scanner: secrets
[17:20:04.708] INFO (1): IaC scan done {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:20:04.708Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"iac-local-scan","scanner":"IaC"}
[17:20:04.710] INFO (1): Starting the Secrets scan. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:20:04.710Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"secrets-local-scan","scanner":"secrets"}
✅ Converted 33 findings successfully
Scan job completed successfully for secrets.
✅ Scan Done successfully for: secrets


==> Starting scanner: k8s
Starting direct execution for scanner: k8s
[17:20:07.272] INFO (1): Done Secrets scan. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:20:07.272Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"secrets-local-scan","scanner":"secrets"}
[17:20:07.303] INFO (1): Starting the Kubescape scan. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:20:07.303Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"k8s-local-scan","scanner":"kubescape"}
Scan job completed successfully for k8s.
✅ Scan Done successfully for: k8s


==> Starting scanner: sast
Starting direct execution for scanner: sast
[17:20:13.030] INFO (1): Kubescape scan done. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:20:13.030Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"k8s-local-scan","scanner":"kubescape"}
[17:20:13.031] INFO (1): Starting the opengrep scan. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:20:13.031Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"sast-local-scan","scanner":"opengrep"}
Scan job completed successfully for sast.
✅ Scan Done successfully for: sast


=> Uploading results for AI enrichment. gpt-5.4-mini model in use. Raw Findings count: 212, Normalized Results count: 177
Uploading raw findings: 177
[17:21:08.739] INFO (1): Done opengrep scan. {"host":"48d79678de8a","severity":"INFO","dateTime":"2026-06-03T17:21:08.739Z","namespace":"bullmq","repo":"/code","workspace":"workspace-default","scanName":"sast-local-scan","scanner":"opengrep"}
=> Raw results uploaded. Initial Findings found: 177
=> Generated HTML, saved in R2 at: reports/b7a526b4-7f14-46c8-b309-759ecf2d93f6/proj_286939d1-2670-4e1a-951b-34741dce54c8/d47f0996-200f-4bfd-9a8f-0f597089b024/report.html
Uploading raw findings: 177
Uploading 177 findings for AI enrichment.
Added AI task, running in background:  {
  success: true,
  job_id: '6f6d4880-7334-4382-b624-4a7213261a4a',
  build_uuid: 'd47f0996-200f-4bfd-9a8f-0f597089b024',
  model: 'gpt-5.4-mini',
  status: 'processing',
  message: 'Enrichment started. Poll /api/enrich/status for results.'
}
[Batch - 0] Enrichment processing... 10s
Enrichment status:  processing
AI Pipeline Status -> processing
[Batch - 1] Enrichment processing... 20s
Enrichment status:  deduplicating
[Batch - 2] Enrichment processing... 30s
Enrichment status:  enriching
[Batch - 3] Enrichment processing... 40s
Enrichment status:  enriching
[Batch - 4] Enrichment processing... 50s
Enrichment status:  enriching
[Batch - 5] Enrichment processing... 60s
Enrichment status:  enriching
[Batch - 6] Enrichment processing... 70s
Enrichment status:  enriching
[Batch - 7] Enrichment processing... 80s
Enrichment status:  correlating
[Batch - 8] Enrichment processing... 90s
Enrichment status:  correlating
[Batch - 9] Enrichment processing... 100s
Enrichment status:  prioritizing
[Batch - 10] Enrichment processing... 110s
Enrichment status:  completed
Encriched Data:  [
  'success',
  'org_id',
  'meta',
  'findings',
  'attackChains',
  'executiveBrief'
]
=> Enrichment completed. Enriched findings count: 51
[+] Tokens consumed:  {
  prompt: 58166,
  completion: 45544,
  total: 103710,
  calls: 22,
  duration: 273829,
  cacheWrite: 0,
  cacheRead: 0
}
[+] AI processing time (s):  102.3
=> Enriched results upload. Total Findings found: 51
=> Generated (enriched findings) HTML, saved in R2 at: reports/b7a526b4-7f14-46c8-b309-759ecf2d93f6/proj_286939d1-2670-4e1a-951b-34741dce54c8/d47f0996-200f-4bfd-9a8f-0f597089b024/report.html
[+] Raw Results are saved at: /output/results.json, Normalized results at: Raw Results are saved at: /output/normalized.json and 
        enriched results at /output/enriched_results.json
=> Email report generation status: {
  success: true,
  message: 'Report notification sent.',
  sent: 1,
  failed: 0,
  reportUrl: 'https://2e5c44a3ee97117f91674c1f3f463981.r2.cloudflarestorage.com/deeptraq-findings-test/reports/b7a526b4-7f14-46c8-b309-759ecf2d93f6/proj_286939d1-2670-4e1a-951b-34741dce54c8/d47f0996-200f-4bfd-9a8f-0f597089b024/report.html?X-Amz-Expires=18000&X-Amz-Date=20260603T172316Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=e0f6a2c12984e8ef57094f9097898eed%2F20260603%2Fauto%2Fs3%2Faws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=884186729ddcd861118745d4d2ff97133da4b32a49a132a2f4aef70c1e2fd2bc',
  projectUrl: 'https://6e08f5c4.deeptraq-reports-test.pages.dev?pid=proj_286939d1-2670-4e1a-951b-34741dce54c8&oid=b7a526b4-7f14-46c8-b309-759ecf2d93f6',
  totalFindings: 51,
  severity: { critical: 2, high: 27, medium: 14, low: 4, info: 4 },
  scannerSummary: { gitleaks: 5, 'osv-scanner': 30, kics: 4, opengrep: 12 },
  recipients: 1
}
[*] Uploading 51 findings to GitHub...
[*] Repo: chef Branch: main Commit: d1e9ce21e1f7925b9c489aa137ffd57bb788b87f
[+] SARIF accepted. Status URL: https://api.github.com/repos/mai1x9/chef/code-scanning/sarifs/e98d6b64-5f70-11f1-9ac1-06c8a1baee39
[*] SARIF processing status: complete
[+] SARIF processing complete. Errors: []
[+] SARIF uploaded to GitHub Security tab
    https://github.com/mai1x9/chef/security/code-scanning
=> Cloudflare Workers processing time: 133605 seconds
=> Uploading the usage for the model. Model used: gpt-5.4-mini, Provided model: gpt-5.4-mini
================ Scan information =============
Build Id: d47f0996-200f-4bfd-9a8f-0f597089b024
Project Id: proj_286939d1-2670-4e1a-951b-34741dce54c8
Usage recorded: {
  success: true,
  cost: {
    llm: 0.248573,
    total: 0.251728,
    credits_runtime: 0,
    credits_llm: 0,
    total_credits: 0
  },
  tokens: {
    prompt: 58166,
    completion: 45544,
    total: 103710,
    cacheWrite: 0,
    cacheRead: 0,
    calls: 22
  },
  model: 'gpt-5.4-mini'
}


[+] Started at: 2026-06-03T17:19:53.717Z
[+] Total execution time: 208.632 seconds
-----------------------------------------------
Scan Summary:

[+] Total Findings: 177
Severity Summary: { critical: 77, high: 19, medium: 73, low: 8, info: 0 }
Scanner Summary: { gitleaks: 5, kics: 4, 'osv-scanner': 43, opengrep: 125 }


-----------------------------------------------
[+] View Results at
https://6e08f5c4.deeptraq-reports-test.pages.dev?pid=proj_286939d1-2670-4e1a-951b-34741dce54c8&oid=b7a526b4-7f14-46c8-b309-759ecf2d93f6
[+] OR Access results at (Expiry 1 hr):
https://2e5c44a3ee97117f91674c1f3f463981.r2.cloudflarestorage.com/deeptraq-findings-test/reports/b7a526b4-7f14-46c8-b309-759ecf2d93f6/proj_286939d1-2670-4e1a-951b-34741dce54c8/d47f0996-200f-4bfd-9a8f-0f597089b024/report.html?X-Amz-Expires=18000&X-Amz-Date=20260603T172316Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=e0f6a2c12984e8ef57094f9097898eed%2F20260603%2Fauto%2Fs3%2Faws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=884186729ddcd861118745d4d2ff97133da4b32a49a132a2f4aef70c1e2fd2bc
```


---

## Related

- [Web Scanner — Standalone Usage](./web-agent-usage.md)
- [CI/CD Integration](./cicd-integration)
- [Supported Models](./models)
- [Pricing & Usage](./pricing-and-usage)
