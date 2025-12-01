import { useVirtualizer } from "@tanstack/react-virtual";
import { useCallback, useRef } from "react";
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

export default function PhotoGallery({
  photos,
  selectedPhotos,
  onPhotoClick,
  onClearSelection,
  width = 280,
  isDark = false,
}: PhotoGalleryProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // 显示的照片列表（已选择的或全部）
  const displayPhotos = selectedPhotos.length > 0 ? selectedPhotos : photos;

  // 虚拟列表配置
  const virtualizer = useVirtualizer({
    count: displayPhotos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => {
      // 估算高度：图片区域(4:3比例) + 文字区域
      const imageHeight = (width - 16) * (3 / 4); // 减去padding
      const textHeight = 72; // 文字区域高度
      return imageHeight + textHeight + 8; // 加上间距
    }, [width]),
    overscan: 3, // 预渲染3个额外项
  });

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
