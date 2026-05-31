import { defineConfig } from "vitepress";
import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "");
const appUrl = env.VITE_APP_URL || "https://app.corefix.dev";

export default defineConfig({
  title: "Corefix Documentation",
  description: "DeepTraq Scanner - Security Scanning Documentation",
  base: "/",
  appearance: "light",

  head: [
    ["link", { rel: "icon", href: "/logo.png" }],
    ["meta", { name: "theme-color", content: "#ffffff" }],
  ],

  themeConfig: {
    logo: "/logo.png",
    logoLink: "/",
    siteTitle: "Corefix",

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
        text: "Getting Started",
        collapsed: false,
        items: [
          { text: "Standalone Usage", link: "/docs/standalone-usage" },
          { text: "Web CI/CD Integration", link: "/docs/web-cicd-integration" },
          { text: "Web Standalone", link: "/docs/web-standalone-usage" },
        ],
      },
      {
        text: "Features",
        collapsed: false,
        items: [
          { text: "Projects", link: "/docs/projects" },
          { text: "Reports", link: "/docs/reports" },
          { text: "Account Usage", link: "/docs/account-usage" },
          { text: "AI Enrichment", link: "/docs/ai-enrichment" },
          { text: "Models", link: "/docs/models" },
        ],
      },
      {
        text: "Integration",
        collapsed: false,
        items: [
          { text: "CI/CD Integration", link: "/docs/cicd-integration" },
          { text: "Chrome Extension", link: "/docs/chrome-extension-guide" },
          { text: "AWS Scan Pipeline", link: "/docs/aws-scan-pipeline-setup" },
        ],
      },
      {
        text: "Reference",
        collapsed: false,
        items: [{ text: "Pricing & Usage", link: "/docs/pricing-and-usage" }],
      },
      {
        text: "Vitest Documentation",
        collapsed: false,
        items: [
          { text: "Tools Overview", link: "/docs/vitest-tools-overview" },
          {
            text: "Release Logs Overview",
            link: "/docs/vitest-release-logs-overview",
          },
          { text: "Release v1.0.0", link: "/docs/vitest-release-logs-v1.0.0" },
          { text: "Support Resources", link: "/docs/vitest-support-resources" },
        ],
      },
    ],

    footer: {
      message: "Built with VitePress",
      copyright: "© 2024 Corefix. All rights reserved.",
    },

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

    editLink: {
      pattern: "https://github.com/yourusername/docs/edit/main/docs/:path",
      text: "Edit this page",
    },

    lastUpdatedText: "Last updated",
  },

  markdown: {
    lineNumbers: true,
  },
});
