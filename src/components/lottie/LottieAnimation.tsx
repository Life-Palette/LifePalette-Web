import type { LottieRefCurrentProps } from "lottie-react";
import LottieModule from "lottie-react";

import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import emptyAnimation from "@/components/lottie/animations/empty.json";
// 导入本地动画文件
import loadingAnimation from "@/components/lottie/animations/loading.json";

// Vite 8 (Rolldown) CJS/ESM 互操作：default 可能是模块对象而非组件
const Lottie = (LottieModule as any).default || LottieModule;

export type AnimationType = "loading" | "empty" | "custom";

interface LottieAnimationProps {
  actionButton?: React.ReactNode;
  animationData?: any; // 仅在 type 为 'custom' 时需要
  autoplay?: boolean;
  className?: string;
  emptyDescription?: string;
  // 用于空状态的文字和按钮
  emptyTitle?: string;
  height?: number | string;
  // 用于加载动画的文字
  loadingText?: string;
  loop?: boolean;
  onClick?: () => void;
  speed?: number;
  style?: React.CSSProperties;
  type?: AnimationType;
  width?: number | string;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  type = "loading",
  animationData: customAnimationData,
  width = 120,
  height = 120,
  loop = true,
  autoplay = true,
  className = "",
  style,
  speed = 1,
  onClick,
  loadingText = "加载中...",
  emptyTitle = "暂无数据",
  emptyDescription = "这里空空如也，快去添加一些内容吧",
  actionButton,
}) => {
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  // 根据 type 选择动画数据
  const animationData = useMemo(() => {
    switch (type) {
      case "loading":
        return loadingAnimation;
      case "empty":
        return emptyAnimation;
      case "custom":
        return customAnimationData;
      default:
        return loadingAnimation;
    }
  }, [type, customAnimationData]);

  // 根据 type 调整默认尺寸
  const defaultSize = useMemo(() => {
    if (type === "empty") {
      return { width: width || 200, height: height || 200 };
    }
    return { width, height };
  }, [type, width, height]);

  useEffect(() => {
    if (lottieRef.current && speed !== 1) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  const defaultStyle: React.CSSProperties = {
    width: defaultSize.width,
    height: defaultSize.height,
    ...style,
  };

  // 根据 type 渲染不同的布局
  if (type === "loading") {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div onClick={onClick}>
          <Lottie
            animationData={animationData}
            autoplay={autoplay}
            loop={loop}
            lottieRef={lottieRef}
            style={defaultStyle}
          />
        </div>
        {loadingText && (
          <p className="mt-4 text-gray-500 text-sm dark:text-gray-400">{loadingText}</p>
        )}
      </div>
    );
  }

  if (type === "empty") {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <div onClick={onClick}>
          <Lottie
            animationData={animationData}
            autoplay={autoplay}
            loop={loop}
            lottieRef={lottieRef}
            style={defaultStyle}
          />
        </div>
        {emptyTitle && (
          <h3 className="mt-4 font-medium text-gray-900 text-lg dark:text-gray-100">
            {emptyTitle}
          </h3>
        )}
        {emptyDescription && (
          <p className="mt-2 text-center text-gray-500 text-sm dark:text-gray-400">
            {emptyDescription}
          </p>
        )}
        {actionButton && <div className="mt-6">{actionButton}</div>}
      </div>
    );
  }

  // custom 或默认情况
  return (
    <div className={className} onClick={onClick}>
      <Lottie
        animationData={animationData}
        autoplay={autoplay}
        loop={loop}
        lottieRef={lottieRef}
        style={defaultStyle}
      />
    </div>
  );
};

export default LottieAnimation;
