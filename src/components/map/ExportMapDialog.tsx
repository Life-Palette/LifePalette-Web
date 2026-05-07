import { QueryClientProvider } from "@tanstack/react-query";
import { Download, Eye } from "lucide-react";
import type { Map as MapboxMap } from "mapbox-gl";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import TrackMapView from "@/components/map/TrackMapView";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { queryClient } from "@/lib/query-client";

interface CityData {
  city: string;
  country: string;
  lat?: number;
  lng?: number;
  photo_count: number;
  province: string;
}

interface ExportMapDialogProps {
  cities: CityData[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const ExportMapDialog: React.FC<ExportMapDialogProps> = ({ open, onOpenChange }) => {
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
  const editorMapFrameRef = useRef<HTMLDivElement>(null);

  const createExportContainer = () => {
    const exportContainer = document.createElement("div");
    exportContainer.style.position = "fixed";
    exportContainer.style.top = "0";
    exportContainer.style.left = "0";
    exportContainer.style.width = `${exportConfig.width}px`;
    exportContainer.style.height = `${exportConfig.height}px`;
    exportContainer.style.background = "white";
    exportContainer.style.overflow = "hidden";
    exportContainer.style.pointerEvents = "none";
    exportContainer.style.zIndex = "-1";
    document.body.appendChild(exportContainer);
    return exportContainer;
  };

  const waitForMapRender = (mapInstance: MapboxMap) =>
    new Promise<void>((resolve) => {
      let resolved = false;
      const finish = () => {
        if (resolved) {
          return;
        }
        resolved = true;
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      };

      const timeout = window.setTimeout(finish, 3000);
      mapInstance.resize();
      mapInstance.triggerRepaint();
      mapInstance.once("idle", () => {
        window.clearTimeout(timeout);
        finish();
      });
    });

  const buildMapImage = (mapInstance: MapboxMap, scale: number) => {
    const mapCanvas = mapInstance.getCanvas();
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = exportConfig.width * scale;
    outputCanvas.height = exportConfig.height * scale;

    const context = outputCanvas.getContext("2d");
    if (!context) {
      throw new Error("无法创建导出画布");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
    context.drawImage(mapCanvas, 0, 0, outputCanvas.width, outputCanvas.height);

    if (watermarkConfig.enabled && watermarkConfig.text) {
      const paddingX = 12 * scale;
      const paddingY = 8 * scale;
      const margin = 20 * scale;
      context.font = `${14 * scale}px sans-serif`;
      context.textBaseline = "middle";

      const metrics = context.measureText(watermarkConfig.text);
      const boxWidth = metrics.width + paddingX * 2;
      const boxHeight = 30 * scale;
      const boxX = outputCanvas.width - boxWidth - margin;
      const boxY = outputCanvas.height - boxHeight - margin;

      context.fillStyle = "rgba(255, 255, 255, 0.8)";
      context.fillRect(boxX, boxY, boxWidth, boxHeight);
      context.fillStyle = "rgba(0, 0, 0, 0.3)";
      context.fillText(watermarkConfig.text, boxX + paddingX, boxY + boxHeight / 2 + paddingY / 8);
    }

    return outputCanvas.toDataURL("image/png", 1);
  };

  const renderExportMap = async (scale: number) => {
    const exportContainer = createExportContainer();
    const editorMapWidth = editorMapFrameRef.current?.clientWidth || exportConfig.width;
    const exportZoom = mapViewRef.current.zoom + Math.log2(exportConfig.width / editorMapWidth);
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(exportContainer);

    try {
      const mapInstance = await new Promise<MapboxMap>((resolve, reject) => {
        let resolved = false;
        const timeout = window.setTimeout(() => {
          if (!resolved) {
            resolved = true;
            reject(new Error("地图加载超时"));
          }
        }, 15_000);

        root.render(
          <QueryClientProvider client={queryClient}>
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              <TrackMapView
                autoFitBounds={false}
                customCenter={[mapViewRef.current.centerLng, mapViewRef.current.centerLat]}
                customZoom={exportZoom}
                minHeight="100%"
                onReady={(readyMap) => {
                  if (resolved || !readyMap) {
                    return;
                  }
                  resolved = true;
                  window.clearTimeout(timeout);
                  resolve(readyMap);
                }}
                secUid={user?.sec_uid}
                showGallery={false}
              />
            </div>
          </QueryClientProvider>
        );
      });

      await waitForMapRender(mapInstance);
      return buildMapImage(mapInstance, scale);
    } finally {
      root.unmount();
      document.body.removeChild(exportContainer);
    }
  };

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

    try {
      const imageUrl = await renderExportMap(1);
      setPreviewImage(imageUrl);
      setShowPreview(true);

      toast.success("预览生成成功！", { id: "generate-preview" });
    } catch (error) {
      console.error("预览生成失败:", error);
      toast.error("预览生成失败，请重试", { id: "generate-preview" });
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  // 生成并下载海报
  const handleExportPoster = async () => {
    setIsExporting(true);
    toast.loading("正在生成海报...", { id: "export-poster" });

    try {
      const imageUrl = await renderExportMap(2);
      const link = document.createElement("a");
      link.download = `足迹地图-${new Date().toLocaleDateString("zh-CN")}.png`;
      link.href = imageUrl;
      link.click();

      toast.success("海报生成成功！", { id: "export-poster" });
      onOpenChange(false);
    } catch (error) {
      console.error("海报生成失败:", error);
      toast.error("海报生成失败，请重试", { id: "export-poster" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] overflow-hidden sm:max-w-[calc(100%-2rem)] lg:max-w-5xl">
        <DialogHeader>
          <DialogTitle>导出地图海报</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[calc(90vh-4.5rem)] grid-cols-1 gap-4 overflow-y-auto pr-1 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6">
          {/* 左侧：配置选项 */}
          <div className="flex min-w-0 flex-col space-y-3">
            <div>
              <label className="mb-2 block font-medium text-sm">尺寸设置</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-muted-foreground text-xs">宽度 (px)</label>
                  <Input
                    min={100}
                    onChange={(e) => handleSizeChange("width", e.target.value)}
                    type="number"
                    value={exportConfig.width}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-muted-foreground text-xs">高度 (px)</label>
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
              <label className="mb-2 block font-medium text-sm">当前视图</label>
              <div className="space-y-2">
                <div className="rounded-lg bg-muted p-3">
                  <div className="mb-1 text-muted-foreground text-xs">缩放级别</div>
                  <div className="font-mono text-sm">{displayView.zoom.toFixed(2)}</div>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="mb-1 text-muted-foreground text-xs">中心坐标</div>
                  <div className="font-mono text-sm">
                    {displayView.centerLng.toFixed(4)}, {displayView.centerLat.toFixed(4)}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground text-xs">
                💡 在右侧地图上拖动和缩放来调整视图
              </p>
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm">水印设置</label>
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
          <div className="flex min-w-0 flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-medium text-sm">
                {showPreview ? "最终效果预览" : "地图视图调整"}
              </label>
              <span className="text-muted-foreground text-xs">
                {exportConfig.width} × {exportConfig.height} px
              </span>
            </div>

            {showPreview && previewImage ? (
              /* 预览模式：显示实际生成的图片 */
              <div className="flex min-h-80 flex-1 items-center justify-center overflow-auto rounded-lg border bg-muted/30 p-4">
                <img
                  alt="地图预览"
                  className="max-h-full max-w-full rounded-lg shadow-2xl"
                  height={600}
                  src={previewImage}
                  style={{
                    objectFit: "contain",
                  }}
                  width={800}
                />
              </div>
            ) : (
              /* 编辑模式：可交互的地图 */
              <div
                className="overflow-hidden rounded-lg border"
                ref={editorMapFrameRef}
                style={{
                  aspectRatio: `${exportConfig.width} / ${exportConfig.height}`,
                  maxHeight: "min(500px, 55vh)",
                }}
              >
                <TrackMapView
                  minHeight="100%"
                  onViewChange={handleMapViewChange}
                  secUid={user?.sec_uid}
                  showGallery={false}
                />
              </div>
            )}

            {!showPreview && (
              <p className="text-muted-foreground text-xs">💡 拖动和缩放地图来调整导出视图</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportMapDialog;
