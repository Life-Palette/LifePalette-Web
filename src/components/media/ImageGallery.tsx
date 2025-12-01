import { useState } from "react";
import OptimizedImage from "@/components/media/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import type { PostImage } from "@/types";

interface ImageGalleryProps {
  images: PostImage[];
  maxDisplay?: number;
  className?: string;
  onImageClick?: (index: number, e: React.MouseEvent) => void;
}

export default function ImageGallery({
  images,
  maxDisplay = 9,
  className = "",
  onImageClick,
}: ImageGalleryProps) {
  const [showAll, setShowAll] = useState(false);

  if (images.length === 0) {
    return null;
  }

  const displayImages = showAll ? images : images.slice(0, maxDisplay);
  const remainingCount = images.length - maxDisplay;

  // 根据图片数量决定布局
  const getLayoutConfig = (count: number) => {
    switch (count) {
      case 1:
        return {
          containerClass: "grid grid-cols-1",
          imageClass: "aspect-[4/3] w-full",
        };
      case 2:
        return {
          containerClass: "grid grid-cols-2 gap-1",
          imageClass: "aspect-square w-full",
        };
      case 3:
        return {
          containerClass: "grid grid-cols-2 gap-1",
          imageClass: (index: number) =>
            index === 0 ? "col-span-2 aspect-[2/1] w-full" : "aspect-square w-full",
        };
      case 4:
        return {
          containerClass: "grid grid-cols-2 gap-1",
          imageClass: "aspect-square w-full",
        };
      case 5:
        return {
          containerClass: "grid grid-cols-3 gap-1",
          imageClass: (index: number) =>
            index < 2
              ? "aspect-square w-full"
              : index === 2
                ? "col-span-1 row-span-2 aspect-[1/2] w-full"
                : "aspect-square w-full",
        };
      case 6:
        return {
          containerClass: "grid grid-cols-3 gap-1",
          imageClass: "aspect-square w-full",
        };
      default:
        return {
          containerClass: "grid grid-cols-3 gap-1",
          imageClass: "aspect-square w-full",
        };
    }
  };

  const layoutConfig = getLayoutConfig(Math.min(displayImages.length, maxDisplay));

  return (
    <div className={`relative w-full ${className}`}>
      <div className={layoutConfig.containerClass}>
        {displayImages.map((image, index) => {
          const isLastInGrid = index === maxDisplay - 1 && remainingCount > 0;
          const imageClass =
            typeof layoutConfig.imageClass === "function"
              ? layoutConfig.imageClass(index)
              : layoutConfig.imageClass;

          // 注意：避免 <button> 内再嵌套 <button> 导致的 hydration 报错。
          // 结构：外层 div 容器；内部一个铺满的 button 处理图片点击；当为最后一张且有剩余时，再渲染一个覆盖层 button（兄弟节点）。
          return (
            <div className="relative overflow-hidden rounded-lg" key={`${image.id}-${index}`}>
              {/* 基础图片点击区域 */}
              <button
                className={`block h-full w-full transition-opacity ${
                  isLastInGrid && !showAll
                    ? "pointer-events-none"
                    : "cursor-pointer hover:opacity-90"
                }`}
                onClick={(e) => {
                  if (onImageClick) {
                    onImageClick(index, e);
                  }
                  // 如果没有 onImageClick，不阻止冒泡，让事件传递到父级卡片
                }}
                type="button"
              >
                <OptimizedImage className={`${imageClass} object-cover`} image={image} />
              </button>

              {/* 显示剩余图片数量（覆盖层按钮，与上面按钮为兄弟关系，避免嵌套） */}
              {isLastInGrid && !showAll && (
                <button
                  className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/60 transition-all hover:bg-black/70"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAll(true);
                  }}
                  onMouseEnter={(e) => {
                    // 阻止鼠标事件穿透到底层图片按钮
                    e.stopPropagation();
                  }}
                  type="button"
                >
                  <Badge className="rounded-full bg-white/90 px-4 py-2 font-semibold text-black text-lg hover:bg-white">
                    +{remainingCount}
                  </Badge>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 收起按钮 */}
      {showAll && images.length > maxDisplay && (
        <div className="mt-2 text-center">
          <button
            className="text-gray-500 text-sm transition-colors hover:text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              setShowAll(false);
            }}
            type="button"
          >
            收起
          </button>
        </div>
      )}
    </div>
  );
}
