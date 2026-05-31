import { h } from 'vue'
import Theme from 'vitepress/theme'
import './custom.css'

export default {
  ...Theme,
  Layout() {
    return h(Theme.Layout, null, {
      // You can add custom layout components here if needed
    })
  }
}
