import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import KeepAlivePage from "@/components/common/KeepAlivePage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ScrollRestoreContainer from "@/components/common/ScrollRestoreContainer";

// 懒加载页面组件
const HomePage = lazy(() => import("../pages/HomePage"));

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
