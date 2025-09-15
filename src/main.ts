import type { Directive } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
// 自定义指令
import * as directives from '@/directives'
import { destroyEruda } from '@/utils/eruda'

import App from './App.vue'
// TailwindCSS 和 shadcn-vue 样式
import '@/assets/index.css'
import 'element-plus/dist/index.css'
// 你自定义的 css
import './styles/main.css'

const app = createApp(App)
Object.keys(directives).forEach((key) => {
  app.directive(key, (directives as { [key: string]: Directive })[key])
})

app.use(MotionPlugin)

app.mount('#app')

// initEruda()
// 监听卸载操作
window.addEventListener('unmount', () => {
	destroyEruda()
	app.unmount()
})
