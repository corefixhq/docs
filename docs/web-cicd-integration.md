# DeepTraq Web Scanner — CI/CD Integration

Add DAST (Dynamic Application Security Testing) to your pipeline with a single step. The scanner targets a live, deployed URL — so the step runs after your app is deployed, not during the build.

---

## How It Works in a Pipeline

1. Your pipeline deploys the app to a staging/test environment (as it normally does)
2. Add the DeepTraq web scan step — it points at the live URL and runs
3. Results are written to an output directory and optionally emailed

Store sensitive values as **secrets** in your CI/CD platform:
- `X_CFIX_API_KEY` → always a secret
- `USERNAME` / `PASSWORD` / `ACCESS_TOKEN` → always secrets
- `OPENAI_API_KEY` → secret if used
- `ORG_ID` → can be a plain variable

---

## GitHub Actions

### Setting Up Secrets

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Under **Secrets**, add:
   - `DEEPTRAQ_API_KEY` — your `X_CFIX_API_KEY`
   - `APP_USERNAME` — login username for authenticated scan (if needed)
   - `APP_PASSWORD` — login password for authenticated scan (if needed)
   - `APP_TOKEN` — bearer token if using token-based auth (if needed)
   - `OPENAI_API_KEY` — only if bringing your own model
3. Under **Variables**, add:
   - `ORG_ID` — your DeepTraq organization ID
   - `SCAN_TARGET` — the URL of your staging/test environment
   - `SCAN_REPORT_EMAILS` — comma-separated email addresses for reports

### Workflow — Scan After Deploy (All Scanners)

```yaml
# .github/workflows/deeptraq-web-scan.yml
name: DeepTraq Web Security Scan

on:
  push:
    branches: [main, master]
  workflow_run:
    workflows: ["Deploy to Staging"]
    types: [completed]

jobs:
  web-security-scan:
    runs-on: ubuntu-latest
    # Only run if deploy succeeded (when triggered by workflow_run)
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.event_name == 'push' }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run DeepTraq Web Scanner
        run: |
          mkdir -p ${{ github.workspace }}/scan-results
          docker run --rm \
            -e ORG_ID=${{ vars.ORG_ID }} \
            -e X_CFIX_API_KEY=${{ secrets.DEEPTRAQ_API_KEY }} \
            -v ${{ github.workspace }}:/web \
            -v ${{ github.workspace }}/scan-results:/output \
            deeptraq-web-scanner \
            --target ${{ vars.SCAN_TARGET }} \
            --emailids ${{ vars.SCAN_REPORT_EMAILS }}

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: deeptraq-web-scan-results
          path: scan-results/
```

### Workflow — Authenticated Scan with Credentials

```yaml
      - name: Run DeepTraq Web Scanner (authenticated)
        run: |
          mkdir -p ${{ github.workspace }}/scan-results
          docker run --rm \
            -e ORG_ID=${{ vars.ORG_ID }} \
            -e X_CFIX_API_KEY=${{ secrets.DEEPTRAQ_API_KEY }} \
            -v ${{ github.workspace }}:/web \
            -v ${{ github.workspace }}/scan-results:/output \
            deeptraq-web-scanner \
            --target ${{ vars.SCAN_TARGET }} \
            --username ${{ secrets.APP_USERNAME }} \
            --password ${{ secrets.APP_PASSWORD }} \
            --emailids ${{ vars.SCAN_REPORT_EMAILS }}
```

### Workflow — Scan with Bearer Token

```yaml
      - name: Run DeepTraq Web Scanner (token auth)
        run: |
          docker run --rm \
            -e ORG_ID=${{ vars.ORG_ID }} \
            -e X_CFIX_API_KEY=${{ secrets.DEEPTRAQ_API_KEY }} \
            -v ${{ github.workspace }}:/web \
            -v ${{ github.workspace }}/scan-results:/output \
            deeptraq-web-scanner \
            --target ${{ vars.SCAN_TARGET }} \
            --token ${{ secrets.APP_TOKEN }}
```

### Workflow — Specific Scanners + Custom Model

```yaml
      - name: Run DeepTraq DAST (vuln + web only)
        run: |
          docker run --rm \
            -e ORG_ID=${{ vars.ORG_ID }} \
            -e X_CFIX_API_KEY=${{ secrets.DEEPTRAQ_API_KEY }} \
            -v ${{ github.workspace }}:/web \
            -v ${{ github.workspace }}/scan-results:/output \
            deeptraq-web-scanner vuln,web \
            --target ${{ vars.SCAN_TARGET }} \
            --openai-api-key ${{ secrets.OPENAI_API_KEY }} \
            --model gpt-4o-mini
```

---

## GitLab CI

### Setting Up Variables

1. Go to your project → **Settings** → **CI/CD** → **Variables**
2. Add:
   - `DEEPTRAQ_API_KEY` — **Masked**, **Protected**
   - `APP_USERNAME` — **Masked**
   - `APP_PASSWORD` — **Masked**
   - `ORG_ID` — plain or masked
   - `SCAN_TARGET` — plain variable (e.g. `https://staging.example.com`)

### `.gitlab-ci.yml`

```yaml
stages:
  - deploy
  - security

# Your existing deploy job
deploy-staging:
  stage: deploy
  script:
    - echo "Deploy your app here"

deeptraq-web-scan:
  stage: security
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  needs: [deploy-staging]
  before_script:
    - mkdir -p scan-results
  script:
    - |
      docker run --rm \
        -e ORG_ID=$ORG_ID \
        -e X_CFIX_API_KEY=$DEEPTRAQ_API_KEY \
        -v $CI_PROJECT_DIR:/web \
        -v $CI_PROJECT_DIR/scan-results:/output \
        deeptraq-web-scanner \
        --target $SCAN_TARGET \
        --username $APP_USERNAME \
        --password $APP_PASSWORD \
        --emailids $SCAN_REPORT_EMAILS
  artifacts:
    when: always
    paths:
      - scan-results/
    expire_in: 7 days
```

> The `needs: [deploy-staging]` ensures the scan runs after your app is live.

---

## Jenkins

### Setting Up Credentials

1. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Add **Secret text** credentials:
   - ID: `deeptraq-api-key`
   - ID: `app-username`
   - ID: `app-password`
   - ID: `openai-api-key` (if using your own model)
3. Add plain environment variables in your job for `ORG_ID` and `SCAN_TARGET`

### Declarative Pipeline

```groovy
pipeline {
    agent any

    environment {
        ORG_ID       = 'b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx'
        SCAN_TARGET  = 'https://staging.example.com'
        SCAN_EMAILS  = 'security@example.com'
    }

    stages {
        stage('Deploy') {
            steps {
                echo 'Deploy your app here'
            }
        }

        stage('DeepTraq Web Scan') {
            steps {
                withCredentials([
                    string(credentialsId: 'deeptraq-api-key', variable: 'DEEPTRAQ_API_KEY'),
                    string(credentialsId: 'app-username',     variable: 'APP_USERNAME'),
                    string(credentialsId: 'app-password',     variable: 'APP_PASSWORD')
                ]) {
                    sh '''
                        mkdir -p scan-results
                        docker run --rm \
                          -e ORG_ID=${ORG_ID} \
                          -e X_CFIX_API_KEY=${DEEPTRAQ_API_KEY} \
                          -v ${WORKSPACE}:/web \
                          -v ${WORKSPACE}/scan-results:/output \
                          deeptraq-web-scanner \
                          --target ${SCAN_TARGET} \
                          --username ${APP_USERNAME} \
                          --password ${APP_PASSWORD} \
                          --emailids ${SCAN_EMAILS}
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

---

## CircleCI

### Setting Up Environment Variables

1. Go to your project → **Project Settings** → **Environment Variables**
2. Add:
   - `DEEPTRAQ_API_KEY`
   - `APP_USERNAME`, `APP_PASSWORD`
   - `ORG_ID`, `SCAN_TARGET`
   - `OPENAI_API_KEY` (if using your own model)

### `.circleci/config.yml`

```yaml
version: 2.1

jobs:
  deploy:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      - run:
          name: Deploy app
          command: echo "Deploy your app here"

  deeptraq-web-scan:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      - run:
          name: Run DeepTraq Web Scanner
          command: |
            mkdir -p scan-results
            docker run --rm \
              -e ORG_ID=$ORG_ID \
              -e X_CFIX_API_KEY=$DEEPTRAQ_API_KEY \
              -v $PWD:/web \
              -v $PWD/scan-results:/output \
              deeptraq-web-scanner \
              --target $SCAN_TARGET \
              --username $APP_USERNAME \
              --password $APP_PASSWORD \
              --emailids $SCAN_REPORT_EMAILS
      - store_artifacts:
          path: scan-results
          destination: deeptraq-web-scan-results

workflows:
  deploy-and-scan:
    jobs:
      - deploy
      - deeptraq-web-scan:
          requires:
            - deploy
```

> Use the `machine` executor so Docker is available. The `requires` key ensures the scan runs after deploy.

---

## Travis CI

### Setting Up Environment Variables

1. Go to your repository on Travis CI → **Settings** → **Environment Variables**
2. Add:
   - `DEEPTRAQ_API_KEY` — mark as **secret (not shown in log)**
   - `APP_USERNAME`, `APP_PASSWORD` — mark as secret
   - `ORG_ID`, `SCAN_TARGET` — can be non-secret

### `.travis.yml`

```yaml
services:
  - docker

env:
  global:
    - SCAN_TARGET=https://staging.example.com
    - ORG_ID=b7a526b4-f6xx-xxxx-xxxx-xxxxxxxxxxxx

before_script:
  - mkdir -p scan-results
  # Deploy your app first, then scan
  - echo "Deploy your app here"

script:
  - docker run --rm
      -e ORG_ID=$ORG_ID
      -e X_CFIX_API_KEY=$DEEPTRAQ_API_KEY
      -v $TRAVIS_BUILD_DIR:/web
      -v $TRAVIS_BUILD_DIR/scan-results:/output
      deeptraq-web-scanner
      --target $SCAN_TARGET
      --username $APP_USERNAME
      --password $APP_PASSWORD
      --emailids $SCAN_REPORT_EMAILS
```

---

## Azure DevOps Pipelines

### Setting Up Variables

1. Go to your pipeline → **Edit** → **Variables**
2. Add with **Keep this value secret** enabled:
   - `DEEPTRAQ_API_KEY`
   - `APP_USERNAME`, `APP_PASSWORD`
   - `OPENAI_API_KEY` (if using your own model)
3. Add plain variables:
   - `ORG_ID`, `SCAN_TARGET`, `SCAN_REPORT_EMAILS`

### `azure-pipelines.yml`

```yaml
trigger:
  branches:
    include:
      - main
      - master

pool:
  vmImage: ubuntu-latest

stages:
  - stage: Deploy
    jobs:
      - job: DeployApp
        steps:
          - script: echo "Deploy your app here"
            displayName: Deploy to staging

  - stage: SecurityScan
    dependsOn: Deploy
    jobs:
      - job: WebScan
        steps:
          - checkout: self

          - bash: mkdir -p $(Build.ArtifactStagingDirectory)/scan-results
            displayName: Create output directory

          - bash: |
              docker run --rm \
                -e ORG_ID=$(ORG_ID) \
                -e X_CFIX_API_KEY=$(DEEPTRAQ_API_KEY) \
                -v $(Build.SourcesDirectory):/web \
                -v $(Build.ArtifactStagingDirectory)/scan-results:/output \
                deeptraq-web-scanner \
                --target $(SCAN_TARGET) \
                --username $(APP_USERNAME) \
                --password $(APP_PASSWORD) \
                --emailids $(SCAN_REPORT_EMAILS)
            displayName: Run DeepTraq Web Scanner

          - task: PublishBuildArtifacts@1
            condition: always()
            inputs:
              pathToPublish: $(Build.ArtifactStagingDirectory)/scan-results
              artifactName: deeptraq-web-scan-results
```

> The `dependsOn: Deploy` ensures scanning only happens after your app is live.

---

## Bitbucket Pipelines

### Setting Up Repository Variables

1. Go to your repository → **Repository settings** → **Repository variables**
2. Add with **Secured** enabled:
   - `DEEPTRAQ_API_KEY`
   - `APP_USERNAME`, `APP_PASSWORD`
3. Add plain variables:
   - `ORG_ID`, `SCAN_TARGET`

### `bitbucket-pipelines.yml`

```yaml
pipelines:
  default:
    - step:
        name: Deploy App
        script:
          - echo "Deploy your app here"

    - step:
        name: DeepTraq Web Security Scan
        image: docker:24
        services:
          - docker
        script:
          - mkdir -p scan-results
          - |
            docker run --rm \
              -e ORG_ID=$ORG_ID \
              -e X_CFIX_API_KEY=$DEEPTRAQ_API_KEY \
              -v $BITBUCKET_CLONE_DIR:/web \
              -v $BITBUCKET_CLONE_DIR/scan-results:/output \
              deeptraq-web-scanner \
              --target $SCAN_TARGET \
              --username $APP_USERNAME \
              --password $APP_PASSWORD \
              --emailids $SCAN_REPORT_EMAILS
        artifacts:
          - scan-results/**
```

---

## Common Configuration Reference

| What | How to store | Suggested variable name |
|---|---|---|
| `X_CFIX_API_KEY` | **Secret / masked** | `DEEPTRAQ_API_KEY` |
| `ORG_ID` | Plain variable | `ORG_ID` |
| App login username | **Secret** | `APP_USERNAME` |
| App login password | **Secret** | `APP_PASSWORD` |
| Bearer / session token | **Secret** | `APP_TOKEN` |
| `--openai-api-key` value | **Secret / masked** | `OPENAI_API_KEY` |
| Target URL | Plain variable | `SCAN_TARGET` |
| Report recipients | Plain variable | `SCAN_REPORT_EMAILS` |
| `X_CFIX_API_URL` | Plain variable | `DEEPTRAQ_API_URL` |

---

## Choosing Scanners in a Pipeline

```bash
# All scanners (default — omit positional arg)
deeptraq-web-scanner --target https://example.com

# Port + vulnerability only (fast)
deeptraq-web-scanner nmap,vuln --target https://example.com

# Full DAST only (no port scan)
deeptraq-web-scanner web --target https://example.com

# SSL/TLS check only
deeptraq-web-scanner testssl --target https://example.com

# API fuzzing only
deeptraq-web-scanner fuzzer,zap-fuzzer --target https://api.example.com
```

---

## Remote Browser in CI/CD

If the scanner needs a browser (for authenticated scans or dynamic discovery), you have three options:

**Option 1 — Cloudflare browser (no browser install needed):**
```bash
deeptraq-web-scanner --target https://example.com --cf-browser
```

**Option 2 — Playwright server as a sidecar service (GitHub Actions / GitLab):**
```yaml
# In your CI step, start Playwright before the scan:
- run: npx playwright launch-server --port 9323 &
- run: |
    docker run --rm \
      --add-host=host.docker.internal:host-gateway \
      ... \
      deeptraq-web-scanner --target $TARGET --remote ws://host.docker.internal:9323
```

**Option 3 — Chrome sidecar:**
```yaml
- run: google-chrome --remote-debugging-port=9222 --headless --no-sandbox &
- run: |
    docker run --rm \
      --add-host=host.docker.internal:host-gateway \
      ... \
      deeptraq-web-scanner --target $TARGET --remote http://host.docker.internal:9222
```

---

## Bring Your Own Model

If you provide `--openai-api-key`, you must also specify `--model`. Otherwise DeepTraq uses its own SaaS model rotation with no extra configuration.

```bash
# Using your own key — model is required
deeptraq-web-scanner --target $TARGET \
  --openai-api-key $OPENAI_API_KEY \
  --model gpt-4o-mini

# No key — DeepTraq handles model selection automatically
deeptraq-web-scanner --target $TARGET
```

Supported models: `gpt-4o-mini`, `gpt-5.4-mini`, `minimax-2.5`, `glm-5.1`, `kimi-2.6`, `grok-4.3`
