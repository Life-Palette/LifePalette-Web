import { createApp } from "vue";
import { router } from "./router";
import routes from "virtual:generated-pages";

import App from "./App.vue";

import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { MotionPlugin } from "@vueuse/motion";

import "element-plus/dist/index.css";
import "./styles/main.css";
// import '@unocss/reset/tailwind.css'
import "uno.css";
import { VueMasonryPlugin } from "vue-masonry";
import FloatingVue from "floating-vue";
import "floating-vue/dist/style.css";
import Toast from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

// 自定义指令
// 自定义指令
import * as directives from "~/directives";
const app = createApp(App);
Object.keys(directives).forEach((key) => {
  app.directive(key, directives[key]);
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);


app.use(MotionPlugin);
app.use(pinia);
app.use(router);
app.use(VueMasonryPlugin);
app.use(FloatingVue);
const optionsToast = {
  // You can set your default options here
  maxToasts: 3,
  timeout: 1500,
  closeOnClick: true,
  pauseOnFocusLoss: true,
};
app.use(Toast, optionsToast);

app.mount("#app");
