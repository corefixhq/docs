# CoreFix Scanner — Standalone Usage

Run the CoreFix security scanner directly on any machine with Docker installed. No installation beyond Docker is required.

---

## Quick Start

Pull the latest image and run all scanners against your current directory:

```bash
docker run --rm \
  -e ORG_ID=<your-org-id> \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  deeptraq-scanner
```

---

## Full Command Reference

```bash
docker run --rm \
  -e ORG_ID=<your-org-id> \
  [-e X_CFIX_API_KEY=<your-api-key>] \
  [-e X_CFIX_API_URL=<custom-api-url>] \
  [-e DEBUG=app:*] \
  -v $(pwd):/code \
  -v <output-dir>:/output \
  deeptraq-scanner [scanner] \
  [--emailids <email1,email2>] \
  [--openai-api-key <key>] \
  [--model <model-name>]
```

---

## Environment Variables

| Variable | Required | Secret | Description |
|---|---|---|---|
| `ORG_ID` | Yes | No | Your CoreFix organization ID |
| `X_CFIX_API_KEY` | No | **Yes** | API key for the CoreFix platform. Omit to use the production server |
| `X_CFIX_API_URL` | No | No | Override the API endpoint. Defaults to the production URL |
| `DEBUG` | No | No | Set to `app:*` to enable verbose debug output |

---

## Volume Mounts

| Mount | Purpose |
|---|---|
| `-v $(pwd):/code` | Source code to scan. Mount the root of your repository |
| `-v ~/scan-results:/output` | Directory where scan reports are written |

---

## Arguments

### `[scanner]` — Positional (optional)

Comma-separated list of scanners to run. Defaults to all scanners if omitted.

| Value | Tool | What it scans |
|---|---|---|
| `osv` | OSV Scanner | Open source dependency vulnerabilities |
| `iac` | KICS | Infrastructure-as-Code misconfigurations |
| `secrets` | Gitleaks | Hardcoded secrets and credentials |
| `k8s` | Kubescape | Kubernetes manifest security |
| `sast` | Opengrep | Static application security testing |

### `--emailids` (optional)

Comma-separated email addresses to receive the scan report.

```bash
--emailids dev@example.com,security@example.com
```

### `--openai-api-key` (optional)

Provide your own OpenAI-compatible API key to use a specific model. If omitted, CoreFix uses its own SaaS model rotation automatically.

> **Note:** If you provide `--openai-api-key`, you **must** also provide `--model`. Omitting `--model` with a key will cause an error.

### `--model` (required when `--openai-api-key` is set)

The model to use with your API key. Supported values:

- `gpt-4o-mini`
- `gpt-5.4-mini`
- `minimax-2.5`
- `glm-5.1`
- `kimi-2.6`
- `grok-4.3`

---

## Examples

### Run all scanners (default)

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  deeptraq-scanner
```

### Run specific scanners only

```bash
# Secrets and SAST only
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  deeptraq-scanner secrets,sast

# Dependency and IaC scanning only
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  deeptraq-scanner osv,iac
```

### Run with email report delivery

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  deeptraq-scanner \
  --emailids you@example.com
```

### Run with your own AI model

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  deeptraq-scanner \
  --openai-api-key sk-proj-xxxxxxxxxxxxxxxx \
  --model gpt-4o-mini
```

### Run with a custom API endpoint and debug output

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -e X_CFIX_API_KEY=cfix_live_xxxxxxxxxxxxxxxx \
  -e X_CFIX_API_URL=https://your-custom-endpoint.example.com \
  -e DEBUG=app:* \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  deeptraq-scanner
```

### Pin to a specific image version

```bash
docker run --rm \
  -e ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx \
  -v $(pwd):/code \
  -v ~/scan-results:/output \
  deeptraq-scanner:1.2.0
```

> Use `deeptraq-scanner:latest` or pin to a version tag for reproducible builds.

---

## Output

Scan results are written to the `/output` mount (mapped to `~/scan-results` or any directory you specify). Reports include findings from each scanner that was run.
