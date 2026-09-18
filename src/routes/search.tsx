import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import KeepAlivePage from "@/components/common/keep-alive-page";
import LoadingSpinner from "@/components/common/loading-spinner";
import ScrollRestoreContainer from "@/components/common/scroll-restore-container";

const SearchPageWrapper = lazy(() => import("../pages/search-page-wrapper"));

export const Route = createFileRoute("/search")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="search">
      <ScrollRestoreContainer
        className="h-screen overflow-auto"
        pageKey="search"
      >
        <Suspense fallback={<LoadingSpinner />}>
          <SearchPageWrapper />
        </Suspense>
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
