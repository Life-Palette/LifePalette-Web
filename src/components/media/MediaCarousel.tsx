import { registerComponents } from "@eosjs/components";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import MediaPlayer from "@/components/media/MediaPlayer";
import type { PostImage } from "@/types";
import { isLivePhoto as checkIsLivePhoto, isVideo as checkIsVideo } from "@/utils/media";

registerComponents();

type CarouselElement = HTMLElement & {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  startSlideProgress: (opts?: { duration?: number; onComplete?: () => void }) => void;
  stopSlideProgress: () => void;
  setSlideLoading: (loading: boolean) => void;
  updateProgress: (progress: number) => void;
};

export interface MediaCarouselRef {
  goTo: (index: number) => void;
  next: () => void;
  pause: () => void;
  play: () => void;
  prev: () => void;
  stopProgress: () => void;
}

interface MediaCarouselProps {
  /** 默认图片展示时长（ms），默认 3000 */
  imageDuration?: number;
  images: PostImage[];
  initialIndex?: number;
  loop?: boolean;
  onIndexChange?: (index: number) => void;
  onSlideClick?: (index: number) => void;
}

const FALLBACK_TIMEOUT = 5000;

const MediaCarousel = forwardRef<MediaCarouselRef, MediaCarouselProps>(
  (
    { images, initialIndex = 0, imageDuration = 3000, loop = true, onIndexChange, onSlideClick },
    ref
  ) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const carouselRef = useRef<CarouselElement>(null);
    const pendingImageLoadRef = useRef<string | number | null>(null);
    const progressStartedForRef = useRef<string | number | null>(null);

    // 暴露控制方法
    useImperativeHandle(ref, () => ({
      next: () => carouselRef.current?.next(),
      prev: () => carouselRef.current?.prev(),
      goTo: (i: number) => carouselRef.current?.goTo(i),
      pause: () => {
        carouselRef.current?.pause();
        carouselRef.current?.stopSlideProgress();
      },
      play: () => carouselRef.current?.play(),
      stopProgress: () => carouselRef.current?.stopSlideProgress(),
    }));

    const advanceToNext = useCallback(() => {
      carouselRef.current?.next();
    }, []);

    // slide 切换后，根据媒体类型决定进度条策略
    // [暂时禁用] 自动播放下一张逻辑
    const onSlideReady = useCallback(
      (_index: number) => {
        // 暂时不自动播放
      },
      []
    );

    const onSlideReadyRef = useRef(onSlideReady);
    onSlideReadyRef.current = onSlideReady;

    const handleChange = useCallback(
      (e: Event) => {
        const idx = (e as CustomEvent).detail?.currentIndex ?? 0;
        setCurrentIndex(idx);
        progressStartedForRef.current = null;
        onSlideReadyRef.current(idx);
        onIndexChange?.(idx);
      },
      [onIndexChange]
    );

    // 图片加载完成
    // [暂时禁用] 自动启动进度条
    const handleImageLoad = useCallback(
      (_mediaId: number | string) => {
        // 暂时不自动播放
      },
      []
    );

    // 实况/视频时长回调
    // [暂时禁用] 自动启动进度条
    const handleDurationChange = useCallback(
      (_mediaId: number | string, _duration: number) => {
        // 暂时不自动播放
      },
      []
    );

    const handleVideoEnded = useCallback(() => {}, []);

    // 初始化第一张
    // [暂时禁用] 自动播放
    // useEffect(() => {
    //   if (!images.length) return;
    //   const timer = setTimeout(() => onSlideReadyRef.current(initialIndex), 500);
    //   return () => clearTimeout(timer);
    // }, [images.length, initialIndex]);

    return (
      <ErrorBoundary>
        <eos-carousel
          autoplay={false}
          indicator-style="tiktok"
          initial-index={initialIndex}
          loop={loop}
          onchange={handleChange as any}
          onslide-click={
            onSlideClick
              ? (((e: Event) => {
                  const idx = (e as CustomEvent).detail?.index;
                  if (idx !== undefined) onSlideClick(idx);
                }) as any)
              : undefined
          }
          ref={carouselRef}
          style={
            {
              "--carousel-height": "100%",
              "--progress-bar-height": "2px",
              "--progress-bar-gap": "6px",
              "--progress-bar-color": "rgba(255, 255, 255, 0.2)",
              "--progress-bar-active-color": "#ffffff",
              "--carousel-transition": "0.3s ease-in-out",
              width: "100%",
              height: "100%",
            } as React.CSSProperties
          }
          virtual-threshold={999}
        >
          {images.map((image, index) => (
            <div
              data-media-type={
                checkIsVideo(image) ? "video" : checkIsLivePhoto(image) ? "live" : "image"
              }
              key={`${image.sec_uid}-${index}`}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MediaPlayer
                className="h-full w-full"
                isActive={index === currentIndex}
                isPlaying={index === currentIndex}
                media={image}
                onDurationChange={(duration: number) => handleDurationChange(image.sec_uid, duration)}
                onEnded={handleVideoEnded}
                onImageLoad={() => handleImageLoad(image.sec_uid)}
              />
            </div>
          ))}
        </eos-carousel>
      </ErrorBoundary>
    );
  }
);

MediaCarousel.displayName = "MediaCarousel";
export default MediaCarousel;
