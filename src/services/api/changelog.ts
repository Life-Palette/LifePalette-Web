import { http } from "../http";

export const changelogApi = {
  /** 获取更新日志列表 */
  list: (params?: { page?: number; page_size?: number; sort?: string; status?: string }) =>
    http.get("/changelogs", params),

  /** 获取最新发布的更新日志 */
  getLatest: () => http.get("/changelogs/latest"),

  /** 根据标识获取更新日志 */
  getByIdentifier: (identifier: string) => http.get(`/changelogs/${identifier}`),
};
