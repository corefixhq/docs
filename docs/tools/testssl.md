---
sidebar_label: testssl.sh + SSLyze
---

# testssl.sh + SSLyze

## Tool Information

| Field | Details |
| --- | --- |
| Tools | testssl.sh and SSLyze |
| Category | SSL/TLS security and certificate analysis |
| testssl.sh source | [github.com/drwetter/testssl.sh](https://github.com/drwetter/testssl.sh) |
| SSLyze source | [github.com/nabla-c0d3/sslyze](https://github.com/nabla-c0d3/sslyze) |

CoreFix runs both scanners as one SSL/TLS pipeline. testssl.sh checks protocol vulnerabilities and compliance issues, while SSLyze provides certificate-chain and cipher-suite analysis. CoreFix merges and deduplicates their findings.

## What It Detects

- Deprecated SSL and TLS protocol versions
- Weak cipher suites and missing forward secrecy
- Certificate expiry, chain-of-trust, and hostname issues
- Known TLS vulnerabilities such as Heartbleed, POODLE, BEAST, ROBOT, SWEET32, and DROWN
- HSTS and HTTPS redirect configuration issues

## Running A Scan

Use the web scanner against an HTTPS endpoint:

```bash
docker run --rm \
  -e ORG_ID=YOUR_ORG_ID \
  -e X_CFIX_API_KEY=cfix_live_YOUR_API_KEY \
  -e X_CFIX_API_URL=https://api.corefix.dev \
  cfix-web:latest testssl \
  --target https://example.com
```

HTTPS targets also enable TLS checks automatically when the `web` scanner shorthand is used.

## Related Documentation

- [Docker / Local CLI](/docs/docker-cli)
- [Web Scanning](/docs/web-agent-usage)
- [Web CI/CD Integration](/docs/web-cicd-integration)
