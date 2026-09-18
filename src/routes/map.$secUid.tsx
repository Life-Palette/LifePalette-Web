/* biome-ignore-all lint/style/useFilenamingConvention: TanStack Router route params require this filename */

import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/common/loading-spinner";

const SharedMapPage = lazy(() => import("../pages/shared-map-page"));

export const Route = createFileRoute("/map/$secUid")({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <SharedMapPage />
    </Suspense>
  ),
});
