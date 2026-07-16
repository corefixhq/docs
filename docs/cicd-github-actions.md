---
hide_title: true
sidebar_label: Code Scan via GitHub Actions
---

## Code Scanning via GitHub Actions in 2 Minutes

Set up automated code scanning in your GitHub repository using GitHub Actions. This guide takes less than 2 minutes.

---

## Prerequisites

- A CoreFix account — [sign up with GitHub](https://app.corefix.dev/signup) for the fastest setup.
- The CoreFix Security GitHub App installed on your repository — [![GitHub](https://img.shields.io/badge/GitHub-View%20App-181717?style=flat&logo=github&logoColor=white)](https://github.com/apps/corefix-security)

---

## Step 1 — Create a Pipeline and Get Your API Key

Click the link below to create a new GitHub Actions pipeline in CoreFix:

**→ [Create GitHub Actions Pipeline](https://app.corefix.dev/mahidhars-workspace/projects?drawer=cicd&platform=github-actions)**

Copy the generated **API key** — you'll need it in the next step.

---

## Step 2 — Add the API Key to GitHub Secrets

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `X_CFIX_API_KEY`
4. Value: paste the API key from Step 1.
5. Click **Add secret**.

---

## Step 3 — Add the Workflow File

Download the YAML file from the pipeline creation screen, or copy the one below. Save it as `.github/workflows/cfix.yaml` in your repository.

```yaml
name: CoreFix Code Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: write
  security-events: write

jobs:
  corefix-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run CoreFix Code Scanner
        run: |
          mkdir -p ${{ github.workspace }}/scan-results
          docker run --rm \
            -e X_CFIX_API_KEY=${{ secrets.X_CFIX_API_KEY }} \
            -e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
            -v ${{ github.workspace }}:/code \
            -v ${{ github.workspace }}/scan-results:/output \
            corefixhq/cfix:latest

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: corefix-scan-results
          path: scan-results/
```

> The workflow targets the `main` branch by default. Change it to any branch you want to scan.

---

## Done

Push the workflow file to your repository. CoreFix will scan your code on every push and pull request to the configured branch. Results appear in your [CoreFix dashboard](https://app.corefix.dev) within a few minutes.

---

## What's Next

- [Code Scanning CI/CD — Full Reference](/docs/cicd-integration) — scanner flags, BYOK models, and other platforms
- [Docker / Local CLI](/docs/docker-cli) — run scans locally without a pipeline
- [Supported Models](/docs/models) — choose an AI model for enrichment