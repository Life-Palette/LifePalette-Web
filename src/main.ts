// https://unocss.dev/ 原子 css 库
import '@unocss/reset/tailwind-compat.css' // unocss reset
import 'virtual:uno.css'
import 'virtual:unocss-devtools'
import 'element-plus/dist/index.css'

// 你自定义的 css
import './styles/main.css'

import App from './App.vue'
import { MotionPlugin } from '@vueuse/motion'
import { type Directive } from 'vue'
// 自定义指令
import * as directives from '@/directives'

const app = createApp(App)
Object.keys(directives).forEach((key) => {
	app.directive(key, (directives as { [key: string]: Directive })[key])
})

app.use(MotionPlugin)

app.mount('#app')
