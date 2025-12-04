import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const SharedMapPage = lazy(() => import("../pages/SharedMapPage"));

export const Route = createFileRoute("/map/$secUid")({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <SharedMapPage />
    </Suspense>
  ),
});
