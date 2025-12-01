import { cn } from "@/lib/utils";
import { type ColorItem, getLuminance } from "./types";

interface ColorGradientBarProps {
  colors: ColorItem[];
  onColorClick: (color: ColorItem) => void;
}

export default function ColorGradientBar({ colors, onColorClick }: ColorGradientBarProps) {
  if (colors.length === 0) return null;

  return (
    <div className="mb-10 group">
      {/* 标题 */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">色彩光谱</h3>
        <span className="text-xs text-muted-foreground/60">点击探索颜色</span>
      </div>

      {/* 渐变条容器 */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-black/10 ring-1 ring-white/10">
        {/* 主渐变条 */}
        <div className="flex h-20">
          {colors.slice(0, 24).map((color, index) => {
            const luminance = getLuminance(color.hex);
            const textColor = luminance > 0.5 ? "text-black/70" : "text-white/70";

            return (
              <div
                key={color.id}
                className={cn(
                  "group/item relative flex-1 cursor-pointer transition-all duration-500",
                  "hover:flex-[3] hover:z-10",
                )}
                style={{ backgroundColor: color.hex }}
                onClick={() => onColorClick(color)}
              >
                {/* 悬浮时显示的信息 */}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-all duration-300",
                    "group-hover/item:opacity-100",
                    textColor,
                  )}
                >
                  <span className="font-mono text-xs font-bold tracking-wide">
                    {color.hex.toUpperCase()}
                  </span>
                  <span className="mt-0.5 text-[10px] opacity-80">{color.count}张</span>
                </div>

                {/* 分隔线效果 */}
                {index < colors.slice(0, 24).length - 1 && (
                  <div className="absolute right-0 top-0 h-full w-px bg-white/5" />
                )}
              </div>
            );
          })}
        </div>

        {/* 底部反射效果 */}
        <div className="flex h-3 opacity-30 blur-[1px]">
          {colors.slice(0, 24).map((color) => (
            <div
              key={`reflection-${color.id}`}
              className="flex-1"
              style={{
                backgroundColor: color.hex,
                transform: "scaleY(-1)",
                maskImage: "linear-gradient(to bottom, transparent, black)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent, black)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
