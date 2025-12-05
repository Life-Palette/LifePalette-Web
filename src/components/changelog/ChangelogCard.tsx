import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bug, Calendar, ChevronRight, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Changelog, ChangelogType } from "@/types";

interface ChangelogCardProps {
  changelog: Changelog;
}

// 更新类型配置
const typeConfig: Record<
  ChangelogType,
  { label: string; icon: React.ReactNode; className: string }
> = {
  feature: {
    label: "新功能",
    icon: <Sparkles className="h-3.5 w-3.5" />,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  bugfix: {
    label: "修复",
    icon: <Bug className="h-3.5 w-3.5" />,
    className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  },
  improvement: {
    label: "优化",
    icon: <Zap className="h-3.5 w-3.5" />,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  breaking: {
    label: "破坏性变更",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
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

export default function ChangelogCard({ changelog }: ChangelogCardProps) {
  const config = typeConfig[changelog.type] || typeConfig.feature;

  return (
    <Link params={{ version: changelog.version }} to="/changelog/$version">
      <Card className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* 版本和类型 */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-mono font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                  {changelog.version}
                </span>
                <Badge
                  className={cn("flex items-center gap-1", config.className)}
                  variant="outline"
                >
                  {config.icon}
                  {config.label}
                </Badge>
              </div>

              {/* 标题 */}
              <h3 className="font-medium text-foreground text-base line-clamp-2">
                {changelog.title}
              </h3>

              {/* 发布时间 */}
              {changelog.publishedAt && (
                <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-sm">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{formatDate(changelog.publishedAt)}</span>
                </div>
              )}
            </div>

            {/* 箭头指示 */}
            <div className="flex-shrink-0 p-1.5 rounded-full bg-muted/50 group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
