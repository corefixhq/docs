---
hide_title: true
sidebar_label: Quick Start
---

## Overview

This quick start guide walks you through running your **first web application vulnerability scan in CoreFix**.

The example uses an **unauthenticated scan**, which is the fastest way to evaluate the platform because it does not require authentication scripts or credential configuration.

By the end of this guide, you will:

- Create a new web application scan
- Launch the vulnerability scan
- Monitor scan progress
- Review detected vulnerabilities

This example uses a public demo application for testing.

**Example target used in this guide:**

```
http://demo.testfire.net/
```

You may also use any of these intentionally vulnerable demo apps:

```
http://zero.webappsecurity.com/
http://testasp.vulnweb.com
http://testaspnet.vulnweb.com/
http://google-gruyere.appspot.com/
https://demo.owasp-juice.shop/#/
```

---

## Create Your First Web Scan

1. After signing in, go to **Projects**.
2. Click the **+ (Plus) icon** in the top toolbar beside the other icons.
3. Select **Website Scan** from the options.
4. Enter your **target URL** (e.g. `http://demo.testfire.net/`).
5. **Credentials are optional** — leave them blank to perform an unauthenticated scan.
6. **Chrome extension is optional** — this is only needed for network traffic recording to enable deep authenticated scans. You can skip this for now.
7. Select the **Application Type** that matches your target:
   - **SPA** — Single Page Application (React, Vue, Angular, etc.)
   - **HTML** — Traditional server-rendered application
   - **Complex Application** — Multi-page apps with heavy JavaScript or mixed rendering
8. Add a **Description** (optional).
9. Click **Create Project**.

---

## Run the Scan

Once your project is created, click the **Run** button on the project card.

CoreFix launches all web scanners simultaneously against your target. Results will be ready in a few minutes.

---

## What Gets Scanned

CoreFix runs the following open source scanners against your web application in parallel:

| Scanner | What It Finds |
|---|---|
| **OWASP ZAP** | OWASP Top 10 — SQL injection, XSS, SSRF, authentication bypass (DAST) |
| **Nuclei** | Known CVEs, exposed admin panels, default credentials, misconfigurations (8,000+ templates) |
| **Nmap** | Open ports, service versions, OS fingerprints, network attack surface |
| **testssl.sh** | TLS protocol support, cipher strength, certificate issues, Heartbleed, POODLE, BEAST |
| **SSLyze** | Certificate chain, key strength, cipher ordering, compliance |

All findings are passed through an AI enrichment layer that deduplicates, enriches, correlates across scanners, and prioritizes results before surfacing them to you.

---

## Viewing Results

Once the scan completes:

- Results are available directly in the **CoreFix dashboard** under your project.
- An **email notification** is sent with a link to the HTML report.
- The HTML report is publicly accessible for **1 hour** via a time-limited link.
- Your project's full results are available at a **password-protected project link** any time.
