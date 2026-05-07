import MapboxLanguage from "@mapbox/mapbox-gl-language";
import { useQuery } from "@tanstack/react-query";
import { Check, Circle, Map as MapIcon } from "lucide-react";
import mapboxgl from "mapbox-gl";
import type React from "react";
import { createElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import ImageInfoPanel from "@/components/media/ImageInfoPanel";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { filesApi } from "@/services/api";
import { generateOssImageParams } from "@/utils/media";
import PhotoGallery from "./PhotoGallery";
import type { FileData } from "./types";
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
  extra?: { address?: string; device?: string; params?: string }
) => `
  <div class="map-popup-card">
    <div class="map-popup-image-wrap">
      <img
        src="${imgUrl}"
        alt="${name}"
        class="popup-preview-image map-popup-image"
        data-photo-index="${photoIndex === undefined ? "" : photoIndex}"
      />
    </div>
    <div class="map-popup-body">
      <div class="map-popup-title">${name}</div>
      <div class="map-popup-meta">
        <span class="map-popup-badge">${info}</span>
        <span class="map-popup-time">${time}</span>
      </div>
      ${extra?.address ? `<div class="map-popup-address"><svg class="map-popup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${extra.address}</div>` : ""}
      ${extra?.device ? `<div class="map-popup-device"><svg class="map-popup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>${extra.device}</div>` : ""}
      ${extra?.params ? `<div class="map-popup-params"><svg class="map-popup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="12"/></svg>${extra.params}</div>` : ""}
    </div>
  </div>
`;

interface TrackMapViewProps {
  autoFitBounds?: boolean;
  customCenter?: [number, number]; // [lng, lat]
  customZoom?: number;
  isDark?: boolean;
  minHeight?: React.CSSProperties["minHeight"];
  onReady?: (map?: mapboxgl.Map) => void; // 地图加载完成回调
  onViewChange?: (center: [number, number], zoom: number) => void;
  secUid?: string;
  showGallery?: boolean;
  userId?: number;
}

const TrackMapView: React.FC<TrackMapViewProps> = ({
  userId,
  secUid,
  isDark = false,
  customCenter,
  customZoom,
  minHeight,
  onViewChange,
  onReady,
  autoFitBounds = true,
  showGallery = true,
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
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
  const fileDetailCache = useRef<Map<string, FileData>>(new Map());

  // 同步 ref 和 state
  useEffect(() => {
    selectModeRef.current = selectMode;
  }, [selectMode]);

  const mapStyle = isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";

  // 清理事件处理器
  const cleanupEventHandlers = useCallback(() => {
    if (!map.current) {
      return;
    }
    eventHandlers.current.forEach(({ event, handler, layer }) => {
      try {
        if (layer) {
          (map.current as any).off(event, layer, handler);
        } else {
          map.current!.off(event as any, handler);
        }
      } catch (_e) {
        /* ignore */
      }
    });
    eventHandlers.current = [];
  }, []);

  // 注册事件处理器（便于统一清理）
  const registerEventHandler = useCallback((event: string, handler: any, layer?: string) => {
    if (!map.current) {
      return;
    }
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
      if (!url) {
        return "";
      }
      if (url.includes("aliyuncs.com")) {
        return url + generateOssImageParams(width, height, targetSize, 80);
      }
      return url;
    },
    []
  );

  // 使用 react-query 加载数据，自动去重和缓存
  const { data: filesData, isLoading: loading } = useQuery({
    queryKey: ["map-user-files", userId, secUid],
    queryFn: async () => {
      const response = await filesApi.list({
        user_sec_uid: secUid,
        page_size: -1,
        preset: "mini",
        sort: "taken_at,desc",
        has_location: true,
      });
      return response;
    },
    enabled: !!(userId || secUid),
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });

  // 处理文件数据 - 保持 API 返回的顺序
  const filteredFiles = useMemo(() => {
    if (!filesData?.result?.list) {
      return [];
    }
    return filesData.result.list.filter((file) => file.lng && file.lat);
  }, [filesData]);

  // 同步 filteredFiles 到 ref
  useEffect(() => {
    filteredFilesRef.current = filteredFiles;
  }, [filteredFiles]);

  // 打开图片预览
  const openImagePreview = useCallback((fileData: FileData) => {
    import("viewer-pro").then(({ ViewerPro }) => {
      const needsFormatConversion =
        fileData.url.includes("aliyuncs.com") && /\.(heic|heif|tiff?)$/i.test(fileData.name);

      const mainSrc = needsFormatConversion
        ? `${fileData.url}?x-oss-process=image/format,jpeg/quality,q_95`
        : fileData.url;

      const cached = fileDetailCache.current.get(fileData.sec_uid);
      const detail = cached || fileData;

      const viewer = new ViewerPro({
        images: [
          {
            id: fileData.sec_uid,
            src: mainSrc,
            thumbnail: `${fileData.url}?x-oss-process=image/resize,w_300,h_200,m_lfit/quality,q_80/format,webp`,
            title: detail.name || fileData.name,
            width: fileData.width,
            height: fileData.height,
            address: detail.address,
            deviceMake: detail.deviceMake,
            deviceModel: detail.deviceModel,
            lensModel: detail.lensModel,
            fNumber: detail.fNumber,
            exposureTime: detail.exposureTime,
            iso: detail.iso,
            focalLength: detail.focalLength,
            takenAt: detail.takenAt,
            lng: fileData.lng,
            lat: fileData.lat,
          } as any,
        ],
        infoRender: (viewerItem: any, idx: number) => {
          const container = document.createElement("div");
          container.style.width = "100%";
          container.style.height = "100%";
          const root = createRoot(container);
          root.render(createElement(ImageInfoPanel, { viewerItem, index: idx }));
          return container;
        },
      });
      viewer.init();
      viewer.open(0);
    });
  }, []);

  // 渲染弹窗内容（纯渲染，不请求接口）
  const renderPopup = useCallback(
    (coords: [number, number], fileData: FileData, index?: number) => {
      if (!map.current) {
        return;
      }

      if (currentPopup.current) {
        currentPopup.current.remove();
      }

      const popupImgUrl = getThumbnailUrl(fileData.url, fileData.width, fileData.height, 400);
      const photoIndex = filteredFiles.findIndex((f) => f.sec_uid === fileData.sec_uid);
      const displayIndex = index || photoIndex + 1;
      const time = fileData.takenAt
        ? new Date(fileData.takenAt).toLocaleString("zh-CN")
        : "未知时间";

      const device = [fileData.deviceMake, fileData.deviceModel].filter(Boolean).join(" ");
      const paramParts = [
        fileData.fNumber ? `ƒ/${fileData.fNumber}` : "",
        fileData.exposureTime ? `${fileData.exposureTime}s` : "",
        fileData.iso ? `ISO ${fileData.iso}` : "",
        fileData.focalLength ? `${fileData.focalLength}mm` : "",
      ].filter(Boolean);

      const extra = {
        address: fileData.address || undefined,
        device: device || undefined,
        params: paramParts.length > 0 ? paramParts.join("  ") : undefined,
      };

      currentPopup.current = new mapboxgl.Popup({ offset: 25, maxWidth: "none" })
        .setLngLat(coords)
        .setHTML(
          createPopupHTML(popupImgUrl, fileData.name, `#${displayIndex}`, time, photoIndex, extra)
        )
        .addTo(map.current);

      const popup = currentPopup.current;
      setTimeout(() => {
        const img = popup.getElement()?.querySelector(".popup-preview-image") as HTMLElement;
        if (img && photoIndex !== -1) {
          img.style.cursor = "pointer";
          img.addEventListener("click", () => openImagePreview(fileData));
        }
      }, 50);
    },
    [filteredFiles, getThumbnailUrl, openImagePreview]
  );

  // 显示照片弹窗（统一入口：先展示 mini 数据，再异步拉详情刷新弹窗）
  const showPhotoPopup = useCallback(
    (coords: [number, number], fileData: FileData, index?: number) => {
      const secUid = fileData.sec_uid;

      // 如果缓存中有详情，直接用
      const cached = fileDetailCache.current.get(secUid);
      if (cached) {
        renderPopup(coords, cached, index);
        return;
      }

      // 先用现有数据立即展示弹窗
      renderPopup(coords, fileData, index);

      // 异步拉详情，拿到后缓存并刷新弹窗
      filesApi
        .getBySecUid(secUid)
        .then((res) => {
          const detail = res.result;
          if (!detail) {
            return;
          }
          const enriched: FileData = {
            ...fileData,
            sec_uid: detail.sec_uid,
            name: detail.name || fileData.name,
            address: detail.address,
            deviceMake: detail.device_make,
            deviceModel: detail.device_model,
            lensModel: detail.lens_model,
            fNumber: detail.f_number,
            exposureTime: detail.exposure_time,
            iso: detail.iso,
            focalLength: detail.focal_length,
            takenAt: detail.taken_at || fileData.takenAt,
          };
          fileDetailCache.current.set(secUid, enriched);
          if (currentPopup.current) {
            renderPopup(coords, enriched, index);
          }
        })
        .catch(() => {});
    },
    [renderPopup]
  );

  // 飞到指定位置
  const flyToLocation = useCallback(
    (lng: number, lat: number, fileData: FileData) => {
      if (!map.current) {
        return;
      }
      map.current.flyTo({ center: [lng, lat], zoom: 16, essential: true, duration: 1500 });
      setTimeout(() => showPhotoPopup([lng, lat], fileData), 1000);
    },
    [showPhotoPopup]
  );

  // 添加聚类和照片图层
  const addPhotoLayers = useCallback(() => {
    if (!(map.current && isMapReady) || filteredFiles.length === 0) {
      return;
    }

    // 创建 GeoJSON 数据
    const pointsGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: filteredFiles.map((file, index) => ({
        type: "Feature",
        properties: {
          name: file.name || `照片 #${index + 1}`,
          time: file.takenAt ? new Date(file.takenAt).toLocaleString("zh-CN") : "未知时间",
          url: file.url,
          index: index + 1,
          sec_uid: file.sec_uid,
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
        if (selectModeRef.current || !fileData || !map.current) {
          return;
        }
        showPhotoPopup(coords, fileData, feature.properties?.index);
      };

      markerData.push({ marker, el, coords, imgSrc, loaded: false });
      markers.current.push(marker);
    });

    // 统一的 marker 可见性更新函数
    const updateMarkersVisibility = () => {
      if (!map.current) {
        return;
      }
      const zoom = map.current.getZoom();
      const bounds = map.current.getBounds();
      if (!bounds) {
        return;
      }

      const showMarkers = zoom > MARKER_ZOOM_THRESHOLD;
      const pointLayer = map.current.getLayer(LAYER_NAMES.POINT);
      const pointOuterLayer = map.current.getLayer(LAYER_NAMES.POINT_OUTER);

      // 批量更新图层可见性
      if (pointLayer) {
        map.current.setLayoutProperty(
          LAYER_NAMES.POINT,
          "visibility",
          showMarkers ? "none" : "visible"
        );
      }
      if (pointOuterLayer) {
        map.current.setLayoutProperty(
          LAYER_NAMES.POINT_OUTER,
          "visibility",
          showMarkers ? "none" : "visible"
        );
      }

      // 更新各 marker
      markerData.forEach((item) => {
        const isInView = bounds.contains(item.coords);
        if (showMarkers && isInView) {
          if (!item.loaded && item.imgSrc) {
            item.el.src = item.imgSrc;
            item.loaded = true;
          }
          if (!item.marker.getElement().parentNode) {
            item.marker.addTo(map.current!);
          }
        } else if (item.marker.getElement().parentNode) {
          item.marker.remove();
        }
      });
    };

    // 注册统一的事件监听器
    registerEventHandler("zoomend", updateMarkersVisibility);
    registerEventHandler("moveend", updateMarkersVisibility);

    // 点击聚类时放大
    const clusterClickHandler = (e: mapboxgl.MapMouseEvent) => {
      if (!map.current || selectModeRef.current) {
        return;
      }
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: [LAYER_NAMES.CLUSTERS],
      });
      if (features.length === 0) {
        return;
      }
      const clusterId = features[0].properties?.cluster_id;
      (map.current.getSource("points") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
        clusterId,
        (err, zoom) => {
          if (err || !map.current) {
            return;
          }
          map.current.easeTo({
            center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom as number,
          });
        }
      );
    };
    registerEventHandler("click", clusterClickHandler, LAYER_NAMES.CLUSTERS);

    // 点击单个点显示弹窗
    const pointClickHandler = (e: mapboxgl.MapMouseEvent) => {
      if (!(map.current && e.features?.length) || selectModeRef.current) {
        return;
      }
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [
        number,
        number,
      ];
      const { url, index } = e.features[0].properties!;
      const fileData = filteredFiles.find((f) => f.url === url);
      if (fileData) {
        showPhotoPopup(coords, fileData, index);
      }
    };
    registerEventHandler("click", pointClickHandler, LAYER_NAMES.POINT);

    // 鼠标悬停效果
    const setCursor = (cursor: string) => () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = cursor;
      }
    };
    registerEventHandler("mouseenter", setCursor("pointer"), LAYER_NAMES.CLUSTERS);
    registerEventHandler("mouseleave", setCursor(""), LAYER_NAMES.CLUSTERS);
    registerEventHandler("mouseenter", setCursor("pointer"), LAYER_NAMES.POINT);
    registerEventHandler("mouseleave", setCursor(""), LAYER_NAMES.POINT);

    // 自动调整视图并在完成后更新 markers
    if (autoFitBounds && pointsGeoJSON.features.length > 0) {
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
    autoFitBounds,
  ]);

  // 存储事件监听器的引用，便于清理
  const canvasMouseMoveHandler = useRef<((e: MouseEvent) => void) | null>(null);

  // 初始化地图
  const initMap = useCallback(() => {
    if (!mapContainer.current || map.current) {
      return;
    }
    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: customCenter || [116.4074, 39.9042],
        zoom: customZoom === undefined ? 2 : customZoom,
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
              (point.x - clickPoint.x) ** 2 + (point.y - clickPoint.y) ** 2
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
    if (!(userId || secUid) || loading || filteredFiles.length === 0) {
      return;
    }

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
        onReady?.(map.current || undefined);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isMapReady, filteredFiles, addPhotoLayers, onReady]);

  // 监听主题变化（仅在运行时切换主题时使用）
  const prevIsDark = useRef(isDark);
  useEffect(() => {
    // 跳过初始渲染，只处理运行时主题切换
    if (prevIsDark.current === isDark) {
      return;
    }
    prevIsDark.current = isDark;

    if (map.current && isMapReady) {
      const newMapStyle = isDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";
      map.current.setStyle(newMapStyle);

      map.current.once("styledata", () => {
        if (filteredFiles.length > 0) {
          setTimeout(() => addPhotoLayers(), 100);
        }
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

  if (!(userId || secUid) || filteredFiles.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-linear-to-br from-gray-50 to-gray-100">
        <div className="mb-4 flex justify-center text-gray-300">
          <MapIcon className="h-16 w-16" strokeWidth={1} />
        </div>
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
    <div
      className="relative w-full"
      style={{ height: "100%", minHeight: minHeight ?? (isMobile ? "100dvh" : "600px") }}
    >
      {/* 地图容器 - 移动端全屏，桌面端留出侧边栏空间 */}
      <div
        ref={mapContainer}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: showGallery && !isMobile ? `${GALLERY_WIDTH}px` : "0",
          backgroundColor: "#f5f5f5",
          zIndex: 0,
        }}
      />

      {/* 调试覆盖层 - 显示地图状态 */}
      {!isMapReady && (
        <div
          className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-gray-100/80"
          style={{ right: showGallery && !isMobile ? `${GALLERY_WIDTH}px` : "0" }}
        >
          <div className="text-center">
            <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
            <p className="text-gray-600">地图加载中...</p>
          </div>
        </div>
      )}

      {/* 圆形选择图标 - 极简版 */}
      <button
        className={`absolute left-4 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all hover:scale-110 hover:shadow-lg ${
          selectMode ? "bg-blue-500 text-white" : "bg-white/90 text-gray-600 backdrop-blur-sm"
        } ${isMobile ? "bottom-16" : "bottom-4"}`}
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
        style={{ right: showGallery && !isMobile ? `${GALLERY_WIDTH}px` : undefined }}
        title={selectMode ? "退出圈选模式" : "圈选照片"}
      >
        <span className="text-lg leading-none">
          {selectMode ? <Check className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </span>
      </button>

      {/* 圆形选择器 - 性能优化：直接操作 DOM */}
      <div
        className="pointer-events-none"
        ref={circleSelectorRef}
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

      {/* 照片画廊 - 桌面端侧边栏 / 移动端底部抽屉 */}
      {showGallery && (
        <PhotoGallery
          isDark={isDark}
          isMobile={isMobile}
          onClearSelection={() => setSelectedPhotos([])}
          onPhotoClick={flyToLocation}
          photos={filteredFiles}
          selectedPhotos={selectedPhotos}
          width={GALLERY_WIDTH}
        />
      )}
    </div>
  );
};

export default TrackMapView;
