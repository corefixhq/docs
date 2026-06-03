# Terms of Service

**Effective Date:** June 02, 2026
**Last Updated:** June 02, 2026

These Terms of Service ("Terms") govern your access to and use of the CoreFix platform, including the website at corefix.dev, the application at app.corefix.dev, documentation at docs.corefix.dev, APIs, CLI tools, browser extensions, and related services (collectively, the "Service"). The Service is operated by CoreFix ("we," "us," or "our"), with its principal office at 503, Capital Park, Capital Pk Rd, Cyber Hills Colony, VIP Hills, Silicon Valley, Madhapur, Hyderabad, Telangana 500081, India.

By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.

---

## 1. Eligibility

You must be at least 18 years of age to use the Service. By creating an account, you represent that you are at least 18 years old and have the legal capacity to enter into these Terms.

## 2. Account Registration

You may create an account using a one-time password (OTP) sent to your email address, an activation link, or through an OAuth provider (GitHub, Google). You are responsible for maintaining the security of your account credentials, API keys, and access tokens. You agree to notify us immediately at hello@corefix.dev if you become aware of any unauthorized use of your account.

We do not store passwords. Authentication is managed via OTP, activation links, or delegated OAuth providers.

## 3. Acceptable Use

You agree to use the Service only for lawful purposes and in compliance with these Terms. Specifically, you agree not to:

- Scan, test, or attack any website, application, or system that you do not own or have explicit written authorization to test
- Use the Service to conduct unauthorized penetration testing, vulnerability scanning, or security assessments against third-party systems
- Reverse engineer, decompile, or attempt to extract the source code of the CoreFix platform, agents, or tools
- Resell, sublicense, or redistribute access to the Service without prior written consent
- Use the Service to violate any applicable law, regulation, or third-party rights
- Attempt to bypass rate limits, usage restrictions, or security controls
- Upload malicious code, malware, or content designed to disrupt the Service
- Use the Service to generate spam, phishing content, or social engineering attacks
- Share or transfer your account, API keys, or credits to unauthorized users

## 4. Code Scanning

When you connect a repository to CoreFix via the GitHub App or CLI agent, we scan the repository contents using open source security scanners. For cloud-hosted (SaaS) scans, your code is temporarily processed in our infrastructure in the us-east-1 region and is not retained after the scan completes. Only the resulting findings (not your source code) are stored.

For self-hosted scans using the CoreFix Docker agent, your source code never leaves your environment. Only scan findings are transmitted to CoreFix for AI enrichment and reporting.

We retain the results of the last 7 builds per project. Older scan results are automatically deleted.

## 5. Web Application Scanning

Web application scanning sends real security test payloads (including but not limited to SQL injection, XSS, SSRF, and authentication bypass attempts) to the target URL you specify. By initiating a web scan, you represent and warrant that you have explicit authorization to perform security testing against the target. See our [Disclaimer](/docs/disclaimer) for full details on liability.

Web application scanning requires credits and is not included in the free Open Source plan.

## 6. Open Source Plan

Public repositories on GitHub may be scanned for free, with no credit card required. The Open Source plan includes code scanning (SAST, secrets, SCA, IaC, Kubernetes) and AI enrichment using standard models. Web application scanning, autofix PRs, and premium AI models are not included in the Open Source plan and require purchased credits.

We reserve the right to modify the scope of the Open Source plan at any time with reasonable notice.

## 7. Credits, Billing, and Payment

CoreFix uses a pay-as-you-go credits model for private repositories and web scanning. Credits are consumed based on actual runtime (at the published rate per minute) and LLM token usage (at provider cost plus the published markup).

Credits are purchased in advance and deducted as scans are executed. Credits do not expire. When your balance reaches zero, scans will pause — you will not be charged overage fees.

All purchases are final. See our [Refund Policy](/docs/refund-policy) for details on exceptions.

## 8. Bring Your Own Key (BYOK)

You may provide your own API keys for supported LLM providers. When using BYOK, you pay your LLM provider directly for token usage. CoreFix charges a platform orchestration fee as described in our [Pricing](https://corefix.dev/pricing) page.

**Important:** CoreFix does not store your API keys. Your API keys are used on-the-fly as you provide them and are immediately routed to your LLM provider. We do not retain, cache, or persist your credentials in any form.

By providing your API key, you acknowledge that CoreFix will route requests through your key on your behalf for the duration of each operation. You are responsible for compliance with your LLM provider's terms of service.

## 9. AI-Generated Content

CoreFix uses large language models (LLMs) to enrich, prioritize, and generate remediation suggestions for security findings. AI-generated outputs, including fix suggestions, risk scores, and code patches, are provided on an as-is basis.

CoreFix is AI-powered and can make mistakes. You are responsible for reviewing, validating, and testing any AI-generated output before applying it to your codebase. See our [AI Usage Policy](/docs/ai-usage-policy) for full details.

## 10. Intellectual Property

You retain all rights to your source code, repositories, and applications. CoreFix does not claim any ownership over your code, findings, or reports.

The CoreFix platform, including its software, design, documentation, and branding, is the intellectual property of CoreFix and is protected by applicable laws.

## 11. Data and Privacy

Our collection and use of your personal information is governed by our [Privacy Policy](/docs/privacy-policy). By using the Service, you consent to our data practices as described therein.

## 12. Service Availability

The Service is provided on an "as available" basis. We do not guarantee uninterrupted or error-free operation. We may perform maintenance, updates, or modifications to the Service at any time. We will make reasonable efforts to notify users of planned downtime.

## 13. Limitation of Liability

To the maximum extent permitted by law, CoreFix and its officers, employees, and contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to your use of the Service, including but not limited to:

- Damage caused by scanning websites or applications you were not authorized to test
- Code changes or pull requests generated by AI that cause bugs, outages, or data loss
- Loss of data, revenue, or business opportunities
- Security incidents arising from reliance on scan results or AI-generated fixes

Our total aggregate liability for any claim arising from these Terms shall not exceed the amount you paid to CoreFix in the 12 months preceding the claim, or $100, whichever is greater.

## 14. Indemnification

You agree to indemnify and hold harmless CoreFix from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.

## 15. Termination

You may terminate your account at any time from your account settings. Upon termination, all your data, scan results, projects, and associated information will be permanently deleted immediately.

We may suspend or terminate your account if we reasonably believe you have violated these Terms, with or without notice.

## 16. Changes to These Terms

We may update these Terms from time to time. If we make material changes, we will notify you by email or by posting a notice on the Service. Your continued use of the Service after changes become effective constitutes your acceptance of the updated Terms.

## 17. Governing Law and Jurisdiction

These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana, India.

## 18. European Users

If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, please note that your data is processed and stored in the United States (us-east-1 region). By using the Service, you consent to the transfer of your data to the United States. We currently do not have an appointed EU representative but plan to appoint one as the product matures. For data subject access requests, contact us at hello@corefix.dev.

## 19. Contact

For questions about these Terms, contact us at:

**Email:** hello@corefix.dev
**Address:** 503, Capital Park, Capital Pk Rd, Cyber Hills Colony, VIP Hills, Silicon Valley, Madhapur, Hyderabad, Telangana 500081, India.
