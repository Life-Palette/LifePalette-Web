import { config } from "@/config/env";
import type { ApiResponse } from "@/services/api";
import type { FileItem, OSSSignature } from "@/types/upload";

const API_BASE_URL = config.API_BASE_URL;

/**
 * 获取 OSS 上传签名
 * @param fileMd5 文件的 MD5 值
 * @returns OSS 签名数据
 */
export async function getOSSSignature(fileMd5: string): Promise<ApiResponse<OSSSignature>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/alioss?fileMd5=${fileMd5}`;

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
    throw new Error(data.msg || "获取 OSS 签名失败");
  }

  return data;
}

/**
 * 生成文件名（用于 OSS key）
 */
function generateFileName(ossData: OSSSignature, file: File): string {
  const suffix = file.name.slice(file.name.lastIndexOf("."));
  const filename = Date.now() + suffix;
  return ossData.dir + filename;
}

/**
 * 上传文件到 OSS
 * @param file 文件对象
 * @param signature OSS 签名数据
 * @param onProgress 进度回调
 * @returns 文件 URL
 */
export async function uploadToOSS(
  file: File,
  signature: OSSSignature,
  onProgress?: (percent: number) => void,
): Promise<string> {
  const key = generateFileName(signature, file);
  const formData = new FormData();

  formData.append("key", key);
  formData.append("OSSAccessKeyId", signature.accessId);
  formData.append("policy", signature.policy);
  formData.append("signature", signature.signature);
  formData.append("success_action_status", "200");
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });
    }

    // 监听完成
    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const fileUrl = `${signature.baseHost}/${key}`;
        resolve(fileUrl);
      } else {
        reject(new Error(`OSS 上传失败: ${xhr.status}`));
      }
    });

    // 监听错误
    xhr.addEventListener("error", () => {
      reject(new Error("OSS 上传失败"));
    });

    // 监听中止
    xhr.addEventListener("abort", () => {
      reject(new Error("OSS 上传已取消"));
    });

    // 发送请求
    xhr.open("POST", signature.host);
    xhr.send(formData);
  });
}

/**
 * 保存文件信息到服务器
 */
export async function saveFileInfo(data: {
  fileUrl: string;
  fileMd5: string;
  size: number;
  type: string;
  name: string;
  dir: string;
  hashCode?: string;
  isPrivate?: boolean;
}): Promise<ApiResponse<FileItem>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/alioss/saveFile`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`保存文件信息失败: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(result.msg || "保存文件信息失败");
  }

  return result;
}

/**
 * 更新文件信息
 */
export async function updateFileInfo(data: {
  id: string;
  videoSrc?: string;
  [key: string]: any;
}): Promise<ApiResponse<FileItem>> {
  const token = localStorage.getItem("auth_token");
  const url = `${API_BASE_URL}/api/file/${data.id}`;

  const response = await fetch(url, {
    method: "PATCH",
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
