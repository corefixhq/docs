import type { Theme } from "vitepress";
import { h } from "vue";
import DefaultTheme from "vitepress/theme";
import { enhanceAppWithTabs } from "vitepress-plugin-tabs/client";
import "./custom.css";
import "./Footer.css";
import CustomFooter from "./CustomFooter.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithTabs(app);
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "layout-bottom": () => h(CustomFooter),
    });
  },
} satisfies Theme;
