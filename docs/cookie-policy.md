# Cookie Policy

**Effective Date:** June 02, 2026
**Last Updated:** June 02, 2026

This Cookie Policy explains what cookies and similar technologies CoreFix uses on corefix.dev, app.corefix.dev, and docs.corefix.dev (collectively, the "Service"), why we use them, and your options for controlling them.

CoreFix is operated by CoreFix (Corefixhq), 503, Capital Park, Capital Pk Rd, Cyber Hills Colony, VIP Hills, Silicon Valley, Madhapur, Hyderabad, Telangana 500081, India. Contact: hello@corefix.dev.

---

## 1. What Are Cookies?

Cookies are small text files stored in your browser when you visit a website. They help websites remember your preferences, maintain your session, and understand how the site is being used. We also use similar technologies such as **local storage** (browser-based key-value storage) as described below.

---

## 2. Our Approach to Cookies

We keep cookie usage as minimal as possible. We do not use cookies for advertising, tracking across third-party websites, or selling data to any third party. CoreFix does not display ads and does not participate in ad networks.

---

## 3. Cookies We Use

### 3.1 OAuth State Cookies (Essential)

| Cookie | Purpose | Duration |
|---|---|---|
| `oauth_state` | Stores a temporary CSRF protection token during GitHub or Google OAuth authentication flows | Deleted immediately after authentication completes |
| `auth_callback_state` | Maintains the authentication flow state during GitHub App installation | Deleted immediately after installation completes |

These cookies are **essential** for OAuth authentication to function securely. Without them, login and GitHub App installation flows would be vulnerable to cross-site request forgery (CSRF) attacks. They cannot be disabled without breaking authentication.

### 3.2 Preference Cookies (Optional)

| Cookie | Purpose | Duration |
|---|---|---|
| `ui_preferences` | Stores your interface preferences (e.g. theme, display settings) if set | Up to 12 months |

These cookies are optional. If not set, default preferences apply. You can clear them at any time via your browser settings without affecting core functionality.

---

## 4. Local Storage (Not Cookies)

CoreFix uses **browser local storage** for session management in the application (app.corefix.dev). This is technically distinct from cookies — it is not sent to our servers with every request and is managed entirely within your browser.

| Item | Purpose | Cleared |
|---|---|---|
| Session tokens | Keeps you logged in to app.corefix.dev | When you log out or clear browser storage |
| App state | Stores current project, navigation state | When you clear browser storage |

Local storage data does not leave your browser except when explicitly needed for authenticated API requests. It is not accessible to third-party scripts.

---

## 5. Third-Party Technologies

### PostHog Analytics

We use PostHog on corefix.dev and app.corefix.dev to collect anonymized product analytics — page views, feature interactions, and general usage patterns. PostHog may set its own cookies or use local storage to maintain an anonymous session identifier.

| Cookie / Storage | Purpose |
|---|---|
| `ph_*` (PostHog cookies) | Anonymous session tracking for product analytics |

PostHog analytics does **not** identify you personally and we do not link PostHog data to your CoreFix account. No personal information is sent to PostHog. You can learn more about PostHog's data practices at [posthog.com/privacy](https://posthog.com/privacy).

We do **not** use Google Analytics, Facebook Pixel, Hotjar, Mixpanel, Intercom, or any advertising or retargeting technologies.

---

## 6. What We Do Not Use Cookies For

To be explicit:

- We do **not** use cookies for advertising or ad targeting
- We do **not** use cookies to track you across other websites
- We do **not** sell cookie data or share it with data brokers
- We do **not** use third-party advertising networks
- We do **not** use fingerprinting or other tracking techniques beyond what is described above

---

## 7. Your Choices

### Browser Settings

You can control and delete cookies through your browser settings. Most browsers allow you to:

- View which cookies are set
- Block cookies from specific sites or all sites
- Delete cookies individually or all at once

Note that blocking essential OAuth state cookies will prevent you from logging in or installing the GitHub App. Blocking PostHog cookies will not affect your ability to use the Service.

Links to cookie settings for common browsers:
- [Google Chrome](https://support.google.com/chrome/answer/95647)
- [Mozilla Firefox](https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox)
- [Safari](https://support.apple.com/en-gb/guide/safari/sfri11471/mac)
- [Microsoft Edge](https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09)

### Opt Out of Analytics

If you want to opt out of PostHog analytics, you can use a browser-level ad or tracking blocker (such as uBlock Origin or Privacy Badger), which will prevent PostHog from loading. Your ability to use the Service is not affected.

---

## 8. European Users

If you are located in the European Economic Area (EEA), United Kingdom, or Switzerland, you have the right to:

- Be informed about the cookies we use (this policy fulfills that obligation)
- Consent to or refuse non-essential cookies

Essential cookies (OAuth state cookies) do not require consent under applicable law as they are strictly necessary for the Service to function. Optional preference cookies and PostHog analytics are used based on legitimate interest for product improvement. If you wish to withdraw from analytics tracking, follow the opt-out steps in Section 7.

---

## 9. Changes to This Policy

We may update this Cookie Policy from time to time. If we make material changes, we will update the "Last Updated" date at the top and, where appropriate, notify you via email or a notice on the Service.

---

## 10. Contact

For questions about this Cookie Policy, contact us at:

**Email:** hello@corefix.dev
**Address:** 503, Capital Park, Capital Pk Rd, Cyber Hills Colony, VIP Hills, Silicon Valley, Madhapur, Hyderabad, Telangana 500081, India.
