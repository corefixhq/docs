import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig, createContentLoader } from "vitepress";
import { loadEnv } from "vite";
import { Feed } from "feed";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const env = loadEnv("", process.cwd(), "");
const appUrl = env.VITE_APP_URL || "https://app.corefix.dev";
const siteUrl = "https://blogs.corefix.dev";

export default defineConfig({
  title: "Corefix Blog",
  description:
    "Security insights, product updates, and engineering deep-dives from the Corefix team.",
  base: "/",
  cleanUrls: true,
  appearance: true,

  // Point to the root public/ so both sites share logos and brand assets.
  vite: {
    publicDir: path.resolve(__dirname, "../../public"),
  },

  head: [
    ["link", { rel: "icon", href: "/light/cf-on-light.svg" }],
    [
      "link",
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Corefix Blog RSS Feed",
        href: `${siteUrl}/feed.xml`,
      },
    ],
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
    ["meta", { property: "og:site_name", content: "Corefix Blog" }],
    ["meta", { name: "twitter:site", content: "@corefixhq" }],
  ],

  themeConfig: {
    logo: {
      light: "/light/corefix-logo-light.svg",
      dark: "/dark/corefix-logo-dark.svg",
      alt: "Corefix",
    },
    logoLink: "https://corefix.dev",
    siteTitle: false,

    nav: [
      { text: "Docs", link: "https://docs.corefix.dev" },
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

    // No sidebar — blog uses date-ordered listing, not a docs-style tree.
    sidebar: [],

    // Table of contents shown on blog post pages (right aside column).
    outline: {
      level: [2, 3],
      label: "On this page",
    },

    search: {
      provider: "local",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/corefixhq" },
      { icon: "x", link: "https://x.com/corefixhq" },
    ],
  },

  // Auto-inject Open Graph + Twitter Card meta from each post's frontmatter.
  transformPageData(pageData) {
    const fm = pageData.frontmatter;
    if (!fm.title) return;

    const injected: [string, Record<string, string>][] = [];

    injected.push(["meta", { property: "og:title", content: fm.title }]);
    injected.push(["meta", { name: "twitter:title", content: fm.title }]);

    if (fm.description) {
      injected.push([
        "meta",
        { property: "og:description", content: fm.description },
      ]);
      injected.push([
        "meta",
        { name: "twitter:description", content: fm.description },
      ]);
    }

    if (fm.cover) {
      const imgUrl = fm.cover.startsWith("http")
        ? fm.cover
        : `${siteUrl}${fm.cover}`;
      injected.push(["meta", { property: "og:image", content: imgUrl }]);
      injected.push([
        "meta",
        { name: "twitter:card", content: "summary_large_image" },
      ]);
      injected.push(["meta", { name: "twitter:image", content: imgUrl }]);
    } else {
      injected.push(["meta", { name: "twitter:card", content: "summary" }]);
    }

    injected.push(["meta", { property: "og:type", content: "article" }]);

    if (fm.date) {
      injected.push([
        "meta",
        {
          property: "article:published_time",
          content: new Date(fm.date).toISOString(),
        },
      ]);
    }

    if (Array.isArray(fm.tags)) {
      (fm.tags as string[]).forEach((tag) => {
        injected.push(["meta", { property: "article:tag", content: tag }]);
      });
    }

    pageData.frontmatter.head = [...(fm.head ?? []), ...injected];
  },

  // Generate RSS feed at build time. Outputs to blogs/.vitepress/dist/feed.xml
  buildEnd: async (siteConfig) => {
    const feed = new Feed({
      title: "Corefix Blog",
      description:
        "Security insights, product updates, and engineering deep-dives from the Corefix team.",
      id: `${siteUrl}/`,
      link: `${siteUrl}/`,
      language: "en",
      image: `${siteUrl}/light/corefix-logo-light.svg`,
      favicon: `${siteUrl}/light/cf-on-light.svg`,
      copyright: `© ${new Date().getFullYear()} Corefix. All rights reserved.`,
    });

    const loader = createContentLoader("*.md", { excerpt: true, render: true });
    const posts = await loader.load();

    posts
      .filter((p) => p.url !== "/" && !p.frontmatter.draft)
      .sort(
        (a, b) =>
          new Date(b.frontmatter.date).getTime() -
          new Date(a.frontmatter.date).getTime()
      )
      .slice(0, 20)
      .forEach((post) => {
        const authorRaw = post.frontmatter.author;
        const authorName =
          typeof authorRaw === "string"
            ? authorRaw
            : (authorRaw?.name ?? "Corefix Team");

        feed.addItem({
          title: post.frontmatter.title ?? "Untitled",
          id: `${siteUrl}${post.url}`,
          link: `${siteUrl}${post.url}`,
          description:
            post.frontmatter.description ?? post.excerpt ?? "",
          date: new Date(post.frontmatter.date ?? Date.now()),
          author: [{ name: authorName }],
          content: post.html ?? "",
          image: post.frontmatter.cover
            ? `${siteUrl}${post.frontmatter.cover}`
            : undefined,
        });
      });

    writeFileSync(path.join(siteConfig.outDir, "feed.xml"), feed.rss2());
    console.log("[blog] RSS feed written to dist/feed.xml");
  },
});
