import { http } from "../http";

// ============ 点赞 ============

export const likesApi = {
  create: (topicSecUid: string) => http.post("/likes", { topic_sec_uid: topicSecUid }),
  delete: (topicSecUid: string) => http.del(`/likes/${topicSecUid}`),
  check: (topicSecUid: string) => http.get(`/likes/${topicSecUid}/check`),
  listByTopic: (topicSecUid: string, params?: { page?: number; page_size?: number }) =>
    http.get(`/topics/${topicSecUid}/likes`, params),
};

// ============ 收藏 ============

export const collectionsApi = {
  create: (topicSecUid: string) => http.post("/collections", { topic_sec_uid: topicSecUid }),
  delete: (topicSecUid: string) => http.del(`/collections/${topicSecUid}`),
  check: (topicSecUid: string) => http.get(`/collections/${topicSecUid}/check`),
};

// ============ 关注 ============

export const followsApi = {
  create: (userSecUid: string) => http.post("/follows", { user_sec_uid: userSecUid }),
  delete: (userSecUid: string) => http.del(`/follows/${userSecUid}`),
  check: (userSecUid: string) => http.get(`/follows/${userSecUid}/check`),
};

// ============ 通知 ============

export const notificationsApi = {
  list: (params?: { page?: number; page_size?: number; type?: string; is_read?: boolean }) =>
    http.get("/messages", params),
  getUnreadCount: () => http.get("/messages/unread-count"),
  markAsRead: (id: string) => http.put(`/messages/${id}/read`),
  markAllAsRead: () => http.put("/messages/read-all"),
};
