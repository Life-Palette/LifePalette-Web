import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapboxgl from "mapbox-gl";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { useImageViewer } from "@/hooks/useImageViewer";
import { apiService } from "@/services/api";
import type { PostImage } from "@/types";
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
  isDark?: boolean;
  customCenter?: [number, number]; // [lng, lat]
  customZoom?: number;
  onViewChange?: (center: [number, number], zoom: number) => void;
  onReady?: () => void; // 地图加载完成回调
  showGallery?: boolean;
}

const TrackMapView: React.FC<TrackMapViewProps> = ({
  userId,
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
  const [isMapReady, setIsMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredFiles, setFilteredFiles] = useState<FileData[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<FileData[]>([]);
  const circleSelectorRef = useRef<HTMLDivElement>(null);
  const selectModeRef = useRef(selectMode);
  const filteredFilesRef = useRef(filteredFiles);

  // 图片预览功能 - 不传入 initialOptions.images，避免自动初始化
  const { initWithPostImages, openPreview } = useImageViewer();

  // 同步 ref 和 state
  useEffect(() => {
    selectModeRef.current = selectMode;
  }, [selectMode]);

  useEffect(() => {
    filteredFilesRef.current = filteredFiles;
  }, [filteredFiles]);

  const mapStyle = isDark ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";

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

  // 加载数据
  const loadData = useCallback(async () => {
    if (!userId) {
      console.log("⚠️ 未提供 userId");
      return;
    }

    try {
      setLoading(true);
      console.log(`📡 加载用户 ${userId} 的文件...`);
      const response = await apiService.getUserFiles({
        userId,
        size: -1, // 获取所有数据
        filterEmptyLocation: true, // 过滤掉没有坐标的
      });

      if (response.code === 200 && response.result.list) {
        // 按时间排序
        const sortedFiles = response.result.list
          .filter((file) => file.lng && file.lat)
          .sort((a, b) => {
            if (!a.takenAt) return 1;
            if (!b.takenAt) return -1;
            return new Date(a.takenAt).getTime() - new Date(b.takenAt).getTime();
          });

        console.log(`✅ 加载了 ${sortedFiles.length} 张照片`);
        setFilteredFiles(sortedFiles);
      }
    } catch (error) {
      console.error("❌ 加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 打开图片预览（按需初始化单张图片）
  const openImagePreview = useCallback(
    (fileData: FileData) => {
      console.log("📸 打开图片预览（单张）", fileData);
      return;
      const postImage: PostImage = {
        id: fileData.id,
        url: fileData.url,
        width: fileData.width,
        height: fileData.height,
        blurhash: fileData.blurhash,
        type: fileData.type,
        name: fileData.name,
        lat: fileData.lat,
        lng: fileData.lng,
        videoSrc: fileData.videoSrc || null,
      };

      // 只初始化当前点击的图片
      initWithPostImages([postImage]);

      // 延迟打开，确保初始化完成
      setTimeout(() => {
        openPreview(0);
      }, 100);

      console.log("📸 打开图片预览（单张）");
    },
    [initWithPostImages, openPreview],
  );

  // 飞到指定位置（从文字区域点击触发）
  const flyToLocation = useCallback(
    (lng: number, lat: number, fileData: FileData) => {
      if (!map.current) return;

      map.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        essential: true,
        duration: 1500,
      });

      // 延迟显示弹窗
      setTimeout(() => {
        const popupImgUrl = getThumbnailUrl(fileData.url, fileData.width, fileData.height, 400);
        const time = fileData.takenAt
          ? new Date(fileData.takenAt).toLocaleString("zh-CN")
          : "未知时间";
        const photoIndex = filteredFiles.findIndex((f) => f.id === fileData.id);
        const popup = new mapboxgl.Popup()
          .setLngLat([lng, lat])
          .setHTML(createPopupHTML(popupImgUrl, fileData.name, "照片", time, photoIndex))
          .addTo(map.current!);

        // 为弹窗中的图片添加点击事件
        setTimeout(() => {
          const popupEl = popup.getElement();
          const img = popupEl?.querySelector(".popup-preview-image") as HTMLElement;
          if (img && photoIndex !== -1) {
            img.addEventListener("click", () => {
              openImagePreview(fileData);
            });
          }
        }, 50);
      }, 1000);
    },
    [getThumbnailUrl, filteredFiles, openImagePreview],
  );

  // 添加聚类和照片图层
  const addPhotoLayers = useCallback(() => {
    if (!map.current || !isMapReady || filteredFiles.length === 0) {
      console.log("⏭️ 跳过图层添加:", { mapReady: isMapReady, filesCount: filteredFiles.length });
      return;
    }

    console.log(`📍 添加 ${filteredFiles.length} 个照片点到地图...`);

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
        "circle-color": ["step", ["get", "point_count"], "#666666", 5, "#4a4a4a", 10, "#333333"],
        "circle-radius": ["step", ["get", "point_count"], 10, 5, 12, 10, 14],
        "circle-opacity": 0.15,
        "circle-blur": 0.3,
      },
    });

    // 添加聚类主圆圈
    map.current.addLayer({
      id: LAYER_NAMES.CLUSTERS,
      type: "circle",
      source: "points",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": ["step", ["get", "point_count"], "#666666", 5, "#4a4a4a", 10, "#333333"],
        "circle-radius": ["step", ["get", "point_count"], 8, 5, 10, 10, 12],
        "circle-stroke-width": 1,
        "circle-stroke-color": "#ffffff",
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

    // 添加单个点的外圈
    map.current.addLayer({
      id: LAYER_NAMES.POINT_OUTER,
      type: "circle",
      source: "points",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#666666",
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
        "circle-color": "#666666",
        "circle-radius": 3,
        "circle-stroke-width": 1,
        "circle-stroke-color": "#fff",
      },
    });

    // 添加图片标记
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    pointsGeoJSON.features.forEach((feature) => {
      const el = document.createElement("img");
      el.className = "photo-marker";
      el.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        object-fit: cover;
        will-change: transform;
        backface-visibility: hidden;
        transform: translate3d(0, 0, 0);
        transition: box-shadow 0.2s ease;
      `;
      const fileData = filteredFiles.find((f) => f.url === feature.properties?.url);
      el.src = fileData ? getThumbnailUrl(fileData.url, fileData.width, fileData.height, 100) : "";
      el.alt = feature.properties?.name || "";
      el.loading = "lazy";

      const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      }).setLngLat(coordinates);

      el.addEventListener("click", (e) => {
        // 选择模式下阻止标记点击
        if (selectModeRef.current) {
          e.stopPropagation();
          return;
        }
        const fileData = filteredFiles.find((f) => f.url === feature.properties?.url);
        if (fileData) {
          const popupImgUrl = getThumbnailUrl(fileData.url, fileData.width, fileData.height, 400);
          const photoIndex = filteredFiles.findIndex((f) => f.id === fileData.id);
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setLngLat(coordinates)
            .setHTML(
              createPopupHTML(
                popupImgUrl,
                feature.properties?.name || "",
                `#${feature.properties?.index}`,
                feature.properties?.time || "",
                photoIndex,
              ),
            )
            .addTo(map.current!);

          // 为弹窗中的图片添加点击事件
          setTimeout(() => {
            const popupEl = popup.getElement();
            const img = popupEl?.querySelector(".popup-preview-image") as HTMLElement;
            if (img && photoIndex !== -1 && fileData) {
              img.addEventListener("click", () => {
                openImagePreview(fileData);
              });
            }
          }, 50);
        }
      });

      // 根据缩放级别显示/隐藏图片标记
      const toggleMarkerVisibility = () => {
        if (!map.current) return;
        const zoom = map.current.getZoom();
        if (zoom > 14) {
          if (!marker.getElement().parentNode) {
            marker.addTo(map.current);
          }
          map.current.setLayoutProperty(LAYER_NAMES.POINT, "visibility", "none");
          map.current.setLayoutProperty(LAYER_NAMES.POINT_OUTER, "visibility", "none");
        } else {
          if (marker.getElement().parentNode) {
            marker.remove();
          }
          map.current.setLayoutProperty(LAYER_NAMES.POINT, "visibility", "visible");
          map.current.setLayoutProperty(LAYER_NAMES.POINT_OUTER, "visibility", "visible");
        }
      };

      if (map.current) {
        map.current.on("zoom", toggleMarkerVisibility);
        toggleMarkerVisibility();
      }

      markers.current.push(marker);
    });

    // 移除旧的事件监听器（如果存在）
    // 注意：这里使用any类型断言来绕过TypeScript的图层事件类型检查
    try {
      (map.current as any).off("click", LAYER_NAMES.CLUSTERS);
      (map.current as any).off("click", LAYER_NAMES.POINT);
      (map.current as any).off("mouseenter", LAYER_NAMES.CLUSTERS);
      (map.current as any).off("mouseleave", LAYER_NAMES.CLUSTERS);
      (map.current as any).off("mouseenter", LAYER_NAMES.POINT);
      (map.current as any).off("mouseleave", LAYER_NAMES.POINT);
    } catch (e) {
      // 忽略移除不存在的监听器的错误
    }

    // 点击聚类时放大（选择模式下跳过）
    const clusterClickHandler = (e: mapboxgl.MapMouseEvent) => {
      if (!map.current || selectModeRef.current) return;
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
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
    map.current.on("click", "clusters", clusterClickHandler);

    // 点击单个点显示弹窗（选择模式下跳过）
    const pointClickHandler = (e: mapboxgl.MapMouseEvent) => {
      if (!map.current || !e.features || e.features.length === 0 || selectModeRef.current) return;
      const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [
        number,
        number,
      ];
      const { name, time, url, index } = e.features[0].properties!;

      const fileData = filteredFiles.find((f) => f.url === url);
      if (fileData) {
        const popupImgUrl = getThumbnailUrl(fileData.url, fileData.width, fileData.height, 400);
        const photoIndex = filteredFiles.findIndex((f) => f.id === fileData.id);
        const popup = new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(createPopupHTML(popupImgUrl, name, `#${index}`, time, photoIndex))
          .addTo(map.current);

        // 为弹窗中的图版添加点击事件
        setTimeout(() => {
          const popupEl = popup.getElement();
          const img = popupEl?.querySelector(".popup-preview-image") as HTMLElement;
          if (img && photoIndex !== -1 && fileData) {
            img.addEventListener("click", () => {
              openImagePreview(fileData);
            });
          }
        }, 50);
      }
    };
    map.current.on("click", "unclustered-point", pointClickHandler);

    // 鼠标悬停效果
    const setCursor = (cursor: string) => () => {
      if (map.current) map.current.getCanvas().style.cursor = cursor;
    };
    map.current.on("mouseenter", LAYER_NAMES.CLUSTERS, setCursor("pointer"));
    map.current.on("mouseleave", LAYER_NAMES.CLUSTERS, setCursor(""));
    map.current.on("mouseenter", LAYER_NAMES.POINT, setCursor("pointer"));
    map.current.on("mouseleave", LAYER_NAMES.POINT, setCursor(""));

    // 自动调整视图
    if (pointsGeoJSON.features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      pointsGeoJSON.features.forEach((point) => {
        bounds.extend((point.geometry as GeoJSON.Point).coordinates as [number, number]);
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 14,
      });
    }
  }, [filteredFiles, isMapReady, getThumbnailUrl, openImagePreview]);

  // 存储事件监听器的引用，便于清理
  const canvasMouseMoveHandler = useRef<((e: MouseEvent) => void) | null>(null);

  // 初始化地图
  const initMap = useCallback(() => {
    if (!mapContainer.current) {
      console.log("❌ 地图容器不存在");
      return;
    }

    if (map.current) {
      console.log("⚠️ 地图已经初始化");
      return;
    }

    console.log("🗺️ 初始化地图容器...", {
      container: mapContainer.current,
      width: mapContainer.current.offsetWidth,
      height: mapContainer.current.offsetHeight,
      token: MAPBOX_TOKEN.substring(0, 20) + "...",
    });
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
          console.log(`✅ 选中了 ${selected.length} 张照片`);
        }
      };

      canvas.addEventListener("mousemove", canvasMouseMoveHandler.current);
      map.current.on("click", handleMapClick);

      map.current.on("load", () => {
        console.log("✅ 地图加载完成");

        // 检查 canvas 元素
        if (mapContainer.current) {
          const canvas = mapContainer.current.querySelector("canvas");
          console.log("🎨 Canvas 元素检查:", {
            exists: !!canvas,
            width: canvas?.width,
            height: canvas?.height,
            style: canvas?.style.cssText,
          });
        }

        setIsMapReady(true);

        // 触发 resize 确保地图适应容器
        setTimeout(() => {
          if (map.current) {
            map.current.resize();
            console.log("🔄 地图 resize 完成", {
              containerWidth: mapContainer.current?.offsetWidth,
              containerHeight: mapContainer.current?.offsetHeight,
            });
          }
        }, 100);
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

  // 加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 初始化地图 - 只有在数据加载完成且有数据时才初始化
  useEffect(() => {
    // 必须满足：有 userId、不在加载中、有数据、有容器
    if (!userId || loading || filteredFiles.length === 0) {
      console.log("⏭️ 跳过地图初始化:", {
        userId,
        loading,
        filesCount: filteredFiles.length,
        hasContainer: !!mapContainer.current,
      });
      return;
    }

    // 再次检查容器（可能在渲染后才存在）
    if (!mapContainer.current) {
      console.log("⚠️ 容器还未挂载，延迟初始化");
      const checkTimer = setTimeout(() => {
        if (mapContainer.current) {
          initMap();
        } else {
          console.error("❌ 容器挂载超时");
        }
      }, 200);
      return () => clearTimeout(checkTimer);
    }

    console.log("📦 准备初始化地图", {
      userId,
      filesCount: filteredFiles.length,
      hasContainer: !!mapContainer.current,
      containerDimensions: {
        width: mapContainer.current.offsetWidth,
        height: mapContainer.current.offsetHeight,
      },
    });

    // 延迟初始化，确保容器已经渲染
    const timer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (map.current) {
        console.log("🧹 清理地图实例");
        // 移除 canvas 事件监听器
        const canvas = map.current.getCanvas();
        if (canvas && canvasMouseMoveHandler.current) {
          canvas.removeEventListener("mousemove", canvasMouseMoveHandler.current);
        }
        map.current.remove();
        map.current = null;
      }
      setIsMapReady(false);
    };
  }, [userId, loading, filteredFiles.length, initMap]);

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

  // 监听主题变化，动态更新地图样式
  useEffect(() => {
    if (map.current && isMapReady) {
      const newMapStyle = isDark
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/light-v11";
      console.log(`🎨 切换地图主题: ${isDark ? "深色" : "浅色"}`);
      map.current.setStyle(newMapStyle);

      // 样式加载完成后重新添加图层
      map.current.once("styledata", () => {
        console.log("✅ 地图样式加载完成，重新添加图层");
        if (filteredFiles.length > 0) {
          // 延迟一下，确保样式完全加载
          setTimeout(() => {
            addPhotoLayers();
          }, 100);
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

  if (!userId || filteredFiles.length === 0) {
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
