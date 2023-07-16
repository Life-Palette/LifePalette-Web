import { createApp } from 'vue'
import { router } from './router'
import routes from 'virtual:generated-pages'

import App from './App.vue'

import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { MotionPlugin } from '@vueuse/motion'

import 'element-plus/dist/index.css'
import './styles/main.css'
// import '@unocss/reset/tailwind.css'
import 'uno.css'
import { VueMasonryPlugin } from 'vue-masonry';

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)

app.use(MotionPlugin)
app.use(pinia)
app.use(router)
app.use(VueMasonryPlugin)

app.mount('#app')
