import { registerComponents } from "@eosjs/components";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Edit, Heart, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import MarkdownRenderer from "@/components/editor/MarkdownRenderer";
import ImagePreview from "@/components/media/ImagePreview";
import MediaCarousel from "@/components/media/MediaCarousel";
import type { MediaCarouselRef } from "@/components/media/MediaCarousel";
import CommentSection from "@/components/post/CommentSection";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { usePostActions } from "@/hooks/useInteractions";
import {
  useComments,
  useCreateComment,
  useDeleteTopic,
  useTopicDetail,
} from "@/hooks/useTopicDetail";

// 注册 Eos Web Components
registerComponents();

interface SimpleImageDetailProps {
  initialImageIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (topicId: number | string) => void;
  originRect?: DOMRect | null;
  topicId: number | string;
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
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isMountedRef = useRef(true);

  // Carousel ref
  const carouselRef = useRef<MediaCarouselRef>(null);

  const { isAuthenticated, user } = useIsAuthenticated();
  const { data: topic, isLoading, error } = useTopicDetail(topicId, user?.id);
  const { data: comments, isLoading: commentsLoading } = useComments(topicId);
  const createCommentMutation = useCreateComment();
  const deleteTopicMutation = useDeleteTopic();
  const postActions = usePostActions({ debounceMs: 300 });
  const navigate = useNavigate();

  // 键盘快捷键
  useHotkeys("esc", onClose, { enabled: isOpen });
  useHotkeys("left", () => prevImage(), { enabled: isOpen });
  useHotkeys("right", () => nextImage(), { enabled: isOpen });

  // 使用统一的点赞和收藏操作
  const handleLike = () => {
    if (!(topic && isAuthenticated)) {
      return;
    }
    setShowFloatingHearts(true);
    postActions.handleLike(topicId, topic.isLiked);

    setTimeout(() => {
      setShowFloatingHearts(false);
    }, 800);
  };

  const handleSave = () => {
    if (!(topic && isAuthenticated)) {
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
          topicSecUid: String(topicId),
        },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        }
      );
    });
  };

  const handleSubmitReply = async (commentId: number, content: string, _replyToUserId?: number) => {
    if (!(content.trim() && isAuthenticated && user)) {
      return;
    }

    return new Promise<void>((resolve, reject) => {
      createCommentMutation.mutate(
        {
          content: content.trim(),
          topicSecUid: String(topicId),
          parentSecUid: String(commentId),
        },
        {
          onSuccess: () => {
            resolve();
          },
          onError: (error) => {
            reject(error);
          },
        }
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
    carouselRef.current?.next();
  };

  const prevImage = () => {
    carouselRef.current?.prev();
  };

  // 清理：组件卸载时的清理工作
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 非打开状态且无数据时不渲染
  if (!isOpen && !topic) {
    return null;
  }

  const hasImages = topic?.images && topic.images.length > 0;

  // 计算动画的初始位置
  const getInitialPosition = () => {
    if (!originRect) {
      return { scale: 0.9, opacity: 0, y: 20 };
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const cardCenterX = originRect.left + originRect.width / 2;
    const cardCenterY = originRect.top + originRect.height / 2;

    // 计算缩放比例 - 从卡片大小到对话框大小
    // 根据屏幕宽度选择合适的最大宽度
    let maxDialogWidth = 1400;
    if (isLoading || !topic) {
      maxDialogWidth = 1152; // max-w-6xl
    } else if (!hasImages) {
      maxDialogWidth = 672; // max-w-2xl (42rem)
    } else if (window.innerWidth >= 1536) {
      maxDialogWidth = 1800; // 2xl
    } else if (window.innerWidth >= 1280) {
      maxDialogWidth = 1600; // xl
    } else if (window.innerWidth >= 1024) {
      maxDialogWidth = 1400; // lg
    }

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
      scale,
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
              key="backdrop"
              onClick={onClose}
              transition={{ duration: 0.2 }}
            />

            {/* 对话框内容 */}
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" key="dialog">
              <motion.div
                animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                className={`relative w-full overflow-hidden rounded-lg border-0 bg-background shadow-2xl ${
                  isLoading || error || !topic
                    ? "max-h-[90vh] max-w-6xl"
                    : hasImages
                      ? "h-[95vh] max-w-[85vw] md:max-w-[80vw] lg:max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1600px]"
                      : "my-8 h-auto max-h-[85vh] max-w-2xl"
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

                {/* 加载中 / 错误 / 正常内容 */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="space-y-4 text-center">
                      <LoadingSpinner size="lg" />
                      <p className="animate-pulse text-muted-foreground">正在加载精彩内容...</p>
                    </div>
                  </div>
                ) : error || !topic ? (
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
                ) : (
                <div
                  className={`relative flex w-full ${hasImages ? "h-full overflow-hidden flex-col lg:flex-row" : "max-h-[85vh] overflow-hidden flex-col"}`}
                >
                  {/* 左侧：图片区域 */}
                  {hasImages && (
                    <div className="relative flex h-[40vh] items-center justify-center overflow-hidden bg-black lg:h-full lg:flex-1">
                      <MediaCarousel
                        images={topic.images || []}
                        initialIndex={initialImageIndex}
                        onIndexChange={setCurrentImageIndex}
                        onSlideClick={(index) => {
                          setPreviewImageIndex(index);
                          setImagePreviewOpen(true);
                        }}
                        ref={carouselRef}
                      />
                    </div>
                  )}

                  {/* 右侧：信息面板 */}
                  <motion.div
                    animate={{ x: 0, opacity: 1 }}
                    className={`relative flex w-full shrink-0 flex-col bg-white ${
                      hasImages ? "min-h-0 flex-1 lg:h-full lg:w-[450px] lg:flex-none" : "max-h-[85vh] w-full"
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
                      <svg className="absolute top-0 left-0 h-32 w-full opacity-[0.02]">
                        <defs>
                          <pattern height="20" id="grid" patternUnits="userSpaceOnUse" width="20">
                            <rect
                              fill="none"
                              height="20"
                              stroke="#000"
                              strokeWidth="0.5"
                              width="20"
                            />
                          </pattern>
                        </defs>
                        <rect fill="url(#grid)" height="100%" width="100%" />
                      </svg>
                      {/* 侧边竖线 */}
                      <div className="absolute top-0 left-8 h-full w-[1px] bg-gradient-to-b from-black/10 via-black/5 to-transparent" />
                    </div>

                    {/* 头部区域 */}
                    <div className="relative border-gray-200 border-b">
                      {/* 关闭按钮 - 移到左上角 */}
                      <button
                        aria-label="关闭"
                        className="group absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                        onClick={onClose}
                      >
                        <div className="relative h-5 w-5">
                          <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 rotate-45 transform bg-gray-600 transition-all group-hover:bg-black" />
                          <span className="absolute top-1/2 left-0 h-[1.5px] w-full -translate-y-1/2 -rotate-45 transform bg-gray-600 transition-all group-hover:bg-black" />
                        </div>
                      </button>

                      {/* 编号和日期 */}
                      <div className="pt-8 pr-16 pb-2 pl-10">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-[11px] text-gray-400">
                            编号 · {String(topicId).padStart(5, "0")}
                          </span>
                          <div className="flex flex-shrink-0 flex-col items-end gap-1">
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
                              Math.floor(new Date(topic.updatedAt).getTime() / 60_000) !==
                                Math.floor(new Date(topic.createdAt).getTime() / 60_000) && (
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
                      <div className="pr-8 pb-6 pl-10">
                        <div className="flex items-end justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="group relative cursor-pointer"
                              onClick={() => {
                                onClose();
                                setTimeout(() => {
                                  navigate({
                                    to: "/profile",
                                    search: { userId: topic.author.id, tab: undefined },
                                  });
                                }, 100);
                              }}
                            >
                              <div className="h-10 w-10 overflow-hidden rounded-lg bg-gray-200 transition-all group-hover:bg-gray-300">
                                {topic.author.avatar ? (
                                  <img
                                    alt={topic.author.name}
                                    className="h-full w-full object-cover"
                                    height={40}
                                    src={topic.author.avatar}
                                    width={40}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-white">
                                    <User size={16} strokeWidth={1} />
                                  </div>
                                )}
                              </div>
                              <div className="absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-sm bg-black" />
                            </div>

                            <div>
                              <h3
                                className="cursor-pointer font-medium text-gray-900 text-sm underline-offset-4 transition-colors hover:text-black hover:underline"
                                onClick={() => {
                                  onClose();
                                  setTimeout(() => {
                                    navigate({
                                      to: "/profile",
                                      search: { userId: topic.author.id, tab: undefined },
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
                                  className="text-gray-400 transition-colors hover:text-black"
                                  onClick={() => onEdit?.(topicId)}
                                  title="编辑"
                                >
                                  <Edit size={14} strokeWidth={1.5} />
                                </button>
                                <button
                                  className="text-gray-400 transition-colors hover:text-red-500"
                                  onClick={() => setShowDeleteConfirm(true)}
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
                    <ScrollArea className={`min-h-0 flex-1 overflow-auto ${!hasImages && "min-h-[300px]"}`}>
                      <div className="py-8 pr-8 pl-10">
                        {/* 标题区 - 分栏式设计 */}
                        <div className="mb-8">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-1 pt-2">
                              <div className="h-[1px] w-full bg-gray-300" />
                            </div>
                            <div className="col-span-11">
                              <h1 className="font-semibold text-2xl text-black leading-snug">
                                {topic.title}
                              </h1>
                              <div className="mt-3 flex items-center gap-3">
                                <span className="text-[11px] text-gray-600">文章</span>
                                <div className="h-[1px] w-4 bg-gray-300" />
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
                              {topic.contentType === "markdown" ? (
                                <MarkdownRenderer
                                  className="text-gray-800 leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80"
                                  content={topic.content}
                                />
                              ) : (
                                <div
                                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80"
                                  dangerouslySetInnerHTML={{ __html: topic.content }}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 标签 */}
                        {topic.tags && topic.tags.length > 0 && (
                          <div className="mb-8 border-gray-100 border-b pb-6">
                            <div className="grid grid-cols-12 gap-4">
                              <div className="col-span-1 text-right">
                                <span className="text-[10px] text-gray-400">02</span>
                              </div>
                              <div className="col-span-11">
                                <div className="flex flex-wrap gap-2">
                                  {topic.tags.map((tag, index) => (
                                    <span
                                      className="inline-flex cursor-pointer items-center rounded-md bg-gray-100 px-2.5 py-1 font-medium text-gray-700 text-xs transition-all hover:bg-gray-900 hover:text-white"
                                      key={index}
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
                        <div className="mb-6 border-gray-200 border-t py-4">
                          <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-1 text-right">
                              <span className="text-[10px] text-gray-400">03</span>
                            </div>
                            <div className="col-span-11">
                              <div className="grid grid-cols-3 gap-6">
                                <div>
                                  <div className="font-semibold text-black text-xl">
                                    {topic.likes.toLocaleString()}
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-gray-500">赞赏</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-black text-xl">
                                    {(comments?.length || 0).toLocaleString()}
                                  </div>
                                  <div className="mt-0.5 text-[10px] text-gray-500">回应</div>
                                </div>
                                <div>
                                  <div className="font-semibold text-black text-xl">
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
                                  className={`group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-2 font-medium text-sm transition-all duration-300 ${
                                    topic.isLiked
                                      ? "bg-black text-white shadow-md"
                                      : "border border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm"
                                  }`}
                                  disabled={postActions.isLoading}
                                  onClick={handleLike}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  {/* 微妙的背景效果 */}
                                  {!topic.isLiked && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                  )}

                                  <motion.div
                                    animate={topic.isLiked ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Heart
                                      className={`transition-all duration-200 ${
                                        topic.isLiked
                                          ? "fill-white stroke-white"
                                          : "stroke-gray-600 group-hover:stroke-black"
                                      }`}
                                      size={16}
                                      strokeWidth={2}
                                    />
                                  </motion.div>
                                  <span className="relative z-10">
                                    {topic.isLiked ? "已赞赏" : "赞赏"}
                                  </span>
                                </motion.button>

                                {/* 收藏按钮 */}
                                <motion.button
                                  className={`group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-2 font-medium text-sm transition-all duration-300 ${
                                    topic.isSaved
                                      ? "bg-black text-white shadow-md"
                                      : "border border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm"
                                  }`}
                                  disabled={postActions.isLoading}
                                  onClick={handleSave}
                                  whileHover={{ scale: 1.01 }}
                                  whileTap={{ scale: 0.96 }}
                                >
                                  {/* 微妙的背景效果 */}
                                  {!topic.isSaved && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                  )}

                                  <motion.div
                                    animate={topic.isSaved ? { scale: [1, 1.2, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                  >
                                    <Bookmark
                                      className={`transition-all duration-200 ${
                                        topic.isSaved
                                          ? "fill-white stroke-white"
                                          : "stroke-gray-600 group-hover:stroke-black"
                                      }`}
                                      size={16}
                                      strokeWidth={2}
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
                )}
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
        confirmText="删除"
        description="删除后将无法恢复，所有相关的评论和点赞也会一并删除。"
        onConfirm={handleDelete}
        onOpenChange={setShowDeleteConfirm}
        open={showDeleteConfirm}
        title="确定要删除这条动态吗？"
        variant="destructive"
      />
    </>
  );
}
