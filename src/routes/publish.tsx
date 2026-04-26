import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const PublishPage = lazy(() => import("../pages/PublishPage"));

export const Route = createFileRoute("/publish")({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <PublishPage />
    </Suspense>
  ),
});
