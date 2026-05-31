import { h } from "vue";
import Theme from "vitepress/theme";
import "./custom.css";
import CustomFooter from "./CustomFooter.vue";

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      footer: () => h(CustomFooter),
    });
  },
};
