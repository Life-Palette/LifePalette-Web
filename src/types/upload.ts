/** 文件项 */
export interface FileItem {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  md5?: string;
  blurhash?: string;
  videoSrc?: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

/** 上传进度阶段 */
export type UploadStage = "compress" | "md5" | "upload" | "blurhash" | "save";

/** 上传进度 */
export interface UploadProgress {
  stage: UploadStage;
  percent: number;
  currentFile?: string;
}

/** 上传配置 */
export interface UploadOptions {
  /** 是否压缩 PNG 图片 */
  compressPNG?: boolean;
  /** 是否压缩 JPEG 图片 */
  compressJPEG?: boolean;
  /** 最大文件大小（MB） */
  maxSizeMB?: number;
  /** 是否私有文件 */
  isPrivate?: boolean;
  /** 进度回调 */
  onProgress?: (progress: UploadProgress) => void;
}

/** OSS 签名数据 */
export interface OSSSignature {
  accessId: string;
  policy: string;
  signature: string;
  dir: string;
  host: string;
  baseHost: string;
  hasUpload?: boolean;
  fileUrl?: string;
  url?: string;
  id?: string;
  videoSrc?: string;
  blurhash?: string;
  width?: number;
  height?: number;
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
    public stage: UploadStage,
  ) {
    super(message);
    this.name = "UploadError";
  }
}
