import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const ProfilePageWrapper = lazy(() => import("../pages/ProfilePageWrapper"));

export const Route = createFileRoute("/profile")({
  component: () => (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfilePageWrapper />
    </Suspense>
  ),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      userId: search.userId as number | undefined,
      tab: search.tab as "posts" | "photos" | "track" | "liked" | "saved" | undefined,
    };
  },
});
