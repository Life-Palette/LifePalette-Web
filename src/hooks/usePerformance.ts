import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 图片懒加载 Hook
 */
export const useLazyLoad = (options?: IntersectionObserverInit) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
};

/**
 * 防抖 Hook
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * 节流 Hook
 */
export const useThrottle = <T extends (...args: any[]) => any>(callback: T, delay: number): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay],
  );
};

/**
 * 性能监控 Hook
 */
export const usePerformanceMonitor = () => {
  useEffect(() => {
    if (!("PerformanceObserver" in window)) return;

    // 监控 LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log("LCP:", lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

    // 监控 FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const delay = entry.processingStart - entry.startTime;
        console.log("FID:", delay);
      });
    });
    fidObserver.observe({ entryTypes: ["first-input"] });

    // 监控 CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          console.log("CLS:", clsValue);
        }
      }
    });
    clsObserver.observe({ entryTypes: ["layout-shift"] });

    return () => {
      lcpObserver.disconnect();
      fidObserver.disconnect();
      clsObserver.disconnect();
    };
  }, []);
};

/**
 * 预加载组件 Hook
 */
export const usePreloadComponent = () => {
  const preload = useCallback((componentLoader: () => Promise<any>) => {
    componentLoader();
  }, []);

  return preload;
};

/**
 * 批量更新 Hook - 减少重渲染
 */
export const useBatchUpdate = <T extends Record<string, any>>(initialState: T) => {
  const [state, setState] = useState(initialState);
  const pendingUpdates = useRef<Partial<T>>({} as Partial<T>);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdate = useCallback((updates: Partial<T>) => {
    pendingUpdates.current = { ...pendingUpdates.current, ...updates };

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, ...pendingUpdates.current }));
      pendingUpdates.current = {} as Partial<T>;
    }, 0);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchUpdate] as const;
};
