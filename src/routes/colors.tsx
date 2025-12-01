import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import KeepAlivePage from "@/components/common/KeepAlivePage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ScrollRestoreContainer from "@/components/common/ScrollRestoreContainer";

// 懒加载页面组件
const ColorPalettePage = lazy(() => import("../pages/ColorPalettePage"));

export const Route = createFileRoute("/colors")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="colors">
      <ScrollRestoreContainer className="h-screen overflow-auto" pageKey="colors">
        <Suspense fallback={<LoadingSpinner />}>
          <ColorPalettePage />
        </Suspense>
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
