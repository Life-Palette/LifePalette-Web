import { config } from "@/config/env";
import { createOssUploader } from "@life-palette/uploader";

export const uploader = createOssUploader({
  apiBaseUrl: config.API_BASE_URL,
  getToken: () => localStorage.getItem("auth_token"),
  // 与后端固定的 5MB 分片阈值保持一致。
  multipartThreshold: 5 * 1024 * 1024,
});

export { detectLivePhotoPairs } from "@life-palette/uploader";

export type {
  OSSFile,
  UploadOptions,
  UploadProgress,
  UploadStage,
} from "@life-palette/uploader";
