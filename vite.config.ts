import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
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
  build: {
    // 代码分割优化
    rolldownOptions: {
      output: {
        manualChunks(id: string) {
          // React 核心库
          if (id.includes("react-dom") || (id.includes("/react/") && !id.includes("react-"))) {
            return "react-vendor";
          }
          // 路由相关
          if (id.includes("@tanstack/react-router")) {
            return "router";
          }
          // React Query
          if (id.includes("@tanstack/react-query")) {
            return "query";
          }
          // UI 组件库 - Radix UI
          if (id.includes("@radix-ui/")) {
            return "radix-ui";
          }
          // 地图相关
          if (id.includes("mapbox-gl") || id.includes("@mapbox/")) {
            return "map";
          }
          // 编辑器相关
          if (id.includes("platejs") || id.includes("@platejs/") || id.includes("slate")) {
            return "editor";
          }
          // 拖拽相关
          if (id.includes("@dnd-kit/")) {
            return "dnd";
          }
          // 图片处理
          if (id.includes("blurhash") || id.includes("browser-image-compression") || id.includes("react-easy-crop")) {
            return "image";
          }
          // 工具库
          if (id.includes("clsx") || id.includes("tailwind-merge") || id.includes("dompurify") || id.includes("spark-md5")) {
            return "utils";
          }
        },
      },
    },
    // 提高 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
  },
  // 生产环境移除 console 和 debugger（Vite 8 使用 Oxc 替代 esbuild）
  oxc: {
    drop: ["console", "debugger"],
  },
  server: {
    port: 9527,
  },
});
