import { createOssUploader } from "@life-palette/uploader";
import { config } from "@/config/env";

export const uploader = createOssUploader({
  apiBaseUrl: config.API_BASE_URL,
  getToken: () => localStorage.getItem("auth_token"),
  // 与后端固定的 5MB 分片阈值保持一致。
  multipartThreshold: 5 * 1024 * 1024,
});

export const DEFAULT_UPLOAD_OPTIONS = {
  analyze: true,
  compress: true,
  maxSizeMB: 20,
} as const;

export type {
  OSSFile,
  UploadOptions,
  UploadProgress,
  UploadStage,
} from "@life-palette/uploader";
// biome-ignore lint/performance/noBarrelFile: this package facade preserves the uploader public API
export { detectLivePhotoPairs } from "@life-palette/uploader";
