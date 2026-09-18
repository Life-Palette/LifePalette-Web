import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import KeepAlivePage from "@/components/common/keep-alive-page";
import LoadingSpinner from "@/components/common/loading-spinner";
import ScrollRestoreContainer from "@/components/common/scroll-restore-container";

// 懒加载页面组件
const ColorPalettePage = lazy(() => import("../pages/color-palette-page"));

export const Route = createFileRoute("/colors")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="colors">
      <ScrollRestoreContainer
        className="h-screen overflow-auto"
        pageKey="colors"
      >
        <Suspense fallback={<LoadingSpinner />}>
          <ColorPalettePage />
        </Suspense>
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
