import { getObjVal } from "@iceywu/utils";
import MapboxLanguage from "@mapbox/mapbox-gl-language";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ViewerItem } from "viewer-pro";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { apiService } from "@/services/api";
import "mapbox-gl/dist/mapbox-gl.css";

interface ImageInfoPanelProps {
  viewerItem: ViewerItem;
  index: number;
}

interface FileDetail {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  fileMd5: string;
  blurhash: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  exif?: Record<string, any>;
  lng?: number;
  lat?: number;
  address?: string;
  city?: string;
  country?: string;
  province?: string;
  district?: string;
  altitude?: number;
  deviceMake?: string;
  deviceModel?: string;
  lensModel?: string;
}

interface MetadataItem {
  key: string;
  label: string;
  value: string;
  valFormat?: (val: string) => string;
}

export default function ImageInfoPanel({ viewerItem, index }: ImageInfoPanelProps) {
  const [fileDetail, setFileDetail] = useState<FileDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const fileId = (viewerItem as any).id;
    if (!fileId) return;

    setLoading(true);
    apiService
      .getFileDetail(fileId)
      .then((response) => {
        console.log("🌈-----response-----", response);
        if (response.code === 200 && response.result) {
          setFileDetail(response.result);
        }
      })
      .catch((error) => {
        console.error("获取文件详情失败:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [viewerItem]);

  const imgMetaData = useMemo(() => {
    if (!fileDetail?.exif) return [];

    const info_enum: MetadataItem[] = [
      {
        key: "Model",
        label: "拍摄设备",
        value: "",
        valFormat: (val: string) => val || "--",
      },
      {
        key: "LensModel",
        label: "镜头型号",
        value: "",
        valFormat: (val: string) => val || "--",
      },
      {
        key: "ISOSpeedRatings",
        label: "ISO",
        value: "",
        valFormat: (val: string) => val || "--",
      },
      {
        key: "FocalLengthIn35mmFilm",
        label: "焦距",
        value: "",
        valFormat: (val: string) => val || "--",
      },
      {
        key: "FNumber",
        label: "光圈",
        value: "",
        valFormat: (val: string) => {
          try {
            const num = eval(val) || 0;
            return `f/${num?.toFixed(1)}`;
          } catch {
            return val || "--";
          }
        },
      },
      {
        key: "ShutterSpeedValue",
        label: "快门",
        value: "",
        valFormat: (val: string) => val || "--",
      },
      {
        key: "GPSAltitude",
        label: "海拔",
        value: "",
        valFormat: (val: string) => val || "--",
      },
      {
        key: "DateTimeOriginal",
        label: "拍摄时间",
        value: "",
        valFormat: (val: string) => val || "--",
      },
      {
        key: "location",
        label: "拍摄地点",
        value: "",
        valFormat: (val: string) => val || "未知",
      },
    ];

    const exifData = fileDetail.exif || {};
    info_enum.forEach((item) => {
      const rawValueObj = getObjVal(exifData, item.key, { value: "" });
      const rawValue = rawValueObj?.value || "";
      item.value = item.valFormat ? item.valFormat(String(rawValue)) : String(rawValue);
    });

    return info_enum;
  }, [fileDetail]);

  const getMetaByKey = (key: string) => {
    return (
      imgMetaData.find((item) => item.key === key) || {
        key: "",
        label: "",
        value: "",
      }
    );
  };

  // 初始化地图
  const initMap = useCallback(() => {
    if (!fileDetail?.lng || !fileDetail?.lat || !mapContainer.current) {
      return;
    }

    // 如果地图已存在，先清理
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [fileDetail.lng, fileDetail.lat],
        zoom: 12,
        pitch: 0,
        bearing: 0,
      });

      map.current.on("error", (_e) => {});

      map.current.addControl(new MapboxLanguage({ defaultLanguage: "zh-Hans" }));

      map.current.on("load", () => {
        // 添加标记
        new mapboxgl.Marker({ color: "#60a5fa" })
          .setLngLat([fileDetail.lng!, fileDetail.lat!])
          .addTo(map.current!);
      });
    } catch (_error) {
      console.error("地图初始化失败:", _error);
    }
  }, [fileDetail]);

  // 初始化地图
  useEffect(() => {
    if (fileDetail?.lng && fileDetail?.lat) {
      setTimeout(() => {
        initMap();
      }, 100);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [fileDetail, initMap]);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "20px",
        color: "#fff",
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        fontSize: "14px",
        overflowY: "auto",
      }}
    >
      {loading && <div style={{ color: "rgba(255, 255, 255, 0.6)" }}>加载中...</div>}

      {fileDetail && imgMetaData.length > 0 && (
        <div style={{ padding: "12px 0" }}>
          {/* 相机信息 */}
          <div
            style={{
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#60a5fa",
                }}
              >
                {getMetaByKey("Model")?.value}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                {getMetaByKey("LensModel")?.value}
              </div>
            </div>
          </div>

          {/* 曝光参数 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              padding: "12px",
              marginBottom: "12px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "6px",
            }}
          >
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "4px",
                  color: "#60a5fa",
                }}
              >
                {getMetaByKey("ISOSpeedRatings")?.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                }}
              >
                {getMetaByKey("ISOSpeedRatings")?.label}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "4px",
                  color: "#60a5fa",
                }}
              >
                {getMetaByKey("FNumber")?.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                }}
              >
                {getMetaByKey("FNumber")?.label}
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "4px",
                  color: "#60a5fa",
                }}
              >
                {getMetaByKey("ShutterSpeedValue")?.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.5)",
                  textTransform: "uppercase",
                }}
              >
                {getMetaByKey("ShutterSpeedValue")?.label}
              </div>
            </div>
          </div>

          {/* 焦距 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "13px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span style={{ color: "rgba(255, 255, 255, 0.6)", flexShrink: 0 }}>
              {getMetaByKey("FocalLengthIn35mmFilm")?.label}:
            </span>
            <span
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "right",
                marginLeft: "12px",
              }}
            >
              {getMetaByKey("FocalLengthIn35mmFilm")?.value}
            </span>
          </div>

          {/* 海拔 */}
          {fileDetail.altitude && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: "13px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <span style={{ color: "rgba(255, 255, 255, 0.6)", flexShrink: 0 }}>⛰️ 海拔:</span>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  textAlign: "right",
                  marginLeft: "12px",
                }}
              >
                {fileDetail.altitude.toFixed(0)}m
              </span>
            </div>
          )}

          {/* 拍摄时间 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "13px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span style={{ color: "rgba(255, 255, 255, 0.6)", flexShrink: 0 }}>🕒 拍摄时间:</span>
            <span
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "right",
                marginLeft: "12px",
              }}
            >
              {getMetaByKey("DateTimeOriginal")?.value}
            </span>
          </div>

          {/* 文件信息 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "13px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span style={{ color: "rgba(255, 255, 255, 0.6)", flexShrink: 0 }}>📐 尺寸:</span>
            <span
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "right",
                marginLeft: "12px",
              }}
            >
              {fileDetail.width} × {fileDetail.height}
            </span>
          </div>

          {/* 文件大小 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "13px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span style={{ color: "rgba(255, 255, 255, 0.6)", flexShrink: 0 }}>💾 文件大小:</span>
            <span
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "right",
                marginLeft: "12px",
              }}
            >
              {((fileDetail.fileSize || (fileDetail as any).size || 0) / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>

          {/* 文件名 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              fontSize: "13px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <span style={{ color: "rgba(255, 255, 255, 0.6)", flexShrink: 0 }}>📄 文件名:</span>
            <span
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                textAlign: "right",
                marginLeft: "12px",
                wordBreak: "break-all",
                fontSize: "12px",
              }}
            >
              {fileDetail.fileName || (fileDetail as any).name || "未知"}
            </span>
          </div>

          {/* 位置信息 */}
          {fileDetail.address && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "6px 0",
                fontSize: "13px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                gap: "4px",
              }}
            >
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>📍 拍摄地点:</span>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                {fileDetail.address}
              </span>
            </div>
          )}

          {/* 小地图 */}
          {fileDetail.lng && fileDetail.lat && (
            <div
              style={{
                marginTop: "12px",
                borderRadius: "8px",
                overflow: "hidden",
                height: "180px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
            </div>
          )}
        </div>
      )}

      {!loading && !fileDetail && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div>
            <span style={{ color: "#9ca3af" }}>标题: </span>
            <span>{viewerItem.title || "未命名"}</span>
          </div>
          <div>
            <span style={{ color: "#9ca3af" }}>索引: </span>
            <span>{index + 1}</span>
          </div>
        </div>
      )}
    </div>
  );
}
