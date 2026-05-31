---
sidebar_label: Dockle
---

# Dockle

## Tool Information

| Field | Details |
| --- | --- |
| Tool | Dockle |
| Category | Container image linting and CIS Docker Benchmark checks |
| License | Apache License 2.0 |
| Source Code | [github.com/goodwithtech/dockle](https://github.com/goodwithtech/dockle) |
| Availability | Coming soon |

Dockle checks Dockerfiles and built images for security misconfigurations before deployment. CoreFix will surface Dockle results alongside container vulnerability findings and generate Dockerfile remediation guidance.

## Planned Checks

- Containers running as `root`
- Credentials exposed through environment variables or image layers
- SUID and SGID binaries
- Package-manager caches left in production images
- Missing `HEALTHCHECK` instructions
- Docker image configuration that does not follow CIS benchmarks

## Planned Workflow

1. Trigger Dockle when a container image is built.
2. Evaluate the image against CIS Docker Benchmark checks and Dockle best practices.
3. Surface `FATAL`, `WARN`, and informational findings in the CoreFix dashboard.
4. Generate focused Dockerfile fixes for review.

## Related Documentation

- [Security Tools](/docs/tools)
- [Docker / Local CLI](/docs/docker-cli)
- [Open Source Acknowledgements](/docs/acknowledgements)
