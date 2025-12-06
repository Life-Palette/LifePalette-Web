import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Bug,
  Calendar,
  ChevronLeft,
  ChevronRight,
  List,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { MarkdownPreview } from "@/components/changelog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useChangelogByIdentifier, useChangelogs } from "@/hooks/useChangelog";
import { cn } from "@/lib/utils";
import type { ChangelogType } from "@/types";

// 大纲项类型
interface TocItem {
  id: string;
  text: string;
  level: number;
}

// 从 Markdown 内容中提取标题
function extractHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{1,4})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // 生成 ID：移除 emoji 和特殊字符，转为小写
    const id = text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // 移除 emoji
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, "") // 保留中文、字母、数字
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();

    if (text && level <= 4) {
      headings.push({ id, text, level });
    }
  }
  return headings;
}

// 大纲组件
function TableOfContents({ headings, activeId }: { headings: TocItem[]; activeId: string }) {
  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      // 更新 URL hash，方便分享
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-1">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
        <List className="h-4 w-4" />
        <span>目录</span>
      </div>
      <div className="space-y-1 text-sm">
        {headings.map((heading, index) => {
          const isNewSection = heading.level === 1 && index > 0;
          return (
            <div key={heading.id}>
              {isNewSection && <div className="my-4 border-t border-border/40" />}
              <button
                onClick={() => handleClick(heading.id)}
                className={cn(
                  "block w-full text-left py-1.5 px-2 rounded transition-colors",
                  // 层级缩进
                  heading.level === 1 && "font-semibold text-foreground mt-3 mb-1",
                  heading.level === 2 && "pl-4 font-medium",
                  heading.level === 3 && "pl-7 text-muted-foreground",
                  heading.level === 4 && "pl-10 text-muted-foreground/80 text-[13px]",
                  // 激活状态
                  activeId === heading.id
                    ? "text-primary bg-primary/5"
                    : "hover:text-foreground hover:bg-muted/50",
                )}
                type="button"
              >
                <span className="line-clamp-1">{heading.text}</span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

// 更新类型配置
const typeConfig: Record<
  ChangelogType,
  { label: string; icon: React.ReactNode; className: string; bgClass: string }
> = {
  feature: {
    label: "新功能",
    icon: <Sparkles className="h-4 w-4" />,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    bgClass: "from-emerald-500/5 to-emerald-500/0",
  },
  bugfix: {
    label: "Bug 修复",
    icon: <Bug className="h-4 w-4" />,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    bgClass: "from-red-500/5 to-red-500/0",
  },
  improvement: {
    label: "优化改进",
    icon: <Zap className="h-4 w-4" />,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    bgClass: "from-blue-500/5 to-blue-500/0",
  },
  breaking: {
    label: "破坏性变更",
    icon: <AlertTriangle className="h-4 w-4" />,
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    bgClass: "from-orange-500/5 to-orange-500/0",
  },
};

// 格式化日期
function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function ChangelogDetailPage() {
  const { version } = Route.useParams();
  const { data: changelog, isLoading, error } = useChangelogByIdentifier(version);
  const [activeId, setActiveId] = useState("");
  const hasScrolledToHash = useRef(false);

  // 获取所有日志用于导航
  const { data: allLogs } = useChangelogs({ pageSize: 100 });
  const allChangelogs = allLogs?.pages.flatMap((page) => page.items) || [];

  // 查找当前日志在列表中的索引
  const currentIndex = allChangelogs.findIndex((log) => log.version === version);
  const prevLog = currentIndex > 0 ? allChangelogs[currentIndex - 1] : null;
  const nextLog = currentIndex < allChangelogs.length - 1 ? allChangelogs[currentIndex + 1] : null;

  // 提取大纲
  const headings = useMemo(() => {
    if (!changelog?.content) return [];
    return extractHeadings(changelog.content);
  }, [changelog?.content]);

  // 页面加载时，根据 URL hash 滚动到对应锚点
  useEffect(() => {
    if (hasScrolledToHash.current || headings.length === 0) return;

    const hash = window.location.hash.slice(1); // 移除 # 前缀
    if (!hash) return;

    // 解码 URL 编码的 hash（如 %E4%B8%AA%E4%BA%BA%E7%A9%BA%E9%97%B4 -> 个人空间）
    const decodedHash = decodeURIComponent(hash);

    // 轮询等待 DOM 元素渲染完成
    let attempts = 0;
    const maxAttempts = 20;
    const checkElement = () => {
      const element = document.getElementById(decodedHash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(decodedHash);
        hasScrolledToHash.current = true;
      } else if (attempts < maxAttempts) {
        attempts++;
        requestAnimationFrame(checkElement);
      }
    };
    checkElement();
  }, [headings]);

  // 监听滚动，更新当前激活的标题
  useEffect(() => {
    const handleScroll = () => {
      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        const rect = el.getBoundingClientRect();
        if (rect.top <= 100) {
          setActiveId(headings[i].id);
          return;
        }
      }
      if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  // 分享功能（包含当前锚点）
  const handleShare = async () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = activeId ? `${baseUrl}#${activeId}` : baseUrl;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${changelog?.version} - ${changelog?.title}`,
          text: `查看 LifePalette ${changelog?.version} 更新日志`,
          url,
        });
      } catch {
        // 用户取消分享
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("链接已复制到剪贴板");
    }
  };

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="lg" text="加载中..." />
      </div>
    );
  }

  // 错误状态
  if (error || !changelog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-foreground">未找到该版本</h2>
          <p className="mb-6 text-muted-foreground">版本 {version} 不存在或已被删除</p>
          <Link to="/changelog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回更新日志
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const config = typeConfig[changelog.type] || typeConfig.feature;

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/changelog">
            <Button className="gap-2" size="sm" variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回列表</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={handleShare} size="sm" variant="outline">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">分享</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 主体布局：内容 + 侧边大纲 */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-8">
          {/* 主内容区域 */}
          <main className="flex-1 min-w-0">
            {/* 版本信息头部 */}
            <div className={cn("mb-8 rounded-2xl bg-gradient-to-b p-8", config.bgClass)}>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h1 className="font-mono text-3xl font-bold text-foreground sm:text-4xl">
                  {changelog.version}
                </h1>
                <Badge
                  className={cn("flex items-center gap-1.5 px-3 py-1", config.className)}
                  variant="outline"
                >
                  {config.icon}
                  {config.label}
                </Badge>
              </div>

              <h2 className="mb-4 text-xl font-medium text-foreground sm:text-2xl">
                {changelog.title}
              </h2>

              {changelog.publishedAt && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>发布于 {formatDate(changelog.publishedAt)}</span>
                </div>
              )}
            </div>

            {/* Markdown 内容 */}
            <Card className="mb-8">
              <CardContent className="p-6 sm:p-8">
                <MarkdownPreview content={changelog.content} />
              </CardContent>
            </Card>

            {/* 版本导航 */}
            <Separator className="my-8" />

            <div className="grid grid-cols-2 gap-4">
              {prevLog ? (
                <Link
                  className="group"
                  to="/changelog/$version"
                  params={{ version: prevLog.version }}
                >
                  <Card className="h-full p-4 transition-colors hover:bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                      <ChevronLeft className="h-4 w-4" />
                      <span>上一版本</span>
                    </div>
                    <div className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                      {prevLog.version}
                    </div>
                    <div className="text-muted-foreground text-sm line-clamp-1 mt-1">
                      {prevLog.title}
                    </div>
                  </Card>
                </Link>
              ) : (
                <div />
              )}

              {nextLog ? (
                <Link
                  className="group"
                  to="/changelog/$version"
                  params={{ version: nextLog.version }}
                >
                  <Card className="h-full p-4 transition-colors hover:bg-muted/50 text-right">
                    <div className="flex items-center justify-end gap-2 text-muted-foreground text-sm mb-1">
                      <span>下一版本</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                    <div className="font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                      {nextLog.version}
                    </div>
                    <div className="text-muted-foreground text-sm line-clamp-1 mt-1">
                      {nextLog.title}
                    </div>
                  </Card>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </main>

          {/* 侧边大纲 - 仅在大屏显示 */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-20">
                <Card className="p-4">
                  <TableOfContents activeId={activeId} headings={headings} />
                </Card>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/changelog/$version")({
  component: ChangelogDetailPage,
});
