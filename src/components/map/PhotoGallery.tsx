import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import OptimizedImage from "@/components/media/OptimizedImage";
import type { PostImage } from "@/types";

interface FileData {
  id: number;
  name: string;
  url: string;
  type: string;
  blurhash: string;
  videoSrc?: string | null;
  fromIphone: boolean;
  width: number;
  height: number;
  lng: number;
  lat: number;
  takenAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PhotoGalleryProps {
  photos: FileData[];
  selectedPhotos: FileData[];
  onPhotoClick: (lng: number, lat: number, file: FileData) => void;
  onClearSelection: () => void;
  width?: number;
  isDark?: boolean;
  isMobile?: boolean;
}

// 工具函数：FileData转PostImage
const fileToPostImage = (file: FileData): PostImage => ({
  id: file.id,
  url: file.url,
  width: file.width,
  height: file.height,
  blurhash: file.blurhash,
  type: file.type,
  name: file.name,
  lat: file.lat,
  lng: file.lng,
  videoSrc: file.videoSrc || null,
});

// 移动端底部抽屉状态
type SheetState = "collapsed" | "half" | "expanded";

export default function PhotoGallery({
  photos,
  selectedPhotos,
  onPhotoClick,
  onClearSelection,
  width = 280,
  isDark = false,
  isMobile = false,
}: PhotoGalleryProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");
  const touchStartY = useRef(0);
  const touchStartState = useRef<SheetState>("collapsed");

  // 显示的照片列表（已选择的或全部）
  const displayPhotos = selectedPhotos.length > 0 ? selectedPhotos : photos;

  // 虚拟列表配置 - 移动端使用更紧凑的尺寸
  const virtualizer = useVirtualizer({
    count: displayPhotos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => {
      if (isMobile) {
        return 80; // 移动端紧凑行高
      }
      // 桌面端：图片区域(4:3比例) + 文字区域
      const imageHeight = (width - 16) * (3 / 4);
      const textHeight = 72;
      return imageHeight + textHeight + 8;
    }, [width, isMobile]),
    overscan: 3,
  });

  // 移动端触摸拖拽处理
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartState.current = sheetState;
    },
    [sheetState],
  );

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    const threshold = 50;

    if (deltaY > threshold) {
      // 上滑 - 展开
      if (touchStartState.current === "collapsed") setSheetState("half");
      else if (touchStartState.current === "half") setSheetState("expanded");
    } else if (deltaY < -threshold) {
      // 下滑 - 收起
      if (touchStartState.current === "expanded") setSheetState("half");
      else if (touchStartState.current === "half") setSheetState("collapsed");
    }
  }, []);

  // 移动端切换抽屉状态
  const toggleSheet = useCallback(() => {
    setSheetState((prev) => {
      if (prev === "collapsed") return "half";
      if (prev === "half") return "expanded";
      return "collapsed";
    });
  }, []);

  // 移动端点击照片后自动收起
  const handleMobilePhotoClick = useCallback(
    (lng: number, lat: number, file: FileData) => {
      onPhotoClick(lng, lat, file);
      if (isMobile) setSheetState("collapsed");
    },
    [onPhotoClick, isMobile],
  );

  // 移动端底部抽屉高度
  const getSheetHeight = () => {
    switch (sheetState) {
      case "collapsed":
        return "3.5rem"; // 仅显示拖拽手柄和标题
      case "half":
        return "45dvh";
      case "expanded":
        return "85dvh";
    }
  };

  // ========== 移动端底部抽屉布局 ==========
  if (isMobile) {
    return (
      <div
        className={`absolute left-0 right-0 bottom-0 z-30 flex flex-col rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] ${
          isDark ? "bg-gray-900/95 backdrop-blur-md" : "bg-white/95 backdrop-blur-md"
        }`}
        style={{
          height: getSheetHeight(),
          transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          maxHeight: "85dvh",
        }}
      >
        {/* 拖拽手柄 + 头部 */}
        <div
          className="flex-shrink-0 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={toggleSheet}
        >
          {/* 拖拽指示条 */}
          <div className="flex justify-center pt-2 pb-1">
            <div className={`h-1 w-10 rounded-full ${isDark ? "bg-gray-600" : "bg-gray-300"}`} />
          </div>

          {/* 头部信息 */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📷</span>
              {selectedPhotos.length > 0 ? (
                <span className="font-semibold text-sm text-blue-500">
                  已选 {selectedPhotos.length} 张
                </span>
              ) : (
                <span
                  className={`font-semibold text-sm ${isDark ? "text-gray-100" : "text-gray-900"}`}
                >
                  旅行相册
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 font-medium text-xs ${
                  isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
                }`}
              >
                {photos.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedPhotos.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSelection();
                  }}
                  className="text-xs text-blue-500"
                >
                  清除
                </button>
              )}
              {sheetState === "collapsed" ? (
                <ChevronUp className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              ) : (
                <ChevronDown className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
              )}
            </div>
          </div>
        </div>

        {/* 照片列表 - 仅在展开时渲染 */}
        {sheetState !== "collapsed" && (
          <div ref={parentRef} className="flex-1 overflow-auto overscroll-contain">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const file = displayPhotos[virtualItem.index];
                const globalIndex = photos.findIndex((p) => p.id === file.id);

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
                    className="px-3 pb-1.5"
                  >
                    {/* 移动端紧凑横向卡片 */}
                    <div
                      className={`flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl p-2 transition-colors active:scale-[0.98] ${
                        isDark
                          ? "bg-gray-800/60 active:bg-gray-800"
                          : "bg-gray-50 active:bg-gray-100"
                      }`}
                      onClick={() => handleMobilePhotoClick(file.lng, file.lat, file)}
                    >
                      {/* 缩略图 */}
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                        <span className="absolute left-0.5 top-0.5 z-10 rounded bg-black/60 px-1 py-0.5 font-bold text-white text-[10px] leading-none">
                          {globalIndex + 1}
                        </span>
                        <OptimizedImage
                          image={fileToPostImage(file)}
                          className="h-full w-full"
                          loading="lazy"
                          quality={60}
                        />
                      </div>
                      {/* 信息 */}
                      <div className="min-w-0 flex-1">
                        <div
                          className={`truncate font-medium text-sm ${
                            isDark ? "text-gray-200" : "text-gray-800"
                          }`}
                        >
                          {file.name || `照片 #${file.id}`}
                        </div>
                        <div
                          className={`mt-0.5 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
                        >
                          {file.takenAt
                            ? new Date(file.takenAt).toLocaleString("zh-CN", {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "未知时间"}
                        </div>
                      </div>
                      {/* 箭头指示 */}
                      <ChevronUp
                        className={`h-4 w-4 -rotate-45 flex-shrink-0 ${
                          isDark ? "text-gray-600" : "text-gray-300"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== 桌面端侧边栏布局（保持不变） ==========
  return (
    <div
      className={`absolute right-0 top-0 bottom-0 flex flex-col border-l shadow-2xl ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
      }`}
      style={{ width: `${width}px` }}
    >
      {/* 固定头部 */}
      <div
        className={`flex-shrink-0 border-b px-4 py-3 ${
          isDark ? "border-gray-700 bg-gray-800/80 backdrop-blur-sm" : "border-gray-200 bg-white"
        }`}
      >
        {selectedPhotos.length > 0 ? (
          // 选择模式
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <span className="font-semibold text-blue-600">
                  已选择 {selectedPhotos.length} 张
                </span>
              </div>
              <button
                onClick={onClearSelection}
                className={`text-xs ${
                  isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                清除
              </button>
            </div>
            <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              共 {photos.length} 张照片
            </div>
          </div>
        ) : (
          // 正常模式
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📷</span>
              <span className={`font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
                旅行相册
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 font-medium text-xs ${
                isDark ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-700"
              }`}
            >
              {photos.length}
            </span>
          </div>
        )}
      </div>

      {/* 虚拟列表容器 */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {/* 虚拟项 - 每个项独立绝对定位 */}
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const file = displayPhotos[virtualItem.index];
            const globalIndex = photos.findIndex((p) => p.id === file.id);

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
                className="px-2 pb-2"
              >
                <div
                  className={`group cursor-pointer overflow-hidden rounded-lg transition-all hover:shadow-lg ${
                    isDark ? "bg-gray-800/50 hover:bg-gray-800/80" : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  onClick={() => onPhotoClick(file.lng, file.lat, file)}
                >
                  {/* 图片区域 */}
                  <div className="relative aspect-[4/3]">
                    <span className="absolute left-2 top-2 z-10 rounded bg-black/70 px-2 py-1 font-bold text-white text-xs backdrop-blur-sm">
                      #{globalIndex + 1}
                    </span>
                    <OptimizedImage
                      image={fileToPostImage(file)}
                      className="h-full w-full"
                      loading="lazy"
                      quality={80}
                    />
                    {/* 悬停遮罩 */}
                    <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
                  </div>

                  {/* 文字区域 */}
                  <div className="p-3">
                    <div className={`mb-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {file.takenAt
                        ? new Date(file.takenAt).toLocaleString("zh-CN", {
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "未知时间"}
                    </div>
                    <div
                      className={`truncate font-medium text-sm ${
                        isDark ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {file.name || `照片 #${file.id}`}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
