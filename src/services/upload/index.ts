/**
 * 上传服务 - 基于 oss-uploader 工具函数的项目实例
 */
import { config } from "@/config/env";
import { createUploader } from "@/utils/upload/oss-uploader";

export const uploader = createUploader({
  apiBaseUrl: config.API_BASE_URL,
  getToken: () => localStorage.getItem("auth_token"),
});

// 重新导出类型
export type {
  OSSFile,
  UploadOptions,
  UploadProgress,
  UploadStage,
} from "@/utils/upload/oss-uploader";
