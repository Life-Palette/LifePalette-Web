import { LivePhotoViewer } from "live-photo";
import { useEffect, useRef } from "react";
import type { PostImage } from "@/types";

interface LivePhotoPlayerProps {
  autoplay?: boolean;
  className?: string;
  image: PostImage;
  isActive?: boolean;
  onCanPlay?: () => void;
  onDurationChange?: (duration: number) => void;
  onEnded?: () => void;
  onPhotoLoad?: () => void;
}

export default function LivePhotoPlayer({
  image,
  className = "",
  isActive = true,
  autoplay = true,
  onDurationChange,
  onEnded,
  onPhotoLoad,
  onCanPlay,
}: LivePhotoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<LivePhotoViewer | null>(null);

  useEffect(() => {
    if (!(containerRef.current && image.videoSrc)) {
      return;
    }

    const container = containerRef.current;

    // 清空容器内容，避免重复渲染
    container.innerHTML = "";

    // 只在激活时创建实例
    if (!isActive) {
      return;
    }

    // 创建新的 LivePhotoViewer 实例
    try {
      viewerRef.current = new LivePhotoViewer({
        photoSrc: image.url,
        videoSrc: image.videoSrc,
        container,
        borderRadius: "0px",
        height: "100%",
        width: "100%",
        autoplay,
        imageCustomization: {
          styles: {
            objectFit: "contain",
            width: "100%",
            height: "100%",
          },
        },
        videoCustomization: {
          styles: {
            objectFit: "contain",
          },
        },
        onPhotoLoad() {
          onPhotoLoad?.();
        },
        onCanPlay() {
          onCanPlay?.();
        },
        onEnded() {
          onEnded?.();
        },
        // @ts-expect-error - live-photo 库的 onVideoLoad 实际上会传递 duration 参数
        onVideoLoad(duration: number) {
          if (duration && Number.isFinite(duration)) {
            onDurationChange?.(duration);
          }
        },
      });
    } catch (error) {
      console.error("Failed to create LivePhotoViewer:", error);
    }

    return () => {
      // 清理时清空容器
      if (container) {
        container.innerHTML = "";
      }
      viewerRef.current = null;
    };
  }, [
    image.url,
    image.videoSrc,
    isActive,
    autoplay,
    onDurationChange,
    onEnded,
    onPhotoLoad,
    onCanPlay,
  ]);

  return (
    <div
      className={className}
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    />
  );
}
