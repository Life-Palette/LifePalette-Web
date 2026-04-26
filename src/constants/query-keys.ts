/**
 * React Query 查询键工厂
 * 所有 ID 统一为 string (sec_uid)
 */
export const queryKeys = {
  topics: {
    all: ["topics"] as const,
    list: (params?: any) => ["topics", "list", params] as const,
    infinite: (params?: any) => ["topics", "infinite", params] as const,
    detail: (secUid: string) => ["topics", "detail", secUid] as const,
  },

  users: {
    all: ["users"] as const,
    me: () => ["users", "me"] as const,
    detail: (secUid: string) => ["users", "detail", secUid] as const,
    stats: (secUid: string) => ["users", "stats", secUid] as const,
    travelStats: (secUid: string) => ["users", "travel-stats", secUid] as const,
    cities: (secUid: string, params?: any) => ["users", "cities", secUid, params] as const,
  },

  likes: {
    all: ["likes"] as const,
    byUser: (secUid: string, params?: any) => ["likes", "user", secUid, params] as const,
    infinite: (secUid: string, params?: any) => ["likes", "infinite", secUid, params] as const,
  },

  collections: {
    all: ["collections"] as const,
    byUser: (secUid: string, params?: any) => ["collections", "user", secUid, params] as const,
    infinite: (secUid: string, params?: any) =>
      ["collections", "infinite", secUid, params] as const,
  },

  files: {
    all: ["files"] as const,
    detail: (secUid: string) => ["files", "detail", secUid] as const,
    byUser: (secUid: string, params?: any) => ["files", "user", secUid, params] as const,
    infinite: (secUid: string, params?: any) => ["files", "infinite", secUid, params] as const,
    colorStats: (params?: any) => ["files", "color-stats", params] as const,
    byColor: (hex: string, params?: any) => ["files", "by-color", hex, params] as const,
  },

  comments: {
    all: ["comments"] as const,
    byTopic: (topicSecUid: string, params?: any) =>
      ["comments", "topic", topicSecUid, params] as const,
  },

  tags: {
    all: ["tags"] as const,
    list: (params?: any) => ["tags", "list", params] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    infinite: (params?: any) => ["notifications", "infinite", params] as const,
    unreadCount: () => ["notifications", "unread"] as const,
  },

  changelog: {
    all: ["changelog"] as const,
    infinite: (params?: any) => ["changelog", "infinite", params] as const,
    latest: () => ["changelog", "latest"] as const,
    detail: (id: string) => ["changelog", "detail", id] as const,
  },

  follows: {
    check: (secUid: string) => ["follows", "check", secUid] as const,
  },

  qrCode: {
    status: (key: string) => ["qr", "status", key] as const,
  },
} as const;
