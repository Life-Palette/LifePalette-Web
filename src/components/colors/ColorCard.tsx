import { Check, Copy, ImageIcon, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ColorItem, getLuminance } from "./types";

interface ColorCardProps {
  color: ColorItem;
  onClick: () => void;
  isSelected: boolean;
  viewMode: "grid" | "list";
  size?: "normal" | "large" | "featured"; // 支持不同尺寸
  index?: number; // 用于动画延迟
}

export default function ColorCard({
  color,
  onClick,
  isSelected,
  viewMode,
  size = "normal",
  index = 0,
}: ColorCardProps) {
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const luminance = getLuminance(color.hex);
  const textColor = luminance > 0.5 ? "text-black" : "text-white";
  const bgOverlay = luminance > 0.5 ? "from-black/50" : "from-black/70";

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
          "group flex items-center gap-4 rounded-2xl border border-border/30 bg-gradient-to-r from-background/80 to-background/40 p-4 backdrop-blur-md transition-all duration-500 hover:border-border/60 hover:shadow-xl hover:shadow-black/5 cursor-pointer",
          "hover:-translate-y-0.5 hover:bg-gradient-to-r hover:from-background/90 hover:to-background/60",
          isSelected && "ring-2 ring-primary ring-offset-2 border-primary/50",
        )}
        onClick={onClick}
        style={{
          animationDelay: `${index * 50}ms`,
        }}
      >
        {/* 颜色预览 - 带图片背景 */}
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl shadow-lg">
          {color.representativeImage ? (
            <>
              <img
                src={`${color.representativeImage.url}?x-oss-process=image/resize,w_100,h_100,m_fill/quality,q_60/format,webp`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onLoad={() => setImageLoaded(true)}
              />
              <div
                className="absolute inset-0 mix-blend-overlay"
                style={{ backgroundColor: color.hex }}
              />
            </>
          ) : (
            <div
              className="h-full w-full transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: color.hex }}
            />
          )}
          {/* 光晕效果 */}
          <div
            className="absolute -inset-1 -z-10 rounded-xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
            style={{ backgroundColor: color.hex }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-semibold uppercase tracking-wide">
              {color.hex}
            </span>
            {color.isPrimary && (
              <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                <Sparkles className="h-3 w-3" />
                主色
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            {color.count} 张图片
            {color.percentage && (
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                {color.percentage.toFixed(1)}%
              </span>
            )}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-primary/10"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
    );
  }

  // 网格视图 - 根据size调整样式
  const sizeClasses = {
    normal: "aspect-square",
    large: "aspect-[4/5]",
    featured: "aspect-[3/4] md:col-span-2 md:row-span-2",
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-3xl transition-all duration-700",
        "hover:z-10 hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/20",
        "before:absolute before:inset-0 before:z-10 before:rounded-3xl before:ring-1 before:ring-inset before:ring-white/10 before:transition-all before:duration-300",
        "hover:before:ring-white/20",
        sizeClasses[size],
        isSelected && "ring-4 ring-primary ring-offset-4 ring-offset-background scale-[1.02]",
      )}
      style={{
        animationDelay: `${index * 30}ms`,
      }}
      onClick={onClick}
    >
      {/* 背景层 - 纯色或图片 */}
      <div className="absolute inset-0" style={{ backgroundColor: color.hex }}>
        {color.representativeImage && (
          <>
            <img
              src={`${color.representativeImage.url}?x-oss-process=image/resize,w_400,h_400,m_fill/quality,q_70/format,webp`}
              alt=""
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-all duration-700",
                "group-hover:scale-110 group-hover:blur-[2px]",
                imageLoaded ? "opacity-100" : "opacity-0",
              )}
              onLoad={() => setImageLoaded(true)}
            />
            {/* 颜色叠加层 */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-color transition-opacity duration-500 group-hover:opacity-60"
              style={{ backgroundColor: color.hex }}
            />
          </>
        )}
      </div>

      {/* 渐变遮罩 */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t via-transparent to-transparent transition-opacity duration-500",
          bgOverlay,
          color.representativeImage
            ? "opacity-60 group-hover:opacity-80"
            : "opacity-0 group-hover:opacity-100",
        )}
      />

      {/* 装饰性光效 */}
      <div
        className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-30"
        style={{ backgroundColor: color.hex }}
      />

      {/* 图片数量角标 */}
      <div className="absolute top-3 left-3 z-20">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md transition-all duration-300",
            "bg-black/30 text-white/90",
            "group-hover:bg-black/50 group-hover:scale-105",
          )}
        >
          <ImageIcon className="h-3 w-3" />
          <span>{color.count}</span>
        </div>
      </div>

      {/* 主色标记 */}
      {color.isPrimary && (
        <div className="absolute top-3 right-3 z-20">
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg shadow-amber-500/30">
            <Sparkles className="h-3 w-3" />
            PRIMARY
          </div>
        </div>
      )}

      {/* 底部信息面板 */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 z-20 p-4 transition-all duration-500",
          "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            {/* 颜色代码 - 玻璃拟态卡片 */}
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 backdrop-blur-md">
              <div
                className="h-4 w-4 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-mono text-sm font-bold tracking-wider text-white">
                {color.hex.toUpperCase()}
              </span>
            </div>
            {/* RGB 值 */}
            {color.rgb && (
              <p className="pl-1 text-[10px] font-medium text-white/70">
                RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
              </p>
            )}
          </div>

          {/* 复制按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md transition-all duration-300",
              "hover:bg-white/20 hover:scale-110",
              "text-white",
            )}
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* 静态显示的颜色代码（无hover时） */}
      <div
        className={cn(
          "absolute bottom-3 left-3 z-20 transition-all duration-300",
          "opacity-100 group-hover:opacity-0",
        )}
      >
        <span
          className={cn(
            "font-mono text-xs font-bold tracking-wide",
            textColor,
            "drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]",
          )}
        >
          {color.hex.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
