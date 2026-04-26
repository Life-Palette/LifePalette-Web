import { http } from "../http";

// ============ 话题 ============

export interface TopicParams {
  is_pinned?: boolean;
  page?: number;
  page_size?: number;
  search?: string;
  sort?: string;
  tag_id?: number;
  user_sec_uid?: string;
}

export const topicsApi = {
  list: (params?: TopicParams) => http.get("/topics", params),
  getBySecUid: (secUid: string) => http.get(`/topics/${secUid}`),
  create: (data: {
    title?: string;
    content?: string;
    content_type?: string;
    file_sec_uids?: string[];
    tags?: string[];
    is_pinned?: boolean;
  }) => http.post("/topics", data),
  update: (secUid: string, data: Record<string, any>) => http.put(`/topics/${secUid}`, data),
  delete: (secUid: string) => http.del(`/topics/${secUid}`),
};

// ============ 评论 ============

export const commentsApi = {
  list: (params?: { page?: number; page_size?: number; user_sec_uid?: string; sort?: string }) =>
    http.get("/comments", params),
  listByTopic: (
    topicSecUid: string,
    params?: { page?: number; page_size?: number; sort?: string }
  ) => http.get(`/topics/${topicSecUid}/comments`, params),
  getBySecUid: (secUid: string) => http.get(`/comments/${secUid}`),
  create: (data: { topic_sec_uid: string; content: string; parent_sec_uid?: string }) =>
    http.post("/comments", data),
  delete: (secUid: string) => http.del(`/comments/${secUid}`),
};

// ============ 标签 ============

export const tagsApi = {
  list: (params?: { page?: number; page_size?: number; sort?: string; search?: string }) =>
    http.get("/tags", params),
  getById: (id: number) => http.get(`/tags/${id}`),
  create: (data: { title: string }) => http.post("/tags", data),
  update: (id: number, data: { title: string }) => http.put(`/tags/${id}`, data),
  delete: (id: number) => http.del(`/tags/${id}`),
};
