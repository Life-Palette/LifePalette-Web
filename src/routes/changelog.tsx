import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { History, ArrowLeft } from "lucide-react";
import { ChangelogList } from "@/components/changelog";
import KeepAlivePage from "@/components/common/KeepAlivePage";
import ScrollRestoreContainer from "@/components/common/ScrollRestoreContainer";
import { Button } from "@/components/ui/button";
import { useChangelogs } from "@/hooks/useChangelog";

function ChangelogPage() {
  const { data, isLoading, hasNextPage, fetchNextPage } = useChangelogs({
    pageSize: 10,
  });

  // 合并所有页面的数据
  const changelogs = useMemo(() => {
    if (!data?.pages) {
      return [];
    }
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-background">
      {/* 页面头部 */}
      <div className="sticky top-0 z-10 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 px-4 py-4">
          <Link to="/">
            <Button className="h-8 w-8" size="icon" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground text-xl">更新日志</h1>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4" id="changelog-scroll-container">
        <ChangelogList
          changelogs={changelogs}
          hasMore={hasNextPage || false}
          isLoading={isLoading}
          onLoadMore={() => fetchNextPage()}
        />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/changelog")({
  component: () => (
    <KeepAlivePage enableScrollRestore={false} name="changelog">
      <ScrollRestoreContainer className="h-screen overflow-auto" pageKey="changelog">
        <ChangelogPage />
      </ScrollRestoreContainer>
    </KeepAlivePage>
  ),
});
