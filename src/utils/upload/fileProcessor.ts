import { getFileType } from "@iceywu/utils";
import { updateFileInfo } from "@/services/upload/ossService";
import type { FileItem } from "@/types/upload";

/**
 * 文件名信息
 */
interface FileNameInfo {
  /** 文件名(不含扩展名) */
  name: string;
  /** 文件扩展名 */
  extension: string;
  /** 是否为视频文件 */
  isVideo: boolean;
}

/**
 * 解析文件名
 * @param fileName 完整文件名
 * @returns 文件名信息
 */
export function parseFileName(fileName: string): FileNameInfo {
  const parts = fileName.split(".");
  const extension = parts.pop() || "";
  const name = parts.join(".");

  return {
    name,
    extension,
    isVideo: getFileType(fileName) === "video",
  };
}

/**
 * 查找匹配的图片文件
 * @param videoFile 视频文件
 * @param fileList 文件列表
 * @returns 匹配的图片文件索引，未找到返回 -1
 */
export function findMatchingImageFile(videoFile: FileItem, fileList: FileItem[]): number {
  const videoNameInfo = parseFileName(videoFile.name);

  return fileList.findIndex((file) => {
    const fileNameInfo = parseFileName(file.name);
    // 文件名相同但扩展名不同，且不是视频文件
    return fileNameInfo.name === videoNameInfo.name && !fileNameInfo.isVideo;
  });
}

/**
 * 处理 Live Photo 文件关联
 * 将 MOV 视频文件与对应的图片文件关联
 * @param uploadedFiles 上传的文件列表
 * @returns 处理后的文件列表
 */
export async function processLivePhotoFiles(uploadedFiles: FileItem[]): Promise<FileItem[]> {
  const processedFiles: FileItem[] = [];
  const processedIds = new Set<string>();

  for (const file of uploadedFiles) {
    const fileNameInfo = parseFileName(file.name);

    // 如果是视频文件 (MOV, MP4, etc.)
    if (fileNameInfo.isVideo) {
      // 查找对应的图片文件
      const matchingImageIndex = findMatchingImageFile(file, uploadedFiles);

      if (matchingImageIndex !== -1) {
        const imageFile = uploadedFiles[matchingImageIndex];

        // 如果图片文件已经有视频源，直接使用该图片文件，跳过视频文件
        if (imageFile.videoSrc) {
          if (!processedIds.has(imageFile.id)) {
            processedFiles.push(imageFile);
            processedIds.add(imageFile.id);
          }
          continue;
        }

        // 检查是否是已上传的文件（hasUpload: true）
        const isAlreadyUploaded = "hasUpload" in file && file.hasUpload === true;

        if (isAlreadyUploaded) {
          // 已上传的文件，直接使用视频的 URL 更新图片
          const updatedImageFile = {
            ...imageFile,
            videoSrc: file.url,
          };

          const existingIndex = processedFiles.findIndex((item) => item.id === updatedImageFile.id);

          if (existingIndex !== -1) {
            processedFiles[existingIndex] = updatedImageFile;
          } else {
            processedFiles.push(updatedImageFile);
          }

          processedIds.add(imageFile.id);
        } else {
          // 新上传的文件，需要调用接口更新
          try {
            const response = await updateFileInfo({
              id: imageFile.id,
              videoSrc: file.url,
            });

            if (response.code === 200 && response.result.videoSrc) {
              // 创建更新后的文件对象
              const updatedImageFile = {
                ...imageFile,
                videoSrc: response.result.videoSrc,
              };

              // 如果该图片已经被处理过，替换它
              const existingIndex = processedFiles.findIndex(
                (item) => item.id === updatedImageFile.id,
              );

              if (existingIndex !== -1) {
                processedFiles[existingIndex] = updatedImageFile;
              } else {
                processedFiles.push(updatedImageFile);
              }

              processedIds.add(imageFile.id);
            }
          } catch (error) {
            console.error("更新视频源失败:", error);
            // 失败时添加原图片文件
            if (!processedIds.has(imageFile.id)) {
              processedFiles.push(imageFile);
              processedIds.add(imageFile.id);
            }
          }
        }
      } else {
        // 没有找到匹配的图片，添加视频文件本身
        if (!processedIds.has(file.id)) {
          processedFiles.push(file);
          processedIds.add(file.id);
        }
      }
    } else {
      // 非 MOV 文件，直接添加
      if (!processedIds.has(file.id)) {
        processedFiles.push(file);
        processedIds.add(file.id);
      }
    }
  }

  return processedFiles;
}

/**
 * 合并文件列表，避免重复
 * @param existingFiles 现有文件列表
 * @param newFiles 新文件列表
 * @returns 合并后的文件列表
 */
export function mergeFileList(existingFiles: FileItem[], newFiles: FileItem[]): FileItem[] {
  const mergedFiles = [...existingFiles];
  const existingIds = new Set(existingFiles.map((file) => file.id));

  for (const newFile of newFiles) {
    if (!existingIds.has(newFile.id)) {
      mergedFiles.push(newFile);
    }
  }

  return mergedFiles;
}

/**
 * 从文件列表中移除指定索引的文件
 * @param fileList 文件列表
 * @param index 要移除的索引
 * @returns 新的文件列表
 */
export function removeFileByIndex(fileList: FileItem[], index: number): FileItem[] {
  return fileList.filter((_, i) => i !== index);
}

/**
 * 提取文件 ID 列表
 * @param fileList 文件列表
 * @returns ID 数组
 */
export function extractFileIds(fileList: FileItem[]): string[] {
  return fileList.map((file) => file.id);
}

/**
 * 本地文件名解析
 */
export function parseLocalFileName(fileName: string): FileNameInfo {
  return parseFileName(fileName);
}

/**
 * 查找匹配的本地图片文件
 * @param videoFile 视频文件
 * @param fileList 本地文件列表
 * @returns 匹配的图片文件索引，未找到返回 -1
 */
export function findMatchingLocalImageFile(videoFile: File, fileList: File[]): number {
  const videoNameInfo = parseFileName(videoFile.name);

  return fileList.findIndex((file) => {
    const fileNameInfo = parseFileName(file.name);
    // 文件名相同但扩展名不同，且不是视频文件
    return fileNameInfo.name === videoNameInfo.name && !fileNameInfo.isVideo;
  });
}

/**
 * 本地文件 Live Photo 配对信息
 */
export interface LocalLivePhotoInfo {
  imageFile: File;
  videoFile: File;
  imageIndex: number;
  videoIndex: number;
}

/**
 * 检测本地文件中的 Live Photo 配对
 * @param files 本地文件列表
 * @returns Live Photo 配对信息数组
 */
export function detectLocalLivePhotos(files: File[]): LocalLivePhotoInfo[] {
  const livePhotos: LocalLivePhotoInfo[] = [];
  const processedIndices = new Set<number>();

  files.forEach((file, videoIndex) => {
    const fileNameInfo = parseFileName(file.name);

    // 如果是视频文件 (MOV, MP4, etc.)
    if (fileNameInfo.isVideo) {
      // 查找对应的图片文件
      const imageIndex = findMatchingLocalImageFile(file, files);

      if (imageIndex !== -1 && !processedIndices.has(imageIndex)) {
        livePhotos.push({
          imageFile: files[imageIndex],
          videoFile: file,
          imageIndex,
          videoIndex,
        });
        processedIndices.add(imageIndex);
        processedIndices.add(videoIndex);
      }
    }
  });

  return livePhotos;
}
