/**
 * React Query 查询键工厂
 * 所有 ID 统一为 string (sec_uid)
 */
export const queryKeys = {
  changelog: {
    all: ["changelog"] as const,
    detail: (id: string) => ["changelog", "detail", id] as const,
    infinite: (params?: unknown) => ["changelog", "infinite", params] as const,
    latest: () => ["changelog", "latest"] as const,
  },

  collections: {
    all: ["collections"] as const,
    byUser: (secUid: string, params?: unknown) =>
      ["collections", "user", secUid, params] as const,
    infinite: (secUid: string, params?: unknown) =>
      ["collections", "infinite", secUid, params] as const,
  },

  comments: {
    all: ["comments"] as const,
    byTopic: (topicSecUid: string, params?: unknown) =>
      ["comments", "topic", topicSecUid, params] as const,
  },

  files: {
    all: ["files"] as const,
    byColor: (hex: string, params?: unknown) =>
      ["files", "by-color", hex, params] as const,
    byUser: (secUid: string, params?: unknown) =>
      ["files", "user", secUid, params] as const,
    colorStats: (params?: unknown) => ["files", "color-stats", params] as const,
    detail: (secUid: string) => ["files", "detail", secUid] as const,
    infinite: (secUid: string, params?: unknown) =>
      ["files", "infinite", secUid, params] as const,
  },

  follows: {
    check: (secUid: string) => ["follows", "check", secUid] as const,
  },

  likes: {
    all: ["likes"] as const,
    byUser: (secUid: string, params?: unknown) =>
      ["likes", "user", secUid, params] as const,
    infinite: (secUid: string, params?: unknown) =>
      ["likes", "infinite", secUid, params] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    infinite: (params?: unknown) =>
      ["notifications", "infinite", params] as const,
    unreadCount: () => ["notifications", "unread"] as const,
  },

  qrCode: {
    status: (key: string) => ["qr", "status", key] as const,
  },

  tags: {
    all: ["tags"] as const,
    list: (params?: unknown) => ["tags", "list", params] as const,
  },
  topics: {
    all: ["topics"] as const,
    detail: (secUid: string) => ["topics", "detail", secUid] as const,
    infinite: (params?: unknown) => ["topics", "infinite", params] as const,
    list: (params?: unknown) => ["topics", "list", params] as const,
  },

  users: {
    all: ["users"] as const,
    cities: (secUid: string, params?: unknown) =>
      ["users", "cities", secUid, params] as const,
    detail: (secUid: string) => ["users", "detail", secUid] as const,
    me: () => ["users", "me"] as const,
    stats: (secUid: string) => ["users", "stats", secUid] as const,
    travelStats: (secUid: string) => ["users", "travel-stats", secUid] as const,
  },
} as const;
