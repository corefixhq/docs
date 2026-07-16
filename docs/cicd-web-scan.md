---
hide_title: true
sidebar_label: Web Scan — CI/CD
---

## Web Scanning — CI/CD Integration

Add CoreFix DAST (Dynamic Application Security Testing) to your pipeline with a single step. The web scanner runs as a Docker container (`corefixhq/cfix-web`) and targets a live, deployed URL — so the step runs **after** your app is deployed, not during the build.

::: warning Limitation
Token-based authentication for CI/CD web scans is reserved for upcoming API scanning and complex web applications. The planned behavior is for CoreFix to ask ZAP to inject the provided token into every request, bypassing username/password credentials. This is under development and not currently available, so `--token` and `TOKEN` have no effect today.
:::

For detailed CLI options and BYOK model configuration, refer to [Docker / Local CLI](/docs/docker-cli).

For advanced scan configuration (authentication, coverage), refer to [Web Scan Config Reference](./web-scan-config-reference.md).

---

## How It Works

1. Your pipeline deploys the app to a staging or test environment as it normally does.
2. Add the CoreFix web scan step — it pulls the `corefixhq/cfix-web` Docker image, points it at the live URL, and runs.
3. Results are written to an output directory, pushed to the CoreFix dashboard, and optionally emailed.

You can add the CoreFix scan as a **standalone workflow file** or as a **step in an existing job** after the deploy stage.

---

## Authentication Options

Choose the appropriate approach based on your application's auth mechanism. Pass credentials via CI/CD secrets.

| Scenario | Flags |
|---|---|
| **Unauthenticated scan** | Omit `--username`, `--password`, and `--token` |
| **Username + Password** | `--username $USERNAME --password $PASSWORD` |
| **Bearer token / Cookie** | Planned for API scanning and complex web app auth. `--token $TOKEN` currently has no effect |

For bearer token or session cookie workflows, CoreFix will support token injection in a future release. Today, the scanner does not bypass the credential login flow with `--token`.

> **Tip:** The pipeline examples below include `--username` and `--password` for reference. Remove them for unauthenticated scans. Token-based auth is under development, so `--token` currently has no effect.


---

## Browser — Zero Configuration

The web scanner automatically handles browser setup with no extra flags:

1. If a Chromium instance is running on `localhost:9222`, the scanner connects to it automatically.
2. If no local browser is detected, the scanner falls back to a **Cloudflare managed browser** — no installation needed.

This means your pipeline works out of the box without installing Chromium. However, if you prefer to use a local browser for performance or network reasons, install Chromium on the runner and launch it before the scan step:

```bash
# Install Chromium (Ubuntu)
sudo apt update
sudo apt install -y \
  chromium-browser \
  ca-certificates \
  fonts-liberation \
  libasound2t64 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libu2f-udev \
  libvulkan1 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxkbcommon0 \
  libxrandr2 \
  wget \
  xdg-utils

# Launch in headless mode
chromium-browser --remote-debugging-port=9222 --remote-debugging-address=0.0.0.0 --headless --no-sandbox &
```

The scanner will detect it automatically on the next run.

---

## Secrets & Permissions

Store sensitive values as **secrets** in your CI/CD platform. `SCAN_TARGET` can be a plain variable.

| Variable | Storage | Description |
|---|---|---|
| `X_CFIX_API_KEY` | **Secret** (required) | Your CoreFix API key |
| `GITHUB_TOKEN` | **Secret** | GitHub token for pushing SARIF to GitHub Code Scanning (see below) |
| `USERNAME` | **Secret** | Login username for authenticated scans |
| `PASSWORD` | **Secret** | Login password for authenticated scans |
| `TOKEN` | **Secret** | Reserved for planned API scanning and complex web app token injection. Currently has no effect |
| `OPENAI_API_KEY` | **Secret** | Only if bringing your own AI model |
| `SCAN_TARGET` | Plain variable | Target URL of your staging/test environment |

> API scanning and token injection are documented as planned behavior. Until they are available, use `USERNAME` / `PASSWORD` for authenticated web scans and do not rely on `TOKEN`.

### GitHub SARIF Upload (replace the current GitHub Token section)

> **Pushing results to GitHub Code Scanning:** Web scan findings can be pushed as SARIF to a relevant source code repository. When run in a pipeline where the code is checked out, results are pushed to the same repository's GitHub Code Scanning tab. Refer to [Code Scanning — CI/CD Integration](./cicd-integration#github-token-for-sarif-upload) for details on configuring SARIF uploads and GitHub token permissions.


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

Create `.github/workflows/corefix-web-scan.yml`:

```yaml
name: CoreFix Web Security Scan

on:
  push:
    branches: [main, master]
  workflow_run:
    workflows: ["Deploy to Staging"]
    types: [completed]

permissions:
  contents: write
  packages: write
  security-events: write

jobs:
  web-security-scan:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' || github.event_name == 'push' }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run CoreFix Web Scanner
        run: |
          mkdir -p ${{ github.workspace }}/scan-results
          docker run --rm \
            --network host \
            -e X_CFIX_API_KEY=${{ secrets.X_CFIX_API_KEY }} \
            -e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
            -v ${{ github.workspace }}:/web \
            -v ${{ github.workspace }}/scan-results:/output \
            corefixhq/cfix-web:latest web \
            --target ${{ vars.SCAN_TARGET }} \
            --username ${{ secrets.USERNAME }} \
            --password ${{ secrets.PASSWORD }} \
            --model gpt-4o-mini

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: corefix-web-scan-results
          path: scan-results/
```

> Remove `--username` and `--password` for unauthenticated scans. Token-based auth is under development, so <code v-pre>--token ${{ secrets.TOKEN }}</code> currently has no effect.

== Add as Step

Add the following steps to an existing job, after your deploy step:

```yaml
      - name: Run CoreFix Web Scanner
        run: |
          mkdir -p ${{ github.workspace }}/scan-results
          docker run --rm \
            --network host \
            -e X_CFIX_API_KEY=${{ secrets.X_CFIX_API_KEY }} \
            -e GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }} \
            -v ${{ github.workspace }}:/web \
            -v ${{ github.workspace }}/scan-results:/output \
            corefixhq/cfix-web:latest web \
            --target ${{ vars.SCAN_TARGET }} \
            --model gpt-4o-mini

      - name: Upload scan results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: corefix-web-scan-results
          path: scan-results/
```

Ensure the web scan step runs **after** your application is deployed and accessible at the target URL.

:::

---

## GitLab CI

Add variables in your project under **Settings → CI/CD → Variables**. Mark `X_CFIX_API_KEY`, `USERNAME`, `PASSWORD`, and `TOKEN` as **Masked** and **Protected**. See [GitLab CI/CD variables](https://docs.gitlab.com/ee/ci/variables/) for details.

:::tabs
== Standalone Pipeline File

Create or add to `.gitlab-ci.yml`:

```yaml
stages:
  - deploy
  - security

deploy-staging:
  stage: deploy
  script:
    - echo "Deploy your app here"

corefix-web-scan:
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
        -e X_CFIX_API_KEY=$X_CFIX_API_KEY \
        -v $CI_PROJECT_DIR:/web \
        -v $CI_PROJECT_DIR/scan-results:/output \
        corefixhq/cfix-web:latest web \
        --target $SCAN_TARGET \
        --username $USERNAME \
        --password $PASSWORD \
        --model gpt-4o-mini
  artifacts:
    when: always
    paths:
      - scan-results/
    expire_in: 7 days
```

> The `needs: [deploy-staging]` ensures the scan runs only after your app is live.

== Add as Stage

Add the `security` stage and the `corefix-web-scan` job to your existing pipeline:

```yaml
stages:
  - build
  - test
  - deploy
  - security  # Add this stage

# Your existing build, test, and deploy jobs above...

corefix-web-scan:
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
        -e X_CFIX_API_KEY=$X_CFIX_API_KEY \
        -v $CI_PROJECT_DIR:/web \
        -v $CI_PROJECT_DIR/scan-results:/output \
        corefixhq/cfix-web:latest web \
        --target $SCAN_TARGET \
        --username $USERNAME \
        --password $PASSWORD \
        --model gpt-4o-mini
  artifacts:
    when: always
    paths:
      - scan-results/
    expire_in: 7 days
```

Replace `deploy-staging` in `needs` with the name of your actual deploy job.

:::

---

## Jenkins

Add credentials in **Manage Jenkins → Credentials → System → Global credentials** as **Secret text** entries. See [Jenkins credentials](https://www.jenkins.io/doc/book/using/using-credentials/) for details.

:::tabs
== Standalone Jenkinsfile

Create a `Jenkinsfile` for a dedicated web security scan pipeline:

```groovy
pipeline {
    agent any

    environment {
        SCAN_TARGET = 'https://staging.example.com'
    }

    stages {
        stage('Deploy') {
            steps {
                echo 'Deploy your app here'
            }
        }

        stage('CoreFix Web Scan') {
            steps {
                withCredentials([
                    string(credentialsId: 'corefix-api-key', variable: 'X_CFIX_API_KEY'),
                    string(credentialsId: 'app-username',    variable: 'USERNAME'),
                    string(credentialsId: 'app-password',    variable: 'PASSWORD')
                ]) {
                    sh '''
                        mkdir -p scan-results
                        docker run --rm \
                          --network host \
                          -e X_CFIX_API_KEY=${X_CFIX_API_KEY} \
                          -v ${WORKSPACE}:/web \
                          -v ${WORKSPACE}/scan-results:/output \
                          corefixhq/cfix-web:latest web \
                          --target ${SCAN_TARGET} \
                          --username ${USERNAME} \
                          --password ${PASSWORD} \
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

Add the following stage to your existing `Jenkinsfile` after the deploy stage:

```groovy
        stage('CoreFix Web Scan') {
            steps {
                withCredentials([
                    string(credentialsId: 'corefix-api-key', variable: 'X_CFIX_API_KEY'),
                    string(credentialsId: 'app-username',    variable: 'USERNAME'),
                    string(credentialsId: 'app-password',    variable: 'PASSWORD')
                ]) {
                    sh '''
                        mkdir -p scan-results
                        docker run --rm \
                          --network host \
                          -e X_CFIX_API_KEY=${X_CFIX_API_KEY} \
                          -v ${WORKSPACE}:/web \
                          -v ${WORKSPACE}/scan-results:/output \
                          corefixhq/cfix-web:latest web \
                          --target ${SCAN_TARGET} \
                          --username ${USERNAME} \
                          --password ${PASSWORD} \
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

Ensure `SCAN_TARGET` is set in your pipeline's `environment` block. Token-based auth is planned for future API and complex web app scans, but `--token` currently has no effect.

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
  deploy:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      - run:
          name: Deploy app
          command: echo "Deploy your app here"

  corefix-web-scan:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      - run:
          name: Run CoreFix Web Scanner
          command: |
            mkdir -p scan-results
            docker run --rm \
              --network host \
              -e X_CFIX_API_KEY=$X_CFIX_API_KEY \
              -v $PWD:/web \
              -v $PWD/scan-results:/output \
              corefixhq/cfix-web:latest web \
              --target $SCAN_TARGET \
              --username $USERNAME \
              --password $PASSWORD \
              --model gpt-4o-mini
      - store_artifacts:
          path: scan-results
          destination: corefix-web-scan-results

workflows:
  deploy-and-scan:
    jobs:
      - deploy
      - corefix-web-scan:
          requires:
            - deploy
```

> Use the `machine` executor so Docker is available. The `requires` key ensures the scan runs after deploy.

== Add as Job

Add the following job and workflow entry to your existing `.circleci/config.yml`:

```yaml
jobs:
  # Your existing jobs above...

  corefix-web-scan:
    machine:
      image: ubuntu-2204:current
    steps:
      - checkout
      - run:
          name: Run CoreFix Web Scanner
          command: |
            mkdir -p scan-results
            docker run --rm \
              --network host \
              -e X_CFIX_API_KEY=$X_CFIX_API_KEY \
              -v $PWD:/web \
              -v $PWD/scan-results:/output \
              corefixhq/cfix-web:latest web \
              --target $SCAN_TARGET \
              --username $USERNAME \
              --password $PASSWORD \
              --model gpt-4o-mini
      - store_artifacts:
          path: scan-results
          destination: corefix-web-scan-results

workflows:
  build-deploy-scan:
    jobs:
      - build
      - deploy:
          requires:
            - build
      - corefix-web-scan:
          requires:
            - deploy
```

:::

---

See [Web Scan Config Reference](./web-scan-config-reference) for detailed coverage behavior including Nuclei template categories.

---

## Coming Soon

Support for the following platforms is in progress:

- **Travis CI**
- **Bitbucket Pipelines**
- **Azure DevOps Pipelines**

## Related

- [Chrome Extension Guide](./chrome-extension-guide)
- [Web Scanner CLI Options](/docs/web-agent-usage.md#cli-options)
- [Scan Coverage Options](/docs/web-agent-usage.md#coverage-optional)
- [Scanner Profiles](/docs/web-agent-usage.md#scanner-profiles)
- [Docker / Local CLI — Web Scanner Options](/docs/docker-cli#cli-options-—-web-scanner-corefixhq-cfix-web)
