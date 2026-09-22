---
hide_title: true
sidebar_label: Container Scanning
---

## Container Scanning

Scan container images for vulnerabilities and Dockerfile CIS benchmark issues, using the `container` scanner in `corefix code`.

---

## Quick Start

```bash
corefix code container --container nginx,redis:v6.2.0,postgres:latest
```

::: tip Docker Socket Is Mounted for You
When `--container` is used, `corefix` mounts the host Docker socket automatically. This lets the scanner talk to your local Docker daemon to pull/inspect images directly, so it can scan them without needing any credentials to your container registry.
:::

---

## `--container` (optional)

```
--container <names>
  Specify container names for scanning, as a comma-separated list.
  Mounts the host Docker socket so the scanner can read local images.
  Type: string
```

Example — comma-separated image names:

```
nginx,redis:v6.2.0,postgres:latest
```

If `--container` is not passed, no container scan is performed — the `container` scanner has nothing to scan and does nothing, even though it's included in the default scanner list (`osv,iac,secrets,k8s,sast,sonar,container,ai,malware`). There's no automatic fallback to images on the host.

You can also opt an image into scanning without `--container` by tagging it `cfix` — every image with a `cfix` tag is picked up automatically:

```bash
docker tag <YOUR-CONTAINER>:latest cfix

corefix code container
```

---

## What It Finds

| Check | Description |
|---|---|
| Image vulnerabilities | Known CVEs in OS packages and application dependencies inside the image |
| Dockerfile CIS benchmarking | Misconfigurations against CIS Docker Benchmark rules |

---

## Automatic Container SBOM

If any images are passed via `--container`, or tagged `cfix`, a container SBOM is generated automatically for each of those images, alongside the automatic source-code SBOM generated on your main branch. See [Automatic SBOM Generation](./code-agent-usage#automatic-sbom-generation).

---

## Examples

### Scan specific images

```bash
corefix code container --container nginx,redis:v6.2.0,postgres:latest
```

### Scan alongside other scanners

```bash
corefix code sast,secrets,container --container nginx,redis:v6.2.0,postgres:latest
```

### Scan images tagged `cfix`

```bash
# Tag the images you want scanned
docker tag myapp:latest cfix
docker tag myapp-worker:latest cfix

# Run the container scanner — no --container flag needed,
# every image tagged "cfix" is picked up automatically
corefix code container
```

---

## CI/CD: Scan a Container After Build

Build your image first, then scan it with `--container` before pushing — the scanner reads the image directly off the runner's Docker daemon, so no registry credentials are needed.

```yaml
name: Build and Scan Container

on:
  push:
    branches: [main]

jobs:
  build-and-scan:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .

      - name: Scan container with CoreFix
        run: |
          export CFIX_API_KEY=${{ secrets.CFIX_API_KEY }}
          curl -fsSL https://get.corefix.dev/corefix | sudo sh
          corefix code container --container myapp:${{ github.sha }}

      - name: Push image
        if: success()
        run: docker push myapp:${{ github.sha }}
```

The scan step runs after `docker build`, so `myapp:${{ github.sha }}` exists locally on the runner for `corefix` to read via the Docker socket. Gate the push step on the scan step's success, as shown above, to stop a vulnerable image from being published.

See [Code Scanning CI/CD Integration](./cicd-integration) for secrets setup and the rest of the pipeline.

---

## Related

- [Code Scanner — Standalone Usage](./code-agent-usage)
- [CoreFix CLI — Overview](./docker-cli)
- [Code Scanning CI/CD Integration](./cicd-integration)
