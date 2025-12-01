import { useVirtualizer } from "@tanstack/react-virtual";
import { Bell } from "lucide-react";
import { useEffect, useRef } from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import NotificationItem from "@/components/notification/NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";
import type { NotificationMessage } from "@/types";

interface NotificationListProps {
  notifications: NotificationMessage[];
  hasMore: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRefresh?: () => void;
}

// 骨架屏组件
function NotificationSkeleton() {
  return (
    <div className="border-border border-b p-4">
      <div className="flex gap-3">
        <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationList({
  notifications,
  hasMore,
  isLoading,
  isFetchingNextPage,
  onLoadMore,
  onRefresh,
}: NotificationListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // 使用 TanStack Virtual 进行虚拟化
  const virtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // 估计每个通知项的高度
    overscan: 5, // 预渲染5个项目
  });

  // 监听滚动到底部，触发加载更多
  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;

    // 当滚动到最后5个项目时，触发加载更多
    if (lastItem.index >= notifications.length - 5 && hasMore && !isFetchingNextPage) {
      onLoadMore();
    }
  }, [lastItem, notifications.length, hasMore, isFetchingNextPage, onLoadMore]);

  // 初始加载状态
  if (isLoading && notifications.length === 0) {
    return (
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, index) => (
          <NotificationSkeleton key={index} />
        ))}
      </div>
    );
  }

  // 空状态
  if (notifications.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Bell className="text-muted-foreground" size={40} />
        </div>
        <p className="mb-2 font-medium text-foreground text-lg">暂无通知</p>
        <p className="text-muted-foreground text-sm">当有人与你的内容互动时，通知会显示在这里</p>
      </div>
    );
  }

  return (
    <div>
      {/* 虚拟化通知列表 */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{
          height: "calc(100vh - 200px)", // 根据实际布局调整
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const notification = notifications[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="border-b border-border"
              >
                <NotificationItem notification={notification} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 加载状态 */}
      {isFetchingNextPage && (
        <div className="flex flex-col items-center gap-2 py-8">
          <LoadingSpinner size="md" />
          <p className="text-muted-foreground text-sm">加载中...</p>
        </div>
      )}
      {!hasMore && notifications.length > 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground text-sm">已经到底了～</p>
        </div>
      )}
    </div>
  );
}
