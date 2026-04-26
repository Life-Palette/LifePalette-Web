import MapboxLanguage from "@mapbox/mapbox-gl-language";
import {
  Aperture,
  Calendar,
  Camera,
  Expand,
  FileText,
  Focus,
  Gauge,
  MapPin,
  Mountain,
  Ruler,
  Timer,
} from "lucide-react";
import mapboxgl from "mapbox-gl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ViewerItem } from "viewer-pro";
import { MAPBOX_TOKEN } from "@/config/mapbox";
import { filesApi } from "@/services/api";
import "mapbox-gl/dist/mapbox-gl.css";

interface FileDetail {
  address?: string;
  altitude?: number;
  city?: string;
  colors?: Array<{ color?: { hex: string }; rank: number }>;
  country?: string;
  createdAt: string;
  deviceMake?: string;
  deviceModel?: string;
  exposureTime?: string;
  fNumber?: string;
  focalLength?: string;
  height: number;
  iso?: number;
  lat?: number;
  lensModel?: string;
  lng?: number;
  name: string;
  province?: string;
  secUid: string;
  size: number;
  takenAt?: string;
  type: string;
  width: number;
}

const fmtSize = (b: number) =>
  b ? (b < 1_048_576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1_048_576).toFixed(1)} MB`) : "--";
const fmtDate = (s?: string) =>
  s
    ? new Date(s).toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-white/[0.04] border-b px-3 py-2">
      <div className="flex shrink-0 items-center gap-2 text-slate-400">
        <span className="opacity-60">{icon}</span>
        <span className="text-xs">{label}</span>
      </div>
      <span className="max-w-[60%] truncate text-right text-slate-200 text-xs">
        {value || "--"}
      </span>
    </div>
  );
}

function ParamCell({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.03] p-2.5">
      <span className="shrink-0 text-blue-400">{icon}</span>
      <div>
        <div className="font-semibold text-slate-100 text-sm">{value}</div>
        <div className="text-[10px] text-slate-500 uppercase">{label}</div>
      </div>
    </div>
  );
}

export default function ImageInfoPanel({ viewerItem }: { viewerItem: ViewerItem; index: number }) {
  const [detail, setDetail] = useState<FileDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const secUid = (viewerItem as any).id;
    if (!secUid) {
      return;
    }
    setLoading(true);
    filesApi
      .getBySecUid(String(secUid))
      .then((res) => {
        if (!res.result) {
          return;
        }
        const d = res.result;
        setDetail({
          secUid: d.sec_uid,
          name: d.name || "",
          type: d.type || "",
          size: d.size || 0,
          width: d.width || 0,
          height: d.height || 0,
          createdAt: d.created_at || "",
          takenAt: d.taken_at,
          deviceMake: d.device_make,
          deviceModel: d.device_model,
          lensModel: d.lens_model,
          fNumber: d.f_number,
          exposureTime: d.exposure_time,
          iso: d.iso,
          focalLength: d.focal_length,
          lng: d.lng,
          lat: d.lat,
          address: d.address,
          city: d.city,
          province: d.province,
          country: d.country,
          altitude: d.altitude,
          colors: d.colors,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [viewerItem]);

  const initMap = useCallback(() => {
    if (!(detail?.lng && detail?.lat && mapContainer.current)) {
      return;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    mapboxgl.accessToken = MAPBOX_TOKEN;
    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [detail.lng, detail.lat],
        zoom: 12,
        interactive: false,
        attributionControl: false,
      });
      mapRef.current.addControl(new MapboxLanguage({ defaultLanguage: "zh-Hans" }));
      mapRef.current.on("load", () => {
        new mapboxgl.Marker({ color: "#60a5fa" })
          .setLngLat([detail.lng!, detail.lat!])
          .addTo(mapRef.current!);
      });
    } catch (_) {}
  }, [detail]);

  useEffect(() => {
    if (detail?.lng && detail?.lat) {
      setTimeout(initMap, 100);
    }
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [detail, initMap]);

  const device = useMemo(() => {
    if (!detail) {
      return null;
    }
    return [detail.deviceMake, detail.deviceModel].filter(Boolean).join(" ") || null;
  }, [detail]);

  if (loading) {
    return <div className="p-6 text-sm text-white/50">加载中...</div>;
  }
  if (!detail) {
    return <div className="p-6 text-sm text-white/50">{viewerItem.title || "未命名"}</div>;
  }

  const hasParams = detail.fNumber || detail.exposureTime || detail.iso || detail.focalLength;
  const hasLocation = detail.lng && detail.lat;
  const locationText =
    detail.address || [detail.city, detail.province, detail.country].filter(Boolean).join(", ");
  const sortedColors = detail.colors?.slice().sort((a, b) => a.rank - b.rank);

  return (
    <div className="size-full overflow-y-auto text-[13px] text-slate-200 leading-relaxed">
      <div className="space-y-5 p-5 pb-6">
        {/* 设备 + 镜头 */}
        {device && (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Camera className="shrink-0 text-blue-400" size={16} />
              <span className="font-semibold text-[15px] text-slate-100">{device}</span>
            </div>
            {detail.lensModel && (
              <div className="pl-6 text-slate-400 text-xs">{detail.lensModel}</div>
            )}
          </div>
        )}

        {/* 拍摄参数 2x2 网格 */}
        {hasParams && (
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] bg-white/[0.06]">
            {detail.fNumber && (
              <ParamCell icon={<Aperture size={14} />} label="光圈" value={`f/${detail.fNumber}`} />
            )}
            {detail.exposureTime && (
              <ParamCell
                icon={<Timer size={14} />}
                label="快门"
                value={`${detail.exposureTime}s`}
              />
            )}
            {detail.iso && (
              <ParamCell icon={<Gauge size={14} />} label="ISO" value={String(detail.iso)} />
            )}
            {detail.focalLength && (
              <ParamCell
                icon={<Focus size={14} />}
                label="焦距"
                value={`${detail.focalLength}mm`}
              />
            )}
          </div>
        )}

        {/* 颜色调色板 */}
        {sortedColors && sortedColors.length > 0 && (
          <div>
            <div className="mb-2 text-[11px] text-slate-500 uppercase tracking-wider">色彩</div>
            <div className="flex gap-1 overflow-hidden rounded-lg">
              {sortedColors.map((c, i) => (
                <div
                  className="h-7 flex-1 cursor-default"
                  key={i}
                  style={{ backgroundColor: c.color?.hex || "#333" }}
                  title={c.color?.hex}
                />
              ))}
            </div>
            <div className="mt-1 flex gap-1">
              {sortedColors.map((c, i) => (
                <div className="flex-1 text-center font-mono text-[10px] text-slate-500" key={i}>
                  {c.color?.hex}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 文件信息 */}
        <div>
          <div className="mb-2 text-[11px] text-slate-500 uppercase tracking-wider">文件信息</div>
          <div className="overflow-hidden rounded-[10px] bg-white/[0.04]">
            <InfoRow icon={<FileText size={13} />} label="文件名" value={detail.name} />
            <InfoRow
              icon={<Expand size={13} />}
              label="分辨率"
              value={`${detail.width} × ${detail.height}`}
            />
            <InfoRow icon={<Ruler size={13} />} label="文件大小" value={fmtSize(detail.size)} />
            <InfoRow
              icon={<Calendar size={13} />}
              label="拍摄时间"
              value={fmtDate(detail.takenAt)}
            />
            {detail.altitude != null && detail.altitude > 0 && (
              <InfoRow
                icon={<Mountain size={13} />}
                label="海拔"
                value={`${detail.altitude.toFixed(0)} m`}
              />
            )}
          </div>
        </div>

        {/* 位置 + 地图 */}
        {hasLocation && (
          <div>
            <div className="mb-2 text-[11px] text-slate-500 uppercase tracking-wider">拍摄地点</div>
            {locationText && (
              <div className="mb-2.5 flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                <MapPin className="mt-0.5 shrink-0 text-blue-400" size={14} />
                <span>{locationText}</span>
              </div>
            )}
            <div className="h-40 overflow-hidden rounded-[10px] border border-white/[0.08]">
              <div className="size-full" ref={mapContainer} />
            </div>
            <div className="mt-1.5 text-center font-mono text-[10px] text-slate-600">
              {detail.lat?.toFixed(6)}, {detail.lng?.toFixed(6)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
