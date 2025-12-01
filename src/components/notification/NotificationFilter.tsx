import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NotificationFilterProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  counts: Record<string, number>;
}

const FILTER_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "like", label: "点赞" },
  { value: "comment", label: "评论" },
  { value: "collection", label: "收藏" },
];

export default function NotificationFilter({
  activeType,
  onTypeChange,
  counts,
}: NotificationFilterProps) {
  return (
    <div className="border-border border-b bg-background px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((option) => {
          const isActive = activeType === option.value;
          const count = counts[option.value] || 0;

          return (
            <Button
              className={`relative rounded-full px-4 py-2 text-sm transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
              key={option.value}
              onClick={() => onTypeChange(option.value)}
              size="sm"
              variant="ghost"
            >
              {option.label}
              {count > 0 && (
                <Badge
                  className={`ml-2 ${
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                  variant="secondary"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
