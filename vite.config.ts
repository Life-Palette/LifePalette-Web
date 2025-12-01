import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./", // 使用相对路径，支持任意目录部署
  plugins: [
    tailwindcss(),
    react({
      babel: {
        plugins: ["react-activation/babel"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库
          "react-vendor": ["react", "react-dom"],
          // 路由相关
          router: ["@tanstack/react-router"],
          // React Query
          query: ["@tanstack/react-query"],
          // UI 组件库 - Radix UI
          "radix-ui": [
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-scroll-area",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-toolbar",
            "@radix-ui/react-tooltip",
          ],
          // 地图相关
          map: ["mapbox-gl", "@mapbox/mapbox-gl-language"],
          // 编辑器相关
          editor: ["platejs", "@platejs/basic-nodes", "slate", "slate-history", "slate-react"],
          // 拖拽相关
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          // 图片处理
          image: ["blurhash", "react-blurhash", "browser-image-compression", "react-easy-crop"],
          // 工具库
          utils: ["clsx", "tailwind-merge", "dompurify", "spark-md5"],
        },
      },
    },
    // 提高 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
    // 图片资源优化 - 小于 4KB 的图片转 base64
    assetsInlineLimit: 4096,
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生产环境移除 console
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    port: 9527,
  },
});
