import {
  initUpload,
  completeUpload,
  uploadToOSS,
  getPartUploadURLs,
  uploadPart,
  type UploadInitResponse,
} from "@/services/upload/ossService";
import type { FileItem, UploadErrorCode, UploadOptions } from "@/types/upload";
import { UploadError } from "@/types/upload";
import { generateBlurhash } from "@/utils/upload/blurhash";
import { compressImage, shouldCompress } from "@/utils/upload/imageCompress";
import { calculateMD5 } from "@/utils/upload/md5";

/**
 * 判断是否为视频文件
 */
function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

/**
 * 上传单个文件（统一接口，自动选择普通/分片上传）
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<FileItem> {
  const { compressPNG = false, compressJPEG = false, onProgress } = options;

  let processedFile = file;

  try {
    // 1. 图片压缩（如需要）
    if ((compressPNG || compressJPEG) && shouldCompress(file)) {
      onProgress?.({ stage: "compress", percent: 0 });
      try {
        processedFile = await compressImage(file, {
          maxSizeMB: options.maxSizeMB || 1,
          maxWidthOrHeight: 1920,
        });
        onProgress?.({ stage: "compress", percent: 100 });
      } catch (error) {
        console.warn("图片压缩失败，使用原文件:", error);
        processedFile = file;
      }
    }

    // 2. 计算 MD5
    onProgress?.({ stage: "md5", percent: 0 });
    const md5 = await calculateMD5(processedFile, (percent) => {
      onProgress?.({ stage: "md5", percent });
    });

    // 3. 初始化上传（统一接口）
    const initResponse = await initUpload({
      fileName: processedFile.name,
      fileSize: processedFile.size,
      md5,
    });

    if (initResponse.code !== 200) {
      throw new UploadError(
        initResponse.msg || "初始化上传失败",
        "SIGNATURE_FAILED" as UploadErrorCode,
        "upload",
      );
    }

    const initData = initResponse.result;

    // 4. 检查秒传
    if (initData.exists && initData.file) {
      return {
        id: initData.file.sec_uid || initData.file.id?.toString() || md5,
        sec_uid: initData.file.sec_uid,
        name: initData.file.name || file.name,
        type: initData.file.type || file.type,
        url: initData.file.url,
        size: initData.file.size || file.size,
        md5: initData.file.file_md5 || md5,
        fileMd5: initData.file.file_md5 || md5,
        width: initData.file.width,
        height: initData.file.height,
        blurhash: initData.file.blurhash,
        hasUpload: true,
      } as FileItem;
    }

    // 5. 根据模式上传
    let key: string;
    let uploadId: string | undefined;
    let parts: Array<{ part_number: number; etag: string }> | undefined;

    if (initData.mode === "multipart") {
      // 分片上传
      const result = await uploadMultipart(processedFile, initData, (percent) => {
        onProgress?.({ stage: "upload", percent });
      });
      key = result.key;
      uploadId = result.uploadId;
      parts = result.parts;
    } else {
      // 普通上传
      onProgress?.({ stage: "upload", percent: 0 });
      const token = initData.token!;
      const fileUrl = await uploadToOSS(processedFile, token, (percent) => {
        onProgress?.({ stage: "upload", percent });
      });
      // 从 URL 提取 key
      const urlObj = new URL(fileUrl);
      key = urlObj.pathname.substring(1);
    }

    // 6. 生成 Blurhash（仅图片，可选）
    if (!isVideoFile(processedFile)) {
      try {
        onProgress?.({ stage: "blurhash", percent: 0 });
        await generateBlurhash(processedFile);
        onProgress?.({ stage: "blurhash", percent: 100 });
      } catch (error) {
        console.warn("Blurhash 生成失败:", error);
      }
    }

    // 7. 完成上传
    onProgress?.({ stage: "save", percent: 0 });
    const completeResponse = await completeUpload({
      key,
      md5,
      fileName: processedFile.name,
      fileSize: processedFile.size,
      uploadId,
      parts,
    });

    if (completeResponse.code !== 200) {
      throw new UploadError(
        completeResponse.msg || "完成上传失败",
        "SAVE_FAILED" as UploadErrorCode,
        "save",
      );
    }

    onProgress?.({ stage: "save", percent: 100 });
    return completeResponse.result;
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError(
      error instanceof Error ? error.message : "上传失败",
      "UPLOAD_FAILED" as UploadErrorCode,
      "upload",
    );
  }
}

/**
 * 分片上传
 */
async function uploadMultipart(
  file: File,
  initData: UploadInitResponse,
  onProgress?: (percent: number) => void,
): Promise<{ key: string; uploadId: string; parts: Array<{ part_number: number; etag: string }> }> {
  const { key, upload_id: uploadId, total_parts: totalParts, chunk_size: chunkSize, uploaded_parts: uploadedParts } = initData;

  if (!key || !uploadId || !totalParts || !chunkSize) {
    throw new Error("分片上传初始化数据不完整");
  }

  const parts: Array<{ part_number: number; etag: string }> = [];
  const uploadedSet = new Set(uploadedParts || []);
  let uploadedCount = uploadedSet.size;

  // 获取需要上传的分片号
  const pendingParts: number[] = [];
  for (let i = 1; i <= totalParts; i++) {
    if (!uploadedSet.has(i)) {
      pendingParts.push(i);
    }
  }

  // 批量获取上传URL（每次最多10个）
  const batchSize = 10;
  for (let i = 0; i < pendingParts.length; i += batchSize) {
    const batch = pendingParts.slice(i, i + batchSize);

    const urlsResponse = await getPartUploadURLs({
      key,
      uploadId,
      partNumbers: batch,
    });

    const urls = urlsResponse.result.urls;

    // 并发上传这批分片
    await Promise.all(
      urls.map(async ({ part_number, url }) => {
        const start = (part_number - 1) * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const etag = await uploadPart(url, chunk);
        parts.push({ part_number, etag });
        uploadedCount++;
        onProgress?.(Math.round((uploadedCount / totalParts) * 100));
      }),
    );
  }

  // 按分片号排序
  parts.sort((a, b) => a.part_number - b.part_number);

  return { key, uploadId, parts };
}

/**
 * 批量上传文件（带重试机制）
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {},
  maxRetries = 3,
): Promise<FileItem[]> {
  const results: FileItem[] = [];

  for (const file of files) {
    let retries = 0;
    let success = false;
    let lastError: Error | null = null;

    while (retries < maxRetries && !success) {
      try {
        const result = await uploadFile(file, options);
        results.push(result);
        success = true;
      } catch (error) {
        lastError = error as Error;
        retries++;

        if (retries < maxRetries) {
          console.warn(`文件 ${file.name} 上传失败，正在重试 (${retries}/${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    if (!success && lastError) {
      console.error(`文件 ${file.name} 上传失败:`, lastError);
      throw lastError;
    }
  }

  return results;
}
