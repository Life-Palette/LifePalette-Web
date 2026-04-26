import { getRouteApi } from "@tanstack/react-router";
import { MapPinOff } from "lucide-react";
import { useEffect, useMemo } from "react";
import { ThemeProvider, useTheme } from "@/components/common/theme-provider";
import TrackMapView from "@/components/map/TrackMapView";

const routeApi = getRouteApi("/map/$secUid");

// 从 URL 获取初始主题参数
function getInitialTheme(): "dark" | "light" | null {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme");
  if (theme === "dark" || theme === "light") {
    return theme;
  }
  return null;
}

// 内部组件，需要在 ThemeProvider 内使用
function SharedMapContent() {
  const { secUid } = routeApi.useParams();
  const { theme, setTheme } = useTheme();

  // 初始化时从 URL 读取主题（仅执行一次）
  useEffect(() => {
    const initialTheme = getInitialTheme();
    if (initialTheme) {
      setTheme(initialTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTheme]);

  // 监听父页面 iframe postMessage 主题切换
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "theme-change") {
        const newTheme = event.data.theme as "dark" | "light";
        if (newTheme === "dark" || newTheme === "light") {
          setTheme(newTheme);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [setTheme]);

  // 判断是否为深色模式
  const isDark = useMemo(() => {
    if (theme === "dark") {
      return true;
    }
    if (theme === "light") {
      return false;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [theme]);

  if (!secUid) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 flex justify-center text-muted-foreground">
            <MapPinOff className="h-16 w-16" strokeWidth={1} />
          </div>
          <h1 className="mb-2 font-semibold text-foreground text-xl">无效的链接</h1>
          <p className="text-muted-foreground">请检查链接是否正确</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background">
      <TrackMapView isDark={isDark} secUid={secUid} showGallery={true} />
    </div>
  );
}

// 主组件，包裹 ThemeProvider
export default function SharedMapPage() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lp-theme">
      <SharedMapContent />
    </ThemeProvider>
  );
}
