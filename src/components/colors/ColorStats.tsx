import { Grid3X3, Image, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorStatsProps {
  totalColors: number;
  totalImages: number;
  uniqueHues: number;
}

// 统计卡片 - 更有特色的设计
function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  delay = 0,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  delay?: number;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br from-background/80 to-background/40 p-5 backdrop-blur-md transition-all duration-500",
        "hover:-translate-y-0.5 hover:border-border/50 hover:shadow-black/5 hover:shadow-xl"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* 装饰性渐变背景 */}
      <div
        className={cn(
          "absolute -top-6 -right-6 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity duration-500 group-hover:opacity-40",
          gradient
        )}
      />

      <div className="relative flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
            gradient
          )}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-bold text-3xl tracking-tight">{value.toLocaleString()}</p>
          <p className="mt-0.5 text-muted-foreground text-sm">{label}</p>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div
        className={cn(
          "absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full",
          gradient
        )}
      />
    </div>
  );
}

export default function ColorStats({ totalColors, totalImages, uniqueHues }: ColorStatsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        delay={0}
        gradient="bg-gradient-to-br from-violet-500 to-purple-600"
        icon={Palette}
        label="总颜色数"
        value={totalColors}
      />
      <StatCard
        delay={100}
        gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
        icon={Image}
        label="关联图片"
        value={totalImages}
      />
      <StatCard
        delay={200}
        gradient="bg-gradient-to-br from-amber-500 to-orange-500"
        icon={Grid3X3}
        label="色相范围"
        value={uniqueHues}
      />
    </div>
  );
}
