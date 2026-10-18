// 环境配置
export const config = {
  // WS_URL: "ws://localhost:3001/ws",
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://api.lpalette.cn/api/v1",
  MAP_BASE_URL:
    import.meta.env.VITE_MAP_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:9596" : "https://map.lpalette.cn"),
  WS_URL: "wss://test.wktest.cn:3001/ws",
  // WS_URL: import.meta.env.VITE_WS_URL || 'wss://test.wktest.cn:3002',
} as const;
