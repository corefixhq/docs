import { defineConfig } from "vitepress";
import { loadEnv } from "vite";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";

const env = loadEnv("", process.cwd(), "");
const appUrl = env.VITE_APP_URL || "https://app.corefix.dev";

export default defineConfig({
  title: "CoreFix Documentation",
  description: "CoreFix security scanning documentation",
  base: "/",
  appearance: true,

  head: [
    ["link", { rel: "icon", href: "/light/cf-on-light.svg" }],
    [
      "meta",
      {
        name: "theme-color",
        content: "#ffffff",
        media: "(prefers-color-scheme: light)",
      },
    ],
    [
      "meta",
      {
        name: "theme-color",
        content: "#0b0d10",
        media: "(prefers-color-scheme: dark)",
      },
    ],
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
          { text: "What is CoreFix?", link: "/docs/introduction" },
          { text: "How It Works", link: "/docs/how-it-works" },
        ],
      },
      {
        text: "Getting Started",
        collapsed: false,
        items: [
          { text: "Sign Up & Setup", link: "/docs/sign-up-and-sign-in" },
          { text: "Web Scan in 2 Minutes", link: "/docs/web-scan-quickstart" },
          {
            text: "Connect GitHub for Code Scanning",
            link: "/docs/github-integration",
          },
        ],
      },
      {
        text: "Scanning",
        collapsed: false,
        items: [
          { text: "Ways to Scan", link: "/docs/ways-to-scan" },
          { text: "Code Scanning", link: "/docs/code-agent-usage" },
          { text: "Web Scanning", link: "/docs/web-agent-usage" },
          {
            text: "CI/CD Integration",
            collapsed: true,
            items: [
              { text: "Code Scanning", link: "/docs/cicd-integration" },
              { text: "Web Scanning", link: "/docs/cicd-web-scan" },
            ],
          },
          { text: "Docker / Local CLI", link: "/docs/docker-cli" },
          { text: "Chrome Extension", link: "/docs/chrome-extension-guide" },
          {
            text: "Web Scan Config Reference",
            link: "/docs/web-scan-config-reference",
          },
        ],
      },
      {
        text: "Projects",
        collapsed: false,
        items: [
          { text: "Creating Projects", link: "/docs/creating-a-project" },
          { text: "Managing Projects", link: "/docs/managing-projects" },
          { text: "Viewing Results", link: "/docs/reports" },
        ],
      },
      {
        text: "AI & Models",
        collapsed: false,
        items: [
          { text: "AI Enrichment", link: "/docs/ai-enrichment" },
          { text: "Supported Models", link: "/docs/models" },
          { text: "Model Pricing", link: "/docs/models-pricing" },
          { text: "Model Availability Matrix", link: "/docs/models-matrix" },
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
          { text: "Privacy Policy", link: "/docs/privacy-protection" },
          { text: "Cookie Policy", link: "/docs/cookie-policy" },
          { text: "Refund Policy", link: "/docs/refund-policy" },
          { text: "Security Policy", link: "/docs/security-policy" },
          { text: "AI Usage Policy", link: "/docs/ai-policy" },
          {
            text: "Open Source Acknowledgements",
            link: "/docs/acknowledgements",
          },
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
    config(md) {
      md.use(tabsMarkdownPlugin);
    },
  },
});
