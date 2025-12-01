import { snapdom } from "@zumer/snapdom";
import { Download, Eye } from "lucide-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import TrackMapView from "@/components/map/TrackMapView";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIsAuthenticated } from "@/hooks/useAuth";

interface CityData {
  id: number;
  country: string;
  city: string;
  photoCount: number;
  firstVisitAt: string;
  lastVisitAt: string;
  lng?: number;
  lat?: number;
}

interface ExportMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cities: CityData[];
}

const ExportMapDialog: React.FC<ExportMapDialogProps> = ({ open, onOpenChange, cities }) => {
  const { user } = useIsAuthenticated();
  const [isExporting, setIsExporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    width: 1920,
    height: 1080,
  });
  const [watermarkConfig, setWatermarkConfig] = useState({
    enabled: true,
    text: user?.name || user?.email || "我的足迹",
  });

  // 使用 ref 存储地图视图状态，避免触发重渲染
  const mapViewRef = useRef({
    centerLng: 116.4074,
    centerLat: 39.9042,
    zoom: 2,
  });

  const [displayView, setDisplayView] = useState({
    centerLng: 116.4074,
    centerLat: 39.9042,
    zoom: 2,
  });

  // 处理尺寸输入变化
  const handleSizeChange = (type: "width" | "height", value: string) => {
    const numValue = Number(value);
    if (numValue >= 100 || value === "") {
      setExportConfig({
        ...exportConfig,
        [type]: value === "" ? 100 : Math.max(100, numValue),
      });
    }
  };

  // 添加水印到容器
  const addWatermark = (container: HTMLDivElement) => {
    if (!watermarkConfig.enabled || !watermarkConfig.text) return;

    const watermark = document.createElement("div");
    watermark.style.position = "absolute";
    watermark.style.bottom = "20px";
    watermark.style.right = "20px";
    watermark.style.color = "rgba(0, 0, 0, 0.3)";
    watermark.style.fontSize = "14px";
    watermark.style.fontWeight = "500";
    watermark.style.padding = "8px 12px";
    watermark.style.background = "rgba(255, 255, 255, 0.8)";
    watermark.style.borderRadius = "4px";
    watermark.style.zIndex = "1000";
    watermark.textContent = watermarkConfig.text;
    container.appendChild(watermark);
  };

  // 处理地图视图变化 - 使用 useCallback 稳定函数引用
  const handleMapViewChange = useCallback((center: [number, number], zoom: number) => {
    // 更新 ref（用于导出）
    mapViewRef.current = {
      centerLng: center[0],
      centerLat: center[1],
      zoom,
    };
    // 更新显示状态（用于 UI 显示）
    setDisplayView({
      centerLng: center[0],
      centerLat: center[1],
      zoom,
    });
  }, []);

  // 生成预览图片
  const handleGeneratePreview = async () => {
    setIsGeneratingPreview(true);
    toast.loading("正在生成预览...", { id: "generate-preview" });

    // 创建临时容器
    const exportContainer = document.createElement("div");
    exportContainer.style.position = "fixed";
    exportContainer.style.top = "-9999px";
    exportContainer.style.left = "-9999px";
    exportContainer.style.width = `${exportConfig.width}px`;
    exportContainer.style.height = `${exportConfig.height}px`;
    exportContainer.style.background = "white";
    document.body.appendChild(exportContainer);

    try {
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(exportContainer);

      await new Promise<void>((resolve) => {
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            addWatermark(exportContainer);
            resolve();
          }
        }, 15000); // 15秒超时保护

        root.render(
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <TrackMapView
              userId={user?.id}
              customCenter={[mapViewRef.current.centerLng, mapViewRef.current.centerLat]}
              customZoom={mapViewRef.current.zoom}
              showGallery={false}
              onReady={() => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeout);
                  addWatermark(exportContainer);
                  resolve();
                }
              }}
            />
          </div>,
        );
      });

      // 使用 snapdom 生成图片
      const result = await snapdom(exportContainer, {
        scale: 1,
        quality: 0.9,
        embedFonts: true,
      });

      // 转换为 base64 图片
      const imgElement = await result.toPng();
      setPreviewImage(imgElement.src);
      setShowPreview(true);

      toast.success("预览生成成功！", { id: "generate-preview" });

      root.unmount();
      document.body.removeChild(exportContainer);
    } catch (error) {
      console.error("预览生成失败:", error);
      toast.error("预览生成失败，请重试", { id: "generate-preview" });
      if (document.body.contains(exportContainer)) {
        document.body.removeChild(exportContainer);
      }
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // 生成并下载海报
  const handleExportPoster = async () => {
    setIsExporting(true);
    toast.loading("正在生成海报...", { id: "export-poster" });

    // 创建一个临时的大尺寸地图容器用于导出
    const exportContainer = document.createElement("div");
    exportContainer.style.position = "fixed";
    exportContainer.style.top = "-9999px";
    exportContainer.style.left = "-9999px";
    exportContainer.style.width = `${exportConfig.width}px`;
    exportContainer.style.height = `${exportConfig.height}px`;
    exportContainer.style.background = "white";
    document.body.appendChild(exportContainer);

    try {
      // 动态导入并渲染地图组件
      const { createRoot } = await import("react-dom/client");
      const root = createRoot(exportContainer);

      // 渲染大尺寸地图
      await new Promise<void>((resolve) => {
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            addWatermark(exportContainer);
            resolve();
          }
        }, 15000); // 15秒超时保护

        root.render(
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <TrackMapView
              userId={user?.id}
              customCenter={[mapViewRef.current.centerLng, mapViewRef.current.centerLat]}
              customZoom={mapViewRef.current.zoom}
              showGallery={false}
              onReady={() => {
                if (!resolved) {
                  resolved = true;
                  clearTimeout(timeout);
                  addWatermark(exportContainer);
                  resolve();
                }
              }}
            />
          </div>,
        );
      });

      // 使用 snapdom 生成海报
      await snapdom.download(exportContainer, {
        format: "png",
        filename: `足迹地图-${new Date().toLocaleDateString("zh-CN")}`,
        scale: 2,
        quality: 1,
        embedFonts: true,
      });

      toast.success("海报生成成功！", { id: "export-poster" });
      onOpenChange(false);

      // 清理临时容器
      root.unmount();
      document.body.removeChild(exportContainer);
    } catch (error) {
      console.error("海报生成失败:", error);
      toast.error("海报生成失败，请重试", { id: "export-poster" });
      // 确保清理临时容器
      if (document.body.contains(exportContainer)) {
        document.body.removeChild(exportContainer);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>导出地图海报</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[320px_1fr] gap-6">
          {/* 左侧：配置选项 */}
          <div className="flex flex-col space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium">尺寸设置</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">宽度 (px)</label>
                  <Input
                    min={100}
                    onChange={(e) => handleSizeChange("width", e.target.value)}
                    type="number"
                    value={exportConfig.width}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">高度 (px)</label>
                  <Input
                    min={100}
                    onChange={(e) => handleSizeChange("height", e.target.value)}
                    type="number"
                    value={exportConfig.height}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">当前视图</label>
              <div className="space-y-2">
                <div className="rounded-lg bg-muted p-3">
                  <div className="mb-1 text-xs text-muted-foreground">缩放级别</div>
                  <div className="font-mono text-sm">{displayView.zoom.toFixed(2)}</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="mb-1 text-xs text-muted-foreground">中心坐标</div>
                  <div className="font-mono text-sm">
                    {displayView.centerLng.toFixed(4)}, {displayView.centerLat.toFixed(4)}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                💡 在右侧地图上拖动和缩放来调整视图
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">水印设置</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    checked={watermarkConfig.enabled}
                    className="h-4 w-4 rounded border-gray-300"
                    id="watermark-enabled"
                    onChange={(e) =>
                      setWatermarkConfig({ ...watermarkConfig, enabled: e.target.checked })
                    }
                    type="checkbox"
                  />
                  <label className="text-sm" htmlFor="watermark-enabled">
                    启用水印
                  </label>
                </div>
                {watermarkConfig.enabled && (
                  <Input
                    onChange={(e) =>
                      setWatermarkConfig({ ...watermarkConfig, text: e.target.value })
                    }
                    placeholder="输入水印文字"
                    value={watermarkConfig.text}
                  />
                )}
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <Button
                className="w-full"
                disabled={isGeneratingPreview}
                onClick={() => {
                  if (showPreview) {
                    setShowPreview(false);
                  } else {
                    handleGeneratePreview();
                  }
                }}
                variant={showPreview ? "default" : "outline"}
              >
                <Eye className="mr-2" size={16} />
                {isGeneratingPreview ? "生成中..." : showPreview ? "返回编辑" : "预览效果"}
              </Button>
              <Button className="w-full" disabled={isExporting} onClick={handleExportPoster}>
                <Download className="mr-2" size={16} />
                {isExporting ? "生成中..." : "导出海报"}
              </Button>
              <Button className="w-full" onClick={() => onOpenChange(false)} variant="outline">
                取消
              </Button>
            </div>
          </div>

          {/* 右侧：预览 */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium">
                {showPreview ? "最终效果预览" : "地图视图调整"}
              </label>
              <span className="text-xs text-muted-foreground">
                {exportConfig.width} × {exportConfig.height} px
              </span>
            </div>

            {showPreview && previewImage ? (
              /* 预览模式：显示实际生成的图片 */
              <div className="flex flex-1 items-center justify-center overflow-auto rounded-lg border bg-muted/30 p-4">
                <img
                  alt="地图预览"
                  className="max-h-full max-w-full rounded-lg shadow-2xl"
                  src={previewImage}
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>
            ) : (
              /* 编辑模式：可交互的地图 */
              <div
                className="overflow-hidden rounded-lg border"
                style={{
                  height: "500px",
                }}
              >
                <TrackMapView
                  userId={user?.id}
                  onViewChange={handleMapViewChange}
                  showGallery={false}
                />
              </div>
            )}

            {!showPreview && (
              <p className="text-xs text-muted-foreground">💡 拖动和缩放地图来调整导出视图</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportMapDialog;
