// 环境配置
export const config = {
  // WS_URL: "ws://localhost:3001/ws",
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV
      ? "http://127.0.0.1:9530/api/v1"
      : "https://api.lpalette.cn/api/v1"),
  WS_URL: "wss://test.wktest.cn:3001/ws",
  // WS_URL: import.meta.env.VITE_WS_URL || 'wss://test.wktest.cn:3002',
} as const;
