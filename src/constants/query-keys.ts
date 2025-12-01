/**
 * 集中管理所有 React Query 的查询键
 * 使用工厂函数模式，确保类型安全和一致性
 */

export const queryKeys = {
  // 话题相关
  topics: {
    all: ["topics"] as const,
    lists: () => [...queryKeys.topics.all, "list"] as const,
    list: (params?: any) => [...queryKeys.topics.lists(), params] as const,
    infiniteLists: () => [...queryKeys.topics.all, "infinite"] as const,
    infiniteList: (params?: any) => [...queryKeys.topics.infiniteLists(), params] as const,
    details: () => [...queryKeys.topics.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.topics.details(), id] as const,
  },

  // 用户相关
  users: {
    all: ["users"] as const,
    current: () => [...queryKeys.users.all, "current"] as const,
    detail: (id: number) => [...queryKeys.users.all, id] as const,
    stats: (id: number) => [...queryKeys.users.all, id, "stats"] as const,
    cities: (id: number, params?: any) => [...queryKeys.users.all, id, "cities", params] as const,
    travelStats: (id: number) => [...queryKeys.users.all, id, "travel-stats"] as const,
  },

  // 点赞相关
  likes: {
    all: ["likes"] as const,
    byUser: (userId: number, params?: any) =>
      [...queryKeys.likes.all, "user", userId, params] as const,
    infiniteByUser: (userId: number, params?: any) =>
      [...queryKeys.likes.all, "infinite", "user", userId, params] as const,
    stats: (topicId: number) => [...queryKeys.likes.all, "stats", topicId] as const,
  },

  // 收藏相关
  collections: {
    all: ["collections"] as const,
    lists: () => [...queryKeys.collections.all, "list"] as const,
    list: (params?: any) => [...queryKeys.collections.lists(), params] as const,
    byUser: (userId: number, params?: any) =>
      [...queryKeys.collections.all, "user", userId, params] as const,
    infiniteByUser: (userId: number, params?: any) =>
      [...queryKeys.collections.all, "infinite", "user", userId, params] as const,
  },

  // 通知相关
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (params?: any) => [...queryKeys.notifications.lists(), params] as const,
    infiniteLists: () => [...queryKeys.notifications.all, "infinite"] as const,
    infiniteList: (params?: any) => [...queryKeys.notifications.infiniteLists(), params] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unreadCount"] as const,
  },

  // 标签相关
  tags: {
    all: ["tags"] as const,
    lists: () => [...queryKeys.tags.all, "list"] as const,
    list: (params?: any) => [...queryKeys.tags.lists(), params] as const,
  },

  // 评论相关
  comments: {
    all: ["comments"] as const,
    lists: () => [...queryKeys.comments.all, "list"] as const,
    list: (params?: any) => [...queryKeys.comments.lists(), params] as const,
    byTopic: (topicId: number, params?: any) =>
      [...queryKeys.comments.all, "topic", topicId, params] as const,
  },

  // 文件相关
  files: {
    all: ["files"] as const,
    detail: (id: number) => [...queryKeys.files.all, id] as const,
  },

  // 二维码登录相关
  qrCode: {
    all: ["qrCode"] as const,
    status: (key: string) => [...queryKeys.qrCode.all, "status", key] as const,
  },
} as const;
