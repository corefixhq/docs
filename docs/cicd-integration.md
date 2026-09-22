---
hide_title: true
sidebar_label: Code Scan — CI/CD
---

## Code Scanning — CI/CD Integration

Add CoreFix code scanning to your existing pipeline with a single step. The step installs the `corefix` CLI and runs `corefix code`, which runs the CoreFix scanner container (`corefixhq/cfix`) for you. It can be dropped into any job that already checks out your code.

::: tip `--patch` is not used in CI/CD
`--patch` (CodeFix) is not usually used in CI/CD pipelines, because nobody applies patches inside a pipeline run. In a pipeline, `corefix code` scans your code and reports the findings; apply fixes from your own machine with `corefix code --patch`. See [CodeFix — Automated Remediation](/docs/code-agent-usage#codefix--automated-remediation).
:::

For detailed CLI options, scanner flags, and BYOK model configuration, refer to [CoreFix CLI](/docs/docker-cli).

---

## How It Works

1. Your pipeline checks out the repository as it normally does.
2. The CoreFix scan step sets `CFIX_API_KEY`, installs the `corefix` CLI, and runs `corefix code`. The CLI pulls the `corefixhq/cfix` Docker image and scans the checked-out workspace.
3. Results are written to `~/.corefix/scan-results` on the runner, pushed to the CoreFix dashboard, and optionally emailed.

You can add the CoreFix scan as a **standalone workflow file** or as a **step in an existing job**.

Every example on this page uses the same three commands:

```bash
export CFIX_API_KEY=<your-api-key>
curl -fsSL https://get.corefix.dev/corefix | sudo sh
corefix code
```

Your runner needs Docker available and permission to run `sudo` for the install. Use `CFIX_API_KEY` for authentication in pipelines — `corefix login` opens a browser and isn't suitable for CI.

---

## Secrets & Permissions

Store sensitive values as **secrets** in your CI/CD platform. 

| Variable | Storage | Description |
|---|---|---|
| `CFIX_API_KEY` | **Secret** (required) | Your CoreFix API key, from [Account & API Keys](https://app.corefix.dev/settings/api-keys) |
| `GITHUB_TOKEN` | **Secret** | GitHub token for pushing SARIF to GitHub Code Scanning (see below) |
| `OPENAI_API_KEY` | **Secret** | Only if bringing your own AI model |

> A secret can have any name you like — the examples call it `CFIX_API_KEY` to match the environment variable the CLI reads. If you already have a secret named `X_CFIX_API_KEY`, keep it and map it in the step, for example `export CFIX_API_KEY=${{ secrets.X_CFIX_API_KEY }}`.

### GitHub Token for SARIF Upload

You have two options for providing `GITHUB_TOKEN`:

**Option 1 — Use the built-in `GITHUB_TOKEN` (GitHub Actions only)**

GitHub Actions automatically exposes a `GITHUB_TOKEN`. Add the following permissions to your workflow so it can upload SARIF results:

```yaml
permissions:
  contents: write
  packages: write
  security-events: write   # required to upload SARIF results to code scanning
```

**Option 2 — Use a Personal Access Token (PAT)**

If you are not using GitHub Actions, or prefer a PAT, create one with **Code Scanning — Read and Write** access under the token's repository permissions. Store it as a secret in your CI/CD platform and pass it with `--github-token`.


---

## Supported Platforms

| Platform | Status |
|---|---|
| GitHub Actions | Supported |
| GitLab CI | Supported |
| Jenkins | Supported |
| CircleCI | Supported |
| Travis CI | Coming soon |
| Bitbucket Pipelines | Coming soon |
| Azure DevOps Pipelines | Coming soon |

---

## GitHub Actions

Add secrets in your repository under **Settings → Secrets and variables → Actions → New repository secret**. See [GitHub Actions encrypted secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) for details.

:::tabs
== Standalone Workflow File

Create `.github/workflows/corefix-code-scan.yml`:

```yaml
name: CoreFix Code Security Scan

on:
  push:
    branches: [main, master]
  pull_request:

permissions:
  security-events: write

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run CoreFix Code Scanner
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          export CFIX_API_KEY=${{ secrets.CFIX_API_KEY }}
          curl -fsSL https://get.corefix.dev/corefix | sudo sh
          corefix code --github-token "$GITHUB_TOKEN"

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: corefix-scan-results
          path: /home/runner/.corefix/scan-results/
```

== Add as Step

Add the following step to any existing job in your workflow after the `checkout` step:

```yaml
      - name: Run CoreFix Code Scanner
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          export CFIX_API_KEY=${{ secrets.CFIX_API_KEY }}
          curl -fsSL https://get.corefix.dev/corefix | sudo sh
          corefix code --github-token "$GITHUB_TOKEN"

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: corefix-scan-results
          path: /home/runner/.corefix/scan-results/
```

Ensure your workflow has `permissions: security-events: write` if pushing SARIF to GitHub Code Scanning.

:::

---

## GitLab CI

Add variables in your project under **Settings → CI/CD → Variables**. Create `CFIX_API_KEY` and mark it as **Masked** and **Protected**. See [GitLab CI/CD variables](https://docs.gitlab.com/ee/ci/variables/) for details.

GitLab exposes CI/CD variables as environment variables, so `CFIX_API_KEY` is already set inside the job. The `docker:24` image is Alpine-based, so `curl` and `sudo` are installed first.

:::tabs
== Standalone Pipeline File

Create or add to `.gitlab-ci.yml`:

```yaml
stages:
  - security

corefix-code-scan:
  stage: security
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - apk add --no-cache curl sudo
    - curl -fsSL https://get.corefix.dev/corefix | sudo sh
  script:
    - corefix code
  after_script:
    - mkdir -p scan-results
    - cp -r ~/.corefix/scan-results/. scan-results/ || true
  artifacts:
    when: always
    paths:
      - scan-results/
    expire_in: 7 days
```

== Add as Stage

Add the `corefix-code-scan` job to your existing pipeline's stages:

```yaml
stages:
  - build
  - test
  - security  # Add this stage

# Your existing build and test jobs above...

corefix-code-scan:
  stage: security
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - apk add --no-cache curl sudo
    - curl -fsSL https://get.corefix.dev/corefix | sudo sh
  script:
    - corefix code
  after_script:
    - mkdir -p scan-results
    - cp -r ~/.corefix/scan-results/. scan-results/ || true
  artifacts:
    when: always
    paths:
      - scan-results/
    expire_in: 7 days
```

:::

---

## Jenkins

Add credentials in **Manage Jenkins → Credentials → System → Global credentials** as **Secret text** entries. See [Jenkins credentials](https://www.jenkins.io/doc/book/using/using-credentials/) for details.

`withCredentials` exposes the secret as the `CFIX_API_KEY` environment variable for the commands inside it.

:::tabs
== Standalone Jenkinsfile

Create a `Jenkinsfile` for a dedicated security scan pipeline:

```groovy
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('CoreFix Code Scan') {
            steps {
                withCredentials([
                    string(credentialsId: 'corefix-api-key', variable: 'CFIX_API_KEY')
                ]) {
                    sh '''
                        curl -fsSL https://get.corefix.dev/corefix | sudo sh
                        corefix code
                    '''
                }
            }
            post {
                always {
                    sh '''
                        mkdir -p scan-results
                        cp -r ~/.corefix/scan-results/. scan-results/ || true
                    '''
                    archiveArtifacts artifacts: 'scan-results/**', allowEmptyArchive: true
                }
            }
        }
    }
}
```

== Add as Stage

Add the following stage to your existing `Jenkinsfile`:

```groovy
        stage('CoreFix Code Scan') {
            steps {
                withCredentials([
                    string(credentialsId: 'corefix-api-key', variable: 'CFIX_API_KEY')
                ]) {
                    sh '''
                        curl -fsSL https://get.corefix.dev/corefix | sudo sh
                        corefix code
                    '''
                }
            }
            post {
                always {
                    sh '''
                        mkdir -p scan-results
                        cp -r ~/.corefix/scan-results/. scan-results/ || true
                    '''
                    archiveArtifacts artifacts: 'scan-results/**', allowEmptyArchive: true
                }
            }
        }
```

:::

---

## CircleCI

Add environment variables in your project under **Project Settings → Environment Variables**. Create `CFIX_API_KEY` — CircleCI exposes it to every step as an environment variable. See [CircleCI environment variables](https://circleci.com/docs/env-vars/) for details.

:::tabs
== Standalone Config File

Create `.circleci/config.yml`:

```yaml
version: 2.1

jobs:
  corefix-code-scan:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      - run:
          name: Run CoreFix Code Scanner
          command: |
            curl -fsSL https://get.corefix.dev/corefix | sudo sh
            corefix code
      - store_artifacts:
          path: /home/circleci/.corefix/scan-results
          destination: corefix-scan-results

workflows:
  security:
    jobs:
      - corefix-code-scan
```

> Use the `machine` executor (not `docker`) so that Docker is available to the CLI.

== Add as Job

Add the following job and workflow entry to your existing `.circleci/config.yml`:

```yaml
jobs:
  # Your existing jobs above...

  corefix-code-scan:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      - run:
          name: Run CoreFix Code Scanner
          command: |
            curl -fsSL https://get.corefix.dev/corefix | sudo sh
            corefix code
      - store_artifacts:
          path: /home/circleci/.corefix/scan-results
          destination: corefix-scan-results

workflows:
  build-test-scan:
    jobs:
      - build
      - test
      - corefix-code-scan:
          requires:
            - test
```

:::

---

## Choosing Scanners

Run specific scanners to keep pipeline time down, or run all for a full audit. Use these in place of `corefix code` in the examples above:

```bash
# All scanners (default — omit positional argument)
corefix code

# Dependencies only
corefix code osv

# Secrets detection + SAST
corefix code secrets,sast

# IaC + Kubernetes
corefix code iac,k8s

# Full scan, explicit
corefix code osv,iac,secrets,k8s,sast
```

---

## Coming Soon

Support for the following platforms is in progress:

- **Travis CI**
- **Bitbucket Pipelines**
- **Azure DevOps Pipelines**

---

## Related

- [Code Scanner CLI Options](/docs/code-agent-usage.md#cli-options)
- [Available Code Scanners](/docs/code-agent-usage.md#scanners)
- [CoreFix CLI — Code Scanner Options](/docs/docker-cli#code-scanner-options)
- [Container Scanning](/docs/code-agent-usage.md#container-scanning-with-container)
