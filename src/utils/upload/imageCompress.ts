import imageCompression from "browser-image-compression";

/**
 * 压缩图片配置
 */
export interface CompressOptions {
  /** 最大文件大小（MB） */
  maxSizeMB?: number;
  /** 最大宽度或高度 */
  maxWidthOrHeight?: number;
  /** 是否使用 WebWorker */
  useWebWorker?: boolean;
}

/**
 * 检查文件是否为 PNG 格式
 */
export async function isPNG(file: File): Promise<boolean> {
  return file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
}

/**
 * 检查文件是否为 JPEG 格式
 */
export function isJPEG(file: File): boolean {
  return (
    file.type === "image/jpeg" ||
    file.name.toLowerCase().endsWith(".jpg") ||
    file.name.toLowerCase().endsWith(".jpeg")
  );
}

/**
 * 压缩图片
 * @param file 原始文件
 * @param options 压缩配置
 * @returns 压缩后的文件
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const { maxSizeMB = 1, maxWidthOrHeight = 1920, useWebWorker = true } = options;

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
    });

    return compressedFile;
  } catch (error) {
    console.error("图片压缩失败:", error);
    // 压缩失败时返回原文件
    return file;
  }
}

/**
 * 根据文件类型和大小决定是否需要压缩
 * @param file 文件对象
 * @returns 是否需要压缩
 */
export function shouldCompress(file: File): boolean {
  const isPng = file.type === "image/png";
  const isJpeg = isJPEG(file);
  const isLargeJpeg = isJpeg && file.size > 18 * 1024 * 1024; // 18MB

  return isPng || isLargeJpeg;
}
