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
    ["link", { rel: "icon", href: "/light/cf-on-light.svg" }],
    ["meta", { name: "theme-color", content: "#ffffff", media: "(prefers-color-scheme: light)" }],
    ["meta", { name: "theme-color", content: "#0b0d10", media: "(prefers-color-scheme: dark)" }],
  ],

  themeConfig: {
    logo: {
      light: "/light/corefix-logo-light.svg",
      dark: "/dark/corefix-logo-dark.svg",
      alt: "CoreFix",
    },
    logoLink: "https://corefix.dev",
    siteTitle: false,

    nav: [
      {
        text: "Overview",
        link: "/docs/introduction",
      },
      {
        text: "Schedule Demo",
        link: "https://cal.com/corefix.dev/30min",
        target: "_blank",
        rel: "noopener noreferrer",
      },
      {
        text: "Login",
        link: appUrl,
        target: "_blank",
        rel: "noopener noreferrer",
      },
    ],

    sidebar: [
      {
        text: "Introduction",
        collapsed: false,
        items: [
          { text: "Overview", link: "/docs/introduction" },
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
        text: "Legal & Policies",
        collapsed: false,
        items: [
          { text: "Terms of Service", link: "/docs/terms-of-service" },
          { text: "Privacy Policy", link: "/docs/privacy-policy" },
          { text: "Cookie Policy", link: "/docs/cookie-policy" },
          { text: "Refund Policy", link: "/docs/refund-policy" },
          { text: "Security Policy", link: "/docs/security-policy" },
          { text: "AI Usage Policy", link: "/docs/ai-usage-policy" },
          { text: "Disclaimer", link: "/docs/disclaimer" },
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
      { icon: "x", link: "https://x.com/corefixhq" },
    ],

    lastUpdatedText: "Last updated",
  },

  markdown: {
    lineNumbers: true,
  },
});
