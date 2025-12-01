import { Play, Video as VideoIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PostImage } from "@/types";
import { isLivePhoto, isVideo } from "@/utils/media";
import LivePhotoPlayer from "./LivePhotoPlayer";
import OptimizedImage from "./OptimizedImage";

interface MediaPlayerProps {
  media: PostImage;
  className?: string;
  isActive: boolean;
  onEnded?: () => void;
  isPlaying?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  onDurationChange?: (duration: number) => void; // 视频时长（秒）
  onImageLoad?: () => void; // 图片加载完成回调
}

export default function MediaPlayer({
  media,
  className = "",
  isActive,
  onEnded,
  isPlaying = true,
  onPlayStateChange,
  onDurationChange,
  onImageLoad,
}: MediaPlayerProps) {
  const isVideoFile = isVideo(media);
  const isLivePhotoFile = isLivePhoto(media);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 处理视频播放/暂停
  useEffect(() => {
    if (!isVideoFile || !videoRef.current || !isActive) return;

    if (isPlaying) {
      videoRef.current.play().catch(() => {
        // 自动播放可能被浏览器阻止
      });
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, isVideoFile, isActive]);

  // 当切换到其他媒体时暂停视频
  useEffect(() => {
    if (!isActive && videoRef.current && isVideoFile) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoPlaying(false);
    }
  }, [isActive, isVideoFile]);

  // 监听视频播放状态和结束事件
  useEffect(() => {
    if (!isVideoFile || !videoRef.current || !isActive) return;

    const video = videoRef.current;

    const handlePlay = () => {
      setVideoPlaying(true);
      onPlayStateChange?.(true);
    };

    const handlePause = () => {
      setVideoPlaying(false);
      onPlayStateChange?.(false);
    };

    const handleEnded = () => {
      setVideoPlaying(false);
      onPlayStateChange?.(false);
      onEnded?.();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isVideoFile, isActive, onEnded, onPlayStateChange]);

  const togglePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;

    if (videoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 加载状态 */}
      {!(loaded || error) && (
        <div className="absolute inset-0 flex animate-pulse items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      )}

      {/* 视频播放器 */}
      {!error && isVideoFile && (
        <>
          <video
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
            muted={true}
            onError={() => setError(true)}
            onLoadedData={() => setLoaded(true)}
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              if (video.duration && isFinite(video.duration)) {
                onDurationChange?.(video.duration);
              }
            }}
            playsInline
            ref={videoRef}
            src={media.url}
          />

          {/* 播放按钮 - 仅在视频暂停时显示 */}
          {loaded && !videoPlaying && (
            <div
              className="absolute inset-0 flex cursor-pointer items-center justify-center"
              onClick={togglePlayPause}
            >
              <div className="rounded-full bg-black/50 p-4 backdrop-blur-sm transition-transform hover:scale-110">
                <Play className="text-white" fill="white" size={48} />
              </div>
            </div>
          )}
        </>
      )}

      {/* 实况照片显示 */}
      {!error && !isVideoFile && isLivePhotoFile && (
        <LivePhotoPlayer
          image={media}
          isActive={isActive}
          className="h-full w-full"
          onDurationChange={onDurationChange}
        />
      )}

      {/* 普通图片显示 */}
      {!error && !isVideoFile && !isLivePhotoFile && (
        <OptimizedImage
          image={media}
          objectFit="contain"
          showDelay={0}
          quality={80}
          noResize={true}
          className="h-full w-full"
          onLoad={onImageLoad}
        />
      )}

      {/* 错误状态 */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black">
          {isVideoFile ? (
            <>
              <VideoIcon className="text-white/50" size={32} />
              <div className="text-white/50 text-sm">视频加载失败</div>
            </>
          ) : (
            <div className="text-white/50 text-sm">图片加载失败</div>
          )}
        </div>
      )}
    </div>
  );
}
