import path from "path";
import { defineConfig } from "vite";
import Vue from "@vitejs/plugin-vue";
import Pages from "vite-plugin-pages";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import Unocss from "unocss/vite";
import VueMacros from "unplugin-vue-macros/vite";
import { viteMockServe } from "vite-plugin-mock";
import legacy from "@vitejs/plugin-legacy";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

import vueJsx from "@vitejs/plugin-vue-jsx";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "~/": `${path.resolve(__dirname, "src")}/`,
      "@build": `${path.resolve(__dirname, "build")}/`,
    },
  },
  plugins: [
    vueJsx(),
    legacy({
      targets: ["defaults", "not IE 11"],
      // legacyPolyfills: false
    }),
    VueMacros({
      plugins: {
        vue: Vue({
          reactivityTransform: true,
        }),
      },
    }),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages(),

    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ["vue", "vue/macros", "@vueuse/core", "pinia", "vue-router"],
      dts: true,
      dirs: ["./src/composables"],
      vueTemplate: true,
      resolvers: [ElementPlusResolver()],
    }),

    // https://github.com/antfu/vite-plugin-components
    Components({
      dts: true,
      resolvers: [ElementPlusResolver()],
    }),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    Unocss(),
  ],
  server: {
    host: "0.0.0.0",
    port: 9527,
    // strictPort: true,
    // open: false
    // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
    proxy: {
      "^/api/.*": {
        target: "http://localhost:3001/api",
        // target: "https://test.wktest.cn:3001/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
