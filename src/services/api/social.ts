import { http } from "../http";

// ============ 点赞 ============

export const likesApi = {
  check: (topicSecUid: string) => http.get(`/likes/${topicSecUid}/check`),
  create: (topicSecUid: string) =>
    http.post("/likes", { topic_sec_uid: topicSecUid }),
  delete: (topicSecUid: string) => http.del(`/likes/${topicSecUid}`),
  listByTopic: (
    topicSecUid: string,
    params?: { page?: number; page_size?: number }
  ) => http.get(`/topics/${topicSecUid}/likes`, params),
};

// ============ 收藏 ============

export const collectionsApi = {
  check: (topicSecUid: string) => http.get(`/collections/${topicSecUid}/check`),
  create: (topicSecUid: string) =>
    http.post("/collections", { topic_sec_uid: topicSecUid }),
  delete: (topicSecUid: string) => http.del(`/collections/${topicSecUid}`),
};

// ============ 关注 ============

export const followsApi = {
  check: (userSecUid: string) => http.get(`/follows/${userSecUid}/check`),
  create: (userSecUid: string) =>
    http.post("/follows", { user_sec_uid: userSecUid }),
  delete: (userSecUid: string) => http.del(`/follows/${userSecUid}`),
};

// ============ 通知 ============

export const notificationsApi = {
  getUnreadCount: () => http.get("/messages/unread-count"),
  list: (params?: {
    page?: number;
    page_size?: number;
    type?: string;
    is_read?: boolean;
  }) => http.get("/messages", params),
  markAllAsRead: () => http.put("/messages/read-all"),
  markAsRead: (id: string) => http.put(`/messages/${id}/read`),
};
