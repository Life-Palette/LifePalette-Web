import { LivePhotoViewer } from "live-photo";
import { useEffect, useRef } from "react";
import type { PostImage } from "@/types";

interface LivePhotoPlayerProps {
  image: PostImage;
  className?: string;
  isActive?: boolean;
  onDurationChange?: (duration: number) => void; // 实况照片视频时长（秒）
}

export default function LivePhotoPlayer({
  image,
  className = "",
  isActive = true,
  onDurationChange,
}: LivePhotoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<LivePhotoViewer | null>(null);

  useEffect(() => {
    if (!containerRef.current || !image.videoSrc) return;

    const container = containerRef.current;

    // 清空容器内容，避免重复渲染
    container.innerHTML = "";

    // 只在激活时创建实例
    if (!isActive) return;

    // 创建新的 LivePhotoViewer 实例
    try {
      viewerRef.current = new LivePhotoViewer({
        photoSrc: image.url,
        videoSrc: image.videoSrc,
        container: container,
        borderRadius: "0px",
        height: "100%",
        // width: "400px",
        width: "100%",
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
        // @ts-ignore - live-photo 库的 onVideoLoad 实际上会传递 duration 参数
        onVideoLoad(duration: number) {
          // 将视频时长传递给父组件
          if (duration && isFinite(duration)) {
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
  }, [image.url, image.videoSrc, image.name, isActive]);

  return (
    <div
      ref={containerRef}
      className={className}
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
