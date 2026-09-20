import { registerComponents } from "@eosjs/ui";
import { Play } from "lucide-react";
import { createElement, useCallback, useEffect, useRef, useState } from "react";
import type { PostImage } from "@/types";
import {
  generateOssImageParams,
  getVideoThumbnailUrl,
  isVideo,
} from "@/utils/media";

// 注册 Eos Web Components（JSX 类型定义会自动生效）
registerComponents();

interface OptimizedImageProps {
  className?: string;
  height?: number;
  image: PostImage;
  loading?: "lazy" | "eager";
  noResize?: boolean; // 是否跳过尺寸缩放（详情页使用）
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  onClick?: () => void;
  onLoad?: () => void; // 图片加载完成回调
  onProgress?: (progress: {
    loaded: number;
    total: number;
    percent: number;
  }) => void; // 图片加载进度回调
  placeholderFill?: boolean;
  placeholderType?: "blurhash" | "color" | "none";
  quality?: number; // 图片质量 1-100，默认 10
  showDelay?: number;
  showProgress?: boolean; // 是否显示进度指示器
  width?: number;
}

interface EosImageElement extends HTMLElement {
  onerror: (() => void) | null;
  onload: (() => void) | null;
  onprogress: ((event: CustomEvent) => void) | null;
}

interface EosImageProps {
  alt?: string;
  height?: string | number;
  loading?: "lazy" | "eager";
  "object-fit"?: string;
  placeholder?: string;
  "placeholder-fill"?: boolean;
  "placeholder-type"?: string;
  ref?: React.Ref<EosImageElement>;
  "show-delay"?: number;
  src?: string;
  style?: React.CSSProperties;
  width?: string | number;
}

function EosImage(props: EosImageProps) {
  return createElement(
    "eos-image",
    props as React.Attributes & Record<string, unknown>
  );
}

function getImageSize(
  isResponsive: boolean,
  responsiveValue: string,
  value?: number
) {
  return isResponsive ? responsiveValue : value;
}

function getPlaceholder(
  type: OptimizedImageProps["placeholderType"],
  blurhash?: string
) {
  return type === "blurhash" ? blurhash : undefined;
}

function getContainerStyle(
  isResponsive: boolean,
  height: number | undefined,
  image: PostImage,
  targetWidth: number,
  width: number | undefined
) {
  if (isResponsive) {
    return {};
  }

  return {
    height: height || Math.round((image.height / image.width) * targetWidth),
    width: width || "auto",
  };
}

export default function OptimizedImage({
  image,
  width,
  height,
  className = "",
  onClick,
  objectFit = "cover",
  placeholderType = "blurhash",
  loading = "lazy",
  showDelay = 500,
  placeholderFill = true,
  quality = 10,
  noResize = false,
  onLoad,
  onProgress,
  _showProgress = false,
}: OptimizedImageProps) {
  const imageRef = useRef<EosImageElement>(null);
  const [_progress, setProgress] = useState({
    loaded: 0,
    percent: 0,
    total: 0,
  });
  const [_loadingState, setLoadingState] = useState<
    "loading" | "loaded" | "error"
  >("loading");

  // 如果没有指定宽度，使用响应式
  const isResponsive = !(width || height);
  const targetWidth = width || 400;

  // 检测是否为视频
  const isVideoFile = isVideo(image);

  // 检测是否为 GIF 图片（GIF 不应走缩略图处理，否则会丢失动画）
  const isGif =
    image.type === "image/gif" || image.url.toLowerCase().endsWith(".gif");
  const imageHeight = getImageSize(isResponsive, "100%", height);
  const imageWidth = getImageSize(isResponsive, "100%", width);
  const placeholder = getPlaceholder(placeholderType, image.blurhash);

  // 生成缩放后的图片URL或视频缩略图URL
  let optimizedUrl = image.url;
  if (isVideoFile) {
    optimizedUrl = getVideoThumbnailUrl(image.url);
  } else if (isGif) {
    optimizedUrl = image.url;
  } else if (noResize) {
    optimizedUrl = `${image.url}?x-oss-process=image/resize,w_1600,m_lfit/format,webp`;
  } else {
    optimizedUrl += generateOssImageParams(
      image.width,
      image.height,
      targetWidth,
      quality
    );
  }

  const handleLoad = useCallback(() => {
    setLoadingState("loaded");
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setLoadingState("error");
    onLoad?.();
  }, [onLoad]);

  const handleProgress = useCallback(
    (e: CustomEvent) => {
      const { loaded, total } = e.detail;
      const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
      const progressData = { loaded, percent, total };
      setProgress(progressData);
      onProgress?.(progressData);
    },
    [onProgress]
  );

  // 设置图片事件处理器
  useEffect(() => {
    const element = imageRef.current;
    if (!element) {
      return;
    }

    element.onload = handleLoad;
    element.onerror = handleError;
    element.onprogress = handleProgress;

    return () => {
      element.onload = null;
      element.onerror = null;
      element.onprogress = null;
    };
  }, [handleProgress, handleLoad, handleError]); // 依赖图片 URL，确保每次图片变化都重新绑定

  const containerStyle = getContainerStyle(
    isResponsive,
    height,
    image,
    targetWidth,
    width
  );

  return (
    <button
      className={`relative overflow-hidden ${className} ${isResponsive ? "h-full w-full" : ""}`}
      onClick={onClick}
      style={containerStyle}
      type="button"
    >
      {/* 进度指示器 */}
      {/* {1 && (
        <div className="absolute bottom-3 right-3 z-50">
          <div className="bg-black/80 px-3 py-2 rounded-md backdrop-blur-sm">
            <div className="text-white text-xs whitespace-nowrap">
              <div className="flex items-center gap-2">
                <span>加载中</span>
                <span className="font-medium">{progress.percent}%</span>
              </div>
              <div className="text-white/70 mt-0.5">
                {(progress.loaded / 1024 / 1024).toFixed(1)}MB /{" "}
                {(progress.total / 1024 / 1024).toFixed(1)}MB
              </div>
            </div>
          </div>
        </div>
      )} */}
      {isVideoFile ? (
        <>
          {/* 视频缩略图使用 eos-image */}
          <EosImage
            alt={image.name}
            height={imageHeight}
            loading={loading}
            object-fit={objectFit}
            placeholder={placeholder}
            placeholder-fill={placeholderFill}
            placeholder-type={placeholderType}
            ref={imageRef}
            src={optimizedUrl}
            style={{ borderRadius: 0 }}
            width={imageWidth}
          />

          {/* 视频播放图标覆盖层 */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
              <Play className="text-white" fill="white" size={24} />
            </div>
          </div>
        </>
      ) : (
        /* 图片使用 eos-image */
        <EosImage
          alt={image.name}
          height={imageHeight}
          loading={loading}
          object-fit={objectFit}
          placeholder={placeholder}
          placeholder-fill={placeholderFill}
          placeholder-type={placeholderType}
          ref={imageRef}
          show-delay={showDelay}
          src={optimizedUrl}
          style={{ borderRadius: 0 }}
          width={imageWidth}
        />
      )}
    </button>
  );
}
