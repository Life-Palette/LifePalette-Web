import { FileText } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { Changelog } from "@/types";
import ChangelogCard from "./ChangelogCard";

interface ChangelogListProps {
  changelogs: Changelog[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export default function ChangelogList({
  changelogs,
  isLoading,
  hasMore,
  onLoadMore,
}: ChangelogListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !isLoading) {
        onLoadMore();
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0,
    });
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }
    return () => observer.disconnect();
  }, [handleObserver]);

  // 加载状态
  if (isLoading && changelogs.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  // 空状态
  if (!changelogs || changelogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <FileText className="mb-4 h-16 w-16 opacity-30" />
        <p className="font-medium text-lg">暂无更新日志</p>
        <p className="mt-1 text-sm">敬请期待新版本发布</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {changelogs.map((changelog) => (
          <ChangelogCard changelog={changelog} key={changelog.id} />
        ))}
      </div>
      <div className="py-8 text-center" ref={sentinelRef}>
        {isLoading && (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {!hasMore && changelogs.length > 0 && (
          <p className="text-muted-foreground text-sm">已经到底了</p>
        )}
      </div>
    </div>
  );
}
