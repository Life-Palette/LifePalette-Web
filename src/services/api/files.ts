import { http } from "../http";

export interface FileListParams {
  has_location?: boolean;
  is_private?: boolean;
  page?: number;
  page_size?: number;
  preset?: "mini" | "simple" | "full";
  sort?: string;
  user_uid?: string;
}

export const filesApi = {
  /** 删除文件 */
  delete: (secUid: string) => http.del(`/files/${secUid}`),

  /** 按颜色查找文件 */
  getByColor: (params: { hex: string; page?: number; page_size?: number }) =>
    http.get("/files/colors/files", params),

  /** 获取文件详情 */
  getBySecUid: (secUid: string, fields = "all") =>
    http.get(`/files/${secUid}`, { fields }),

  /** 获取颜色统计 */
  getColorStats: (params?: { page?: number; page_size?: number }) =>
    http.get("/files/colors/statistics", params),

  /** 获取文件列表 */
  list: (params?: FileListParams) => http.get("/files", params),

  /** 更新文件 */
  update: (secUid: string, data: Record<string, unknown>) =>
    http.put(`/files/${secUid}`, data),
};
