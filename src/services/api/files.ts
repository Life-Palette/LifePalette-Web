import { http } from "../http";

export interface FileListParams {
  has_location?: boolean;
  is_private?: boolean;
  page?: number;
  page_size?: number;
  preset?: "mini" | "simple" | "full";
  sort?: string;
  user_sec_uid?: string;
}

export const filesApi = {
  /** 删除文件 */
  delete: (secUid: string) => http.del(`/file/${secUid}`),

  /** 按颜色查找文件 */
  getByColor: (params: {
    hex: string;
    user_sec_uid?: string;
    page?: number;
    page_size?: number;
  }) => http.get("/file/colors/files", params),

  /** 根据位置获取文件 */
  getByLocation: (params?: {
    city?: string;
    country?: string;
    page?: number;
    page_size?: number;
  }) => http.get("/file/location", params),

  /** 获取文件详情 */
  getBySecUid: (secUid: string, fields = "all") =>
    http.get(`/file/${secUid}`, { fields }),

  /** 获取颜色统计 */
  getColorStats: (params?: {
    user_sec_uid?: string;
    page?: number;
    page_size?: number;
  }) => http.get("/file/colors/statistics", params),

  /** 获取文件上传者列表 */
  getUploaders: () => http.get("/file/uploaders"),
  /** 获取文件列表 */
  list: (params?: FileListParams) => http.get("/file", params),

  /** 更新文件 */
  update: (secUid: string, data: Record<string, unknown>) =>
    http.put(`/file/${secUid}`, data),
};
