import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, Copy, Image, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ImagePreview from "@/components/media/ImagePreview";
import OptimizedImage from "@/components/media/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type ColorItem, type FileItem, getLuminance, hexToRgb } from "./types";

interface ColorDetailPanelProps {
  color: ColorItem | null;
  files: FileItem[];
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onClose: () => void;
}

export default function ColorDetailPanel({
  color,
  files,
  isLoading,
  isFetchingMore,
  hasMore,
  onLoadMore,
  onClose,
}: ColorDetailPanelProps) {
  const [copied, setCopied] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);

  // 每行3个，计算行数
  const rowCount = Math.ceil(files.length / 3);

  // 虚拟列表配置
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 120, []),
    overscan: 2,
  });

  // 监听滚动到底部
  const virtualItems = virtualizer.getVirtualItems();
  const lastItem = virtualItems[virtualItems.length - 1];

  useEffect(() => {
    if (!lastItem) return;
    if (lastItem.index >= rowCount - 2 && hasMore && !isFetchingMore) {
      onLoadMore();
    }
  }, [lastItem, rowCount, hasMore, isFetchingMore, onLoadMore]);

  // 打开图片预览
  const handleImageClick = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  if (!color) return null;

  const rgb = hexToRgb(color.hex);
  const luminance = getLuminance(color.hex);
  const textColor = luminance > 0.5 ? "text-black" : "text-white";

  const handleCopy = () => {
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-background/95 backdrop-blur-xl flex flex-col">
          {/* 关闭按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* 颜色展示区 */}
          <div
            className="relative h-48 w-full flex-shrink-0"
            style={{ backgroundColor: color.hex }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("font-mono text-3xl font-bold tracking-wider", textColor)}>
                {color.hex.toUpperCase()}
              </span>
              {rgb && (
                <span className={cn("mt-2 font-mono text-sm opacity-80", textColor)}>
                  RGB({rgb.r}, {rgb.g}, {rgb.b})
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "mt-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30",
                  textColor,
                )}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> 已复制
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> 复制色值
                  </>
                )}
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* 相关图片区 - 虚拟列表 */}
          <div className="flex-1 flex flex-col min-h-0 p-6">
            <div className="mb-4 flex items-center gap-2 flex-shrink-0">
              <Image className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">包含此颜色的图片</h3>
              <span className="text-sm text-muted-foreground">({color.count})</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : files.length > 0 ? (
              <div
                ref={parentRef}
                className="flex-1 overflow-auto min-h-0"
                style={{ maxHeight: "300px" }}
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualRow) => {
                    const startIndex = virtualRow.index * 3;
                    const rowFiles = files.slice(startIndex, startIndex + 3);

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
                        className="grid grid-cols-3 gap-3 pb-3"
                      >
                        {rowFiles.map((file, idx) => {
                          const globalIndex = startIndex + idx;
                          return (
                            <div
                              key={file.id}
                              className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
                              onClick={() => handleImageClick(globalIndex)}
                            >
                              <OptimizedImage
                                image={file}
                                className="h-full w-full transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">点击预览</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                {/* 加载更多指示器 */}
                {isFetchingMore && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">加载中...</span>
                  </div>
                )}
                {!hasMore && files.length > 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">已加载全部</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 opacity-50" />
                <p className="mt-2 text-sm">暂无相关图片</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 图片预览 */}
      <ImagePreview
        images={files}
        initialIndex={previewIndex}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}
