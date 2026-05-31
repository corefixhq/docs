import { defineConfig } from "vitepress";
import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "");
const appUrl = env.VITE_APP_URL || "https://app.corefix.dev";

export default defineConfig({
  title: "CoreFix Documentation",
  description: "CoreFix security scanning documentation",
  base: "/",
  appearance: true,

  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
    ["meta", { name: "theme-color", content: "#ffffff", media: "(prefers-color-scheme: light)" }],
    ["meta", { name: "theme-color", content: "#0b0d10", media: "(prefers-color-scheme: dark)" }],
  ],

  themeConfig: {
    logo: {
      light: "/light/cf-on-light.svg",
      dark: "/dark/cf-on-dark.svg",
      alt: "CoreFix",
    },
    logoLink: "https://corefix.dev",
    siteTitle: "CoreFix",

    nav: [
      {
        text: "Login",
        link: appUrl,
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        text: "Schedule Call",
        link: "https://cal.com/corefix.dev/30min",
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [
          { text: "What is CoreFix?", link: "/docs/introduction" },
          { text: "How It Works", link: "/docs/how-it-works" },
        ],
      },
      {
        text: "Getting Started",
        collapsed: false,
        items: [
          { text: "Sign Up & Setup", link: "/docs/getting-started" },
          { text: "Your First Scan", link: "/docs/first-scan" },
          { text: "GitHub Integration", link: "/docs/github-integration" },
        ],
      },
      {
        text: "Scanning",
        collapsed: false,
        items: [
          { text: "Code Scanning", link: "/docs/standalone-usage" },
          { text: "Web Scanning", link: "/docs/web-standalone-usage" },
          { text: "CI/CD Pipelines", link: "/docs/cicd-integration" },
          { text: "Web CI/CD Integration", link: "/docs/web-cicd-integration" },
          { text: "Docker / Local CLI", link: "/docs/docker-cli" },
        ],
      },
      {
        text: "Browser Extensions",
        collapsed: false,
        items: [
          { text: "Chrome Extension", link: "/docs/chrome-extension-guide" },
        ],
      },
      {
        text: "Projects",
        collapsed: false,
        items: [
          { text: "Managing Projects", link: "/docs/projects" },
          { text: "Viewing Reports", link: "/docs/reports" },
          { text: "Findings & Triage", link: "/docs/findings" },
        ],
      },
      {
        text: "AI & Models",
        collapsed: false,
        items: [
          { text: "AI Enrichment", link: "/docs/ai-enrichment" },
          { text: "Supported Models", link: "/docs/models" },
        ],
      },
      {
        text: "Account",
        collapsed: false,
        items: [
          { text: "Usage & Credits", link: "/docs/account-usage" },
          { text: "Pricing", link: "/docs/pricing-and-usage" },
        ],
      },
      {
        text: "Tools",
        collapsed: false,
        items: [
          { text: "Overview", link: "/docs/tools" },
          { text: "Nmap", link: "/docs/tools/nmap" },
          { text: "OpenVAS", link: "/docs/tools/openvas" },
          { text: "Nuclei", link: "/docs/tools/nuclei" },
          { text: "OWASP ZAP", link: "/docs/tools/zap" },
          { text: "testssl.sh + SSLyze", link: "/docs/tools/testssl" },
          { text: "OpenAPI Fuzzer", link: "/docs/tools/openapi-fuzzer" },
          { text: "OSV Scanner", link: "/docs/tools/osv-scanner" },
          { text: "Gitleaks", link: "/docs/tools/gitleaks" },
          { text: "KICS", link: "/docs/tools/kics" },
          { text: "Kubescape", link: "/docs/tools/kubescape" },
          { text: "OpenGrep", link: "/docs/tools/opengrep" },
          { text: "Prowler", link: "/docs/tools/prowler" },
          { text: "Grype", link: "/docs/tools/grype" },
          { text: "Dockle", link: "/docs/tools/dockle" },
          { text: "SonarQube", link: "/docs/tools/sonarqube" },
        ],
      },
      {
        text: "Legal & Policies",
        collapsed: false,
        items: [
          { text: "Terms of Service", link: "/docs/terms-of-service" },
          { text: "Privacy Policy", link: "/docs/privacy-protection" },
          { text: "Cookie Policy", link: "/docs/cookie-policy" },
          { text: "Refund Policy", link: "/docs/refund-policy" },
          { text: "Security Policy", link: "/docs/security-policy" },
          { text: "AI Usage Policy", link: "/docs/ai-policy" },
          { text: "Open Source Acknowledgements", link: "/docs/acknowledgements" },
        ],
      },
      {
        text: "Release Logs",
        collapsed: false,
        items: [
          { text: "Overview", link: "/docs/release-logs" },
          { text: "v1.0.0", link: "/docs/release-v1.0.0" },
        ],
      },
    ],

    search: {
      provider: "local",
      options: {
        detailedView: true,
        miniSearch: {
          options: {
            processTerm: (term) => {
              return term;
            },
          },
          searchOptions: {
            combineWith: "AND",
            boostDocument: (id, term, storedFields) => {
              return storedFields.level === 1 ? 10 : 1;
            },
          },
        },
      },
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/corefixhq" },
      { icon: "X", link: "https://x.com/corefixhq" },
    ],

    lastUpdatedText: "Last updated",
  },

  markdown: {
    lineNumbers: true,
  },
});
