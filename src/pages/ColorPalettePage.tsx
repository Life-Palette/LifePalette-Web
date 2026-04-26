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
import { adaptPage, filesApi } from "@/services/api";

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
      const response = await filesApi.getColorStats({
        page: pageParam,
        page_size: pageSize,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const pg = adaptPage(lastPage?.result);
      return pg.page < pg.totalPages ? pg.page + 1 : undefined;
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
      const response = await filesApi.getByColor({
        hex: selectedColor?.hex || "",
        page: pageParam,
        page_size: 20,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const pg = adaptPage(lastPage?.result);
      return pg.page < pg.totalPages ? pg.page + 1 : undefined;
    },
    enabled: !!selectedColor?.hex && !!user?.id,
  });

  // 处理颜色数据 - Go 后端返回格式: { color_id, hex, r, g, b, file_count, file?: { url, blurhash, width, height } }
  const colors = useMemo(() => {
    const allPages = colorStatsData?.pages || [];
    const allItems: ColorItem[] = [];

    allPages.forEach((page) => {
      const list = page?.result?.list || [];
      list.forEach((item: any) => {
        const representativeImage = item.file?.url
          ? { url: item.file.url, blurhash: item.file.blurhash || "" }
          : undefined;

        allItems.push({
          id: item.color_id,
          hex: item.hex,
          count: item.file_count || 0,
          percentage: item.percentage,
          isPrimary: false,
          rgb: { r: item.r, g: item.g, b: item.b },
          representativeImage,
        });
      });
    });

    return allItems;
  }, [colorStatsData]);

  // 总颜色数和图片数
  const totalColors = colorStatsData?.pages?.[0]?.result?.pagination?.total || colors.length;
  const totalImages = colors.reduce((acc, c) => acc + c.count, 0);

  // 相关文件 - Go 后端返回格式: { sec_uid, name, url, type, width, height, blurhash, created_at }
  const relatedFiles = useMemo(() => {
    const allPages = colorFilesData?.pages || [];
    const allFiles: FileItem[] = [];

    allPages.forEach((page) => {
      const list = page?.result?.list || [];
      list.forEach((item: any) => {
        allFiles.push({
          id: item.sec_uid || item.id,
          url: item.url,
          name: item.name || "",
          blurhash: item.blurhash || "",
          width: item.width || 400,
          height: item.height || 400,
          type: item.type || "image/jpeg",
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
  const lastItem = virtualItems.at(-1);

  useEffect(() => {
    if (!lastItem) {
      return;
    }
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
        <div className="relative sticky top-0 z-40 border-border/20 border-b bg-background/50 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex items-center justify-between">
              {/* 左侧：标题 + 统计标签 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <h1 className="font-semibold text-xl">色集</h1>
                </div>
                {!isLoading && (
                  <div className="hidden items-center gap-2 sm:flex">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary text-xs">
                      {totalColors} 色
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-muted-foreground text-xs">
                      {totalImages.toLocaleString()} 图
                    </span>
                  </div>
                )}
              </div>

              {/* 右侧：视图切换 */}
              <div className="flex items-center gap-1 rounded-xl bg-muted/50 p-1">
                <Button
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => setViewMode("grid")}
                  size="sm"
                  variant={viewMode === "grid" ? "default" : "ghost"}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  className="h-8 w-8 rounded-lg p-0"
                  onClick={() => setViewMode("list")}
                  size="sm"
                  variant={viewMode === "list" ? "default" : "ghost"}
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
              <h3 className="mt-6 font-semibold text-lg">暂无色彩数据</h3>
              <p className="mt-2 max-w-xs text-center text-muted-foreground text-sm">
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
                <span className="font-medium text-muted-foreground text-xs">全部颜色</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>

              {/* 颜色网格 */}
              <div
                className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/30 overflow-auto"
                ref={parentRef}
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
                        className={cn(
                          viewMode === "grid"
                            ? "grid grid-cols-3 gap-4 pb-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
                            : "space-y-3 pb-3"
                        )}
                        data-index={virtualRow.index}
                        key={virtualRow.key}
                        ref={virtualizer.measureElement}
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        {rowColors.map((color, idx) => (
                          <ColorCard
                            color={color}
                            index={startIndex + idx}
                            isSelected={selectedColor?.id === color.id}
                            key={color.id}
                            onClick={() => setSelectedColor(color)}
                            viewMode={viewMode}
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
                    <span className="text-muted-foreground text-xs">共 {totalColors} 种颜色</span>
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
            hasMore={!!hasMoreFiles}
            isFetchingMore={isFetchingMoreFiles}
            isLoading={isLoadingFiles}
            onClose={() => setSelectedColor(null)}
            onLoadMore={fetchNextFiles}
          />
        )}
      </div>
    </PageLayout>
  );
}
