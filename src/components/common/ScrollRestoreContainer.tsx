import { type ReactNode, useEffect, useRef, useState } from "react";
import { useActivate } from "react-activation";

interface ScrollRestoreContainerProps {
  children: ReactNode;
  pageKey: string;
  className?: string;
}

const STORAGE_KEY = "page-scroll-positions";

export default function ScrollRestoreContainer({
  children,
  pageKey,
  className = "h-full overflow-auto",
}: ScrollRestoreContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const isRestoringRef = useRef(false);
  const [shouldHide, setShouldHide] = useState(true);
  const [initialScrollSet, setInitialScrollSet] = useState(false);

  // 获取保存的滚动位置
  const getSavedPosition = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const positions = stored ? JSON.parse(stored) : {};
      return positions[pageKey] || null;
    } catch {
      return null;
    }
  };

  // 保存滚动位置
  const saveScrollPosition = () => {
    if (isRestoringRef.current || !containerRef.current) {
      return;
    }

    const scrollX = containerRef.current.scrollLeft;
    const scrollY = containerRef.current.scrollTop;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const positions = stored ? JSON.parse(stored) : {};
        positions[pageKey] = {
          x: scrollX,
          y: scrollY,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      } catch (_error) {}
    }, 150);
  };

  // 立即恢复滚动位置
  const restoreScrollPosition = () => {
    if (!containerRef.current) {
      return;
    }

    const savedPosition = getSavedPosition();
    if (!savedPosition) {
      setShouldHide(false);
      return;
    }

    isRestoringRef.current = true;

    // 立即设置滚动位置
    containerRef.current.scrollLeft = savedPosition.x;
    containerRef.current.scrollTop = savedPosition.y;

    // 短暂延迟后显示内容，确保滚动位置已设置
    setTimeout(() => {
      isRestoringRef.current = false;
      setShouldHide(false);
    }, 16); // 一帧的时间
  };

  // 当页面激活时恢复滚动位置
  useActivate(() => {
    setShouldHide(true);
    setTimeout(() => {
      restoreScrollPosition();
    }, 0);
  });

  // 初始化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    // 如果有保存的位置，先隐藏内容
    const savedPosition = getSavedPosition();
    if (savedPosition && !initialScrollSet) {
      setShouldHide(true);
      // 在下一帧设置滚动位置
      requestAnimationFrame(() => {
        restoreScrollPosition();
        setInitialScrollSet(true);
      });
    } else {
      setShouldHide(false);
      setInitialScrollSet(true);
    }

    container.addEventListener("scroll", saveScrollPosition, { passive: true });

    return () => {
      container.removeEventListener("scroll", saveScrollPosition);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [getSavedPosition, initialScrollSet, restoreScrollPosition, saveScrollPosition]);

  return (
    <div className="relative">
      <div
        className={className}
        ref={containerRef}
        style={{
          scrollBehavior: "auto",
          visibility: shouldHide ? "hidden" : "visible",
        }}
      >
        {children}
      </div>

      {/* 加载遮罩 */}
      {shouldHide && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <div className="text-gray-500 text-sm">加载中...</div>
        </div>
      )}
    </div>
  );
}
