import { h } from "vue";
import Theme from "vitepress/theme";
import "./custom.css";
import "./Footer.css";
import CustomFooter from "./CustomFooter.vue";

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      "layout-bottom": () => h(CustomFooter),
    });
  },
};
