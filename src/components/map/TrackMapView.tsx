import MapboxLanguage from "@mapbox/mapbox-gl-language";
import { useQuery } from "@tanstack/react-query";
import mapboxgl from "mapbox-gl";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { apiService } from "@/services/api";
import { generateOssImageParams } from "@/utils/media";
import PhotoGallery from "./PhotoGallery";
import "mapbox-gl/dist/mapbox-gl.css";
import "./MapCard.css";

// 常量配置
const GALLERY_WIDTH = 280;
const CIRCLE_RADIUS = 50;
const LAYER_NAMES = {
  CLUSTERS_OUTER: "clusters-outer",
  CLUSTERS: "clusters",
  CLUSTER_COUNT: "cluster-count",
  POINT_OUTER: "unclustered-point-outer",
  POINT: "unclustered-point",
} as const;

// 工具函数：生成弹窗HTML
const createPopupHTML = (
  imgUrl: string,
  name: string,
  info: string,
  time: string,
  photoIndex?: number,
) => `
  <div>
    <img 
      src="${imgUrl}" 
      style="width: 100%; height: 200px; object-fit: cover; display: block; cursor: pointer;" 
      alt="${name}"
      class="popup-preview-image"
      data-photo-index="${photoIndex !== undefined ? photoIndex : ""}" 
    />
    <div style="padding: 15px;">
      <div style="font-size: 14px; font-weight: 600; color: #2c3e50; margin-bottom: 8px;">${name}</div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #7f8c8d;">
        <span>📷 ${info}</span>
        <span style="color: #3498db;">🕐 ${time}</span>
      </div>
    </div>
  </div>
`;

interface FileData {
  id: number;
  name: string;
  url: string;
  type: string;
  blurhash: string;
  videoSrc?: string | null;
  fromIphone: boolean;
  width: number;
  height: number;
  lng: number;
  lat: number;
  takenAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TrackMapViewProps {
  userId?: number;
  secUid?: string;
  isDark?: boolean;
  customCenter?: [number, number]; // [lng, lat]
  customZoom?: number;
  onViewChange?: (center: [number, number], zoom: number) => void;
  onReady?: () => void; // 地图加载完成回调
  showGallery?: boolean;
}

const TrackMapView: React.FC<TrackMapViewProps> = ({
  userId,
  secUid,
  isDark = false,
  customCenter,
  customZoom,
  onViewChange,
  onReady,
  showGallery = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const eventHandlers = useRef<{ event: string; handler: any; layer?: string }[]>([]);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<FileData[]>([]);
  const circleSelectorRef = useRef<HTMLDivElement>(null);
  const selectModeRef = useRef(selectMode);
  const filteredFilesRef = useRef<FileData[]>([]);

  // 同步 ref 和 state
  useEffect(() => {
    selectModeRef.current = selectMode;
  }, [selectMode]);

  const mapStyle = isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";

  // 清理事件处理器
  const cleanupEventHandlers = useCallback(() => {
    if (!map.current) return;
    eventHandlers.current.forEach(({ event, handler, layer }) => {
      try {
        if (layer) {
          (map.current as any).off(event, layer, handler);
        } else {
          map.current!.off(event as any, handler);
        }
      } catch (e) {
        /* ignore */
      }
    });
    eventHandlers.current = [];
  }, []);

  // 注册事件处理器（便于统一清理）
  const registerEventHandler = useCallback((event: string, handler: any, layer?: string) => {
    if (!map.current) return;
    if (layer) {
      map.current.on(event as any, layer, handler);
    } else {
      map.current.on(event as any, handler);
    }
    eventHandlers.current.push({ event, handler, layer });
  }, []);

  // OSS 缩略图处理函数
  const getThumbnailUrl = useCallback(
    (url: string, width: number, height: number, targetSize = 100) => {
      if (!url) return "";
      if (url.includes("aliyuncs.com")) {
        return url + generateOssImageParams(width, height, targetSize, 80);
      }
      return url;
    },
    [],
  );

  // 使用 react-query 加载数据，自动去重和缓存
  const { data: filesData, isLoading: loading } = useQuery({
    queryKey: ["map-user-files", userId, secUid],
    queryFn: async () => {
      const response = await apiService.getUserFiles({
        userId,
        secUid,
        size: -1,
        filterEmptyLocation: true,
      });
      return response;
    },
    enabled: !!(userId || secUid),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });

  // 处理文件数据 - 保持 API 返回的顺序
  const filteredFiles = useMemo(() => {
    if (!filesData?.result?.list) return [];
    return filesData.result.list.filter((file) => file.lng && file.lat);
  }, [filesData]);

  // 同步 filteredFiles 到 ref
  useEffect(() => {
    filteredFilesRef.current = filteredFiles;
  }, [filteredFiles]);

  // 打开图片预览
  const openImagePreview = useCallback((fileData: FileData) => {
    import("viewer-pro").then(({ ViewerPro }) => {
      // 检查是否需要格式转换（HEIC等格式浏览器不支持）
      const needsFormatConversion =
        fileData.url.includes("aliyuncs.com") && /\.(heic|heif|tiff?)$/i.test(fileData.name);

      // 主图：HEIC等格式需要转换为JPEG，保持高质量
      const mainSrc = needsFormatConversion
        ? `${fileData.url}?x-oss-process=image/format,jpeg/quality,q_95`
        : fileData.url;

      const viewer = new ViewerPro({
        images: [
          {
            src: mainSrc,
            thumbnail: `${fileData.url}?x-oss-process=image/resize,w_300,h_200,m_lfit/quality,q_80/format,webp`,
            title: fileData.name,
            width: fileData.width,
            height: fileData.height,
          },
        ],
      });
      viewer.init();
      viewer.open(0);
    });
  }, []);

  // 显示照片弹窗（统一函数）
  const showPhotoPopup = useCallback(
    (coords: [number, number], fileData: FileData, index?: number) => {
      if (!map.current) return;
      const popupImgUrl = getThumbnailUrl(fileData.url, fileData.width, fileData.height, 400);
      const photoIndex = filteredFiles.findIndex((f) => f.id === fileData.id);
      const time = fileData.takenAt
        ? new Date(fileData.takenAt).toLocaleString("zh-CN")
        : "未知时间";

      const popup = new mapboxgl.Popup({ offset: 25 })
        .setLngLat(coords)
        .setHTML(
          createPopupHTML(
            popupImgUrl,
            fileData.name,
            `#${index || photoIndex + 1}`,
            time,
            photoIndex,
          ),
        )
        .addTo(map.current);

      setTimeout(() => {
        const img = popup.getElement()?.querySelector(".popup-preview-image") as HTMLElement;
        if (img && photoIndex !== -1) {
          img.addEventListener("click", () => openImagePreview(fileData));
        }
      }, 50);
    },
    [filteredFiles, getThumbnailUrl, openImagePreview],
  );

  // 飞到指定位置
  const flyToLocation = useCallback(
    (lng: number, lat: number, fileData: FileData) => {
      if (!map.current) return;
      map.current.flyTo({ center: [lng, lat], zoom: 16, essential: true, duration: 1500 });
      setTimeout(() => showPhotoPopup([lng, lat], fileData), 1000);
    },
    [showPhotoPopup],
  );

  // 添加聚类和照片图层
  const addPhotoLayers = useCallback(() => {
    if (!map.current || !isMapReady || filteredFiles.length === 0) {
      return;
    }

    // 创建 GeoJSON 数据
    const pointsGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: filteredFiles.map((file, index) => ({
        type: "Feature",
        properties: {
          name: file.name || `照片 #${file.id || index + 1}`,
          time: file.takenAt ? new Date(file.takenAt).toLocaleString("zh-CN") : "未知时间",
          url: file.url,
          index: index + 1,
          id: file.id,
        },
        geometry: {
          type: "Point",
          coordinates: [file.lng, file.lat],
        },
      })),
    };

    // 移除旧的数据源和图层
    if (map.current.getSource("points")) {
      Object.values(LAYER_NAMES).forEach((layerId) => {
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
      });
      map.current.removeSource("points");
    }

    // 添加新的数据源
    map.current.addSource("points", {
      type: "geojson",
      data: pointsGeoJSON,
      cluster: true,
      clusterMaxZoom: 16,
      clusterRadius: 50,
    });

    // 添加聚类外圈
    map.current.addLayer({
      id: LAYER_NAMES.CLUSTERS_OUTER,
      type: "circle",
      source: "points",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": ["step", ["get", "point_count"], "#666", 5, "#555", 10, "#444"],
        "circle-radius": ["step", ["get", "point_count"], 12, 5, 15, 10, 18],
        "circle-opacity": 0.15,
      },
    });

    // 添加聚类主圆圈
    map.current.addLayer({
      id: LAYER_NAMES.CLUSTERS,
      type: "circle",
      source: "points",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": ["step", ["get", "point_count"], "#666", 5, "#555", 10, "#444"],
        "circle-radius": ["step", ["get", "point_count"], 10, 5, 12, 10, 14],
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });

    // 添加聚类数字
    map.current.addLayer({
      id: LAYER_NAMES.CLUSTER_COUNT,
      type: "symbol",
      source: "points",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
        "text-size": 9,
      },
      paint: {
        "text-color": "#ffffff",
      },
    });

    // 添加单个点外圈
    map.current.addLayer({
      id: LAYER_NAMES.POINT_OUTER,
      type: "circle",
      source: "points",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#666",
        "circle-radius": 6,
        "circle-opacity": 0.15,
      },
    });

    // 添加单个点
    map.current.addLayer({
      id: LAYER_NAMES.POINT,
      type: "circle",
      source: "points",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#666",
        "circle-radius": 4,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });

    // 清理旧的 markers 和事件
    markers.current.forEach((m) => m.remove());
    markers.current = [];
    cleanupEventHandlers();

    // 图片标记配置
    const MARKER_ZOOM_THRESHOLD = 12;
    const markerData: {
      marker: mapboxgl.Marker;
      el: HTMLImageElement;
      coords: [number, number];
      imgSrc: string;
      loaded: boolean;
    }[] = [];

    // 创建所有 markers
    pointsGeoJSON.features.forEach((feature) => {
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
      const fileData = filteredFiles.find((f) => f.url === feature.properties?.url);
      const imgSrc = fileData
        ? getThumbnailUrl(fileData.url, fileData.width, fileData.height, 100)
        : "";

      const el = document.createElement("img");
      el.className = "photo-marker";
      el.style.cssText =
        "width:40px;height:40px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;object-fit:cover;background:#f0f0f0";
      el.alt = feature.properties?.name || "";
      el.loading = "lazy";

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" }).setLngLat(coords);

      el.onclick = (e) => {
        e.stopPropagation();
        if (selectModeRef.current || !fileData || !map.current) return;

        // 关闭之前的弹窗
        if (currentPopup.current) {
          currentPopup.current.remove();
        }

        const popupImgUrl = getThumbnailUrl(fileData.url, fileData.width, fileData.height, 400);
        const time = fileData.takenAt
          ? new Date(fileData.takenAt).toLocaleString("zh-CN")
          : "未知时间";
        currentPopup.current = new mapboxgl.Popup({ offset: 25, closeOnClick: true })
          .setLngLat(coords)
          .setHTML(
            createPopupHTML(popupImgUrl, fileData.name, `#${feature.properties?.index}`, time, -1),
          )
          .addTo(map.current);

        // 为弹窗图片添加点击预览
        setTimeout(() => {
          const img = currentPopup.current
            ?.getElement()
            ?.querySelector(".popup-preview-image") as HTMLElement;
          if (img && fileData) {
            img.style.cursor = "pointer";
            img.onclick = (ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              openImagePreview(fileData);
            };
          }
        }, 50);
      };

      markerData.push({ marker, el, coords, imgSrc, loaded: false });
      markers.current.push(marker);
    });

    // 统一的 marker 可见性更新函数
    const updateMarkersVisibility = () => {
      if (!map.current) return;
      const zoom = map.current.getZoom();
      const bounds = map.current.getBounds();
      if (!bounds) return;

      const showMarkers = zoom > MARKER_ZOOM_THRESHOLD;
      const pointLayer = map.current.getLayer(LAYER_NAMES.POINT);
      const pointOuterLayer = map.current.getLayer(LAYER_NAMES.POINT_OUTER);

      // 批量更新图层可见性
      if (pointLayer)
        map.current.setLayoutProperty(
          LAYER_NAMES.POINT,
          "visibility",
          showMarkers ? "none" : "visible",
        );
      if (pointOuterLayer)
        map.current.setLayoutProperty(
          LAYER_NAMES.POINT_OUTER,
          "visibility",
          showMarkers ? "none" : "visible",
        );

      // 更新各 marker
      markerData.forEach((item) => {
        const isInView = bounds.contains(item.coords);
        if (showMarkers && isInView) {
          if (!item.loaded && item.imgSrc) {
            item.el.src = item.imgSrc;
            item.loaded = true;
          }
          if (!item.marker.getElement().parentNode) item.marker.addTo(map.current!);
        } else {
          if (item.marker.getElement().parentNode) item.marker.remove();
        }
      });
    };

    // 注册统一的事件监听器
    registerEventHandler("zoomend", updateMarkersVisibility);
    registerEventHandler("moveend", updateMarkersVisibility);

    // 点击聚类时放大
    const clusterClickHandler = (e: mapboxgl.MapMouseEvent) => {
      if (!map.current || selectModeRef.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: [LAYER_NAMES.CLUSTERS],
      });
      if (features.length === 0) return;
      const clusterId = features[0].properties?.cluster_id;
      (map.current.getSource("points") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err || !map.current) return;
          map.current.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom as number,
          });
        },
      );
    };
    registerEventHandler("click", clusterClickHandler, LAYER_NAMES.CLUSTERS);

    // 点击单个点显示弹窗
    const pointClickHandler = (e: mapboxgl.MapMouseEvent) => {
      if (!map.current || !e.features?.length || selectModeRef.current) return;
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [
        number,
        number,
      ];
      const { url, index } = e.features[0].properties!;
      const fileData = filteredFiles.find((f) => f.url === url);
      if (fileData) showPhotoPopup(coords, fileData, index);
    };
    registerEventHandler("click", pointClickHandler, LAYER_NAMES.POINT);

    // 鼠标悬停效果
    const setCursor = (cursor: string) => () => {
      if (map.current) map.current.getCanvas().style.cursor = cursor;
    };
    registerEventHandler("mouseenter", setCursor("pointer"), LAYER_NAMES.CLUSTERS);
    registerEventHandler("mouseleave", setCursor(""), LAYER_NAMES.CLUSTERS);
    registerEventHandler("mouseenter", setCursor("pointer"), LAYER_NAMES.POINT);
    registerEventHandler("mouseleave", setCursor(""), LAYER_NAMES.POINT);

    // 自动调整视图并在完成后更新 markers
    if (pointsGeoJSON.features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      pointsGeoJSON.features.forEach((point) => {
        bounds.extend((point.geometry as GeoJSON.Point).coordinates as [number, number]);
      });
      map.current.once("moveend", updateMarkersVisibility);
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
      });
    } else {
      updateMarkersVisibility();
    }
  }, [
    filteredFiles,
    isMapReady,
    getThumbnailUrl,
    showPhotoPopup,
    registerEventHandler,
    cleanupEventHandlers,
  ]);

  // 存储事件监听器的引用，便于清理
  const canvasMouseMoveHandler = useRef<((e: MouseEvent) => void) | null>(null);

  // 初始化地图
  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: customCenter || [116.4074, 39.9042],
        zoom: customZoom !== undefined ? customZoom : 2,
        pitch: 0,
        bearing: 0,
        preserveDrawingBuffer: true,
      });

      map.current.on("error", (e) => {
        console.error("❌ 地图错误:", e);
      });

      map.current.addControl(new MapboxLanguage({ defaultLanguage: "zh-Hans" }));
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

      // 使用原生 DOM 事件监听鼠标移动（直接操作 DOM，性能优化）
      const canvas = map.current.getCanvas();
      canvasMouseMoveHandler.current = (e: MouseEvent) => {
        if (selectModeRef.current && circleSelectorRef.current) {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          // 直接操作 DOM，避免状态更新导致的重渲染
          const circle = circleSelectorRef.current;
          const diameter = CIRCLE_RADIUS * 2;
          circle.style.width = `${diameter}px`;
          circle.style.height = `${diameter}px`;
          circle.style.left = `${x - CIRCLE_RADIUS}px`;
          circle.style.top = `${y - CIRCLE_RADIUS}px`;
          circle.style.display = "block";
        }
      };

      // 点击地图筛选圆圈内的照片
      const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
        if (selectModeRef.current && filteredFilesRef.current.length > 0) {
          const center = e.lngLat;
          const selected = filteredFilesRef.current.filter((file) => {
            const point = map.current!.project([file.lng, file.lat]);
            const clickPoint = map.current!.project([center.lng, center.lat]);
            const distance = Math.sqrt(
              Math.pow(point.x - clickPoint.x, 2) + Math.pow(point.y - clickPoint.y, 2),
            );
            return distance <= CIRCLE_RADIUS;
          });
          setSelectedPhotos(selected);
        }
      };

      canvas.addEventListener("mousemove", canvasMouseMoveHandler.current);
      map.current.on("click", handleMapClick);

      map.current.on("load", () => {
        setIsMapReady(true);

        // 触发 resize 确保地图适应容器
        setTimeout(() => map.current?.resize(), 100);
      });

      if (onViewChange) {
        const updateView = () => {
          if (map.current) {
            const center = map.current.getCenter();
            const zoom = map.current.getZoom();
            onViewChange([center.lng, center.lat], zoom);
          }
        };

        map.current.on("moveend", updateView);
        map.current.on("zoomend", updateView);
      }
    } catch (error) {
      console.error("❌ 地图初始化失败:", error);
    }
  }, [mapStyle, customCenter, customZoom, onViewChange]);

  // 初始化地图 - 只有在数据加载完成且有数据时才初始化
  useEffect(() => {
    if ((!userId && !secUid) || loading || filteredFiles.length === 0) return;

    if (!mapContainer.current) {
      const checkTimer = setTimeout(() => mapContainer.current && initMap(), 200);
      return () => clearTimeout(checkTimer);
    }

    const timer = setTimeout(initMap, 100);

    return () => {
      clearTimeout(timer);
      // 清理 markers
      markers.current.forEach((m) => m.remove());
      markers.current = [];
      // 清理事件监听器
      cleanupEventHandlers();
      // 清理地图实例
      if (map.current) {
        const canvas = map.current.getCanvas();
        if (canvas && canvasMouseMoveHandler.current) {
          canvas.removeEventListener("mousemove", canvasMouseMoveHandler.current);
        }
        map.current.remove();
        map.current = null;
      }
      setIsMapReady(false);
    };
  }, [userId, secUid, loading, filteredFiles.length, initMap, cleanupEventHandlers]);

  // 添加照片图层
  useEffect(() => {
    if (isMapReady && filteredFiles.length > 0) {
      addPhotoLayers();
      // 地图和数据都准备好后，延迟调用 onReady（等待瓦片加载）
      const timer = setTimeout(() => {
        onReady?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMapReady, filteredFiles, addPhotoLayers, onReady]);

  // 监听主题变化（仅在运行时切换主题时使用）
  const prevIsDark = useRef(isDark);
  useEffect(() => {
    // 跳过初始渲染，只处理运行时主题切换
    if (prevIsDark.current === isDark) return;
    prevIsDark.current = isDark;

    if (map.current && isMapReady) {
      const newMapStyle = isDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";
      map.current.setStyle(newMapStyle);

      map.current.once("styledata", () => {
        if (filteredFiles.length > 0) setTimeout(() => addPhotoLayers(), 100);
      });
    }
  }, [isDark, isMapReady, filteredFiles, addPhotoLayers]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <p className="text-gray-600">加载地图数据中...</p>
        </div>
      </div>
    );
  }

  if ((!userId && !secUid) || filteredFiles.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="mb-4 text-6xl">🗺️</div>
        <h3 className="mb-2 font-semibold text-gray-700 text-lg">暂无地图数据</h3>
        <p className="text-center text-gray-500 text-sm">
          上传带有GPS信息的照片后，
          <br />
          你的足迹将在这里显示
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: "100%", minHeight: "600px" }}>
      {/* 地图容器 - 绝对定位填充整个父容器 */}
      <div
        ref={mapContainer}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: showGallery ? `${GALLERY_WIDTH}px` : "0",
          backgroundColor: "#f5f5f5",
          zIndex: 0,
        }}
      />

      {/* 调试覆盖层 - 显示地图状态 */}
      {!isMapReady && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/80 pointer-events-none"
          style={{ right: showGallery ? `${GALLERY_WIDTH}px` : "0" }}
        >
          <div className="text-center">
            <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            <p className="text-gray-600">地图加载中...</p>
          </div>
        </div>
      )}

      {/* 圆形选择图标 - 极简版 */}
      <button
        onClick={() => {
          const newMode = !selectMode;
          setSelectMode(newMode);
          if (!newMode) {
            setSelectedPhotos([]);
            // 退出选择模式时隐藏圆圈
            if (circleSelectorRef.current) {
              circleSelectorRef.current.style.display = "none";
            }
          }
        }}
        className={`absolute left-4 bottom-4 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all hover:shadow-lg hover:scale-110 ${
          selectMode ? "bg-blue-500 text-white" : "bg-white/90 text-gray-600 backdrop-blur-sm"
        }`}
        style={{ right: showGallery ? `${GALLERY_WIDTH}px` : undefined }}
        title={selectMode ? "退出圈选模式" : "圈选照片"}
      >
        <span className="text-lg leading-none">{selectMode ? "✓" : "○"}</span>
      </button>

      {/* 圆形选择器 - 性能优化：直接操作 DOM */}
      <div
        ref={circleSelectorRef}
        className="pointer-events-none"
        style={{
          position: "absolute",
          display: "none",
          border: "2px solid #3498db",
          borderRadius: "50%",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          zIndex: 10,
          boxShadow: "0 0 20px rgba(52, 152, 219, 0.3)",
        }}
      />

      {/* 照片画廊侧边栏 - 虚拟列表优化 */}
      {showGallery && (
        <PhotoGallery
          photos={filteredFiles}
          selectedPhotos={selectedPhotos}
          onPhotoClick={flyToLocation} // 点击卡片 - 飞到地图位置并显示弹窗
          onClearSelection={() => setSelectedPhotos([])}
          width={GALLERY_WIDTH}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default TrackMapView;
