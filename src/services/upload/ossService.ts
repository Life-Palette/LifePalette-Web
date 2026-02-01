import { config } from "@/config/env";
import type { ApiResponse } from "@/services/api";
import type { FileItem, OSSSignature } from "@/types/upload";

const API_BASE_URL = config.API_BASE_URL;

// ============ 统一上传接口 ============

export interface UploadInitResponse {
  exists: boolean;
  file?: FileItem;
  mode?: "simple" | "multipart";
  // 普通上传
  token?: OSSSignature;
  // 分片上传
  upload_id?: string;
  key?: string;
  host?: string;
  total_parts?: number;
  chunk_size?: number;
  uploaded_parts?: number[];
}

/**
 * 初始化上传（统一接口）
 * 自动检查秒传，根据文件大小决定上传方式
 */
export async function initUpload(params: {
  fileName: string;
  fileSize: number;
  md5: string;
  chunkSize?: number;
}): Promise<ApiResponse<UploadInitResponse>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/v1/file/upload/init`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      file_name: params.fileName,
      file_size: params.fileSize,
      md5: params.md5,
      chunk_size: params.chunkSize,
    }),
  });

  if (!response.ok) {
    throw new Error(`初始化上传失败: ${response.status}`);
  }

  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(data.msg || data.message || "初始化上传失败");
  }

  return { ...data, result: data.data || data.result };
}

/**
 * 完成上传（统一接口）
 * 支持普通上传和分片上传
 */
export async function completeUpload(params: {
  key: string;
  md5: string;
  fileName: string;
  fileSize: number;
  uploadId?: string;
  parts?: Array<{ part_number: number; etag: string }>;
}): Promise<ApiResponse<FileItem>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/v1/file/upload/complete`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      key: params.key,
      md5: params.md5,
      file_name: params.fileName,
      file_size: params.fileSize,
      upload_id: params.uploadId,
      parts: params.parts,
    }),
  });

  if (!response.ok) {
    throw new Error(`完成上传失败: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || result.message || "完成上传失败");
  }

  const fileData = result.data || result.result;
  const fileItem: FileItem = {
    id: fileData.sec_uid || fileData.id?.toString() || params.md5,
    numeric_id: fileData.id,
    sec_uid: fileData.sec_uid,
    name: fileData.name || params.fileName,
    type: fileData.type,
    url: fileData.url,
    size: fileData.size || params.fileSize,
    md5: fileData.file_md5 || params.md5,
    fileMd5: fileData.file_md5 || params.md5,
    width: fileData.width,
    height: fileData.height,
    blurhash: fileData.blurhash,
    ...fileData,
  };

  return { ...result, result: fileItem };
}

/**
 * 获取分片上传URL
 */
export async function getPartUploadURLs(params: {
  key: string;
  uploadId: string;
  partNumbers: number[];
}): Promise<ApiResponse<{ urls: Array<{ part_number: number; url: string }> }>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/v1/file/upload/urls`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      key: params.key,
      upload_id: params.uploadId,
      part_numbers: params.partNumbers,
    }),
  });

  if (!response.ok) {
    throw new Error(`获取分片URL失败: ${response.status}`);
  }

  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(data.msg || data.message || "获取分片URL失败");
  }

  return { ...data, result: data.data || data.result };
}

/**
 * 取消上传
 */
export async function abortUpload(params: {
  key: string;
  uploadId: string;
}): Promise<ApiResponse<null>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/v1/file/upload/abort`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      key: params.key,
      upload_id: params.uploadId,
    }),
  });

  if (!response.ok) {
    throw new Error(`取消上传失败: ${response.status}`);
  }

  const data = await response.json();
  return { ...data, result: null };
}

// ============ 普通上传辅助函数 ============

/**
 * 生成文件名（用于 OSS key）
 */
function generateFileName(ossData: OSSSignature, file: File): string {
  if (ossData.key) {
    return ossData.key;
  }
  const suffix = file.name.slice(file.name.lastIndexOf("."));
  const filename = Date.now() + suffix;
  return ossData.dir + filename;
}

/**
 * 上传文件到 OSS（普通上传）
 */
export async function uploadToOSS(
  file: File,
  signature: OSSSignature,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const key = generateFileName(signature, file);
  const formData = new FormData();

  formData.append("key", key);
  formData.append("OSSAccessKeyId", signature.accessId || signature.accessid);
  formData.append("policy", signature.policy);
  formData.append("signature", signature.signature);
  formData.append("success_action_status", "200");
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const fileUrl = `${signature.baseHost || signature.host}/${key}`;
        resolve(fileUrl);
      } else {
        reject(new Error(`OSS 上传失败: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("OSS 上传失败")));
    xhr.addEventListener("abort", () => reject(new Error("OSS 上传已取消")));

    xhr.open("POST", signature.host);
    xhr.send(formData);
  });
}

// ============ 分片上传辅助函数 ============

/**
 * 上传单个分片
 */
export async function uploadPart(
  url: string,
  chunk: Blob,
  onProgress?: (loaded: number, total: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onProgress(event.loaded, event.total);
        }
      });
    }

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag") || "";
        resolve(etag.replace(/"/g, ""));
      } else {
        reject(new Error(`分片上传失败: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("分片上传失败")));
    xhr.addEventListener("abort", () => reject(new Error("分片上传已取消")));

    xhr.open("PUT", url);
    xhr.send(chunk);
  });
}

// ============ 旧接口（保持兼容） ============

/**
 * @deprecated 请使用 initUpload
 */
export async function getOSSSignature(fileMd5: string): Promise<ApiResponse<OSSSignature>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/v1/file/token?md5=${encodeURIComponent(fileMd5)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`获取 OSS 签名失败: ${response.status}`);
  }

  const data = await response.json();
  if (data.code !== 200) {
    throw new Error(data.msg || data.message || "获取 OSS 签名失败");
  }

  return { ...data, result: data.data || data.result };
}

/**
 * @deprecated 请使用 completeUpload
 */
export async function saveFileInfo(data: {
  fileUrl: string;
  fileMd5: string;
  size: number;
  name: string;
  dir: string;
  hashCode?: string;
  isPrivate?: boolean;
}): Promise<ApiResponse<FileItem>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/v1/file/callback`;

  const urlObj = new URL(data.fileUrl);
  const key = urlObj.pathname.substring(1);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      key: key,
      md5: data.fileMd5,
      file_name: data.name,
      file_size: data.size,
    }),
  });

  if (!response.ok) {
    throw new Error(`保存文件信息失败: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || result.message || "保存文件信息失败");
  }

  const fileData = result.data || result.result;
  const fileItem: FileItem = {
    id: fileData.sec_uid || fileData.id?.toString() || data.fileMd5,
    numeric_id: fileData.id,
    sec_uid: fileData.sec_uid,
    name: fileData.name || data.name,
    type: fileData.type,
    url: fileData.url || data.fileUrl,
    size: fileData.size || data.size,
    md5: fileData.file_md5 || data.fileMd5,
    fileMd5: fileData.file_md5 || data.fileMd5,
    width: fileData.width,
    height: fileData.height,
    blurhash: fileData.blurhash || data.hashCode,
    ...fileData,
  };

  return { ...result, result: fileItem };
}

// ============ 文件操作接口 ============

/**
 * 手动处理文件元数据
 */
export async function processFileMetadata(secUID: string): Promise<ApiResponse<FileItem>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/v1/file/${secUID}/process`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`处理文件元数据失败: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || result.message || "处理文件元数据失败");
  }

  return result;
}

/**
 * 获取文件详情
 */
export async function getFileInfo(secUID: string): Promise<ApiResponse<FileItem>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/v1/file/${secUID}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`获取文件信息失败: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || result.message || "获取文件信息失败");
  }

  return result;
}

/**
 * 更新文件信息
 */
export async function updateFileInfo(data: {
  id: string | number;
  numeric_id?: number;
  videoSrc?: string;
  [key: string]: any;
}): Promise<ApiResponse<FileItem>> {
  const token = localStorage.getItem("auth_token");
  const fileId = data.sec_uid || data.id;
  const url = `${API_BASE_URL}/api/v1/file/${fileId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`更新文件信息失败: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || "更新文件信息失败");
  }

  return result;
}
