import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import KeepAlivePage from "@/components/common/KeepAlivePage";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ScrollRestoreContainer from "@/components/common/ScrollRestoreContainer";

const SearchPageWrapper = lazy(() => import("../pages/SearchPageWrapper"));

export const Route = createFileRoute("/search")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="search">
      <ScrollRestoreContainer className="h-screen overflow-auto" pageKey="search">
        <Suspense fallback={<LoadingSpinner />}>
          <SearchPageWrapper />
        </Suspense>
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
