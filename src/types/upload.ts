/** 文件项 */
export interface FileItem {
  blurhash?: string;
  height?: number;
  id: string;
  md5?: string;
  name: string;
  size: number;
  thumbnail?: string;
  type: string;
  url: string;
  videoSrc?: string;
  width?: number;
  [key: string]: any;
}

/** 上传进度阶段 */
export type UploadStage = "compress" | "md5" | "upload" | "blurhash" | "save";

/** 上传进度 */
export interface UploadProgress {
  currentFile?: string;
  percent: number;
  stage: UploadStage;
}

/** 上传配置 */
export interface UploadOptions {
  /** 是否压缩图片 */
  compress?: boolean;
  /** 是否私有文件 */
  isPrivate?: boolean;
  /** 手动地理位置（经纬度） */
  location?: { lat: number; lng: number };
  /** 最大文件大小（MB） */
  maxSizeMB?: number;
  /** 进度回调 */
  onProgress?: (progress: UploadProgress) => void;
}

/** OSS 签名数据 */
export interface OSSSignature {
  accessId: string;
  baseHost: string;
  blurhash?: string;
  dir: string;
  fileUrl?: string;
  hasUpload?: boolean;
  height?: number;
  host: string;
  id?: string;
  policy: string;
  signature: string;
  url?: string;
  videoSrc?: string;
  width?: number;
  [key: string]: any;
}

/** 上传错误码 */
export enum UploadErrorCode {
  COMPRESS_FAILED = "COMPRESS_FAILED",
  MD5_FAILED = "MD5_FAILED",
  SIGNATURE_FAILED = "SIGNATURE_FAILED",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  BLURHASH_FAILED = "BLURHASH_FAILED",
  SAVE_FAILED = "SAVE_FAILED",
}

/** 上传错误 */
export class UploadError extends Error {
  constructor(
    message: string,
    public code: UploadErrorCode,
    public stage: UploadStage
  ) {
    super(message);
    this.name = "UploadError";
  }
}
