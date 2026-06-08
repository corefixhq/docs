---
hide_title: true
sidebar_label: Use Cases
---

# Use Cases

CoreFix fits into different workflows depending on your team size, security maturity, and where you are in the development lifecycle. Here's how teams use it.

---

## Shift-Left Security in CI/CD

**The problem:** Security scanning happens too late — after code is merged, after it's deployed, sometimes only during quarterly pentests.

**How CoreFix helps:** Drop the CoreFix Docker agent into your GitHub Actions, GitLab CI, Jenkins, or CircleCI pipeline. Every push and pull request triggers a full code scan. Vulnerabilities are caught before code is merged — not after it hits production.

**Setup time:** Under 5 minutes. One secret, one YAML file.

→ [Code Scan via GitHub Actions](/docs/cicd-github-actions)

---

## Continuous Web Application Security

**The problem:** Web application pentests happen quarterly at best. Between tests, new endpoints ship, configurations change, and vulnerabilities go undetected for months.

**How CoreFix helps:** Schedule automated web scans — daily, weekly, or on a custom cron — against your staging or production URL. CoreFix runs OWASP ZAP, Nuclei, Nmap, and SSL/TLS checks continuously. Findings are deduplicated and prioritized so your team isn't drowning in alerts.

**Setup time:** Under 2 minutes. Enter a URL, hit Run.

→ [Web Scan in 2 Minutes](/docs/web-scan-quickstart)

---

## GitHub-Native Code Scanning

**The problem:** You want code scanning on every PR but don't want to maintain CI/CD pipeline scripts or manage infrastructure.

**How CoreFix helps:** Install the CoreFix GitHub App with one click. Every pull request and push automatically triggers a full scan — SAST, secrets, dependencies, IaC, and Kubernetes checks. Results appear in your CoreFix dashboard. No pipeline configuration, no Docker, no CLI.

**Setup time:** One click.

→ [Connect GitHub for Code Scanning](/docs/github-integration)

---

## Pre-Push Local Scanning

**The problem:** You want to catch security issues before pushing to remote — especially secrets, hardcoded credentials, and dependency vulnerabilities.

**How CoreFix helps:** Pull the `corefixhq/cfix` Docker image and run it against your local repository. All five code scanners run in parallel. Your source code never leaves your machine — only findings are sent to the cloud for AI enrichment.

**Setup time:** One `docker run` command.

→ [Docker / Local CLI](/docs/docker-cli)

---

## API Security Testing

**The problem:** Your API has dozens of endpoints documented in an OpenAPI spec, but nobody is testing them for injection, authentication bypass, or misconfigurations.

**How CoreFix helps:** Point CoreFix at your OpenAPI/Swagger spec. The scanner imports every endpoint — including POST/PUT/DELETE with exact request body schemas — and runs vulnerability checks against all of them. No spider needed to discover endpoints.

**Setup time:** Drop your spec file in the scan directory and run.

→ [Web Scan Config Reference](/docs/web-scan-config-reference)

---

## Security Reports for Stakeholders

**The problem:** Management, auditors, or clients need a security report but don't have a CoreFix account and shouldn't need one.

**How CoreFix helps:** Every scan generates an HTML report with an executive brief, severity breakdown, attack chains, and compliance mapping. Share the password-protected project link with anyone — no account required. A time-limited public link is also sent via email for quick access.

→ [Managing Projects](/docs/managing-projects)

---

## Open Source Project Security

**The problem:** You maintain an open source project and want security scanning but don't have budget for commercial tools.

**How CoreFix helps:** CoreFix is free for open source — all scanners, AI enrichment, unlimited scans, no credit card. The SaaS model rotation pool handles AI processing at no cost. Push results to GitHub Code Scanning as SARIF for visibility directly in your repository's Security tab.

→ [Supported Models](/docs/models)

---

## Multi-Scanner Noise Reduction

**The problem:** Running multiple scanners generates hundreds of overlapping findings. The same SQL injection flagged by three tools shows up as three separate tickets. Triage takes hours.

**How CoreFix helps:** CoreFix runs all scanners in parallel and passes findings through an AI pipeline that deduplicates across tools, correlates related vulnerabilities into attack chains, and ranks everything by composite priority. Instead of 400 raw alerts, you see the 50 that matter — sorted by urgency.

→ [How It Works](/docs/how-it-works)

---

## Authenticated Scanning for Complex Apps

**The problem:** Your application uses SSO, OAuth, MFA, or custom login flows that break traditional scanners. Unauthenticated scans miss everything behind the login page.

**How CoreFix helps:** CoreFix supports three authentication modes — JSON API login, HTML form login, and headless browser login for complex flows. The browser mode handles JavaScript-driven forms, redirects, and multi-step auth automatically. For even simpler setup, pass a bearer token via CLI and skip the login flow entirely.

→ [Web Scan Config Reference](/docs/web-scan-config-reference)