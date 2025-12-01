import { memo, useMemo, useState } from "react";
import { Blurhash } from "react-blurhash";
import { useLazyLoad } from "@/hooks/usePerformance";
import { cn } from "@/lib/utils";
import type { PostImage } from "@/types";
import { isValidBlurhash } from "@/utils/blurhash";
import { generateOssImageParams } from "@/utils/media";

interface LazyImageProps {
  image: PostImage;
  width?: number;
  height?: number;
  className?: string;
  quality?: number;
  onClick?: () => void;
  priority?: boolean;
}

/**
 * 优化的懒加载图片组件
 * - 支持 Intersection Observer 懒加载
 * - 支持 Blurhash 占位符
 * - 自动选择最佳图片尺寸
 * - 支持 WebP 格式
 */
const LazyImage = memo(
  ({
    image,
    width,
    height,
    className = "",
    quality = 85,
    onClick,
    priority = false,
  }: LazyImageProps) => {
    const { ref, isInView } = useLazyLoad();
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    // 根据设备像素比和屏幕宽度计算最佳尺寸
    const optimalSize = useMemo(() => {
      const dpr = window.devicePixelRatio || 1;
      const screenWidth = window.innerWidth;
      const targetWidth = width || 400;

      // 移动设备优化
      if (screenWidth < 640) {
        return Math.min(640, Math.round(targetWidth * dpr));
      }
      // 平板设备
      if (screenWidth < 1024) {
        return Math.min(1024, Math.round(targetWidth * dpr));
      }
      // 桌面设备
      return Math.min(1920, Math.round(targetWidth * dpr));
    }, [width]);

    // 生成优化的图片 URL
    const optimizedUrl = useMemo(() => {
      if (!image.url) return "";

      // 如果是 OSS 图片，添加处理参数
      if (image.url.includes("aliyuncs.com") || image.url.includes("oss")) {
        const params = generateOssImageParams(image.width, image.height, optimalSize);
        // 添加 WebP 格式支持
        return `${image.url}${params}/format,webp/quality,q_${quality}`;
      }

      return image.url;
    }, [image.url, image.width, image.height, optimalSize, quality]);

    // 计算容器尺寸
    const containerStyle = useMemo(() => {
      if (!width && !height) {
        return {};
      }

      const aspectRatio = image.height / image.width;
      return {
        width: width || "auto",
        height: height || Math.round((width || 400) * aspectRatio),
      };
    }, [width, height, image.width, image.height]);

    // 验证 blurhash
    const validBlurhash = useMemo(() => {
      return image.blurhash && isValidBlurhash(image.blurhash) ? image.blurhash : null;
    }, [image.blurhash]);

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden bg-gray-100", className)}
        style={containerStyle}
        onClick={onClick}
      >
        {/* Blurhash 占位符 */}
        {validBlurhash && !loaded && !error && (
          <div className="absolute inset-0">
            <Blurhash
              hash={validBlurhash}
              width="100%"
              height="100%"
              resolutionX={32}
              resolutionY={32}
              punch={1}
            />
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <span className="text-gray-500 text-sm">加载失败</span>
          </div>
        )}

        {/* 实际图片 - 只在进入视口或优先加载时渲染 */}
        {(isInView || priority) && !error && (
          <img
            src={optimizedUrl}
            alt={image.name || ""}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0",
            )}
            style={containerStyle}
          />
        )}
      </div>
    );
  },
  // 自定义比较函数，避免不必要的重渲染
  (prevProps, nextProps) => {
    return (
      prevProps.image.id === nextProps.image.id &&
      prevProps.image.url === nextProps.image.url &&
      prevProps.width === nextProps.width &&
      prevProps.height === nextProps.height &&
      prevProps.className === nextProps.className &&
      prevProps.quality === nextProps.quality &&
      prevProps.priority === nextProps.priority
    );
  },
);

LazyImage.displayName = "LazyImage";

export default LazyImage;
