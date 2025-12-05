import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AliveScope } from "react-activation";
import EmailBindChecker from "@/components/auth/EmailBindChecker";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { queryClient } from "@/lib/query-client";

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AliveScope>
          <div className="min-h-screen bg-background text-foreground">
            <Outlet />
          </div>
          {/* 邮箱绑定检查弹窗 */}
          <EmailBindChecker />
        </AliveScope>
      </ErrorBoundary>
      {/* React Query DevTools - 仅在开发环境显示 */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  ),
});
