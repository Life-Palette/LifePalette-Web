import { ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const scrollContainerRef = useRef<Element | Window | null>(null);
  const VISIBILITY_THRESHOLD = 300;

  useEffect(() => {
    // 查找 ScrollRestoreContainer 的滚动容器，或 fallback 到 window
    const scrollContainer = document.querySelector(".h-screen.overflow-auto") || window;
    scrollContainerRef.current = scrollContainer;

    const toggleVisibility = () => {
      const scrollTop =
        scrollContainer instanceof Window
          ? window.pageYOffset
          : (scrollContainer as Element).scrollTop;

      setIsVisible(scrollTop > VISIBILITY_THRESHOLD);
    };

    scrollContainer.addEventListener("scroll", toggleVisibility, { passive: true });
    // 初始检查
    toggleVisibility();

    return () => scrollContainer.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer instanceof Window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      aria-label="回到顶部"
      className="group fixed right-6 bottom-24 z-50 rounded-full border border-border bg-background/80 p-3 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:shadow-xl dark:bg-secondary/80 dark:hover:bg-secondary"
      onClick={scrollToTop}
      type="button"
    >
      <ChevronUp
        className="text-muted-foreground transition-colors group-hover:text-foreground"
        size={20}
      />
    </button>
  );
}
