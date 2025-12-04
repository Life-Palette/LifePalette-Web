import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  Bug,
  Zap,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
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

  // 获取所有日志用于导航
  const { data: allLogs } = useChangelogs({ pageSize: 100 });
  const allChangelogs = allLogs?.pages.flatMap((page) => page.items) || [];

  // 查找当前日志在列表中的索引
  const currentIndex = allChangelogs.findIndex((log) => log.version === version);
  const prevLog = currentIndex > 0 ? allChangelogs[currentIndex - 1] : null;
  const nextLog = currentIndex < allChangelogs.length - 1 ? allChangelogs[currentIndex + 1] : null;

  // 分享功能
  const handleShare = async () => {
    const url = window.location.href;
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
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
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

      {/* 内容区域 */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* 版本信息头部 */}
        <div className={cn("mb-8 rounded-2xl bg-gradient-to-b p-8", config.bgClass)}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="font-mono text-3xl font-bold text-foreground sm:text-4xl">
              {changelog.version}
            </h1>
            <Badge className={cn("flex items-center gap-1.5 px-3 py-1", config.className)} variant="outline">
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
            <Link className="group" to="/changelog/$version" params={{ version: prevLog.version }}>
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
            <Link className="group" to="/changelog/$version" params={{ version: nextLog.version }}>
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
    </div>
  );
}

export const Route = createFileRoute("/changelog/$version")({
  component: ChangelogDetailPage,
});
