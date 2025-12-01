import { QueryClient } from "@tanstack/react-query";
import { isSlowNetwork } from "@/utils/performance";

/**
 * 创建并配置 React Query 客户端
 * 提供全局的查询和变更默认配置
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 根据网络状况动态调整缓存时间
      staleTime: isSlowNetwork() ? 10 * 60 * 1000 : 5 * 60 * 1000, // 慢速网络10分钟，正常5分钟

      // 垃圾回收时间：30分钟后清理未使用的缓存
      gcTime: 30 * 60 * 1000,

      // 智能重试策略
      retry: (failureCount, error: any) => {
        // 认证错误不重试
        if (error?.message?.includes("登录已过期")) return false;
        if (error?.message?.includes("权限不足")) return false;

        // 最多重试2次
        return failureCount < 2;
      },

      // 重试延迟：指数退避策略
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // 窗口聚焦时智能重新获取
      refetchOnWindowFocus: (query) => {
        // 只有数据过期超过10分钟才在窗口聚焦时重新获取
        const state = query.state;
        if (!state.dataUpdatedAt) return false;
        const timeSinceUpdate = Date.now() - state.dataUpdatedAt;
        return timeSinceUpdate > 10 * 60 * 1000;
      },

      // 组件挂载时智能重新获取
      refetchOnMount: (query) => {
        // 只有数据过期才重新获取
        return query.state.isInvalidated || !query.state.data;
      },

      // 网络重连时重新获取失败的请求
      refetchOnReconnect: "always",

      // 启用结构共享以优化性能
      structuralSharing: true,

      // 启用占位数据，避免加载闪烁
      placeholderData: (previousData: any) => previousData,
    },

    mutations: {
      // 变更默认不重试
      retry: false,

      // 全局错误处理（可以在这里添加通用的错误日志）
      onError: (error: any) => {
        // 开发环境下打印错误
        if (import.meta.env.DEV) {
          console.error("Mutation error:", error);
        }
      },
    },
  },
});
