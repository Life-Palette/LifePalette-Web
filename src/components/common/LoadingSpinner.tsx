import { LottieAnimation } from "@/components/lottie";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "spinner" | "skeleton";
  text?: string;
}

export default function LoadingSpinner({
  size = "md",
  className = "",
  variant = "spinner",
  text,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 60,
    md: 100,
    lg: 150,
  };

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  // 使用 Lottie 动画替代原来的 spinner
  return (
    <LottieAnimation
      type="loading"
      width={sizeMap[size]}
      height={sizeMap[size]}
      loadingText={text}
      className={className}
    />
  );
}
