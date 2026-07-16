---
hide_title: true
sidebar_label: Code Scan — CI/CD
---

## Code Scanning — CI/CD Integration

Add CoreFix code scanning to your existing pipeline with a single step. The scanner runs as a Docker container (`corefixhq/cfix`) and can be dropped into any job that already checks out your code.

For detailed CLI options, scanner flags, and BYOK model configuration, refer to [Docker / Local CLI](/docs/docker-cli).

---

## How It Works

1. Your pipeline checks out the repository as it normally does.
2. Add the CoreFix scan step — it pulls the `corefixhq/cfix` Docker image, mounts the workspace, and runs the scanner.
3. Results are written to an output directory, pushed to the CoreFix dashboard, and optionally emailed.

You can add the CoreFix scan as a **standalone workflow file** or as a **step in an existing job**.

---

## Secrets & Permissions

Store sensitive values as **secrets** in your CI/CD platform. 

| Variable | Storage | Description |
|---|---|---|
| `X_CFIX_API_KEY` | **Secret** (required) | Your CoreFix API key |
| `GITHUB_TOKEN` | **Secret** | GitHub token for pushing SARIF to GitHub Code Scanning (see below) |
| `OPENAI_API_KEY` | **Secret** | Only if bringing your own AI model |

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

If you are not using GitHub Actions, or prefer a PAT, create one with **Code Scanning — Read and Write** access under the token's repository permissions. Store it as a secret in your CI/CD platform.


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
        run: |
          mkdir -p ${{ github.workspace }}/scan-results
          docker run --rm \
            -e X_CFIX_API_KEY=${{ secrets.X_CFIX_API_KEY }} \
            -e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
            -v ${{ github.workspace }}:/code \
            -v ${{ github.workspace }}/scan-results:/output \
            corefixhq/cfix:latest \
            --model gpt-4o-mini

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: corefix-scan-results
          path: scan-results/
```

== Add as Step

Add the following step to any existing job in your workflow after the `checkout` step:

```yaml
      - name: Run CoreFix Code Scanner
        run: |
          mkdir -p ${{ github.workspace }}/scan-results
          docker run --rm \
            -e X_CFIX_API_KEY=${{ secrets.X_CFIX_API_KEY }} \
            -e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
            -v ${{ github.workspace }}:/code \
            -v ${{ github.workspace }}/scan-results:/output \
            corefixhq/cfix:latest \
            --model gpt-4o-mini

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: corefix-scan-results
          path: scan-results/
```

Ensure your workflow has `permissions: security-events: write` if pushing SARIF to GitHub Code Scanning.

:::

---

## GitLab CI

Add variables in your project under **Settings → CI/CD → Variables**. Mark `X_CFIX_API_KEY` as **Masked** and **Protected**. See [GitLab CI/CD variables](https://docs.gitlab.com/ee/ci/variables/) for details.

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
    - mkdir -p scan-results
  script:
    - |
      docker run --rm \
        -e X_CFIX_API_KEY=$X_CFIX_API_KEY \
        -v $CI_PROJECT_DIR:/code \
        -v $CI_PROJECT_DIR/scan-results:/output \
        corefixhq/cfix:latest \
        --model gpt-4o-mini
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
    - mkdir -p scan-results
  script:
    - |
      docker run --rm \
        -e X_CFIX_API_KEY=$X_CFIX_API_KEY \
        -v $CI_PROJECT_DIR:/code \
        -v $CI_PROJECT_DIR/scan-results:/output \
        corefixhq/cfix:latest \
        --model gpt-4o-mini
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
                    string(credentialsId: 'corefix-api-key', variable: 'X_CFIX_API_KEY')
                ]) {
                    sh '''
                        mkdir -p scan-results
                        docker run --rm \
                          -e X_CFIX_API_KEY=${X_CFIX_API_KEY} \
                          -v ${WORKSPACE}:/code \
                          -v ${WORKSPACE}/scan-results:/output \
                          corefixhq/cfix:latest \
                          --model gpt-4o-mini
                    '''
                }
            }
            post {
                always {
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
                    string(credentialsId: 'corefix-api-key', variable: 'X_CFIX_API_KEY')
                ]) {
                    sh '''
                        mkdir -p scan-results
                        docker run --rm \
                          -e X_CFIX_API_KEY=${X_CFIX_API_KEY} \
                          -v ${WORKSPACE}:/code \
                          -v ${WORKSPACE}/scan-results:/output \
                          corefixhq/cfix:latest \
                          --model gpt-4o-mini
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'scan-results/**', allowEmptyArchive: true
                }
            }
        }
```

:::

---

## CircleCI

Add environment variables in your project under **Project Settings → Environment Variables**. See [CircleCI environment variables](https://circleci.com/docs/env-vars/) for details.

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
            mkdir -p scan-results
            docker run --rm \
              -e X_CFIX_API_KEY=$X_CFIX_API_KEY \
              -v $PWD:/code \
              -v $PWD/scan-results:/output \
              corefixhq/cfix:latest \
              --model gpt-4o-mini
      - store_artifacts:
          path: scan-results
          destination: corefix-scan-results

workflows:
  security:
    jobs:
      - corefix-code-scan
```

> Use the `machine` executor (not `docker`) so that Docker-in-Docker is available.

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
            mkdir -p scan-results
            docker run --rm \
              -e X_CFIX_API_KEY=$X_CFIX_API_KEY \
              -v $PWD:/code \
              -v $PWD/scan-results:/output \
              corefixhq/cfix:latest \
              --model gpt-4o-mini
      - store_artifacts:
          path: scan-results
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

Run specific scanners to keep pipeline time down, or run all for a full audit:

```bash
# All scanners (default — omit positional argument)
corefixhq/cfix:latest

# Dependencies only
corefixhq/cfix:latest osv

# Secrets detection + SAST
corefixhq/cfix:latest secrets,sast

# IaC + Kubernetes
corefixhq/cfix:latest iac,k8s

# Full scan, explicit
corefixhq/cfix:latest osv,iac,secrets,k8s,sast
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
- [Docker / Local CLI — Code Scanner Options](/docs/docker-cli#cli-options-—-code-scanner-corefixhq-cfix)
- [Container Scanning](/docs/code-agent-usage.md#container-scanning-with-container)

