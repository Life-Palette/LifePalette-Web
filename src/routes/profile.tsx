import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/common/loading-spinner";

const ProfilePageWrapper = lazy(() => import("../pages/profile-page-wrapper"));

export const Route = createFileRoute("/profile")({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfilePageWrapper />
    </Suspense>
  ),
  validateSearch: (search: Record<string, unknown>) => ({
    tab: search.tab as
      | "posts"
      | "photos"
      | "track"
      | "liked"
      | "saved"
      | undefined,
    userId: search.userId as string | undefined,
  }),
});
