import { useVirtualizer } from "@tanstack/react-virtual";
import { Camera, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  type MouseEvent,
  type TouchEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import OptimizedImage from "@/components/media/optimized-image";
import type { PostImage } from "@/types";
import type { FileData } from "./types";

interface PhotoGalleryProps {
  isDark?: boolean;
  isMobile?: boolean;
  onClearSelection: () => void;
  onPhotoClick: (lng: number, lat: number, file: FileData) => void;
  photos: FileData[];
  selectedPhotos: FileData[];
  width?: number;
}

interface GalleryLayoutProps {
  displayPhotos: FileData[];
  isDark: boolean;
  onClearSelection: () => void;
  onPhotoClick: (lng: number, lat: number, file: FileData) => void;
  photos: FileData[];
  selectedPhotos: FileData[];
  width: number;
}

// 工具函数：FileData转PostImage
const fileToPostImage = (file: FileData): PostImage => ({
  blurhash: file.blurhash,
  height: file.height,
  lat: file.lat,
  lng: file.lng,
  name: file.name,
  sec_uid: file.sec_uid,
  type: file.type,
  url: file.url,
  videoSrc: file.videoSrc || null,
  width: file.width,
});

// 移动端底部抽屉状态
type SheetState = "collapsed" | "half" | "expanded";

const getSheetHeight = (sheetState: SheetState) => {
  switch (sheetState) {
    case "collapsed":
      return "3.5rem"; // 仅显示拖拽手柄和标题
    case "half":
      return "45dvh";
    case "expanded":
      return "85dvh";
    default:
      return "3.5rem";
  }
};

function MobilePhotoGallery({
  displayPhotos,
  isDark,
  onClearSelection,
  onPhotoClick,
  photos,
  selectedPhotos,
}: GalleryLayoutProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [sheetState, setSheetState] = useState<SheetState>("collapsed");
  const touchStartY = useRef(0);
  const touchStartState = useRef<SheetState>("collapsed");

  const virtualizer = useVirtualizer({
    count: displayPhotos.length,
    estimateSize: useCallback(() => 80, []),
    getScrollElement: () => parentRef.current,
    overscan: 3,
  });

  const handleTouchStart = useCallback(
    (event: TouchEvent<HTMLButtonElement>) => {
      touchStartY.current = event.touches[0].clientY;
      touchStartState.current = sheetState;
    },
    [sheetState]
  );

  const handleTouchEnd = useCallback((event: TouchEvent<HTMLButtonElement>) => {
    const deltaY = touchStartY.current - event.changedTouches[0].clientY;
    const threshold = 50;

    if (deltaY > threshold) {
      if (touchStartState.current === "collapsed") {
        setSheetState("half");
      } else if (touchStartState.current === "half") {
        setSheetState("expanded");
      }
    } else if (deltaY < -threshold) {
      if (touchStartState.current === "expanded") {
        setSheetState("half");
      } else if (touchStartState.current === "half") {
        setSheetState("collapsed");
      }
    }
  }, []);

  const toggleSheet = useCallback(() => {
    setSheetState((prev) => {
      if (prev === "collapsed") {
        return "half";
      }
      if (prev === "half") {
        return "expanded";
      }
      return "collapsed";
    });
  }, []);

  const handlePhotoClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const file =
        displayPhotos[Number(event.currentTarget.dataset.photoIndex)];
      if (!file) {
        return;
      }
      onPhotoClick(file.lng, file.lat, file);
      setSheetState("collapsed");
    },
    [displayPhotos, onPhotoClick]
  );

  return (
    <div
      className={`absolute right-0 bottom-0 left-0 z-30 flex flex-col rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] ${
        isDark
          ? "bg-gray-900/95 backdrop-blur-md"
          : "bg-white/95 backdrop-blur-md"
      }`}
      style={{
        height: getSheetHeight(sheetState),
        maxHeight: "85dvh",
        transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* 拖拽手柄 + 头部 */}
      <div className="relative flex-shrink-0">
        <button
          className="w-full cursor-grab border-0 bg-transparent p-0 text-left active:cursor-grabbing"
          onClick={toggleSheet}
          onTouchEnd={handleTouchEnd}
          onTouchStart={handleTouchStart}
          type="button"
        >
          {/* 拖拽指示条 */}
          <div className="flex justify-center pt-2 pb-1">
            <div
              className={`h-1 w-10 rounded-full ${isDark ? "bg-gray-600" : "bg-gray-300"}`}
            />
          </div>

          {/* 头部信息 */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 opacity-60" />
              {selectedPhotos.length > 0 ? (
                <span className="font-semibold text-blue-500 text-sm">
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
                  isDark
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {photos.length}
              </span>
            </div>
            {sheetState === "collapsed" ? (
              <ChevronUp
                className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              />
            ) : (
              <ChevronDown
                className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
              />
            )}
          </div>
        </button>
        {selectedPhotos.length > 0 && (
          <button
            className="absolute right-4 bottom-2 text-blue-500 text-xs"
            onClick={onClearSelection}
            type="button"
          >
            清除
          </button>
        )}
      </div>

      {/* 照片列表 - 仅在展开时渲染 */}
      {sheetState !== "collapsed" && (
        <div
          className="flex-1 overflow-auto overscroll-contain"
          ref={parentRef}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              position: "relative",
              width: "100%",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const file = displayPhotos[virtualItem.index];
              const globalIndex = photos.findIndex(
                (photo) => photo.sec_uid === file.sec_uid
              );

              return (
                <div
                  className="px-3 pb-1.5"
                  data-index={virtualItem.index}
                  key={virtualItem.key}
                  ref={virtualizer.measureElement}
                  style={{
                    left: 0,
                    position: "absolute",
                    top: 0,
                    transform: `translateY(${virtualItem.start}px)`,
                    width: "100%",
                  }}
                >
                  <button
                    className={`flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border-0 p-2 text-left transition-colors active:scale-[0.98] ${
                      isDark
                        ? "bg-gray-800/60 active:bg-gray-800"
                        : "bg-gray-50 active:bg-gray-100"
                    }`}
                    data-photo-index={virtualItem.index}
                    onClick={handlePhotoClick}
                    type="button"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                      <span className="absolute top-0.5 left-0.5 z-10 rounded bg-black/60 px-1 py-0.5 font-bold text-[10px] text-white leading-none">
                        {globalIndex + 1}
                      </span>
                      <OptimizedImage
                        className="h-full w-full"
                        image={fileToPostImage(file)}
                        loading="lazy"
                        quality={60}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className={`truncate font-medium text-sm ${
                          isDark ? "text-gray-200" : "text-gray-800"
                        }`}
                      >
                        {file.name || `照片 #${globalIndex + 1}`}
                      </div>
                      <div
                        className={`mt-0.5 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
                      >
                        {file.takenAt
                          ? new Date(file.takenAt).toLocaleString("zh-CN", {
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              month: "2-digit",
                            })
                          : "未知时间"}
                      </div>
                    </div>
                    <ChevronUp
                      className={`h-4 w-4 flex-shrink-0 -rotate-45 ${
                        isDark ? "text-gray-600" : "text-gray-300"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopPhotoGallery({
  displayPhotos,
  isDark,
  onClearSelection,
  onPhotoClick,
  photos,
  selectedPhotos,
  width,
}: GalleryLayoutProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: displayPhotos.length,
    estimateSize: useCallback(() => {
      const imageHeight = (width - 16) * (3 / 4);
      const textHeight = 72;
      return imageHeight + textHeight + 8;
    }, [width]),
    getScrollElement: () => parentRef.current,
    overscan: 3,
  });

  const handlePhotoClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const file =
        displayPhotos[Number(event.currentTarget.dataset.photoIndex)];
      if (file) {
        onPhotoClick(file.lng, file.lat, file);
      }
    },
    [displayPhotos, onPhotoClick]
  );

  return (
    <div
      className={`absolute top-0 right-0 bottom-0 flex flex-col border-l shadow-2xl ${
        isDark ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white"
      }`}
      style={{ width: `${width}px` }}
    >
      {/* 固定头部 */}
      <div
        className={`flex-shrink-0 border-b px-4 py-3 ${
          isDark
            ? "border-gray-700 bg-gray-800/80 backdrop-blur-sm"
            : "border-gray-200 bg-white"
        }`}
      >
        {selectedPhotos.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-4.5 w-4.5 text-blue-600" />
                <span className="font-semibold text-blue-600">
                  已选择 {selectedPhotos.length} 张
                </span>
              </div>
              <button
                className={`text-xs ${
                  isDark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={onClearSelection}
                type="button"
              >
                清除
              </button>
            </div>
            <div
              className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
            >
              共 {photos.length} 张照片
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-4.5 w-4.5 opacity-60" />
              <span
                className={`font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                旅行相册
              </span>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 font-medium text-xs ${
                isDark
                  ? "bg-gray-700 text-gray-200"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {photos.length}
            </span>
          </div>
        )}
      </div>

      {/* 虚拟列表容器 */}
      <div className="flex-1 overflow-auto" ref={parentRef}>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            position: "relative",
            width: "100%",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const file = displayPhotos[virtualItem.index];
            const globalIndex = photos.findIndex(
              (photo) => photo.sec_uid === file.sec_uid
            );

            return (
              <div
                className="px-2 pb-2"
                data-index={virtualItem.index}
                key={virtualItem.key}
                ref={virtualizer.measureElement}
                style={{
                  left: 0,
                  position: "absolute",
                  top: 0,
                  transform: `translateY(${virtualItem.start}px)`,
                  width: "100%",
                }}
              >
                <button
                  className={`group w-full cursor-pointer overflow-hidden rounded-lg border-0 p-0 text-left transition-all hover:shadow-lg ${
                    isDark
                      ? "bg-gray-800/50 hover:bg-gray-800/80"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  data-photo-index={virtualItem.index}
                  onClick={handlePhotoClick}
                  type="button"
                >
                  {/* 图片区域 */}
                  <div className="relative aspect-[4/3]">
                    <span className="absolute top-2 left-2 z-10 rounded bg-black/70 px-2 py-1 font-bold text-white text-xs backdrop-blur-sm">
                      #{globalIndex + 1}
                    </span>
                    <OptimizedImage
                      className="h-full w-full"
                      image={fileToPostImage(file)}
                      loading="lazy"
                      quality={80}
                    />
                    <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />
                  </div>

                  {/* 文字区域 */}
                  <div className="p-3">
                    <div
                      className={`mb-1 text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}
                    >
                      {file.takenAt
                        ? new Date(file.takenAt).toLocaleString("zh-CN", {
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "2-digit",
                          })
                        : "未知时间"}
                    </div>
                    <div
                      className={`truncate font-medium text-sm ${
                        isDark ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {file.name || `照片 #${globalIndex + 1}`}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PhotoGallery({
  photos,
  selectedPhotos,
  onPhotoClick,
  onClearSelection,
  width = 280,
  isDark = false,
  isMobile = false,
}: PhotoGalleryProps) {
  const displayPhotos = selectedPhotos.length > 0 ? selectedPhotos : photos;
  const layoutProps = {
    displayPhotos,
    isDark,
    onClearSelection,
    onPhotoClick,
    photos,
    selectedPhotos,
    width,
  };

  return isMobile ? (
    <MobilePhotoGallery {...layoutProps} />
  ) : (
    <DesktopPhotoGallery {...layoutProps} />
  );
}
