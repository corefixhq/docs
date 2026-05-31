# CoreFix Scanner — CI/CD Integration

Add CoreFix security scanning to your existing pipeline with a single step. The scanner runs as a Docker container and can be dropped into any job that already checks out your code.

---

## How It Works in a Pipeline

1. Your pipeline checks out the repository (as it normally does)
2. Add the CoreFix scan step — it mounts the workspace and runs the scanner
3. Results are written to an output directory and optionally emailed

Store sensitive values as **secrets** in your CI/CD platform. `ORG_ID` can be a plain environment variable. `X_CFIX_API_KEY` must always be a secret.

---

## GitHub Actions

### Setting Up Secrets

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add:
   - `DEEPTRAQ_API_KEY` — your `X_CFIX_API_KEY` value
   - `OPENAI_API_KEY` — only if you bring your own model key
3. Add a plain variable (not a secret) for `ORG_ID` under **Variables** tab, or store it as a secret too

### Workflow — Scan on Every Push and PR

```yaml
# .github/workflows/deeptraq-scan.yml
name: CoreFix Security Scan

on:
  push:
    branches: [main, master]
  pull_request:

jobs:
  security-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run CoreFix Scanner
        run: |
          mkdir -p ${{ github.workspace }}/scan-results
          docker run --rm \
            -e ORG_ID=${{ vars.ORG_ID }} \
            -e X_CFIX_API_KEY=${{ secrets.DEEPTRAQ_API_KEY }} \
            -v ${{ github.workspace }}:/code \
            -v ${{ github.workspace }}/scan-results:/output \
            deeptraq-scanner \
            --emailids ${{ vars.SCAN_REPORT_EMAILS }}

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: deeptraq-scan-results
          path: scan-results/
```

### Workflow — Scan Specific Scanners Only

```yaml
      - name: Run secrets and SAST scan
        run: |
          docker run --rm \
            -e ORG_ID=${{ vars.ORG_ID }} \
            -e X_CFIX_API_KEY=${{ secrets.DEEPTRAQ_API_KEY }} \
            -v ${{ github.workspace }}:/code \
            -v ${{ github.workspace }}/scan-results:/output \
            deeptraq-scanner secrets,sast
```

### Workflow — Bring Your Own AI Model

```yaml
      - name: Run CoreFix Scanner with custom model
        run: |
          docker run --rm \
            -e ORG_ID=${{ vars.ORG_ID }} \
            -e X_CFIX_API_KEY=${{ secrets.DEEPTRAQ_API_KEY }} \
            -v ${{ github.workspace }}:/code \
            -v ${{ github.workspace }}/scan-results:/output \
            deeptraq-scanner \
            --openai-api-key ${{ secrets.OPENAI_API_KEY }} \
            --model gpt-4o-mini
```

---

## GitLab CI

### Setting Up Variables

1. Go to your project → **Settings** → **CI/CD** → **Variables**
2. Add the following:
   - `DEEPTRAQ_API_KEY` — set as **Masked** and **Protected**
   - `ORG_ID` — can be plain or masked
   - `OPENAI_API_KEY` — masked, only if using your own model

### `.gitlab-ci.yml`

```yaml
stages:
  - test
  - security

deeptraq-scan:
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
        -e ORG_ID=$ORG_ID \
        -e X_CFIX_API_KEY=$DEEPTRAQ_API_KEY \
        -v $CI_PROJECT_DIR:/code \
        -v $CI_PROJECT_DIR/scan-results:/output \
        deeptraq-scanner \
        --emailids $SCAN_REPORT_EMAILS
  artifacts:
    when: always
    paths:
      - scan-results/
    expire_in: 7 days
```

> Drop the `deeptraq-scan` job into your existing pipeline's stages. It does not need to be a separate pipeline.

---

## Jenkins

### Setting Up Credentials

1. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Add a **Secret text** credential:
   - ID: `deeptraq-api-key` for `X_CFIX_API_KEY`
   - ID: `openai-api-key` if using your own model
3. Add a plain environment variable for `ORG_ID` in your job or pipeline configuration

### Declarative Pipeline

```groovy
pipeline {
    agent any

    environment {
        ORG_ID = 'b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx'
        SCAN_EMAIL = 'security@example.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('CoreFix Security Scan') {
            steps {
                withCredentials([string(credentialsId: 'deeptraq-api-key', variable: 'DEEPTRAQ_API_KEY')]) {
                    sh '''
                        mkdir -p scan-results
                        docker run --rm \
                          -e ORG_ID=${ORG_ID} \
                          -e X_CFIX_API_KEY=${DEEPTRAQ_API_KEY} \
                          -v ${WORKSPACE}:/code \
                          -v ${WORKSPACE}/scan-results:/output \
                          deeptraq-scanner \
                          --emailids ${SCAN_EMAIL}
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

> Add the `CoreFix Security Scan` stage to your existing `Jenkinsfile` pipeline.

---

## CircleCI

### Setting Up Environment Variables

1. Go to your project → **Project Settings** → **Environment Variables**
2. Add:
   - `DEEPTRAQ_API_KEY` — your `X_CFIX_API_KEY`
   - `ORG_ID` — your organization ID
   - `OPENAI_API_KEY` — only if using your own model

### `.circleci/config.yml`

```yaml
version: 2.1

jobs:
  deeptraq-scan:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      - run:
          name: Run CoreFix Security Scanner
          command: |
            mkdir -p scan-results
            docker run --rm \
              -e ORG_ID=$ORG_ID \
              -e X_CFIX_API_KEY=$DEEPTRAQ_API_KEY \
              -v $PWD:/code \
              -v $PWD/scan-results:/output \
              deeptraq-scanner \
              --emailids $SCAN_REPORT_EMAILS
      - store_artifacts:
          path: scan-results
          destination: deeptraq-scan-results

workflows:
  security:
    jobs:
      - deeptraq-scan
```

> Use the `machine` executor (not `docker`) so that Docker-in-Docker is available.

---

## Travis CI

### Setting Up Environment Variables

1. Go to your repository on Travis CI → **Settings** → **Environment Variables**
2. Add:
   - `DEEPTRAQ_API_KEY` — mark as **secret (not shown in log)**
   - `ORG_ID` — can be non-secret
   - `OPENAI_API_KEY` — secret, only if using your own model

### `.travis.yml`

```yaml
services:
  - docker

before_script:
  - mkdir -p scan-results

script:
  - docker run --rm
      -e ORG_ID=$ORG_ID
      -e X_CFIX_API_KEY=$DEEPTRAQ_API_KEY
      -v $TRAVIS_BUILD_DIR:/code
      -v $TRAVIS_BUILD_DIR/scan-results:/output
      deeptraq-scanner
      --emailids $SCAN_REPORT_EMAILS
```

> Add the `deeptraq-scanner` `docker run` call to your existing `script` block.

---

## Azure DevOps Pipelines

### Setting Up Variables

1. Go to your pipeline → **Edit** → **Variables**
2. Add:
   - `DEEPTRAQ_API_KEY` — enable **Keep this value secret**
   - `ORG_ID` — plain variable
   - `OPENAI_API_KEY` — secret, only if using your own model

### `azure-pipelines.yml`

```yaml
trigger:
  branches:
    include:
      - main
      - master

pool:
  vmImage: ubuntu-latest

steps:
  - checkout: self

  - bash: mkdir -p $(Build.ArtifactStagingDirectory)/scan-results
    displayName: Create output directory

  - bash: |
      docker run --rm \
        -e ORG_ID=$(ORG_ID) \
        -e X_CFIX_API_KEY=$(DEEPTRAQ_API_KEY) \
        -v $(Build.SourcesDirectory):/code \
        -v $(Build.ArtifactStagingDirectory)/scan-results:/output \
        deeptraq-scanner \
        --emailids $(SCAN_REPORT_EMAILS)
    displayName: Run CoreFix Security Scanner

  - task: PublishBuildArtifacts@1
    condition: always()
    inputs:
      pathToPublish: $(Build.ArtifactStagingDirectory)/scan-results
      artifactName: deeptraq-scan-results
```

> Paste the three steps above into your existing `azure-pipelines.yml` under `steps:`.

---

## Bitbucket Pipelines

### Setting Up Repository Variables

1. Go to your repository → **Repository settings** → **Repository variables**
2. Add:
   - `DEEPTRAQ_API_KEY` — enable **Secured**
   - `ORG_ID` — plain variable
   - `OPENAI_API_KEY` — secured, only if using your own model

### `bitbucket-pipelines.yml`

```yaml
pipelines:
  default:
    - step:
        name: CoreFix Security Scan
        image: docker:24
        services:
          - docker
        script:
          - mkdir -p scan-results
          - |
            docker run --rm \
              -e ORG_ID=$ORG_ID \
              -e X_CFIX_API_KEY=$DEEPTRAQ_API_KEY \
              -v $BITBUCKET_CLONE_DIR:/code \
              -v $BITBUCKET_CLONE_DIR/scan-results:/output \
              deeptraq-scanner \
              --emailids $SCAN_REPORT_EMAILS
        artifacts:
          - scan-results/**
```

> Add this step to your existing pipeline definition. The `docker` service enables Docker-in-Docker.

---

## Common Configuration Reference

Regardless of CI/CD platform, these are the values you configure:

| What | How to store | Variable name suggestion |
|---|---|---|
| `X_CFIX_API_KEY` | **Secret / masked** | `DEEPTRAQ_API_KEY` |
| `ORG_ID` | Plain variable or secret | `ORG_ID` |
| `X_CFIX_API_URL` | Plain variable | `DEEPTRAQ_API_URL` |
| `--openai-api-key` value | **Secret / masked** | `OPENAI_API_KEY` |
| `--emailids` value | Plain variable | `SCAN_REPORT_EMAILS` |

---

## Choosing Scanners in a Pipeline

Run specific scanners to keep pipeline time down, or run all for a full audit:

```bash
# All scanners (default — omit positional arg)
deeptraq-scanner

# Dependencies only
deeptraq-scanner osv

# Secrets detection + SAST
deeptraq-scanner secrets,sast

# IaC + Kubernetes
deeptraq-scanner iac,k8s

# Full scan, explicit
deeptraq-scanner osv,iac,secrets,k8s,sast
```

---

## Bring Your Own Model

If you provide your own API key, you must also specify the model. Otherwise CoreFix uses its own SaaS model rotation at no extra configuration.

```bash
# Using your own key — model is required
docker run --rm ... deeptraq-scanner \
  --openai-api-key $OPENAI_API_KEY \
  --model gpt-4o-mini

# No key provided — CoreFix handles model selection automatically
docker run --rm ... deeptraq-scanner
```

Supported models when using your own key: `gpt-4o-mini`, `gpt-5.4-mini`, `minimax-2.5`, `glm-5.1`, `kimi-2.6`, `grok-4.3`
