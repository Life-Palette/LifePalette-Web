import { Check, Copy, ImageIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ColorItem, getLuminance } from "./types";

interface ColorCardProps {
  color: ColorItem;
  index?: number;
  isSelected: boolean;
  onClick: () => void;
  size?: "normal" | "large" | "featured";
  viewMode: "grid" | "list";
}

export default function ColorCard({
  color,
  onClick,
  isSelected,
  viewMode,
  size = "normal",
}: ColorCardProps) {
  const [copied, setCopied] = useState(false);
  const luminance = getLuminance(color.hex);
  const textColor = luminance > 0.5 ? "text-black/80" : "text-white/90";

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 列表视图
  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "group flex cursor-pointer items-center gap-4 rounded-2xl border border-border/30 bg-background/80 p-4 backdrop-blur-md transition-all duration-300 hover:border-border/60 hover:shadow-lg",
          isSelected && "border-primary/50 ring-2 ring-primary ring-offset-2"
        )}
        onClick={onClick}
      >
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
          <div className="h-full w-full" style={{ backgroundColor: color.hex }} />
          <div
            className="absolute -inset-1 -z-10 rounded-xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-50"
            style={{ backgroundColor: color.hex }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <span className="font-mono font-semibold text-sm uppercase tracking-wide">
            {color.hex}
          </span>
          <p className="mt-0.5 flex items-center gap-1.5 text-muted-foreground text-xs">
            <ImageIcon className="h-3 w-3" />
            {color.count} 张图片
          </p>
        </div>

        <Button
          className="h-8 w-8 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleCopy}
          size="icon"
          variant="ghost"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </Button>
      </div>
    );
  }

  // 网格视图 - 纯色块
  const sizeClasses = {
    normal: "aspect-square",
    large: "aspect-[4/5]",
    featured: "aspect-[3/4] md:col-span-2 md:row-span-2",
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300",
        "hover:scale-[1.05] hover:shadow-xl",
        "ring-1 ring-black/5 ring-inset",
        sizeClasses[size],
        isSelected && "scale-[1.03] ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={onClick}
      style={{ backgroundColor: color.hex }}
    >
      {/* 光效 */}
      <div
        className="absolute -top-16 -right-16 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
        style={{ backgroundColor: "#fff" }}
      />

      {/* 图片数量角标 */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <div
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-[11px] backdrop-blur-sm",
            luminance > 0.5 ? "bg-black/10 text-black/70" : "bg-white/15 text-white/80"
          )}
        >
          <ImageIcon className="h-3 w-3" />
          <span>{color.count}</span>
        </div>
      </div>

      {/* hover 时显示详细信息 */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-10 p-3 transition-all duration-300",
          "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
        )}
      >
        <div className="flex items-end justify-between">
          <div>
            <span className={cn("font-bold font-mono text-sm tracking-wider", textColor)}>
              {color.hex.toUpperCase()}
            </span>
            {color.rgb && (
              <p className={cn("mt-0.5 text-[10px] opacity-70", textColor)}>
                RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
              </p>
            )}
          </div>
          <Button
            className={cn(
              "h-8 w-8 rounded-lg transition-all",
              luminance > 0.5
                ? "text-black/70 hover:bg-black/10"
                : "text-white/80 hover:bg-white/20"
            )}
            onClick={handleCopy}
            size="icon"
            variant="ghost"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* 静态 hex 标签 */}
      <div
        className={cn("absolute bottom-2.5 left-3 z-10 transition-opacity group-hover:opacity-0")}
      >
        <span className={cn("font-mono font-semibold text-xs tracking-wide", textColor)}>
          {color.hex.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
