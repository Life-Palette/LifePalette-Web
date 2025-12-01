// 环境配置
export const config = {
  API_BASE_URL: "http://localhost:3001",
  WS_URL: "ws://localhost:3001/ws",
  // API_BASE_URL: "https://test.wktest.cn:3001",
  // WS_URL: "wss://test.wktest.cn:3002",
  // 可以根据环境变量来切换不同的API地址
  // API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://test.wktest.cn:3001',
  // WS_URL: import.meta.env.VITE_WS_URL || 'wss://test.wktest.cn:3002',
} as const;
