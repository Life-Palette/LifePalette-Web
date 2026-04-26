import { config } from "@/config/env";

const API_BASE_URL = config.API_BASE_URL;

// ============ 类型定义 ============

export interface UploadToken {
  accessid: string;
  dir: string;
  expire: number;
  host: string;
  key: string;
  policy: string;
  signature: string;
}

export interface OSSFile {
  address?: string;
  blurhash?: string;
  created_at: string;
  file_md5: string;
  height?: number;
  is_private: boolean;
  live_photo_video_id?: number;
  name: string;
  sec_uid: string;
  size: number;
  taken_at?: string;
  type: string;
  updated_at: string;
  url: string;
  width?: number;
}

// 初始化响应 - 秒传
export interface UploadInitExistsResponse {
  exists: true;
  file: OSSFile;
}

// 初始化响应 - 普通上传
export interface UploadInitSimpleResponse {
  exists: false;
  mode: "simple";
  token: UploadToken;
}

// 初始化响应 - 分片上传
export interface UploadInitMultipartResponse {
  chunk_size: number;
  exists: false;
  host: string;
  key: string;
  mode: "multipart";
  total_parts: number;
  upload_id: string;
  uploaded_parts: number[];
}

export type UploadInitResponse =
  | UploadInitExistsResponse
  | UploadInitSimpleResponse
  | UploadInitMultipartResponse;

export interface CompletePart {
  etag: string;
  part_number: number;
}

export interface UploadCompleteRequest {
  file_name: string;
  file_size: number;
  is_private?: boolean;
  key: string;
  lat?: number;
  lng?: number;
  md5: string;
  parts?: CompletePart[];
  upload_id?: string;
}

// ============ 常量 ============

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
const MULTIPART_THRESHOLD = 5 * 1024 * 1024; // 5MB

// ============ 工具函数 ============

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok || (data.code && data.code >= 400)) {
    throw new Error(data.message || data.msg || "请求失败");
  }
  return data.data ?? data.result;
}

// ============ 上传 API ============

/**
 * 初始化上传（统一入口：秒传 / 普通 / 分片）
 */
export async function initUpload(
  fileName: string,
  fileSize: number,
  md5: string,
  chunkSize?: number
): Promise<UploadInitResponse> {
  const body: Record<string, unknown> = { file_name: fileName, file_size: fileSize, md5 };
  if (chunkSize) {
    body.chunk_size = chunkSize;
  }
  return apiPost<UploadInitResponse>("/file/upload/init", body);
}

/**
 * 完成上传（普通 or 分片）
 */
export async function completeUpload(data: UploadCompleteRequest): Promise<OSSFile> {
  return apiPost<OSSFile>("/file/upload/complete", data);
}

/**
 * 获取分片上传 URL
 */
export async function getPartUploadURLs(
  key: string,
  uploadId: string,
  partNumbers: number[]
): Promise<{ urls: { part_number: number; url: string }[] }> {
  return apiPost("/file/upload/urls", {
    key,
    upload_id: uploadId,
    part_numbers: partNumbers,
  });
}

// ============ 上传流程封装 ============

/** 上传时的可选地理位置 */
export interface UploadLocation {
  lat: number;
  lng: number;
}

/**
 * 普通上传（< 5MB）
 */
async function simpleUpload(
  file: File,
  md5: string,
  onProgress?: (percent: number) => void,
  isPrivate?: boolean,
  location?: UploadLocation
): Promise<OSSFile> {
  onProgress?.(10);
  const initRes = await initUpload(file.name, file.size, md5);

  // 秒传
  if (initRes.exists) {
    onProgress?.(100);
    return initRes.file;
  }

  if (initRes.mode !== "simple") {
    throw new Error("Unexpected upload mode");
  }

  const token = initRes.token;
  onProgress?.(30);

  // 上传到 OSS
  const formData = new FormData();
  formData.append("key", token.key);
  formData.append("policy", token.policy);
  formData.append("OSSAccessKeyId", token.accessid);
  formData.append("signature", token.signature);
  formData.append("success_action_status", "200");
  formData.append("file", file);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = 30 + Math.round((e.loaded / e.total) * 50);
        onProgress?.(percent);
      }
    });
    xhr.addEventListener("load", () =>
      xhr.status === 200 ? resolve() : reject(new Error(`OSS 上传失败: ${xhr.status}`))
    );
    xhr.addEventListener("error", () => reject(new Error("OSS 上传失败")));
    xhr.open("POST", token.host);
    xhr.send(formData);
  });

  onProgress?.(85);

  // 完成上传
  const result = await completeUpload({
    key: token.key,
    md5,
    file_name: file.name,
    file_size: file.size,
    is_private: isPrivate,
    ...(location ? { lat: location.lat, lng: location.lng } : {}),
  });

  onProgress?.(100);
  return result;
}

/**
 * 分片上传（>= 5MB）
 */
async function multipartUpload(
  file: File,
  md5: string,
  onProgress?: (percent: number) => void,
  isPrivate?: boolean,
  location?: UploadLocation
): Promise<OSSFile> {
  onProgress?.(5);
  const initRes = await initUpload(file.name, file.size, md5, CHUNK_SIZE);

  if (initRes.exists) {
    onProgress?.(100);
    return initRes.file;
  }

  if (initRes.mode !== "multipart") {
    throw new Error("Unexpected upload mode");
  }

  const {
    upload_id: uploadId,
    key,
    uploaded_parts: uploadedParts = [],
    total_parts: totalParts,
  } = initRes;
  const uploadedSet = new Set(uploadedParts);
  const pendingParts = Array.from({ length: totalParts }, (_, i) => i + 1).filter(
    (n) => !uploadedSet.has(n)
  );

  // 获取预签名 URL
  let urls: { part_number: number; url: string }[] = [];
  if (pendingParts.length > 0) {
    const urlsRes = await getPartUploadURLs(key, uploadId, pendingParts);
    urls = urlsRes.urls;
  }

  // 上传分片
  const completedParts: CompletePart[] = [];
  let uploaded = 0;

  for (const partNumber of pendingParts) {
    const start = (partNumber - 1) * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const urlInfo = urls.find((u) => u.part_number === partNumber);
    if (!urlInfo) {
      throw new Error(`No URL for part ${partNumber}`);
    }

    const res = await fetch(urlInfo.url, { method: "PUT", body: chunk });
    if (!res.ok) {
      throw new Error(`Failed to upload part ${partNumber}`);
    }

    const etag = res.headers.get("ETag") || "";
    completedParts.push({ part_number: partNumber, etag: etag.replace(/"/g, "") });
    uploaded++;
    onProgress?.(10 + Math.floor((uploaded / pendingParts.length) * 75));
  }

  completedParts.sort((a, b) => a.part_number - b.part_number);
  onProgress?.(90);

  const result = await completeUpload({
    key,
    upload_id: uploadId,
    md5,
    file_name: file.name,
    file_size: file.size,
    parts: completedParts,
    is_private: isPrivate,
    ...(location ? { lat: location.lat, lng: location.lng } : {}),
  });

  onProgress?.(100);
  return result;
}

/**
 * 统一上传入口 - 自动选择普通/分片上传
 */
export async function uploadToOSS(
  file: File,
  md5: string,
  onProgress?: (percent: number) => void,
  isPrivate?: boolean,
  location?: UploadLocation
): Promise<OSSFile> {
  if (file.size >= MULTIPART_THRESHOLD) {
    return multipartUpload(file, md5, onProgress, isPrivate, location);
  }
  return simpleUpload(file, md5, onProgress, isPrivate, location);
}

// ============ 文件信息更新 ============

/**
 * 更新文件信息（用于 Live Photo 关联等）
 */
export async function updateFileInfo(data: {
  id: string;
  videoSrc?: string;
  [key: string]: any;
}): Promise<{ code: number; result: any; message?: string }> {
  const token = localStorage.getItem("auth_token");
  const response = await fetch(`${API_BASE_URL}/file/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok || (result.code && result.code >= 400)) {
    throw new Error(result.message || "更新文件信息失败");
  }

  return { code: 200, result: result.data ?? result.result, message: "success" };
}
