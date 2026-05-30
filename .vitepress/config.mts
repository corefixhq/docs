import { defineConfig } from "vitepress";

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
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide" },
      {
        text: "Tools",
        items: [
          { text: "Chrome Extension", link: "/docs/chrome-extension-guide" },
          { text: "AWS Scan Pipeline", link: "/docs/aws-scan-pipeline-setup" },
        ],
      },
      { text: "Pricing", link: "/docs/pricing-and-usage" },
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

    socialLinks: [{ icon: "github", link: "https://github.com" }],

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
