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
        autoplay,
        borderRadius: "0px",
        container,
        height: "100%",
        imageCustomization: {
          styles: {
            height: "100%",
            objectFit: "contain",
            width: "100%",
          },
        },
        onCanPlay() {
          onCanPlay?.();
        },
        onEnded() {
          onEnded?.();
        },
        onPhotoLoad() {
          onPhotoLoad?.();
        },
        // @ts-expect-error - live-photo 库的 onVideoLoad 实际上会传递 duration 参数
        onVideoLoad(duration: number) {
          if (duration && Number.isFinite(duration)) {
            onDurationChange?.(duration);
          }
        },
        photoSrc: image.url,
        videoCustomization: {
          styles: {
            objectFit: "contain",
          },
        },
        videoSrc: image.videoSrc,
        width: "100%",
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
        alignItems: "center",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    />
  );
}
