import { useInfiniteQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Grid3X3, LayoutList, Loader2, Palette } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ColorCard,
  ColorDetailPanel,
  type ColorItem,
  ColorPaletteSkeleton,
  ColorPaletteWheel,
  type FileItem,
} from "@/components/colors";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { apiService } from "@/services/api";

export default function ColorPalettePage() {
  const { user } = useIsAuthenticated();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedColor, setSelectedColor] = useState<ColorItem | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const pageSize = 50;

  // 获取颜色统计数据 - 使用无限滚动
  const {
    data: colorStatsData,
    isLoading: isLoadingStats,
    fetchNextPage: fetchNextColors,
    hasNextPage: hasMoreColors,
    isFetchingNextPage: isFetchingMoreColors,
  } = useInfiniteQuery({
    queryKey: ["colorStats", user?.id],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getColorStats({
        userId: user?.id,
        page: pageParam,
        size: pageSize,
        sort: "count:desc",
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.result?.pagination;
      if (!pagination) return undefined;
      const { page, totalPages } = pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!user?.id,
  });

  // 获取选中颜色的相关文件 - 使用无限滚动
  const {
    data: colorFilesData,
    isLoading: isLoadingFiles,
    fetchNextPage: fetchNextFiles,
    hasNextPage: hasMoreFiles,
    isFetchingNextPage: isFetchingMoreFiles,
  } = useInfiniteQuery({
    queryKey: ["colorFiles", selectedColor?.hex, user?.id],
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getFilesByColor({
        hex: selectedColor?.hex,
        userId: user?.id,
        page: pageParam,
        size: 20,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.result?.pagination;
      if (!pagination) return undefined;
      const { page, totalPages } = pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: !!selectedColor?.hex && !!user?.id,
  });

  // 处理颜色数据 - API返回格式: { color: { id, hex, r, g, b }, count, file?: {...} }
  const colors = useMemo(() => {
    const allPages = colorStatsData?.pages || [];
    const allItems: ColorItem[] = [];

    allPages.forEach((page) => {
      const list = page?.result?.list || [];
      list.forEach((item: any) => {
        // 提取代表图片
        const file = item.file || item.representativeFile;
        const representativeImage = file?.url
          ? { url: file.url, blurhash: file.blurhash }
          : undefined;

        allItems.push({
          id: item.color?.id || item.id,
          hex: item.color?.hex || item.hex,
          count: item.count || item._count || 0,
          percentage: item.percentage,
          isPrimary: item.isPrimary,
          rgb: item.color ? { r: item.color.r, g: item.color.g, b: item.color.b } : undefined,
          representativeImage,
        });
      });
    });

    return allItems;
  }, [colorStatsData]);

  // 总颜色数和图片数
  const totalColors = colorStatsData?.pages?.[0]?.result?.pagination?.total || colors.length;
  const totalImages = colors.reduce((acc, c) => acc + c.count, 0);

  // 相关文件 - 转换为 PostImage 格式
  const relatedFiles = useMemo(() => {
    const allPages = colorFilesData?.pages || [];
    const allFiles: FileItem[] = [];

    allPages.forEach((page) => {
      const list = page?.result?.list || [];
      list.forEach((item: any) => {
        const file = item.file || item;
        allFiles.push({
          id: file.id || item.fileId,
          url: file.url || item.url,
          name: file.name || file.fileName || item.name || "",
          blurhash: file.blurhash || item.blurhash || "",
          width: file.width || 400,
          height: file.height || 400,
          type: file.type || file.mimeType || "image/jpeg",
        } as FileItem);
      });
    });

    return allFiles;
  }, [colorFilesData]);

  // 虚拟列表配置 - 用于颜色网格
  const columnCount = viewMode === "grid" ? 6 : 1;
  const rowCount = Math.ceil(colors.length / columnCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => (viewMode === "grid" ? 200 : 90), [viewMode]),
    overscan: 3,
  });

  // 监听滚动到底部加载更多颜色
  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;
    if (lastItem.index >= rowCount - 3 && hasMoreColors && !isFetchingMoreColors) {
      fetchNextColors();
    }
  }, [lastItem, rowCount, hasMoreColors, isFetchingMoreColors, fetchNextColors]);

  const isLoading = isLoadingStats;

  return (
    <PageLayout activeTab="colors" title="色集">
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        {/* 装饰性背景 */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute top-1/2 -left-32 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
        </div>

        {/* 简洁头部 */}
        <div className="relative border-b border-border/20 bg-background/50 backdrop-blur-xl sticky top-0 z-40">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex items-center justify-between">
              {/* 左侧：标题 + 统计标签 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <h1 className="text-xl font-semibold">色集</h1>
                </div>
                {!isLoading && (
                  <div className="hidden sm:flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {totalColors} 色
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      {totalImages.toLocaleString()} 图
                    </span>
                  </div>
                )}
              </div>

              {/* 右侧：视图切换 */}
              <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => setViewMode("list")}
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 主内容区 */}
        <div className="relative mx-auto max-w-6xl px-4 py-6">
          {isLoading ? (
            <ColorPaletteSkeleton viewMode={viewMode} />
          ) : colors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="relative">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-muted ring-1 ring-border/50">
                  <Palette className="h-12 w-12 text-muted-foreground/40" />
                </div>
              </div>
              <h3 className="mt-6 text-lg font-semibold">暂无色彩数据</h3>
              <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
                上传图片后，AI 将自动提取主色调
              </p>
            </div>
          ) : (
            <>
              {/* 调色盘区域 - 居中突出 */}
              <div className="mb-8 flex justify-center">
                <ColorPaletteWheel
                  colors={colors}
                  onColorClick={setSelectedColor}
                  selectedColor={selectedColor}
                />
              </div>

              {/* 分隔线 + 标题 */}
              <div className="mb-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <span className="text-xs font-medium text-muted-foreground">全部颜色</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* 颜色网格 */}
              <div
                ref={parentRef}
                className="overflow-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/30"
                style={{ height: "calc(100vh - 520px)", minHeight: "300px" }}
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const startIndex = virtualRow.index * columnCount;
                    const rowColors = colors.slice(startIndex, startIndex + columnCount);

                    return (
                      <div
                        key={virtualRow.key}
                        data-index={virtualRow.index}
                        ref={virtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                        className={cn(
                          viewMode === "grid"
                            ? "grid grid-cols-3 gap-4 pb-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                            : "space-y-3 pb-3",
                        )}
                      >
                        {rowColors.map((color, idx) => (
                          <ColorCard
                            key={color.id}
                            color={color}
                            onClick={() => setSelectedColor(color)}
                            isSelected={selectedColor?.id === color.id}
                            viewMode={viewMode}
                            index={startIndex + idx}
                          />
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* 加载更多 */}
                {isFetchingMoreColors && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!hasMoreColors && colors.length > 0 && (
                  <div className="py-6 text-center">
                    <span className="text-xs text-muted-foreground">共 {totalColors} 种颜色</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 颜色详情面板 */}
        {selectedColor && (
          <ColorDetailPanel
            color={selectedColor}
            files={relatedFiles}
            isLoading={isLoadingFiles}
            isFetchingMore={isFetchingMoreFiles}
            hasMore={!!hasMoreFiles}
            onLoadMore={fetchNextFiles}
            onClose={() => setSelectedColor(null)}
          />
        )}
      </div>
    </PageLayout>
  );
}
