/**
 * Mapbox 配置
 */

// Mapbox Access Token
// 从环境变量读取
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

// 默认地图中心点（北京）
export const DEFAULT_CENTER: [number, number] = [116.4074, 39.9042];

// 默认缩放级别
export const DEFAULT_ZOOM = 12;

// 地图样式
export const MAP_STYLES = {
  light: "mapbox://styles/mapbox/light-v11",
  dark: "mapbox://styles/mapbox/dark-v11",
  streets: "mapbox://styles/mapbox/streets-v12",
} as const;
