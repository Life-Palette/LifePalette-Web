import { useVirtualizer } from "@tanstack/react-virtual";
import { Check, Copy, Image, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ImagePreview from "@/components/media/ImagePreview";
import OptimizedImage from "@/components/media/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { type ColorItem, type FileItem, getLuminance, hexToRgb } from "./types";

interface ColorDetailPanelProps {
  color: ColorItem | null;
  files: FileItem[];
  hasMore: boolean;
  isFetchingMore: boolean;
  isLoading: boolean;
  onClose: () => void;
  onLoadMore: () => void;
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
  const lastItem = virtualItems.at(-1);

  useEffect(() => {
    if (!lastItem) {
      return;
    }
    if (lastItem.index >= rowCount - 2 && hasMore && !isFetchingMore) {
      onLoadMore();
    }
  }, [lastItem, rowCount, hasMore, isFetchingMore, onLoadMore]);

  // 打开图片预览
  const handleImageClick = (index: number) => {
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  if (!color) {
    return null;
  }

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
      <Dialog onOpenChange={(open) => !open && onClose()} open={!!color}>
        <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          {/* 颜色展示区 */}
          <div
            className="relative h-48 w-full flex-shrink-0"
            style={{ backgroundColor: color.hex }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("font-bold font-mono text-3xl tracking-wider", textColor)}>
                {color.hex.toUpperCase()}
              </span>
              {rgb && (
                <span className={cn("mt-2 font-mono text-sm opacity-80", textColor)}>
                  RGB({rgb.r}, {rgb.g}, {rgb.b})
                </span>
              )}
              <Button
                className={cn(
                  "mt-4 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30",
                  textColor
                )}
                onClick={handleCopy}
                size="sm"
                variant="ghost"
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
            <div className="absolute right-0 bottom-0 left-0 h-8 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* 相关图片区 - 虚拟列表 */}
          <div className="flex min-h-0 flex-1 flex-col p-6">
            <div className="mb-4 flex flex-shrink-0 items-center gap-2">
              <Image className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">包含此颜色的图片</h3>
              <span className="text-muted-foreground text-sm">({color.count})</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton className="aspect-square rounded-lg" key={i} />
                ))}
              </div>
            ) : files.length > 0 ? (
              <div
                className="min-h-0 flex-1 overflow-auto"
                ref={parentRef}
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
                        className="grid grid-cols-3 gap-3 pb-3"
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
                        {rowFiles.map((file, idx) => {
                          const globalIndex = startIndex + idx;
                          return (
                            <div
                              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted"
                              key={file.id}
                              onClick={() => handleImageClick(globalIndex)}
                            >
                              <OptimizedImage
                                className="h-full w-full transition-transform duration-300 group-hover:scale-110"
                                image={file}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <span className="font-medium text-white text-xs">点击预览</span>
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
                    <span className="ml-2 text-muted-foreground text-sm">加载中...</span>
                  </div>
                )}
                {!hasMore && files.length > 0 && (
                  <div className="py-4 text-center text-muted-foreground text-sm">已加载全部</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 opacity-50" />
                <p className="mt-2 text-sm">暂无相关图片</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
