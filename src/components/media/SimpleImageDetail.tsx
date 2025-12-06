import { registerComponents } from "@eosjs/components";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Edit, Heart, Trash2, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ImagePreview from "@/components/media/ImagePreview";
import MediaPlayer from "@/components/media/MediaPlayer";
import CommentSection from "@/components/post/CommentSection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { usePostActions } from "@/hooks/usePostActions";
import {
  useComments,
  useCreateComment,
  useDeleteTopic,
  useTopicDetail,
} from "@/hooks/useTopicDetail";
import { isLivePhoto as checkIsLivePhoto, isVideo as checkIsVideo } from "@/utils/media";

// 注册 Eos Web Components
registerComponents();

// TypeScript 类型声明
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "eos-carousel": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          autoplay?: boolean;
          interval?: number;
          loop?: boolean;
          "show-controls"?: boolean;
          "indicator-style"?: string;
          "initial-index"?: number;
          ref?: React.Ref<HTMLElement>;
        },
        HTMLElement
      >;
    }
  }
}

// 扩展 React 的 CSSProperties 类型以支持自定义 CSS 变量
declare module "react" {
  interface CSSProperties {
    "--carousel-height"?: string;
    "--progress-bar-height"?: string;
    "--progress-bar-gap"?: string;
    "--progress-bar-color"?: string;
    "--progress-bar-active-color"?: string;
    "--carousel-transition"?: string;
  }
}

interface SimpleImageDetailProps {
  topicId: number;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (topicId: number) => void;
  originRect?: DOMRect | null; // 卡片的位置信息
  initialImageIndex?: number; // 初始显示的图片索引
}

export default function SimpleImageDetail({
  topicId,
  isOpen,
  onClose,
  onEdit,
  originRect,
  initialImageIndex = 0,
}: SimpleImageDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFloatingHearts, setShowFloatingHearts] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isMountedRef = useRef(true);
  // 存储每个视频的时长（以秒为单位），使用 id 作为 key
  const [videoDurations, setVideoDurations] = useState<Record<number, number>>({});
  // 存储等待启动进度条的图片 ID
  const pendingProgressStartRef = useRef<number | null>(null);

  // Carousel ref - 新的 API
  const carouselRef = useRef<
    HTMLElement & {
      next: () => void;
      prev: () => void;
      goTo: (index: number) => void;
      play: () => void;
      pause: () => void;
      startSlideProgress: (options?: { duration?: number; onComplete?: () => void }) => void;
      updateProgress: (progress: number) => void;
    }
  >(null);

  const { isAuthenticated, user } = useIsAuthenticated();
  const { data: topic, isLoading, error } = useTopicDetail(topicId, user?.id);
  const { data: comments, isLoading: commentsLoading } = useComments(topicId);
  const createCommentMutation = useCreateComment();
  const deleteTopicMutation = useDeleteTopic();
  const postActions = usePostActions({ debounceMs: 300 });
  const navigate = useNavigate();

  // 事件处理器
  const handleChange = (e: Event) => {
    const customEvent = e as CustomEvent;
    setCurrentImageIndex(customEvent.detail.currentIndex);
  };

  const handleSlideActive = (e: Event) => {
    const customEvent = e as CustomEvent;
    const { index } = customEvent.detail;
    const currentItem = topic?.images?.[index];
    if (!currentItem) return;

    const mediaType = checkIsVideo(currentItem)
      ? "video"
      : checkIsLivePhoto(currentItem)
        ? "video"
        : "image";

    setCurrentImageIndex(index);

    const carousel = carouselRef.current;
    if (!carousel) return;

    if (mediaType === "image") {
      // 图片类型：标记等待图片加载完成
      pendingProgressStartRef.current = currentItem.id;
      // 注意：实际的 startSlideProgress 会在 handleImageLoad 中调用
    } else if (mediaType === "video") {
      // 视频类型：使用视频的实际时长，如果还没获取到则使用默认 30 秒（会在元数据加载后重新启动）
      const videoDuration = videoDurations[currentItem.id];
      const durationMs = videoDuration ? videoDuration * 1000 : 30000;

      carousel.startSlideProgress({
        duration: durationMs,
        onComplete: () => {
          carousel.next();
        },
      });

      // 确保视频自动播放
      setIsAutoPlaying(true);
    }
  };

  const handleSlideClick = () => {
    // 点击时暂停自动播放
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.pause();
      setIsAutoPlaying(false);
    }
  };

  // 处理图片加载完成
  const handleImageLoad = useCallback((mediaId: number) => {
    // 只有当这个图片是等待启动进度的图片时才启动
    if (pendingProgressStartRef.current === mediaId) {
      const carousel = carouselRef.current;
      if (carousel) {
        carousel.startSlideProgress({
          duration: 3000,
          onComplete: () => {
            carousel.next();
          },
        });
      }
      pendingProgressStartRef.current = null;
    }
  }, []);

  // 键盘快捷键
  useHotkeys("esc", onClose, { enabled: isOpen });
  useHotkeys("left", () => prevImage(), { enabled: isOpen });
  useHotkeys("right", () => nextImage(), { enabled: isOpen });

  // 使用统一的点赞和收藏操作
  const handleLike = () => {
    if (!topic || !isAuthenticated) {
      return;
    }
    setShowFloatingHearts(true);
    postActions.handleLike(topicId, topic.isLiked);

    setTimeout(() => {
      setShowFloatingHearts(false);
    }, 800);
  };

  const handleSave = () => {
    if (!topic || !isAuthenticated) {
      return;
    }
    postActions.handleSave(topicId, topic.isSaved);
  };

  const handleSubmitComment = async (content: string) => {
    if (!(content.trim() && isAuthenticated && user)) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      createCommentMutation.mutate(
        {
          content: content.trim(),
          userId: user.id,
          topicId,
        },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        },
      );
    });
  };

  const handleSubmitReply = async (commentId: number, content: string, replyToUserId?: number) => {
    if (!(content.trim() && isAuthenticated && user)) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      createCommentMutation.mutate(
        {
          content: content.trim(),
          userId: user.id,
          topicId,
          parentId: commentId,
          replyToUserId,
        },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        },
      );
    });
  };

  const handleDelete = async () => {
    try {
      await deleteTopicMutation.mutateAsync(topicId);
      onClose();
      // 可选：导航回首页或显示删除成功提示
    } catch (error) {
      console.error("删除动态失败:", error);
    }
  };

  const nextImage = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
      carouselRef.current.pause();
      setIsAutoPlaying(false);
    }
  };

  const prevImage = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
      carouselRef.current.pause();
      setIsAutoPlaying(false);
    }
  };

  // 处理视频播放结束 - 视频播放完成后的回调
  const handleVideoEnded = useCallback(() => {
    // startSlideProgress 的 onComplete 会自动触发切换
  }, [currentImageIndex]);

  // 处理视频时长变化 - 存储每个视频的实际时长
  const handleDurationChange = useCallback(
    (mediaId: number, duration: number) => {
      setVideoDurations((prev) => ({
        ...prev,
        [mediaId]: duration,
      }));

      // 如果这个视频是当前激活的幻灯片，重新启动进度条使用正确的时长
      const currentItem = topic?.images?.[currentImageIndex];
      if (currentItem && currentItem.id === mediaId) {
        const carousel = carouselRef.current;
        if (carousel) {
          carousel.startSlideProgress({
            duration: duration * 1000,
            onComplete: () => {
              carousel.next();
            },
          });
        }
      }
    },
    [currentImageIndex, topic?.images],
  );

  // 清理：组件卸载时的清理工作
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (isLoading && isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="max-h-[90vh] max-w-6xl rounded-lg bg-background p-8 shadow-2xl"
            exit={{ scale: 0.9, opacity: 0 }}
            initial={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center py-20">
              <div className="space-y-4 text-center">
                <LoadingSpinner size="lg" />
                <p className="animate-pulse text-muted-foreground">正在加载精彩内容...</p>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  if ((error || !topic) && isOpen) {
    return (
      <AnimatePresence>
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-md rounded-lg bg-background p-8 shadow-2xl"
            exit={{ scale: 0.9, opacity: 0 }}
            initial={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <span className="text-2xl">😕</span>
              </div>
              <p className="mb-4 text-red-600">内容加载失败</p>
              <Button
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => window.location.reload()}
              >
                重新加载
              </Button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  if (!topic) return null;

  const hasImages = topic.images && topic.images.length > 0;

  // 计算动画的初始位置
  const getInitialPosition = () => {
    if (!originRect) return { scale: 0.9, opacity: 0, y: 20 };

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const cardCenterX = originRect.left + originRect.width / 2;
    const cardCenterY = originRect.top + originRect.height / 2;

    // 计算缩放比例 - 从卡片大小到对话框大小
    // 根据屏幕宽度选择合适的最大宽度
    let maxDialogWidth = 1400;
    if (!hasImages) {
      maxDialogWidth = 672; // max-w-2xl (42rem)
    } else if (window.innerWidth >= 1536)
      maxDialogWidth = 1800; // 2xl
    else if (window.innerWidth >= 1280)
      maxDialogWidth = 1600; // xl
    else if (window.innerWidth >= 1024) maxDialogWidth = 1400; // lg

    const dialogWidth = Math.min(window.innerWidth * 0.85, maxDialogWidth);
    const scaleX = originRect.width / dialogWidth;

    // 对于没有图片的纯文本内容，高度是自适应的，很难准确计算 scaleY
    // 使用 scaleX 作为主要缩放比例，或者给一个更合理的估算值
    let scaleY = originRect.height / (window.innerHeight * 0.95);
    if (!hasImages) {
      // 估算纯文本弹窗的大致高度 (比如 600px)
      // 或者直接使用 scaleX 来保持比例，避免过度变形
      scaleY = scaleX;
    }

    const scale = Math.max(scaleX, scaleY, 0.2); // 最小缩放 0.2

    return {
      x: cardCenterX - centerX,
      y: cardCenterY - centerY,
      scale: scale,
      opacity: 0,
    };
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={onClose}
              transition={{ duration: 0.2 }}
            />

            {/* 对话框内容 */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                className={`relative w-full overflow-hidden rounded-lg border-0 bg-background shadow-2xl ${
                  hasImages
                    ? "h-[95vh] max-w-[85vw] md:max-w-[80vw] lg:max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px]"
                    : "h-auto max-h-[85vh] max-w-2xl my-8"
                }`}
                exit={getInitialPosition()}
                initial={getInitialPosition()}
                onClick={(e) => e.stopPropagation()}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  opacity: { duration: 0.2 },
                }}
              >
                {/* 隐藏的标题用于可访问性 */}
                <span className="sr-only">{topic?.title || "话题详情"}</span>

                {/* 左右分栏布局 */}
                <div
                  className={`relative flex w-full overflow-hidden ${hasImages ? "h-full" : "h-auto flex-col"}`}
                >
                  {/* 左侧：图片区域 */}
                  {hasImages && (
                    <div className="relative flex flex-1 items-center justify-center bg-black overflow-hidden">
                      <ErrorBoundary>
                        <eos-carousel
                          autoplay={isAutoPlaying}
                          indicator-style="tiktok"
                          interval={1500}
                          loop={true}
                          initial-index={initialImageIndex}
                          ref={carouselRef}
                          show-controls={false}
                          onchange={handleChange as any}
                          onslide-active={handleSlideActive as any}
                          onslide-click={handleSlideClick as any}
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
                        >
                          {topic.images?.map((image, index) => (
                            <div
                              data-media-type={checkIsVideo(image) ? "video" : "image"}
                              key={`${image.id}-${index}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setPreviewImageIndex(index);
                                setImagePreviewOpen(true);
                              }}
                            >
                              <MediaPlayer
                                media={image}
                                className="h-full w-full"
                                isActive={index === currentImageIndex}
                                isPlaying={
                                  index === currentImageIndex &&
                                  (checkIsVideo(image) ? true : isAutoPlaying)
                                }
                                onEnded={handleVideoEnded}
                                onDurationChange={(duration) =>
                                  handleDurationChange(image.id, duration)
                                }
                                onImageLoad={() => handleImageLoad(image.id)}
                              />
                            </div>
                          ))}
                        </eos-carousel>
                      </ErrorBoundary>
                    </div>
                  )}

                  {/* 右侧：信息面板 */}
                  <motion.div
                    animate={{ x: 0, opacity: 1 }}
                    className={`relative flex w-full flex-col bg-white shrink-0 ${
                      hasImages ? "lg:w-[450px] h-full" : "w-full h-auto"
                    }`}
                    initial={{ x: 100, opacity: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.1,
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    {/* 极简几何背景 */}
                    <div className="pointer-events-none absolute inset-0">
                      {/* 顶部细线网格 */}
                      <svg className="absolute top-0 left-0 w-full h-32 opacity-[0.02]">
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <rect
                              width="20"
                              height="20"
                              fill="none"
                              stroke="#000"
                              strokeWidth="0.5"
                            />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                      {/* 侧边竖线 */}
                      <div className="absolute top-0 left-8 w-[1px] h-full bg-gradient-to-b from-black/10 via-black/5 to-transparent" />
                    </div>

                    {/* 头部区域 */}
                    <div className="relative border-b border-gray-200">
                      {/* 关闭按钮 - 移到左上角 */}
                      <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center group hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="关闭"
                      >
                        <div className="relative w-5 h-5">
                          <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-gray-600 group-hover:bg-black transform -translate-y-1/2 rotate-45 transition-all"></span>
                          <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-gray-600 group-hover:bg-black transform -translate-y-1/2 -rotate-45 transition-all"></span>
                        </div>
                      </button>

                      {/* 编号和日期 */}
                      <div className="pl-10 pr-16 pt-8 pb-2">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-[11px] text-gray-400">
                            编号 · {String(topicId).padStart(5, "0")}
                          </span>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span className="text-[11px] text-gray-500">
                              {new Date(topic.createdAt).toLocaleDateString("zh-CN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {topic.updatedAt &&
                              // 比较到分钟级别，避免毫秒差异导致显示相同时间
                              Math.floor(new Date(topic.updatedAt).getTime() / 60000) !==
                                Math.floor(new Date(topic.createdAt).getTime() / 60000) && (
                                <span className="text-[10px] text-gray-400">
                                  更新于{" "}
                                  {new Date(topic.updatedAt).toLocaleDateString("zh-CN", {
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* 作者信息 - 极简布局 */}
                      <div className="pl-10 pr-8 pb-6">
                        <div className="flex items-end justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="relative cursor-pointer group"
                              onClick={() => {
                                onClose();
                                setTimeout(() => {
                                  navigate({ to: "/profile", search: { userId: topic.author.id } });
                                }, 100);
                              }}
                            >
                              <div className="w-10 h-10 overflow-hidden bg-gray-200 group-hover:bg-gray-300 transition-all rounded-lg">
                                {topic.author.avatar ? (
                                  <img
                                    src={topic.author.avatar}
                                    alt={topic.author.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white">
                                    <User size={16} strokeWidth={1} />
                                  </div>
                                )}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-black rounded-sm" />
                            </div>

                            <div>
                              <h3
                                className="font-medium text-gray-900 text-sm cursor-pointer hover:text-black hover:underline underline-offset-4 transition-colors"
                                onClick={() => {
                                  onClose();
                                  setTimeout(() => {
                                    navigate({
                                      to: "/profile",
                                      search: { userId: topic.author.id },
                                    });
                                  }, 100);
                                }}
                              >
                                {topic.author.name}
                              </h3>
                              <div className="mt-0.5 text-[11px] text-gray-400">
                                {topic.location || ""}
                              </div>
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          <div className="flex items-center gap-4">
                            {user && topic.author && user.id === topic.author.id && (
                              <>
                                <button
                                  onClick={() => onEdit?.(topicId)}
                                  className="text-gray-400 hover:text-black transition-colors"
                                  title="编辑"
                                >
                                  <Edit size={14} strokeWidth={1.5} />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(true)}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  title="删除"
                                >
                                  <Trash2 size={14} strokeWidth={1.5} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 中间：可滚动内容区域 */}
                    <ScrollArea className={`flex-1 ${!hasImages && "min-h-[300px]"}`}>
                      <div className="pl-10 pr-8 py-8">
                        {/* 标题区 - 分栏式设计 */}
                        <div className="mb-8">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-1 pt-2">
                              <div className="w-full h-[1px] bg-gray-300" />
                            </div>
                            <div className="col-span-11">
                              <h1 className="text-2xl font-semibold text-black leading-snug">
                                {topic.title}
                              </h1>
                              <div className="mt-3 flex items-center gap-3">
                                <span className="text-[11px] text-gray-600">文章</span>
                                <div className="w-4 h-[1px] bg-gray-300" />
                                <span className="text-[11px] text-gray-500">
                                  {topic.images?.length || 0} 张图片
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 内容 - 编辑排版 */}
                        <div className="mb-8">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-1 text-right">
                              <span className="text-[10px] text-gray-400">01</span>
                            </div>
                            <div className="col-span-11">
                              <div
                                className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: topic.content }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* 标签 */}
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="mb-8 pb-6 border-b border-gray-100">
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-1 text-right">
                                <span className="text-[10px] text-gray-400">02</span>
                              </div>
                              <div className="col-span-11">
                                <div className="flex flex-wrap gap-2">
                                  {topic.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-900 hover:text-white transition-all cursor-pointer"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 互动统计 */}
                        <div className="mb-6 border-t border-gray-200 py-4">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-1 text-right">
                              <span className="text-[10px] text-gray-400">03</span>
                            </div>
                            <div className="col-span-11">
                              <div className="grid grid-cols-3 gap-6">
                                <div>
                                  <div className="text-xl font-semibold text-black">
                                    {topic.likes.toLocaleString()}
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-gray-500">赞赏</div>
                                </div>
                                <div>
                                  <div className="text-xl font-semibold text-black">
                                    {(comments?.length || 0).toLocaleString()}
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-gray-500">回应</div>
                                </div>
                                <div>
                                  <div className="text-xl font-semibold text-black">
                                    {topic.saves.toLocaleString()}
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-gray-500">收藏</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 互动按钮 - 简洁设计 */}
                        <div className="mb-6">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-1" />
                            <div className="col-span-11">
                              <div className="flex gap-2.5">
                                {/* 赞赏按钮 */}
                                <motion.button
                                  onClick={handleLike}
                                  className={`group relative flex-1 px-4 py-2 flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all duration-300 overflow-hidden ${
                                    topic.isLiked
                                      ? "bg-black text-white shadow-md"
                                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:shadow-sm"
                                  }`}
                                  disabled={postActions.isLoading}
                                  whileTap={{ scale: 0.96 }}
                                  whileHover={{ scale: 1.01 }}
                                >
                                  {/* 微妙的背景效果 */}
                                  {!topic.isLiked && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  )}

                                  <motion.div
                                    animate={topic.isLiked ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Heart
                                      size={16}
                                      strokeWidth={2}
                                      className={`transition-all duration-200 ${
                                        topic.isLiked
                                          ? "fill-white stroke-white"
                                          : "stroke-gray-600 group-hover:stroke-black"
                                      }`}
                                    />
                                  </motion.div>
                                  <span className="relative z-10">
                                    {topic.isLiked ? "已赞赏" : "赞赏"}
                                  </span>
                                </motion.button>

                                {/* 收藏按钮 */}
                                <motion.button
                                  onClick={handleSave}
                                  className={`group relative flex-1 px-4 py-2 flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all duration-300 overflow-hidden ${
                                    topic.isSaved
                                      ? "bg-black text-white shadow-md"
                                      : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400 hover:shadow-sm"
                                  }`}
                                  disabled={postActions.isLoading}
                                  whileTap={{ scale: 0.96 }}
                                  whileHover={{ scale: 1.01 }}
                                >
                                  {/* 微妙的背景效果 */}
                                  {!topic.isSaved && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  )}

                                  <motion.div
                                    animate={topic.isSaved ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Bookmark
                                      size={16}
                                      strokeWidth={2}
                                      className={`transition-all duration-200 ${
                                        topic.isSaved
                                          ? "fill-white stroke-white"
                                          : "stroke-gray-600 group-hover:stroke-black"
                                      }`}
                                    />
                                  </motion.div>
                                  <span className="relative z-10">
                                    {topic.isSaved ? "已收藏" : "收藏"}
                                  </span>
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 浮动爱心动画 */}
                        <AnimatePresence>
                          {showFloatingHearts && (
                            <motion.div
                              animate={{ opacity: 0, y: -40 }}
                              className="pointer-events-none fixed bottom-20 left-1/2 -translate-x-1/2"
                              exit={{ opacity: 0 }}
                              initial={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.8 }}
                            >
                              <div className="relative">
                                <Heart className="fill-black text-black" size={24} />
                                <Heart
                                  className="absolute -top-2 -right-2 fill-black/20 text-black/20"
                                  size={16}
                                />
                                <Heart
                                  className="absolute -bottom-1 -left-2 fill-black/10 text-black/10"
                                  size={12}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* 评论区域 */}
                        <CommentSection
                          comments={comments || []}
                          isLoading={commentsLoading}
                          onCreateComment={handleSubmitComment}
                          onCreateReply={handleSubmitReply}
                          topicId={topicId}
                        />
                      </div>
                    </ScrollArea>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* 图片大图预览 */}
      {topic?.images && (
        <ImagePreview
          images={topic.images}
          initialIndex={previewImageIndex}
          isOpen={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
        />
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="确定要删除这条动态吗？"
        description="删除后将无法恢复，所有相关的评论和点赞也会一并删除。"
        onConfirm={handleDelete}
        confirmText="删除"
        variant="destructive"
      />
    </>
  );
}
