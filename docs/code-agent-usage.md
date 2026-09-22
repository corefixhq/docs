# Code Scanner — Standalone Usage

Run the CoreFix code scanner on any machine with Docker installed using the `corefix` CLI. It runs the `corefixhq/cfix` image for you — no `docker run` commands, volume mounts or environment variables to manage.

Check your installed version with `corefix --version`, and pull the latest scanner images with `corefix update`.

::: tip New Scanners Now Live
- **Container Scanning** - vulnerabilities in your container images
- **CIS Benchmarking** for Dockerfiles
- **Malware & Supply Chain Risk Detection** for packages
- **SonarQube Integration** for security hotspots, code smells, and bugs
- **AI Governance Scanner** and **AI BOM** — AI Bill of Materials and governance scan across source code
- **SBOM Generator** — Software Bill of Materials for your project
:::

---

## Setup

You need [Docker](https://docs.docker.com/get-docker/) running and the `corefix` binary on your `PATH`. See [CoreFix CLI — Overview](./docker-cli) for installation.

### Log in

```bash
corefix login
```

This opens your browser, signs you in to CoreFix, and saves your session to `~/.corefix/session.json`. One login covers both code and web scanning, and you only do it once per machine.

Alternatively, skip the login and export an API key from [Account & API Keys](https://app.corefix.dev/settings/api-keys):

```bash
export CFIX_API_KEY=<your-api-key>
```

`corefix` reads `~/.corefix/session.json` first and falls back to `$CFIX_API_KEY`.

### Update the scanner images

```bash
corefix update
```

Docker Hub: [hub.docker.com/r/corefixhq/cfix](https://hub.docker.com/r/corefixhq/cfix)

---

## Quick Start

Run from the root of the repository you want to scan:

```bash
corefix code
```

That's it — all scanners run against the current checkout, and results are written to `~/.corefix/scan-results` and sent to your CoreFix dashboard.

![Terminal Successful Execution](./assets/terminal-successful-exec.png)

---

## Full Command Reference

```bash
corefix code [<scanner>[,<scanner>...]] \
  [--openai-api-key <key>] \
  [--model <model-name>] \
  [--ignore-ai-analysis] \
  [--github-token <github-pat>] \
  [--container <images>] \
  [--patch] \
  [--rescan] \
  [--pr] \
  [--in-place]
```

Other commands:

| Command | Description |
|---|---|
| `corefix login` | Log in to CoreFix using your browser. Covers both code and web scanning |
| `corefix code status` | Print the last known scan status (branch, commit and patch state) as JSON |

---

## Authentication and Output

| Item | Description |
|---|---|
| API key | Read from `~/.corefix/session.json` (created by `corefix login`), falling back to the `CFIX_API_KEY` environment variable |
| Source code | `corefix` scans the repository in your current directory. Run it from your repository root |
| Results | Reports are written to `~/.corefix/scan-results` after the scan completes |

### What `corefix code` does for you

You don't pass any Docker flags — `corefix code` sets up the container for you:

- **Runs as your user.** The scanner container always runs with `--user "$(id -u):$(id -g)"`, so files it writes are owned by you rather than root.
- **Mounts `$HOME/.corefix` automatically.** This is how the scanner is authenticated with your `corefix login` session, and where results are written.
- **Mounts the Docker socket only for container scans.** When `--container` is used, `-v /var/run/docker.sock:/var/run/docker.sock` is added so the scanner can access your local Docker daemon and pull images directly — no credentials to your container registry are needed.

---

## Scanners

Pass a comma-separated list as the first argument. Defaults to all scanners if omitted: `osv,iac,secrets,k8s,sast,sonar,container,ai,malware`

| Value | Tool | What it finds |
|---|---|---|
| `sast` | OpenGrep | Code vulnerabilities across 30+ languages |
| `secrets` | Gitleaks | Hardcoded credentials, API keys, tokens |
| `osv` | OSV-Scanner | Dependency CVEs with reachability analysis |
| `iac` | KICS | Terraform, Dockerfile, Helm, CloudFormation misconfigs |
| `k8s` | Kubescape | Kubernetes RBAC, pod security, CIS benchmarks |
| `sonar` | SonarQube | Security hotspot, bug, code smell, and vulnerability rules |
| `container` | CoreFix Container Scanner | Container image vulnerabilities and Dockerfile CIS benchmarking |
| `ai` | AI BOM / AI Governance Scanner | AI Bill of Materials (AI BOM) and AI governance scan across source code |
| `malware` | CoreFix Malware Scanner | Malware within Python, NPM (JS), Golang, Ruby gems, GitHub Actions, and VS Code extensions, plus cross-package supply chain risk detection |

### Automatic SBOM Generation

On your main branch, an SBOM is generated automatically by default — there is no `sbom` scanner to pass yourself.

- A full source-code SBOM is generated from a directory scan of your entire repository.
- If any images are passed via `--container`, or tagged `cfix`, a container SBOM is generated automatically for each of those images.
- If the `ai` scanner is included in the run, an AI Bill of Materials (AI BOM) is also generated alongside the source SBOM.

---


## CodeFix — Automated Remediation

For the full reference — patch options, patch limits by plan, and how patching behaves when your branch or commit diverges from the scanned snapshot — see [CodeFix — Automated Remediation](./auto-remediation.md).

CoreFix can patch the vulnerabilities it finds instead of just reporting them. `--patch` runs CodeFix against your findings and writes the fixes into your repository.

::: tip OpenCode Agent Included
CodeFix uses the **OpenCode** coding agent, which ships by default inside the CoreFix Docker image — there is nothing to install or configure. In the future, you will also be able to use your own Claude or Codex as the coding agent.
:::

## Patch options

| Flag | Description |
|---|---|
| `--patch` | Fix the previous pending scan, or scan and fix when no pending scan exists. Free plan: up to 5 patches at a time — see [Patch limits by plan](#patch-limits-by-plan) |
| `--rescan` | Scan the current checkout again; add `--patch` to also fix findings |
| `--pr` | Create a pull request after remediation |
| `--in-place` | Apply fixes directly in the current repository instead of an isolated worktree |

All four default to `false`. Here is what the common combinations do:

| Command | What it does |
|---|---|
| `corefix code` | Scans the current checkout. If a previous scan still has patches pending, it does **not** rescan — it shows the status of that scan instead (see [Scan snapshots and re-runs](#scan-snapshots-and-re-runs)) |
| `corefix code --patch` | Fixes the previous pending scan. If there is no pending scan, scans the current checkout and fixes it |
| `corefix code --rescan` | Scans the current checkout again — a security scan only, no fixes |
| `corefix code --rescan --patch` | Scans the current checkout again and fixes the findings |
| `corefix code --patch --pr` | Fixes the findings, then opens a pull request |
| `corefix code --patch --in-place` | Fixes the findings directly in your current repository instead of an isolated worktree |
| `corefix code status` | Prints the last known scan status (branch, commit and patch state) as JSON |



```bash
# Fix the previous pending scan (or scan and fix if none is pending)
corefix code --patch

# Scan the current checkout again and fix the findings
corefix code --rescan --patch

# Apply fixes and open a pull request automatically
corefix code --patch --pr --github-token ghp_xxxxxxxxxxxx

# Apply fixes directly in the current repository
corefix code --patch --in-place

# Check the last known scan / patch state
corefix code status
```


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
--openai-api-key sk-proj-xxxxxxxx --model gpt-5-mini
```

**Models accepted by `--model` for code scans:** `gpt-5-mini`, `gpt-5.4-mini`, `gpt-5.6-luna`, `bedrock:runtime:claude-haiku-4.5`, `claude-haiku-4.5`, `gpt-5`, `gpt-5.4`, `gpt-5.6-terra`, `claude-sonnet-4.6`, `claude-sonnet-5`

**Skip AI analysis entirely:**

Pass `--ignore-ai-analysis` to skip the AI pipeline — this covers deduplication, enrichment of findings, and AI-based prioritization. Raw and normalized findings are still written to `~/.corefix/scan-results`, but no enriched report or AI-based prioritization is generated.

---

## CLI Options

### `--openai-api-key` (optional)

Your own OpenAI API key. Requires `--model`. See [AI Models](#ai-models) above.

### `--model` (optional)

Override the AI model used for enrichment. See [AI Models](#ai-models) for the accepted values and [Supported Models](https://docs.corefix.dev/docs/models).

### `--ignore-ai-analysis` (optional)

Skip the AI pipeline — deduplication, enrichment of findings, and AI-based prioritization are all skipped. Useful for faster runs, or when you only need raw/normalized findings without AI enrichment. Cannot be combined meaningfully with `--openai-api-key` / `--model`, since there is no enrichment step to run those against. Default: `false`.

### `--github-token` (optional)

GitHub Personal Access Token for uploading scan results as a SARIF file to GitHub Code Scanning. Also required for `--pr`.

```bash
--github-token ghp_xxxxxxxxxxxx

# In CI, read it from a secret
--github-token "$GITHUB_TOKEN"
```

### `--container` (optional)

Comma-separated list of container images to scan. See [Container Scanning](./container) for the full reference, CI/CD example, and the `cfix`-tag opt-in.

```bash
--container nginx,redis:v6.2.0,postgres:latest
```

### `--patch` (optional)

Fix the previous pending scan, or scan and fix when no pending scan exists. Fixes are applied in an isolated worktree unless `--in-place` is set. Patches always apply to the snapshot (branch and commit) of the previous scan — see [Scan snapshots and re-runs](#scan-snapshots-and-re-runs). On the Free plan, up to 5 patches (5 commits) are applied at a time; Pro and Teams fix all issues in all files in one go — see [Patch limits by plan](#patch-limits-by-plan). Default: `false`.

```bash
--patch
```

### `--rescan` (optional)

Scan the current checkout again; add `--patch` to also fix findings. Use it when CoreFix reports that your branch or commit has changed since the previous scan. On its own, `--rescan` is a security scan only. Default: `false`.

```bash
--rescan --patch
```

### `--pr` (optional)

Create a pull request after remediation. Requires `--github-token` with write access to the repository. Default: `false`.

```bash
--patch --pr
```

### `--in-place` (optional)

Apply fixes directly in the current repository instead of an isolated worktree. Default: `false`.

```bash
--patch --in-place
```

---

## Examples

### All scanners

```bash
corefix code
```

### Specific scanners only

```bash
# Secrets and SAST
corefix code secrets,sast

# Dependencies and IaC only
corefix code osv,iac

# Sonar, AI BOM/Governance, and malware scanning
corefix code sonar,ai,malware
```

### Bring your own API key

```bash
corefix code \
  --openai-api-key sk-proj-xxxxxxxx \
  --model gpt-5-mini
```

### Skip AI analysis

```bash
corefix code --ignore-ai-analysis
```


### Container scanning

See [Container Scanning](./container) for the `--container` reference, the `cfix`-tag opt-in, and a CI/CD example that scans an image right after it's built.

### Upload results to GitHub Code Scanning

```bash
corefix code --github-token ghp_xxxxxxxxxxxx
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
corefix code secrets,sast,osv \
  --github-token ghp_xxxxxxxxxxxx \
  --openai-api-key sk-proj-xxxxxxxx \
  --model gpt-5-mini
```

### Automated remediation with CodeFix

```bash
# Fix the previous pending scan (or scan and fix if none is pending)
corefix code --patch

# Apply fixes and open a pull request
corefix code --patch --pr --github-token ghp_xxxxxxxxxxxx

# Re-scan the current checkout, then fix and open a PR
corefix code --rescan --patch --pr --github-token ghp_xxxxxxxxxxxx
```

### Use in scripts and CI

```bash
export CFIX_API_KEY=<your-api-key>
corefix code --ignore-ai-analysis

# Read the last known scan / patch state as JSON
corefix code status | jq .
```

---

## Related

- [CoreFix CLI — Overview](./docker-cli)
- [Container Scanning](./container)
- [Web Scanner — Standalone Usage](./web-agent-usage.md)
- [CI/CD Integration](./cicd-integration)
- [Supported Models](./models)
- [Credit Components](./pricing-and-usage)
