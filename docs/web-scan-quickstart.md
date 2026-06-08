---
hide_title: true
sidebar_label: Web Scan in 2 Minutes
---

## Web Scan in 2 Minutes

Run your first web application vulnerability scan. No configuration, no credentials, no setup.

---

## Step 1 — Create a Web Scan Project

Click the link below to open the project creation drawer directly:

**→ [Create Web Scan Project](https://app.corefix.dev/projects?drawer=web)**

Enter a target URL and click **Create Project**. Everything else is optional.

**Example target for testing:**

```
http://demo.testfire.net/
```

Other intentionally vulnerable demo apps you can use:

```
http://zero.webappsecurity.com/
http://testasp.vulnweb.com
https://demo.owasp-juice.shop/#/
```

---

## Step 2 — Hit Run

Click the green **Run** icon on the project row. CoreFix launches all web scanners in parallel — OWASP ZAP, Nuclei, Nmap, testssl.sh, and SSLyze. Results are ready in a few minutes.

---

## Step 3 — View Results

Once complete, findings appear in your **CoreFix dashboard** under the project. An email notification with the HTML report link is also sent.

---

## What's Next

- [Web Scan Config Reference](/docs/web-scan-config-reference) — configure authenticated scans, API scanning, and coverage
- [Web Scanning CI/CD](/docs/cicd-web-scan) — add web scanning to your pipeline
- [Chrome Extension](/docs/chrome-extension-guide) — record network traffic for deep authenticated scans
