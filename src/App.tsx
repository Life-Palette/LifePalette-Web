import { createRouter, RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { ThemeProvider } from "@/components/common/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { routeTree } from "@/routeTree.gen";
import { performanceMonitor } from "@/utils/performance";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  // 启动性能监控
  useEffect(() => {
    if (import.meta.env.PROD) {
      performanceMonitor.start();

      // 在页面卸载时发送性能数据
      window.addEventListener("beforeunload", () => {
        performanceMonitor.sendToAnalytics();
      });
    }

    return () => {
      performanceMonitor.stop();
    };
  }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="life-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
