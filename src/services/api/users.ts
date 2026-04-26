import { http } from "../http";

export const usersApi = {
  /** 获取当前登录用户 */
  getMe: () => http.get("/users/me"),

  /** 更新当前用户资料 */
  updateMe: (data: Record<string, any>) => http.put("/users/me", data),

  /** 根据 sec_uid 获取用户 */
  getBySecUid: (secUid: string) => http.get(`/users/${secUid}`),

  /** 获取用户互动统计 */
  getStats: (secUid: string) => http.get(`/users/${secUid}/stats`),

  /** 获取用户旅行统计 */
  getTravelStats: (secUid: string) => http.get(`/users/${secUid}/travel-stats`),

  /** 获取用户城市列表 */
  getCities: (secUid: string, params?: Record<string, any>) =>
    http.get(`/users/${secUid}/cities`, params),

  /** 获取用户点赞列表 */
  getLikes: (secUid: string, params?: { page?: number; page_size?: number }) =>
    http.get(`/users/${secUid}/likes`, params),

  /** 获取用户收藏列表 */
  getCollections: (secUid: string, params?: { page?: number; page_size?: number }) =>
    http.get(`/users/${secUid}/collections`, params),

  /** 更新用户（管理员） */
  update: (secUid: string, data: Record<string, any>) => http.put(`/users/${secUid}`, data),
};
