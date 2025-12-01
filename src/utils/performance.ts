/**
 * 性能监控工具
 */

interface PerformanceMetrics {
  FCP?: number; // First Contentful Paint
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  /**
   * 开始监控
   */
  start() {
    if (!this.isSupported()) {
      console.warn("Performance monitoring is not supported in this browser");
      return;
    }

    this.measureFCP();
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureTTFB();
  }

  /**
   * 停止监控
   */
  stop() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }

  /**
   * 获取性能指标
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 检查浏览器支持
   */
  private isSupported(): boolean {
    return "PerformanceObserver" in window;
  }

  /**
   * 测量 First Contentful Paint
   */
  private measureFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          this.metrics.FCP = Math.round(entry.startTime);
          console.log(`FCP: ${this.metrics.FCP}ms`);
        }
      }
    });

    observer.observe({ entryTypes: ["paint"] });
    this.observers.push(observer);
  }

  /**
   * 测量 Largest Contentful Paint
   */
  private measureLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      this.metrics.LCP = Math.round(lastEntry.startTime);
      console.log(`LCP: ${this.metrics.LCP}ms`);
    });

    observer.observe({ entryTypes: ["largest-contentful-paint"] });
    this.observers.push(observer);
  }

  /**
   * 测量 First Input Delay
   */
  private measureFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any) {
        const delay = entry.processingStart - entry.startTime;
        this.metrics.FID = Math.round(delay);
        console.log(`FID: ${this.metrics.FID}ms`);
      }
    });

    observer.observe({ entryTypes: ["first-input"] });
    this.observers.push(observer);
  }

  /**
   * 测量 Cumulative Layout Shift
   */
  private measureCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.CLS = Math.round(clsValue * 1000) / 1000;
        }
      }
      console.log(`CLS: ${this.metrics.CLS}`);
    });

    observer.observe({ entryTypes: ["layout-shift"] });
    this.observers.push(observer);
  }

  /**
   * 测量 Time to First Byte
   */
  private measureTTFB() {
    const navigationEntry = performance.getEntriesByType("navigation")[0] as any;
    if (navigationEntry) {
      this.metrics.TTFB = Math.round(navigationEntry.responseStart - navigationEntry.fetchStart);
      console.log(`TTFB: ${this.metrics.TTFB}ms`);
    }
  }

  /**
   * 发送指标到分析服务
   */
  sendToAnalytics(endpoint?: string) {
    const metrics = this.getMetrics();

    // 只在生产环境发送
    if (import.meta.env.PROD && endpoint) {
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metrics,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch((error) => {
        console.error("Failed to send performance metrics:", error);
      });
    }
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor();

/**
 * 测量组件渲染时间
 */
export const measureComponentPerformance = (componentName: string) => {
  const startMark = `${componentName}-start`;
  const endMark = `${componentName}-end`;
  const measureName = `${componentName}-render`;

  return {
    start: () => performance.mark(startMark),
    end: () => {
      performance.mark(endMark);
      performance.measure(measureName, startMark, endMark);

      const measure = performance.getEntriesByName(measureName)[0];
      if (measure) {
        console.log(`${componentName} render time: ${Math.round(measure.duration)}ms`);
      }

      // 清理标记
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
      performance.clearMeasures(measureName);
    },
  };
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * 预加载图片
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * 批量预加载图片
 */
export const preloadImages = async (srcs: string[]): Promise<void> => {
  await Promise.all(srcs.map(preloadImage));
};

/**
 * 检测是否为慢速网络
 */
export const isSlowNetwork = (): boolean => {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) return false;

  // 检查网络类型
  const slowTypes = ["slow-2g", "2g", "3g"];
  if (slowTypes.includes(connection.effectiveType)) {
    return true;
  }

  // 检查下载速度 (Mbps)
  if (connection.downlink && connection.downlink < 1) {
    return true;
  }

  return false;
};

/**
 * 获取设备类型
 */
export const getDeviceType = (): "mobile" | "tablet" | "desktop" => {
  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
};

/**
 * 检测是否支持 WebP 格式
 */
export const supportsWebP = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src =
      "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
  });
};
