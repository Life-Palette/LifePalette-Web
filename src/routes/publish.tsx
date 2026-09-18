import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/common/loading-spinner";

const PublishPage = lazy(() => import("../pages/publish-page"));

export const Route = createFileRoute("/publish")({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <PublishPage />
    </Suspense>
  ),
});
