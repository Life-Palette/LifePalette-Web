import { type OSSFile, type UploadLocation, uploadToOSS } from "@/services/upload/ossService";
import type { UploadOptions } from "@/types/upload";
import { UploadError, UploadErrorCode } from "@/types/upload";
import { generateBlurhash } from "@/utils/upload/blurhash";
import { compressImage } from "@/utils/upload/imageCompress";
import { calculateMD5 } from "@/utils/upload/md5";

/**
 * 上传单个文件到 Go 后端
 * 流程: 压缩(可选) → MD5 → init(秒传检查) → 上传 OSS → complete → blurhash(可选)
 */
export async function uploadFile(file: File, options: UploadOptions = {}): Promise<OSSFile> {
  const { compress = false, onProgress } = options;
  let processedFile = file;

  try {
    // 1. 图片压缩
    if (file.type.startsWith("image/") && compress) {
      onProgress?.({ stage: "compress", percent: 0 });
      try {
        processedFile = await compressImage(file, {
          maxSizeMB: options.maxSizeMB || 1,
        });
      } catch {
        processedFile = file;
      }
      onProgress?.({ stage: "compress", percent: 100 });
    }

    // 2. 计算 MD5
    onProgress?.({ stage: "md5", percent: 0 });
    const md5 = await calculateMD5(processedFile, (percent) => {
      onProgress?.({ stage: "md5", percent });
    });

    // 3. 上传到 OSS（init → upload → complete）
    onProgress?.({ stage: "upload", percent: 0 });
    const ossFile = await uploadToOSS(
      processedFile,
      md5,
      (percent) => {
        onProgress?.({ stage: "upload", percent });
      },
      options.isPrivate,
      options.location as UploadLocation | undefined
    );

    // 4. 生成 Blurhash（仅图片）
    if (processedFile.type.startsWith("image/")) {
      try {
        onProgress?.({ stage: "blurhash", percent: 0 });
        const blurhash = await generateBlurhash(processedFile);
        if (blurhash) {
          ossFile.blurhash = blurhash;
        }
        onProgress?.({ stage: "blurhash", percent: 100 });
      } catch {
        // blurhash 失败不影响上传
      }
    }

    onProgress?.({ stage: "save", percent: 100 });
    return ossFile;
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    throw new UploadError(
      error instanceof Error ? error.message : "上传失败",
      UploadErrorCode.UPLOAD_FAILED,
      "upload"
    );
  }
}

/**
 * 批量上传文件（带重试机制）
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions = {},
  maxRetries = 3
): Promise<OSSFile[]> {
  const results: OSSFile[] = [];

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
          await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
        }
      }
    }

    if (!success && lastError) {
      throw lastError;
    }
  }

  return results;
}
