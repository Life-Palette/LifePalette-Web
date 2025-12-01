import { Copy, ImageIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { type ColorItem, getLuminance } from "./types";

interface ColorPaletteWheelProps {
  colors: ColorItem[];
  onColorClick: (color: ColorItem) => void;
  selectedColor?: ColorItem | null;
}

export default function ColorPaletteWheel({
  colors,
  onColorClick,
  selectedColor,
}: ColorPaletteWheelProps) {
  const [hoveredColor, setHoveredColor] = useState<ColorItem | null>(null);
  const [copied, setCopied] = useState(false);

  // 取前30个颜色用于调色盘
  const paletteColors = useMemo(() => colors.slice(0, 30), [colors]);

  // 中心显示的颜色
  const centerColor = hoveredColor || selectedColor || paletteColors[0];

  if (paletteColors.length === 0) return null;

  const centerLuminance = centerColor ? getLuminance(centerColor.hex) : 0.5;
  const centerTextColor = centerLuminance > 0.5 ? "text-black/80" : "text-white/90";

  const handleCopyColor = () => {
    if (centerColor) {
      navigator.clipboard.writeText(centerColor.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="relative">
      {/* 调色盘主体 */}
      <div className="relative mx-auto" style={{ width: "340px", height: "340px" }}>
        {/* 外层光晕 */}
        <div
          className="absolute inset-0 rounded-full opacity-30 blur-3xl transition-all duration-700"
          style={{ backgroundColor: centerColor?.hex || "#888" }}
        />

        {/* 外层装饰环 */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-muted/80 to-muted/40 p-[2px] shadow-2xl shadow-black/10">
          <div className="h-full w-full rounded-full bg-background/95 backdrop-blur-xl" />
        </div>

        {/* 颜色块排列 - 双层圆形布局 */}
        <div className="absolute inset-0">
          {paletteColors.map((color, index) => {
            // 双层布局：前18个外圈，后12个内圈
            const isOuterRing = index < 18;
            const ringIndex = isOuterRing ? index : index - 18;
            const ringTotal = isOuterRing ? 18 : 12;
            const radius = isOuterRing ? 140 : 95;

            const angle = (ringIndex / ringTotal) * 360 - 90;
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;

            // 根据count计算大小
            const maxCount = Math.max(...paletteColors.map((c) => c.count));
            const sizeRatio = 0.65 + (color.count / maxCount) * 0.35;
            const baseSize = isOuterRing ? 32 : 28;
            const size = baseSize * sizeRatio;

            const isHovered = hoveredColor?.id === color.id;
            const isSelected = selectedColor?.id === color.id;

            return (
              <div
                key={color.id}
                className={cn(
                  "absolute cursor-pointer rounded-full transition-all duration-300 ease-out",
                  "hover:z-30 hover:scale-[1.3]",
                  isHovered && "z-30 scale-[1.3]",
                  isSelected &&
                    "z-30 scale-[1.2] ring-[3px] ring-primary ring-offset-2 ring-offset-background",
                )}
                style={{
                  backgroundColor: color.hex,
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `calc(50% + ${x}px - ${size / 2}px)`,
                  top: `calc(50% + ${y}px - ${size / 2}px)`,
                  boxShadow: isHovered
                    ? `0 0 24px ${color.hex}90, 0 8px 16px rgba(0,0,0,0.25)`
                    : `0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)`,
                }}
                onClick={() => onColorClick(color)}
                onMouseEnter={() => setHoveredColor(color)}
                onMouseLeave={() => setHoveredColor(null)}
              />
            );
          })}
        </div>

        {/* 中心预览区域 */}
        {centerColor && (
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full",
              "shadow-2xl transition-all duration-500 cursor-pointer",
              "hover:scale-105 active:scale-100",
            )}
            style={{
              backgroundColor: centerColor.hex,
              boxShadow: `0 0 60px ${centerColor.hex}50, 0 12px 40px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)`,
            }}
            onClick={handleCopyColor}
          >
            <span className={cn("font-mono text-[13px] font-bold tracking-wider", centerTextColor)}>
              {copied ? "已复制!" : centerColor.hex.toUpperCase()}
            </span>
            <div
              className={cn(
                "mt-1.5 flex items-center gap-1.5 text-[11px] opacity-70",
                centerTextColor,
              )}
            >
              {copied ? (
                <Copy className="h-3 w-3" />
              ) : (
                <>
                  <ImageIcon className="h-3 w-3" />
                  <span>{centerColor.count} 张</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部提示 */}
      <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
        点击色块探索 · 点击中心复制
      </p>
    </div>
  );
}
