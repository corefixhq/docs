import type { Theme } from "vitepress";
import { h } from "vue";
import DefaultTheme from "vitepress/theme";

// ─── Shared with docs.corefix.dev (not modified) ──────────────────────────
import "../../../.vitepress/theme/custom.css";
import "../../../.vitepress/theme/Footer.css";
import CustomFooter from "../../../.vitepress/theme/CustomFooter.vue";

// ─── Blog editorial design system ─────────────────────────────────────────
import "./blog.css";

// ─── Blog components ──────────────────────────────────────────────────────
import BlogHome from "./BlogHome.vue";
import BlogHero from "./BlogHero.vue";
import BlogCard from "./BlogCard.vue";
import BlogGrid from "./BlogGrid.vue";
import CategoryFilter from "./CategoryFilter.vue";
import FeaturedPost from "./FeaturedPost.vue";
import FeaturedPosts from "./FeaturedPosts.vue";
import RelatedPosts from "./RelatedPosts.vue";
import DocumentationCTA from "./DocumentationCTA.vue";
import ReadingProgress from "./ReadingProgress.vue";
import BlogPostMeta from "./BlogPostMeta.vue";
import BlogPostNav from "./BlogPostNav.vue";

export default {
  extends: DefaultTheme,

  enhanceApp({ app }) {
    app.component("BlogHome", BlogHome);
    app.component("BlogHero", BlogHero);
    app.component("BlogCard", BlogCard);
    app.component("BlogGrid", BlogGrid);
    app.component("CategoryFilter", CategoryFilter);
    app.component("FeaturedPost", FeaturedPost);
    app.component("FeaturedPosts", FeaturedPosts);
    app.component("RelatedPosts", RelatedPosts);
    app.component("DocumentationCTA", DocumentationCTA);
  },

  Layout() {
    return h(DefaultTheme.Layout, null, {
      // Reading progress bar — fixed at top, self-hides on non-post pages
      "layout-top": () => h(ReadingProgress),
      // Blog post meta header (cover, title, byline, tags)
      "doc-before": () => h(BlogPostMeta),
      // Prev/next navigation + related articles
      "doc-after": () => h(BlogPostNav),
      // Shared footer
      "layout-bottom": () => h(CustomFooter),
    });
  },
} satisfies Theme;
