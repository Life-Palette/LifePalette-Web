import { registerComponents } from "@eosjs/ui";
import {
  type Ref,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import ErrorBoundary from "@/components/common/error-boundary";
import MediaPlayer from "@/components/media/media-player";
import type { PostImage } from "@/types";
import {
  isLivePhoto as checkIsLivePhoto,
  isVideo as checkIsVideo,
} from "@/utils/media";

registerComponents();

type CarouselElement = HTMLElement & {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  play: () => void;
  pause: () => void;
  startSlideProgress: (opts?: {
    duration?: number;
    onComplete?: () => void;
  }) => void;
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

const MediaCarousel = ({
  images,
  imageDuration = 3000,
  initialIndex = 0,
  loop = true,
  onIndexChange,
  onSlideClick,
  ref,
}: MediaCarouselProps & { ref?: Ref<MediaCarouselRef> }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const carouselRef = useRef<CarouselElement>(null);
  const progressStartedForRef = useRef<string | number | null>(null);
  const pendingMediaIdRef = useRef<string | number | null>(null);
  const loadedImagesRef = useRef(new Set<string | number>());
  const mediaDurationsRef = useRef(new Map<string | number, number>());

  const startSlideProgress = useCallback(
    (duration: number, mediaId: string | number) => {
      if (images.length <= 1 || progressStartedForRef.current === mediaId) {
        return;
      }

      const carousel = carouselRef.current;
      if (!carousel) {
        return;
      }

      progressStartedForRef.current = mediaId;
      carousel.startSlideProgress({
        duration,
        onComplete: () => {
          progressStartedForRef.current = null;
          carousel.next();
        },
      });
    },
    [images.length]
  );

  // 暴露控制方法
  useImperativeHandle(ref, () => ({
    goTo: (i: number) => carouselRef.current?.goTo(i),
    next: () => carouselRef.current?.next(),
    pause: () => {
      carouselRef.current?.pause();
      carouselRef.current?.stopSlideProgress();
    },
    play: () => carouselRef.current?.play(),
    prev: () => carouselRef.current?.prev(),
    stopProgress: () => carouselRef.current?.stopSlideProgress(),
  }));

  const handleChange = useCallback(
    (e: Event) => {
      const idx = (e as CustomEvent).detail?.currentIndex ?? 0;
      setCurrentIndex(idx);
      progressStartedForRef.current = null;
      onIndexChange?.(idx);
    },
    [onIndexChange]
  );

  const handleSlideActive = useCallback(
    (e: CustomEvent) => {
      const index = e.detail?.index as number | undefined;
      const image = index === undefined ? undefined : images[index];
      const carousel = carouselRef.current;
      if (!(image && carousel)) {
        return;
      }

      setCurrentIndex(index ?? 0);
      carousel.stopSlideProgress();
      progressStartedForRef.current = null;
      pendingMediaIdRef.current = null;

      if (checkIsVideo(image) || checkIsLivePhoto(image)) {
        const duration = mediaDurationsRef.current.get(image.sec_uid);
        if (duration) {
          startSlideProgress(duration, image.sec_uid);
          return;
        }

        pendingMediaIdRef.current = image.sec_uid;
        return;
      }

      if (loadedImagesRef.current.has(image.sec_uid)) {
        startSlideProgress(imageDuration, image.sec_uid);
        return;
      }

      pendingMediaIdRef.current = image.sec_uid;
    },
    [imageDuration, images, startSlideProgress]
  );

  const handleImageLoad = useCallback(
    (mediaId: number | string) => {
      loadedImagesRef.current.add(mediaId);
      if (pendingMediaIdRef.current !== mediaId) {
        return;
      }

      pendingMediaIdRef.current = null;
      startSlideProgress(imageDuration, mediaId);
    },
    [imageDuration, startSlideProgress]
  );

  const handleDurationChange = useCallback(
    (mediaId: number | string, duration: number) => {
      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const durationInMilliseconds = duration * 1000;
      mediaDurationsRef.current.set(mediaId, durationInMilliseconds);
      if (pendingMediaIdRef.current !== mediaId) {
        return;
      }

      pendingMediaIdRef.current = null;
      startSlideProgress(durationInMilliseconds, mediaId);
    },
    [startSlideProgress]
  );

  const handleVideoEnded = useCallback(() => undefined, []);

  const handleSlideClick = useCallback(
    (e: CustomEvent) => {
      const idx = e.detail?.index;
      if (idx !== undefined) {
        onSlideClick?.(idx);
      }
    },
    [onSlideClick]
  );

  const mediaCallbacks = useMemo(
    () =>
      images.map((image) => ({
        onDurationChange: (duration: number) =>
          handleDurationChange(image.sec_uid, duration),
        onImageLoad: () => handleImageLoad(image.sec_uid),
      })),
    [handleDurationChange, handleImageLoad, images]
  );

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
        indicator-position="bottom"
        indicator-style="tiktok"
        initial-index={initialIndex}
        loop={loop}
        onchange={handleChange}
        onslide-active={handleSlideActive}
        onslide-click={onSlideClick ? handleSlideClick : undefined}
        ref={carouselRef}
        show-navigation
        style={
          {
            "--carousel-height": "100%",
            "--carousel-transition": "0.3s ease-in-out",
            "--progress-bar-active-color": "#ffffff",
            "--progress-bar-color": "rgba(255, 255, 255, 0.2)",
            "--progress-bar-gap": "6px",
            "--progress-bar-height": "2px",
            height: "100%",
            width: "100%",
          } as React.CSSProperties
        }
        virtual-threshold={999}
      >
        {images.map((image, index) => {
          let mediaType = "image";
          if (checkIsVideo(image)) {
            mediaType = "video";
          } else if (checkIsLivePhoto(image)) {
            mediaType = "live";
          }

          return (
            <div
              data-media-type={mediaType}
              key={image.sec_uid}
              style={{
                alignItems: "center",
                display: "flex",
                height: "100%",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <MediaPlayer
                className="h-full w-full"
                isActive={index === currentIndex}
                isPlaying={index === currentIndex}
                media={image}
                onDurationChange={mediaCallbacks[index].onDurationChange}
                onEnded={handleVideoEnded}
                onImageLoad={mediaCallbacks[index].onImageLoad}
              />
            </div>
          );
        })}
      </eos-carousel>
    </ErrorBoundary>
  );
};

MediaCarousel.displayName = "MediaCarousel";
export default MediaCarousel;
