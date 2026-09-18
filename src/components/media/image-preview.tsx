import { LivePhotoViewer } from "live-photo";
import { useEffect, useRef } from "react";
import type { ImageObj } from "@/hooks/use-image-viewer";
import { useImageViewer } from "@/hooks/use-image-viewer";
import type { PostImage } from "@/types";

interface ImagePreviewProps {
  images: PostImage[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImagePreview({
  images,
  initialIndex,
  isOpen,
  onClose,
}: ImagePreviewProps) {
  const livePhotoViewersRef = useRef(new Map<number, LivePhotoViewer>());
  const { initWithPostImages, openPreview, closePreview } = useImageViewer({
    onImageLoad: (_imgObj: ImageObj, _idx: number) => {
      if (_imgObj.type !== "live-photo") {
        return;
      }

      // 对于 live-photo，创建 LivePhotoViewer 实例
      const demoSource = {
        photoSrc: _imgObj.src || "",
        videoSrc: _imgObj.videoSrc || "",
      };
      const container = document.getElementById(`live-photo-container-${_idx}`);

      if (!container) {
        return;
      }

      const { placeholderId } = container.dataset;
      const removePlaceholder = () => {
        if (!placeholderId) {
          return;
        }
        document.getElementById(placeholderId)?.remove();
      };

      // 等待布局稳定后再获取尺寸并初始化 LivePhotoViewer
      requestAnimationFrame(() => {
        const rect = container.getBoundingClientRect();
        const width = rect.width || undefined;
        const height = rect.height || undefined;

        // 创建 LivePhotoViewer 实例
        livePhotoViewersRef.current.set(
          _idx,
          new LivePhotoViewer({
            container,
            height,
            imageCustomization: {
              attributes: {
                alt: "Live Photo",
                loading: "lazy",
              },
              styles: {
                objectFit: "contain",
              },
            },
            photoSrc: demoSource.photoSrc,
            videoSrc: demoSource.videoSrc,
            width,
          })
        );

        // 等待 live-photo 图片加载完成后移除 blurhash 占位
        requestAnimationFrame(() => {
          const image = container.querySelector("img");
          if (!image) {
            removePlaceholder();
            return;
          }
          if (image.complete) {
            removePlaceholder();
            return;
          }
          image.addEventListener("load", removePlaceholder, { once: true });
        });
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
