import type { Directive } from 'vue' // unocss reset
import { destroyEruda } from '@/utils/eruda'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'

// https://unocss.dev/ 原子 css 库
import '@unocss/reset/tailwind-compat.css'
import 'virtual:uno.css'
import 'virtual:unocss-devtools'
import 'element-plus/dist/index.css'
// 你自定义的 css
import './styles/main.css'
// 自定义指令
import * as directives from '@/directives'

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
