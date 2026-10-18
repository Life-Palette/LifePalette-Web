import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { config } from "@/config/env";
import { filesApi } from "@/services/api";

export interface MapLocation {
  address?: string;
  lat: number;
  lng: number;
}
export interface MapHandle {
  exportImage: (scale: number) => Promise<string>;
}
export interface MapEmbedProps {
  autoFitBounds?: boolean;
  className?: string;
  customCenter?: [number, number];
  customZoom?: number;
  interactive?: boolean;
  isDark?: boolean;
  location?: MapLocation;
  minHeight?: CSSProperties["minHeight"];
  mode?: "track" | "point" | "picker";
  onLocationSelect?: (location: MapLocation) => void;
  onReady?: (map: MapHandle) => void;
  onViewChange?: (center: [number, number], zoom: number) => void;
  pointData?: Record<string, unknown>;
  secUid?: string;
  showGallery?: boolean;
}
interface MapMessage {
  center: [number, number];
  channel?: string;
  error?: string;
  id: string;
  image?: string;
  location?: MapLocation;
  method?: string;
  page?: number;
  type?: string;
  uid?: string;
  zoom: number;
}
interface ExportRequest {
  reject: (reason: Error) => void;
  resolve: (value: string) => void;
  timer: number;
}
type Send = (message: Record<string, unknown>) => void;
const TRAILING_SLASH = /\/$/;

function createHandle(
  requests: Map<string, ExportRequest>,
  send: Send
): MapHandle {
  return {
    exportImage: (scale) =>
      new Promise((resolve, reject) => {
        const id = crypto.randomUUID();
        const timer = window.setTimeout(() => {
          requests.delete(id);
          reject(new Error("地图导出超时"));
        }, 20_000);
        requests.set(id, { reject, resolve, timer });
        send({ id, scale, type: "export-image" });
      }),
  };
}
function finishExport(data: MapMessage, requests: Map<string, ExportRequest>) {
  const request = requests.get(data.id);
  if (!request) {
    return;
  }
  window.clearTimeout(request.timer);
  requests.delete(data.id);
  if (typeof data.image === "string") {
    request.resolve(data.image);
  } else {
    request.reject(new Error(data.error || "地图导出失败"));
  }
}
async function fetchMapData(data: MapMessage, secUid?: string) {
  if (data.method === "list" && secUid) {
    const page =
      data.page && Number.isInteger(data.page) && data.page > 0 ? data.page : 1;
    return await filesApi.list({
      has_location: true,
      page,
      page_size: 500,
      preset: "mini",
      sort: "taken_at,desc",
      user_uid: secUid,
    });
  }
  if (data.method === "detail" && typeof data.uid === "string") {
    return await filesApi.getBySecUid(data.uid);
  }
  throw new Error("无效的地图数据请求");
}
async function respondWithData(data: MapMessage, send: Send, secUid?: string) {
  if (typeof data.id !== "string") {
    return;
  }
  try {
    send({
      id: data.id,
      response: await fetchMapData(data, secUid),
      type: "data-result",
    });
  } catch (reason) {
    send({
      error: reason instanceof Error ? reason.message : "读取地图数据失败",
      id: data.id,
      type: "data-result",
    });
  }
}
function forwardEvent(data: MapMessage, props: MapEmbedProps) {
  if (
    data.type === "view-change" &&
    Array.isArray(data.center) &&
    data.center.length === 2 &&
    data.center.every(Number.isFinite) &&
    Number.isFinite(data.zoom)
  ) {
    props.onViewChange?.(data.center, data.zoom);
  }
  if (
    data.type === "location-select" &&
    data.location &&
    Number.isFinite(data.location?.lng) &&
    Number.isFinite(data.location?.lat)
  ) {
    props.onLocationSelect?.(data.location);
  }
}
function getOptions(props: MapEmbedProps) {
  return {
    autoFitBounds: props.autoFitBounds ?? true,
    customCenter: props.customCenter,
    customZoom: props.customZoom,
    hostData: true,
    interactive: props.interactive ?? true,
    isDark: props.isDark,
    location: props.location,
    mode: props.mode || "track",
    pointData: props.pointData,
    secUid: props.secUid,
    showGallery: props.showGallery ?? true,
  };
}
export default function MapEmbed(props: MapEmbedProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(props);
  latest.current = props;
  const pending = useRef(new Map<string, ExportRequest>());
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const options = JSON.stringify(getOptions(props));
  const url = useMemo(() => {
    const target = new URL(
      "embed",
      `${config.MAP_BASE_URL.replace(TRAILING_SLASH, "")}/`
    );
    target.searchParams.set("parentOrigin", window.location.origin);
    target.searchParams.set("attempt", String(attempt));
    return target;
  }, [attempt]);
  const send = useCallback(
    (message: Record<string, unknown>) => {
      frame.current?.contentWindow?.postMessage(
        { channel: "lifepalette-map", ...message },
        url.origin
      );
    },
    [url]
  );
  useEffect(() => {
    const requests = pending.current;
    const timeout = window.setTimeout(
      () => setError("地图加载超时，请检查地图服务后重试"),
      20_000
    );
    const handleMessage = (event: MessageEvent<MapMessage>) => {
      if (
        event.origin !== url.origin ||
        event.source !== frame.current?.contentWindow
      ) {
        return;
      }
      const { data } = event;
      if (data?.channel !== "lifepalette-map") {
        return;
      }
      switch (data.type) {
        case "embed-ready":
          window.clearTimeout(timeout);
          setLoaded(true);
          setError("");
          send({ options: getOptions(latest.current), type: "map-init" });
          break;
        case "map-ready":
          latest.current.onReady?.(createHandle(requests, send));
          break;
        case "export-result":
          finishExport(data, requests);
          break;
        case "data-request":
          respondWithData(data, send, latest.current.secUid);
          break;
        default:
          forwardEvent(data, latest.current);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
      for (const request of requests.values()) {
        window.clearTimeout(request.timer);
        request.reject(new Error("地图已关闭"));
      }
      requests.clear();
    };
  }, [send, url]);
  useEffect(() => {
    if (loaded) {
      send({ options: JSON.parse(options), type: "map-init" });
    }
  }, [loaded, options, send]);
  const retry = useCallback(() => {
    setError("");
    setLoaded(false);
    setAttempt((value) => value + 1);
  }, []);
  return (
    <div
      className={props.className || "relative h-full w-full"}
      style={{ minHeight: props.minHeight }}
    >
      <iframe
        allow="fullscreen"
        className="h-full w-full border-0"
        ref={frame}
        src={url.href}
        title={props.mode === "picker" ? "选择地理位置" : "LifePalette 地图"}
      />
      {!!error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background text-sm">
          <p>{error}</p>
          <button onClick={retry} type="button">
            重新加载
          </button>
        </div>
      )}
    </div>
  );
}
