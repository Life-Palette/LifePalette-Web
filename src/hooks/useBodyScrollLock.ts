import { useEffect } from "react";

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // 保存当前滚动位置
      const scrollY = window.scrollY;

      // 锁定body滚动
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // 恢复滚动
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";

        // 恢复滚动位置
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
};
