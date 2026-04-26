/**
 * OSS 上传工具 - 纯函数封装，不依赖任何框架
 *
 * 完整流程: 压缩(可选) → MD5 → init(秒传检查) → 上传 OSS → complete
 *
 * 使用方式:
 *   import { createUploader } from '@/utils/upload/oss-uploader'
 *   const uploader = createUploader({ apiBaseUrl: 'http://localhost:9527/api/v1', getToken: () => localStorage.getItem('token') })
 *   const file = await uploader.upload(file, { compress: true, isPrivate: true, onProgress: console.log })
 */

// ============ 类型 ============

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

export interface UploadToken {
  accessid: string;
  dir: string;
  expire: number;
  host: string;
  key: string;
  policy: string;
  signature: string;
}

export interface CompletePart {
  etag: string;
  part_number: number;
}

export type UploadStage = "compress" | "md5" | "upload" | "complete";

export interface UploadProgress {
  percent: number;
  stage: UploadStage;
}

export interface UploadOptions {
  /** 压缩图片 */
  compress?: boolean;
  /** 是否私有 */
  isPrivate?: boolean;
  /** 手动地理位置（经纬度） */
  location?: { lat: number; lng: number };
  /** 最大文件大小 MB（压缩用） */
  maxSizeMB?: number;
  /** 进度回调 */
  onProgress?: (progress: UploadProgress) => void;
}

export interface UploaderConfig {
  /** API 基础路径，如 http://localhost:9527/api/v1 */
  apiBaseUrl: string;
  /** 分片大小（字节），默认 5MB */
  chunkSize?: number;
  /** 获取 token 的函数 */
  getToken: () => string | null;
  /** 分片阈值（字节），默认 5MB */
  multipartThreshold?: number;
}

// ============ 内部类型 ============

interface InitExistsResponse {
  exists: true;
  file: OSSFile;
}
interface InitSimpleResponse {
  exists: false;
  mode: "simple";
  token: UploadToken;
}
interface InitMultipartResponse {
  chunk_size: number;
  exists: false;
  host: string;
  key: string;
  mode: "multipart";
  total_parts: number;
  upload_id: string;
  uploaded_parts: number[];
}
type InitResponse = InitExistsResponse | InitSimpleResponse | InitMultipartResponse;

// ============ 工厂函数 ============

export function createUploader(config: UploaderConfig) {
  const {
    apiBaseUrl,
    getToken,
    multipartThreshold = 5 * 1024 * 1024,
    chunkSize = 5 * 1024 * 1024,
  } = config;

  // --- HTTP 工具 ---
  async function post<T>(endpoint: string, body: unknown): Promise<T> {
    const token = getToken();
    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || (data.code && data.code >= 400)) {
      throw new Error(data.message || data.msg || "请求失败");
    }
    return data.data ?? data.result;
  }

  async function put<T>(endpoint: string, body: unknown): Promise<T> {
    const token = getToken();
    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || (data.code && data.code >= 400)) {
      throw new Error(data.message || data.msg || "请求失败");
    }
    return data.data ?? data.result;
  }

  // --- API 层 ---
  function initUpload(fileName: string, fileSize: number, md5: string, chunk?: number) {
    const body: Record<string, unknown> = { file_name: fileName, file_size: fileSize, md5 };
    if (chunk) {
      body.chunk_size = chunk;
    }
    return post<InitResponse>("/file/upload/init", body);
  }

  function completeUpload(data: {
    key: string;
    md5: string;
    file_name: string;
    file_size: number;
    is_private?: boolean;
    lat?: number;
    lng?: number;
    upload_id?: string;
    parts?: CompletePart[];
  }) {
    return post<OSSFile>("/file/upload/complete", data);
  }

  function getPartUrls(key: string, uploadId: string, partNumbers: number[]) {
    return post<{ urls: { part_number: number; url: string }[] }>("/file/upload/urls", {
      key,
      upload_id: uploadId,
      part_numbers: partNumbers,
    });
  }

  // --- MD5 计算 ---
  async function calcMD5(file: File, onProgress?: (pct: number) => void): Promise<string> {
    const { default: SparkMD5 } = await import("spark-md5");
    const spark = new SparkMD5.ArrayBuffer();
    const size = 2 * 1024 * 1024;
    const chunks = Math.ceil(file.size / size);
    let cur = 0;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("文件读取失败"));
      reader.onload = (e) => {
        spark.append(e.target!.result as ArrayBuffer);
        cur++;
        onProgress?.(Math.round((cur / chunks) * 100));
        cur < chunks ? loadNext() : resolve(spark.end());
      };
      function loadNext() {
        const start = cur * size;
        reader.readAsArrayBuffer(file.slice(start, Math.min(start + size, file.size)));
      }
      loadNext();
    });
  }

  // --- 普通上传 ---
  async function simpleUpload(
    file: File,
    md5: string,
    isPrivate?: boolean,
    onProgress?: (pct: number) => void,
    location?: { lat: number; lng: number }
  ): Promise<OSSFile> {
    onProgress?.(10);
    const init = await initUpload(file.name, file.size, md5);
    if (init.exists) {
      onProgress?.(100);
      return init.file;
    }
    if (init.mode !== "simple") {
      throw new Error("Unexpected upload mode");
    }

    const t = init.token;
    onProgress?.(30);

    const fd = new FormData();
    fd.append("key", t.key);
    fd.append("policy", t.policy);
    fd.append("OSSAccessKeyId", t.accessid);
    fd.append("signature", t.signature);
    fd.append("success_action_status", "200");
    fd.append("file", file);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress?.(30 + Math.round((e.loaded / e.total) * 50));
        }
      };
      xhr.onload = () =>
        xhr.status === 200 ? resolve() : reject(new Error(`OSS 上传失败: ${xhr.status}`));
      xhr.onerror = () => reject(new Error("OSS 上传失败"));
      xhr.open("POST", t.host);
      xhr.send(fd);
    });

    onProgress?.(85);
    const result = await completeUpload({
      key: t.key,
      md5,
      file_name: file.name,
      file_size: file.size,
      is_private: isPrivate,
      ...(location ? { lat: location.lat, lng: location.lng } : {}),
    });
    onProgress?.(100);
    return result;
  }

  // --- 分片上传 ---
  async function multiUpload(
    file: File,
    md5: string,
    isPrivate?: boolean,
    onProgress?: (pct: number) => void,
    location?: { lat: number; lng: number }
  ): Promise<OSSFile> {
    onProgress?.(5);
    const init = await initUpload(file.name, file.size, md5, chunkSize);
    if (init.exists) {
      onProgress?.(100);
      return init.file;
    }
    if (init.mode !== "multipart") {
      throw new Error("Unexpected upload mode");
    }

    const { upload_id: uid, key, uploaded_parts: done = [], total_parts: total } = init;
    const doneSet = new Set(done);
    const pending = Array.from({ length: total }, (_, i) => i + 1).filter((n) => !doneSet.has(n));

    let urls: { part_number: number; url: string }[] = [];
    if (pending.length > 0) {
      urls = (await getPartUrls(key, uid, pending)).urls;
    }

    const parts: CompletePart[] = [];
    let uploaded = 0;

    for (const pn of pending) {
      const start = (pn - 1) * chunkSize;
      const chunk = file.slice(start, Math.min(start + chunkSize, file.size));
      const urlInfo = urls.find((u) => u.part_number === pn);
      if (!urlInfo) {
        throw new Error(`No URL for part ${pn}`);
      }

      const res = await fetch(urlInfo.url, { method: "PUT", body: chunk });
      if (!res.ok) {
        throw new Error(`Failed to upload part ${pn}`);
      }

      const etag = res.headers.get("ETag") || "";
      parts.push({ part_number: pn, etag: etag.replace(/"/g, "") });
      uploaded++;
      onProgress?.(10 + Math.floor((uploaded / pending.length) * 75));
    }

    parts.sort((a, b) => a.part_number - b.part_number);
    onProgress?.(90);

    const result = await completeUpload({
      key,
      upload_id: uid,
      md5,
      file_name: file.name,
      file_size: file.size,
      parts,
      is_private: isPrivate,
      ...(location ? { lat: location.lat, lng: location.lng } : {}),
    });
    onProgress?.(100);
    return result;
  }

  // --- 图片压缩 ---
  async function compress(file: File, maxSizeMB = 1): Promise<File> {
    if (!file.type.startsWith("image/")) {
      return file;
    }
    try {
      const { default: imageCompression } = await import("browser-image-compression");
      const compressed = await imageCompression(file, {
        maxSizeMB,
        useWebWorker: true,
        preserveExif: true,
      });
      return compressed.name
        ? compressed
        : new File([compressed], file.name, { type: compressed.type || file.type });
    } catch {
      return file;
    }
  }

  // ============ 公开 API ============

  /**
   * 上传单个文件
   * 完整流程: 压缩(可选) → MD5 → init(秒传) → OSS上传 → complete
   */
  async function upload(file: File, options: UploadOptions = {}): Promise<OSSFile> {
    const { compress: shouldCompress = false, maxSizeMB, isPrivate, location, onProgress } = options;
    let processed = file;

    // 1. 压缩
    if (shouldCompress && file.type.startsWith("image/")) {
      onProgress?.({ stage: "compress", percent: 0 });
      processed = await compress(file, maxSizeMB);
      onProgress?.({ stage: "compress", percent: 100 });
    }

    // 2. MD5
    onProgress?.({ stage: "md5", percent: 0 });
    const md5 = await calcMD5(processed, (pct) => onProgress?.({ stage: "md5", percent: pct }));

    // 3. 上传
    onProgress?.({ stage: "upload", percent: 0 });
    const fn = processed.size >= multipartThreshold ? multiUpload : simpleUpload;
    const result = await fn(processed, md5, isPrivate, (pct) =>
      onProgress?.({ stage: "upload", percent: pct }),
      location
    );

    onProgress?.({ stage: "complete", percent: 100 });
    return result;
  }

  // --- 实况照片关联 ---
  function getFileExtName(name: string): { baseName: string; ext: string; isVideo: boolean } {
    const parts = name.split(".");
    const ext = (parts.pop() || "").toLowerCase();
    const baseName = parts.join(".");
    const videoExts = ["mov", "mp4", "avi", "mkv", "webm", "m4v"];
    return { baseName, ext, isVideo: videoExts.includes(ext) };
  }

  async function associateLivePhotos(results: OSSFile[]): Promise<void> {
    // 按 baseName 分组，找出同名的图片+视频配对
    const byName = new Map<string, { images: OSSFile[]; videos: OSSFile[] }>();
    for (const f of results) {
      const { baseName, isVideo } = getFileExtName(f.name);
      if (!byName.has(baseName)) {
        byName.set(baseName, { images: [], videos: [] });
      }
      const group = byName.get(baseName)!;
      if (isVideo) {
        group.videos.push(f);
      } else {
        group.images.push(f);
      }
    }

    for (const [, { images, videos }] of byName) {
      if (images.length === 0 || videos.length === 0) {
        continue;
      }
      // 一对一关联
      const image = images[0];
      const video = videos[0];
      try {
        await put<unknown>(`/file/${image.sec_uid}`, {
          live_photo_video_sec_uid: video.sec_uid,
        });
      } catch (e) {
        console.error("实况照片关联失败:", e);
      }
    }
  }

  /**
   * 批量上传（串行，带重试），上传完成后自动关联实况照片
   */
  async function uploadBatch(
    files: File[],
    options: UploadOptions = {},
    maxRetries = 3
  ): Promise<OSSFile[]> {
    const results: OSSFile[] = [];
    for (const file of files) {
      let retries = 0,
        lastErr: Error | null = null;
      while (retries < maxRetries) {
        try {
          results.push(await upload(file, options));
          break;
        } catch (e) {
          lastErr = e as Error;
          retries++;
          if (retries < maxRetries) {
            await new Promise((r) => setTimeout(r, 1000 * retries));
          }
        }
      }
      if (retries >= maxRetries && lastErr) {
        throw lastErr;
      }
    }
    // 上传完成后自动关联实况照片
    await associateLivePhotos(results);
    return results;
  }

  return { upload, uploadBatch, associateLivePhotos };
}
