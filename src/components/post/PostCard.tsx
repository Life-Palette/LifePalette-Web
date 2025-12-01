import { Bookmark, Heart, MapPin, MessageCircle } from "lucide-react";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import RichTextContent from "@/components/editor/RichTextContent";
import ImageGallery from "@/components/media/ImageGallery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { MESSAGES } from "@/constants/messages";
import type { Post } from "@/types";
import { formatRelativeTime } from "@/utils/date";

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onClick: (postId: string, event?: React.MouseEvent, imageIndex?: number) => void;
}

// 预设的柔和渐变背景组合
const GRADIENT_VARIANTS = [
  "from-primary/5 via-background to-secondary/20 hover:from-primary/10 hover:to-secondary/30",
  "from-blue-500/5 via-background to-cyan-500/10 hover:from-blue-500/10 hover:to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/5",
  "from-rose-500/5 via-background to-orange-500/10 hover:from-rose-500/10 hover:to-orange-500/20 dark:from-rose-500/10 dark:to-orange-500/5",
  "from-violet-500/5 via-background to-fuchsia-500/10 hover:from-violet-500/10 hover:to-fuchsia-500/20 dark:from-violet-500/10 dark:to-fuchsia-500/5",
  "from-emerald-500/5 via-background to-teal-500/10 hover:from-emerald-500/10 hover:to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/5",
  "from-amber-500/5 via-background to-yellow-500/10 hover:from-amber-500/10 hover:to-yellow-500/20 dark:from-amber-500/10 dark:to-yellow-500/5",
];

export default function PostCard({ post, onLike, onSave, onClick }: PostCardProps) {
  const handleImageClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // 跳转到详情页，并传递图片索引
    onClick(post.id, e, index);
  };

  // 根据 post.id 获取确定的渐变色索引
  const gradientIndex =
    typeof post.id === "string"
      ? post.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
        GRADIENT_VARIANTS.length
      : Number(post.id) % GRADIENT_VARIANTS.length;

  const gradientClass = GRADIENT_VARIANTS[gradientIndex];

  return (
    <>
      <Card
        className={`group relative w-full cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 border border-transparent ${
          post.images.length === 0
            ? `bg-gradient-to-br ${gradientClass} shadow-sm hover:shadow-md`
            : "bg-card shadow-sm hover:translate-y-[-2px] hover:shadow-xl dark:shadow-none dark:hover:shadow-white/5 dark:border-white/10"
        }`}
        onClick={(e) => onClick(post.id, e)}
      >
        {/* 图片部分 */}
        {post.images.length > 0 && (
          <div className="relative overflow-hidden">
            <ErrorBoundary
              fallback={
                <div className="flex h-48 w-full items-center justify-center bg-muted/50">
                  <span className="text-muted-foreground text-sm">
                    {MESSAGES.ERROR.IMAGE_LOAD_FAILED}
                  </span>
                </div>
              }
            >
              <ImageGallery
                className="transition-all duration-700 group-hover:scale-105"
                images={post.images}
                maxDisplay={9}
                onImageClick={handleImageClick}
              />
            </ErrorBoundary>
            {/* 渐变遮罩，让文字更清晰 */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        )}

        {/* 纯文本动态的装饰性元素 */}
        {post.images.length === 0 && (
          <>
            {/* 右上角装饰 - 使用 currentColor 实现自适应颜色 */}
            <div className="absolute -top-6 -right-6 opacity-[0.03] transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 group-hover:opacity-[0.08]">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-[12px] border-foreground/50 text-foreground">
                <div className="h-16 w-16 rounded-full bg-foreground/30" />
              </div>
            </div>

            {/* 左下角装饰纹理 */}
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-tr from-white/10 to-transparent opacity-30 blur-2xl transition-all duration-500 group-hover:scale-125" />

            {/* 引用符号装饰 */}
            <div className="absolute top-6 left-6 font-serif text-6xl text-foreground/5 leading-none select-none transition-all duration-300 group-hover:translate-y-[-2px] group-hover:text-foreground/10">
              “
            </div>
          </>
        )}

        {/* 内容部分 */}
        <CardContent
          className={`${post.images.length === 0 ? "relative z-10 p-7 pt-12" : "p-5 pb-4"}`}
        >
          {/* 纯文本动态的引用标记 - 已移除，改为背景装饰 */}

          <h3
            className={`mb-3 line-clamp-3 font-bold text-foreground tracking-tight transition-colors group-hover:text-primary/90 ${
              post.images.length === 0 ? "text-xl leading-relaxed" : "text-lg line-clamp-2"
            }`}
          >
            {post.title}
          </h3>
          <RichTextContent
            className={`mb-4 text-muted-foreground leading-relaxed ${
              post.images.length === 0 ? "text-base" : "text-sm"
            }`}
            content={post.content}
            maxLines={post.images.length === 0 ? 5 : 3}
          />

          {/* 标签 */}
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  className="cursor-pointer rounded-md bg-secondary/50 px-2 py-0.5 font-normal text-secondary-foreground text-xs transition-all hover:bg-secondary hover:text-primary"
                  key={index}
                  variant="secondary"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* 位置和时间信息的行 */}
          <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground/80">
            {post.location && (
              <div className="flex items-center gap-1 truncate max-w-[60%]">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{post.location}</span>
              </div>
            )}
            <span className={post.location ? "shrink-0" : "w-full text-left"}>
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* 用户信息和互动按钮的容器 */}
          <div className="flex items-center justify-between border-border/50 pt-2">
            {/* 用户信息 */}
            <div className="flex items-center gap-2.5 min-w-0 max-w-[40%] group/avatar">
              <Avatar className="h-7 w-7 ring-2 ring-background transition-transform group-hover/avatar:scale-105">
                <AvatarImage alt={post.author.name} src={post.author.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {post.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="truncate font-medium text-foreground text-sm group-hover/avatar:text-primary transition-colors">
                {post.author.name}
              </div>
            </div>

            {/* 互动按钮 */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                className={`flex h-8 items-center gap-1 rounded-full px-2 transition-all duration-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 ${
                  post.isLiked ? "text-red-500" : "text-muted-foreground"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(post.id);
                }}
                size="sm"
                variant="ghost"
              >
                <Heart
                  className={`transition-transform duration-300 ${post.isLiked ? "fill-current scale-110" : "group-hover:scale-110"}`}
                  size={16}
                />
                <span className="text-xs font-medium tabular-nums">
                  {post.likes > 0 ? post.likes : ""}
                </span>
              </Button>

              <Button
                className="flex h-8 items-center gap-1 rounded-full px-2 text-muted-foreground transition-all duration-300 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-950/30"
                size="sm"
                variant="ghost"
              >
                <MessageCircle
                  className="transition-transform duration-300 group-hover:scale-110"
                  size={16}
                />
                <span className="text-xs font-medium tabular-nums">
                  {post.comments > 0 ? post.comments : ""}
                </span>
              </Button>

              <Button
                className={`flex h-8 items-center gap-1 rounded-full px-2 transition-all duration-300 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-950/30 ${
                  post.isSaved ? "text-amber-500" : "text-muted-foreground"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(post.id);
                }}
                size="sm"
                variant="ghost"
              >
                <Bookmark
                  className={`transition-transform duration-300 ${post.isSaved ? "fill-current scale-110" : "group-hover:scale-110"}`}
                  size={16}
                />
                <span className="text-xs font-medium tabular-nums">
                  {post.saves > 0 ? post.saves : ""}
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
