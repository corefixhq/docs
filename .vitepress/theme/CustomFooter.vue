<script setup lang="ts">
import { ref } from "vue";

const WEBSITE_URL = "https://corefix.dev";
const openColumn = ref<string | null>(null);

const columns = [
  {
    title: "Products",
    links: [
      { label: "Code Scanning", href: `${WEBSITE_URL}/products/code-security` },
      { label: "Web Scanning", href: `${WEBSITE_URL}/products/web-security` },
    ],
  },
  {
    title: "Vulnerability Scanners",
    links: [
      { label: "OWASP ZAP", href: `${WEBSITE_URL}/resources/owasp-zap` },
      { label: "Project Nuclei", href: `${WEBSITE_URL}/resources/nuclei` },
      { label: "Nmap", href: `${WEBSITE_URL}/resources/nmap` },
      { label: "testssl.sh", href: `${WEBSITE_URL}/resources/testssl` },
      { label: "Gitleaks", href: `${WEBSITE_URL}/resources/gitleaks` },
      { label: "KICS", href: `${WEBSITE_URL}/resources/kics` },
      { label: "OSV Scanner", href: `${WEBSITE_URL}/resources/osv-scanner` },
      { label: "OpenAPI Fuzzer", href: `${WEBSITE_URL}/resources/openapi-fuzzer` },
      { label: "SonarQube", href: `${WEBSITE_URL}/resources/sonarqube` },
      { label: "OpenGrep", href: `${WEBSITE_URL}/resources/opengrep` },
      { label: "Grype", href: `${WEBSITE_URL}/resources/grype` },
      { label: "Dockle", href: `${WEBSITE_URL}/resources/dockle` },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs/introduction" },
      { label: "Support", href: "https://github.com/orgs/corefixhq/discussions" },
      { label: "Status Page", href: "https://corefix.instatus.com/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: `${WEBSITE_URL}/contact` },
      { label: "Pricing", href: `${WEBSITE_URL}/pricing` },
      { label: "Roadmap", href: `${WEBSITE_URL}/roadmap` },
      { label: "Terms & Conditions", href: "/docs/terms-of-service" },
      { label: "Privacy Policy", href: "/docs/privacy-protection" },
      { label: "Refund Policy", href: "/docs/refund-policy" },
      { label: "AI Usage Policy", href: "/docs/ai-policy" },
    ],
  },
];

function isExternal(href: string) {
  return href.startsWith("http");
}

function toggleColumn(title: string) {
  openColumn.value = openColumn.value === title ? null : title;
}
</script>

<template>
  <footer class="ft-root">
    <div class="ft-inner">
      <div class="ft-top">
        <div class="ft-brand">
          <a :href="WEBSITE_URL" class="ft-logo-link" aria-label="CoreFix home">
            <img src="/light/corefix-logo-light.svg" alt="CoreFix" class="ft-logo ft-logo--light" />
            <img src="/dark/corefix-logo-dark.svg" alt="CoreFix" class="ft-logo ft-logo--dark" />
          </a>
          <p class="ft-tagline">Find it at runtime. Fix it in code</p>
          <div class="ft-socials">
            <a
              href="https://github.com/corefixhq"
              class="ft-social"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </a>
            <a
              href="https://x.com/corefixhq"
              class="ft-social"
              aria-label="X / Twitter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2.25 2.25h6.336l4.261 5.636 5.397-5.636zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" class="ft-social" aria-label="LinkedIn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle cx="4" cy="4" r="2" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </a>
          </div>
        </div>

        <nav class="ft-cols" aria-label="Footer navigation">
          <div
            v-for="column in columns"
            :key="column.title"
            class="ft-col"
            :class="{ 'ft-col--open': openColumn === column.title }"
          >
            <button
              class="ft-col-title"
              type="button"
              :aria-expanded="openColumn === column.title"
              @click="toggleColumn(column.title)"
            >
              {{ column.title }}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="ft-col-chev" aria-hidden="true">
                <path d="M2 4.5l4 3 4-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <div class="ft-col-body">
              <ul class="ft-col-list">
                <li v-for="link in column.links" :key="link.label">
                  <a
                    class="ft-link"
                    :href="link.href"
                    :target="isExternal(link.href) ? '_blank' : undefined"
                    :rel="isExternal(link.href) ? 'noopener noreferrer' : undefined"
                  >
                    {{ link.label }}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>

      <div class="ft-bottom">
        <span class="ft-copy">© 2026 CoreFix. All rights reserved.</span>
      </div>
    </div>
  </footer>
</template>
