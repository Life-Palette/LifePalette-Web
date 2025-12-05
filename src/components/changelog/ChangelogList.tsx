import { FileText } from "lucide-react";
import InfiniteScroll from "react-infinite-scroll-component";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { Changelog } from "@/types";
import ChangelogCard from "./ChangelogCard";

interface ChangelogListProps {
  changelogs: Changelog[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function ChangelogList({
  changelogs,
  isLoading,
  hasMore,
  onLoadMore,
}: ChangelogListProps) {
  // 加载状态
  if (isLoading) {
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
        <FileText className="h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">暂无更新日志</p>
        <p className="text-sm mt-1">敬请期待新版本发布</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      dataLength={changelogs.length}
      endMessage={<div className="text-center py-8 text-muted-foreground text-sm">已经到底了</div>}
      hasMore={hasMore}
      loader={
        <div className="flex justify-center py-6">
          <LoadingSpinner size="sm" />
        </div>
      }
      next={onLoadMore}
      scrollableTarget="changelog-scroll-container"
    >
      <div className="space-y-3">
        {changelogs.map((changelog) => (
          <ChangelogCard key={changelog.id} changelog={changelog} />
        ))}
      </div>
    </InfiniteScroll>
  );
}
