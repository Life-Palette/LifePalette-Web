import { LivePhotoViewer } from "live-photo";
import { useEffect } from "react";
import type { ImageObj } from "@/hooks/useImageViewer";
import { useImageViewer } from "@/hooks/useImageViewer";
import type { PostImage } from "@/types";

interface ImagePreviewProps {
  images: PostImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImagePreview({ images, initialIndex, isOpen, onClose }: ImagePreviewProps) {
  const { initWithPostImages, openPreview, closePreview } = useImageViewer({
    onImageLoad: (_imgObj: ImageObj, _idx: number) => {
      if (_imgObj.type !== "live-photo") {
        // 对于普通图片，loading 已经由 customLoading 控制
        return;
      }

      // 对于 live-photo，创建 LivePhotoViewer 实例
      const demoSource = {
        photoSrc: _imgObj.src || "",
        videoSrc: _imgObj.videoSrc || "",
      };
      const container = document.getElementById(`live-photo-container-${_idx}`);

      if (!container) return;

      // 创建 LivePhotoViewer 实例
      new LivePhotoViewer({
        photoSrc: demoSource.photoSrc,
        videoSrc: demoSource.videoSrc,
        container: container,
        // width: 300,
        height: 600,
        // autoplay: false,
        borderRadius: "8px",
        imageCustomization: {
          styles: {
            objectFit: "cover",
          },
          attributes: {
            alt: "Live Photo Demo",
            loading: "lazy",
          },
        },
      });
    },
  });

  // 当图片列表变化时更新viewer
  useEffect(() => {
    if (images.length > 0) {
      initWithPostImages(images);
    }
  }, [images, initWithPostImages]);

  // 当打开状态或初始索引变化时控制viewer
  useEffect(() => {
    if (isOpen && images.length > 0) {
      // 延迟一点打开，确保viewer已经初始化
      const timer = setTimeout(() => {
        openPreview(initialIndex);
      }, 100);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      closePreview();
    }
  }, [isOpen, initialIndex, images.length, openPreview, closePreview]);

  // 监听viewer的关闭事件
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // viewer-pro 会创建自己的DOM结构，这里不需要返回可见的JSX
  return null;
}
