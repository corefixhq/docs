# Privacy Policy

**Effective Date:** June 02, 2026
**Last Updated:** June 02, 2026

This Privacy Policy describes how CoreFix ("we," "us," or "our") collects, uses, stores, and protects your personal information when you use the CoreFix platform, including corefix.dev, app.corefix.dev, docs.corefix.dev, CLI tools, browser extensions, and related services (the "Service").

**Principal Office:** 503, Capital Park, Capital Pk Rd, Cyber Hills Colony, VIP Hills, Silicon Valley, Madhapur, Hyderabad, Telangana 500081, India.

---

## 1. Information We Collect

### 1.1 Account Information

When you create an account, we collect:

- **Email address** (required) — used for authentication, OTP delivery, and notifications
- **Full name** (optional) — collected only if you update your profile
- **Country and general location** — derived during signup for regional settings

We do **not** collect or store IP addresses.

If you sign up via an OAuth provider (GitHub or Google), we receive your email address and display name from the provider. We do not receive or store your OAuth provider password.

### 1.2 Authentication Data

We do not store passwords. Authentication is handled via one-time passwords (OTP) sent to your email, activation links, or OAuth delegation (GitHub, Google). During OAuth flows (GitHub App installation, Google sign-in), temporary authentication state may be stored in cookies.

### 1.3 Repository and Scan Data

When you connect a repository and run a scan, we process the following:

- **Repository metadata** — repository name, branch, commit hash, build identifiers
- **Git metadata** — which may include committer email addresses and committer names from git log history
- **Scan findings** — vulnerability details, severity, file paths, line numbers, code snippets (typically 5-20 lines of context around the vulnerable line), CWE identifiers, and scanner attribution. Findings are linked directly to the relevant line numbers in your repository.
- **AI enrichment results** — risk scores, prioritization, deduplication decisions, and remediation suggestions

For **cloud-hosted (SaaS) scans**, your source code is cloned into an isolated container spun up exclusively for your scan. Once the scan completes and findings are extracted, the container is destroyed completely — no source code is retained in our infrastructure. Only the resulting findings, code snippets, and line number references are stored. Your full source code is never pushed to or persisted in our storage.

For **self-hosted scans** using the CoreFix Docker agent, your source code never leaves your environment. Only scan findings are transmitted to CoreFix.

### 1.4 Web Application Scan Data

When you run a web application scan, we process:

- **Target URL and configuration** — the URL, authentication credentials, session tokens, or HAR files you provide for the scan
- **Scan results** — vulnerabilities found, endpoints tested, response data relevant to the findings

Credentials and authentication tokens you provide for authenticated web scans are **stored encrypted** for the duration of the project's lifecycle, as they may be needed for periodic or recurring scans. Credentials are decrypted only at the time of scan submission and execution. They are permanently deleted when you delete the project or your account. We do not access, view, or use stored credentials for any purpose other than executing scans you initiate.

### 1.5 Report Sharing Data

You may share scan reports with other users by entering their email addresses. These recipients do not need a CoreFix account. A system-generated password (format: XXXX-XXXX-XXXX, 12 characters) is created for each shared report to control access. The recipient's email address is stored for the purpose of delivering and controlling access to the shared report.

### 1.6 Analytics Data

We use **PostHog** for product analytics on corefix.dev and app.corefix.dev. PostHog collects anonymized usage data such as page views, feature usage, and interaction patterns to help us improve the product. We do not use PostHog for advertising or sell analytics data to third parties. You can learn more about PostHog's privacy practices at [posthog.com/privacy](https://posthog.com/privacy).

### 1.7 Usage and Billing Data

We track scan execution metadata including runtime duration, token usage, model selection, and credit consumption for billing and platform monitoring purposes.

## 2. How We Use Your Information

We use the information we collect to:

- Provide, operate, and maintain the Service
- Authenticate your identity and manage your account
- Execute security scans and deliver findings
- Generate AI-enriched reports and remediation suggestions
- Process billing and track credit usage
- Send transactional emails (OTP, scan results, notifications)
- Improve the Service through anonymized analytics
- Respond to support requests and inquiries
- Comply with legal obligations

We do **not** use your information for:

- Advertising or ad targeting
- Selling to third parties
- Training AI or machine learning models (see our [AI Usage Policy](/docs/ai-usage-policy))

## 3. Cookies and Local Storage

We use cookies minimally:

- **Authentication state cookies** — temporary cookies used during OAuth flows (GitHub, Google) to maintain session state. These are deleted after authentication completes.
- **Preference cookies** — optional cookies to store user interface preferences.

We use **local storage** (browser-based) for session management in the application. We do **not** use third-party tracking cookies.

## 4. Data Storage and Infrastructure

All data is stored and processed in the **us-east-1 region (United States)** using the following infrastructure:

| Service | Provider | Purpose |
|---|---|---|
| Database | MongoDB Atlas (AWS us-east-1) | User accounts, scan findings, project data |
| Object storage | Cloudflare R2 (global edge) | Scan reports, artifacts |
| Task processing | Cloudflare Workers, Queues, Cron Jobs | Edge processing, scan orchestration, scheduled tasks |
| Container execution | AWS ECS, SQS, EventBridge | Cloud-hosted scan execution (us-east-1) |
| Container registries | AWS ECR, Docker Hub, GitHub Container Registry (GHCR) | Scanner container images |
| Email delivery | Mailtrap | OTP, notifications, report sharing |
| Analytics | PostHog | Anonymized product analytics |
| LLM inference | AWS Bedrock, OpenAI, Anthropic, DeepSeek | AI enrichment of scan findings |

**Data residency note:** The primary database (MongoDB Atlas) resides in the AWS us-east-1 region. Cloud-hosted scans execute in us-east-1. Cloudflare R2 (object storage) and Cloudflare Queues operate on Cloudflare's global edge network and may process or cache data at edge locations closest to users. Cloudflare Workers execute at the edge for low-latency request handling. Persistent, authoritative data storage is in the us-east-1 region.

## 5. Data Retention

- **Scan results:** We retain the results of the **last 7 builds** per project. Older scan results are automatically deleted.
- **Account data:** Retained for as long as your account is active.
- **Shared reports:** Retained for as long as the parent project exists.
- **Analytics data:** Anonymized and retained per PostHog's standard retention policies.

## 6. Data Deletion

You may delete your account at any time from your account settings. Upon deletion:

- Your account, profile information, projects, scan results, reports, and all associated data are **permanently deleted immediately**
- This action is irreversible
- Shared report access is revoked simultaneously

You may also delete individual projects, which removes all scan results and reports associated with that project.

## 7. Data Sharing and Third Parties

We do not sell, rent, or trade your personal information. We share data only with the following categories of third-party processors, solely for the purpose of operating the Service:

- **LLM providers** (OpenAI, Anthropic, DeepSeek, AWS Bedrock) — scan findings are sent for AI enrichment. Source code is not sent to LLM providers; only finding metadata (file paths, vulnerability descriptions, code snippets from findings) is transmitted.
- **Infrastructure providers** (AWS, Cloudflare, MongoDB Atlas) — for hosting, processing, and storage as described above.
- **Email provider** (Mailtrap) — for delivering transactional emails.
- **Analytics provider** (PostHog) — for anonymized product analytics.

We may disclose information if required by law, regulation, legal process, or governmental request.

## 8. Your Rights

Depending on your jurisdiction, you may have the following rights regarding your personal data:

- **Access** — request a copy of the personal data we hold about you
- **Correction** — request correction of inaccurate data
- **Deletion** — request deletion of your data (available immediately via account settings)
- **Data portability** — request an export of your data
- **Objection** — object to certain processing activities

To exercise these rights, contact us at hello@corefix.dev. We will respond within 30 days.

## 9. European Users (EEA, UK, Switzerland)

If you are located in the European Economic Area, United Kingdom, or Switzerland:

- **Legal basis for processing:** We process your data based on contractual necessity (to provide the Service), legitimate interest (to improve the Service), and consent (for optional analytics).
- **Data transfers:** Your data is transferred to and stored in the United States (us-east-1 region). By using the Service, you consent to this transfer. We rely on standard contractual clauses where applicable.
- **EU representative:** We do not currently have an appointed EU representative. As the product matures and EU usage grows, we plan to appoint one. In the interim, contact us directly at hello@corefix.dev.
- **Data subject requests:** We handle data subject access requests (DSARs) manually through support. Automated DSAR processing is planned for a future release.
- **Supervisory authority:** You have the right to lodge a complaint with your local data protection supervisory authority.

## 10. Indian Users (DPDP Act)

For users in India, we comply with applicable provisions of the Digital Personal Data Protection Act, 2023 (DPDP Act) as they come into effect. You may exercise your rights under the DPDP Act by contacting us at hello@corefix.dev.

## 11. Children's Privacy

The Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from anyone under 18. If we become aware that we have collected data from a user under 18, we will delete the account and associated data immediately.

## 12. Security

We implement reasonable technical and organizational measures to protect your personal information, including encryption in transit (TLS), access controls, and regular security reviews of our own infrastructure. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.

## 13. Changes to This Policy

We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a notice on the Service. Your continued use of the Service after changes become effective constitutes your acceptance of the updated policy.

## 14. Contact

For questions about this Privacy Policy, contact us at:

**Email:** hello@corefix.dev
**Address:** 503, Capital Park, Capital Pk Rd, Cyber Hills Colony, VIP Hills, Silicon Valley, Madhapur, Hyderabad, Telangana 500081, India.
