import { registerComponents } from "@eosjs/components";
import { Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PostImage } from "@/types";
import { generateOssImageParams, getVideoThumbnailUrl, isVideo } from "@/utils/media";

// 注册 Eos Web Components（JSX 类型定义会自动生效）
registerComponents();

// TypeScript 类型声明
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "eos-image": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          width?: string | number;
          height?: string | number;
          loading?: "lazy" | "eager";
          "object-fit"?: string;
          "placeholder-type"?: string;
          placeholder?: string;
          "placeholder-fill"?: boolean;
          "show-delay"?: number;
          ref?: React.Ref<HTMLElement>;
        },
        HTMLElement
      >;
    }
  }
}

interface OptimizedImageProps {
  image: PostImage;
  width?: number;
  height?: number;
  className?: string;
  onClick?: () => void;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  placeholderType?: "blurhash" | "color" | "none";
  loading?: "lazy" | "eager";
  showDelay?: number;
  placeholderFill?: boolean;
  quality?: number; // 图片质量 1-100，默认 10
  noResize?: boolean; // 是否跳过尺寸缩放（详情页使用）
  onLoad?: () => void; // 图片加载完成回调
  onProgress?: (progress: { loaded: number; total: number; percent: number }) => void; // 图片加载进度回调
  showProgress?: boolean; // 是否显示进度指示器
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
  showProgress = false,
}: OptimizedImageProps) {
  const imageRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState({ loaded: 0, total: 0, percent: 0 });
  const [loadingState, setLoadingState] = useState<"loading" | "loaded" | "error">("loading");

  // 如果没有指定宽度，使用响应式
  const isResponsive = !(width || height);
  const targetWidth = width || 400;

  // 检测是否为视频
  const isVideoFile = isVideo(image);

  // 生成缩放后的图片URL或视频缩略图URL
  const optimizedUrl = isVideoFile
    ? getVideoThumbnailUrl(image.url)
    : noResize
      ? `${image.url}?x-oss-process=image/resize,w_1600,m_lfit/format,webp`
      : image.url + generateOssImageParams(image.width, image.height, targetWidth, quality);

  const handleLoad = () => {
    setLoadingState("loaded");
    onLoad?.();
  };

  const handleError = () => {
    setLoadingState("error");
    onLoad?.();
  };

  const handleProgress = (e: CustomEvent) => {
    const { loaded, total } = e.detail;
    const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
    const progressData = { loaded, total, percent };
    setProgress(progressData);
    onProgress?.(progressData);
  };

  // 设置图片事件处理器
  useEffect(() => {
    const element = imageRef.current as any;
    if (!element) return;

    element.onimageload = handleLoad;
    element.onimageerror = handleError;
    element.onimageprogress = handleProgress;

    return () => {
      element.onimageload = null;
      element.onimageerror = null;
      element.onimageprogress = null;
    };
  }, [image.url]); // 依赖图片 URL，确保每次图片变化都重新绑定

  const containerStyle = isResponsive
    ? {}
    : {
        width: width || "auto",
        height: height || Math.round((image.height / image.width) * targetWidth),
      };

  return (
    <div
      className={`relative overflow-hidden ${className} ${isResponsive ? "h-full w-full" : ""}`}
      onClick={onClick}
      style={containerStyle}
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
          <eos-image
            ref={imageRef}
            src={optimizedUrl}
            alt={image.name}
            width={isResponsive ? "100%" : width}
            height={isResponsive ? "100%" : height}
            loading={loading}
            object-fit={objectFit}
            placeholder-type={placeholderType}
            placeholder={placeholderType === "blurhash" ? image.blurhash : undefined}
            placeholder-fill={placeholderFill}
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
        <eos-image
          ref={imageRef}
          src={optimizedUrl}
          alt={image.name}
          show-delay={showDelay}
          width={isResponsive ? "100%" : width}
          height={isResponsive ? "100%" : height}
          loading={loading}
          object-fit={objectFit}
          placeholder-type={placeholderType}
          placeholder={placeholderType === "blurhash" ? image.blurhash : undefined}
          placeholder-fill={placeholderFill}
        />
      )}
    </div>
  );
}
