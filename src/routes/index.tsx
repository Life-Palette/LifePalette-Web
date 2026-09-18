import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import KeepAlivePage from "@/components/common/keep-alive-page";
import LoadingSpinner from "@/components/common/loading-spinner";
import ScrollRestoreContainer from "@/components/common/scroll-restore-container";

// 懒加载页面组件
const HomePage = lazy(() => import("../pages/home-page"));

export const Route = createFileRoute("/")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="home">
      <ScrollRestoreContainer className="h-screen overflow-auto" pageKey="home">
        <Suspense fallback={<LoadingSpinner />}>
          <HomePage />
        </Suspense>
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
