import { isEmpty } from '@iceywu/utils'

/**
 * 文件项接口
 */
export interface FileItem {
  id: string
  name: string
  type: string
  url: string
  videoSrc?: string
  fileType?: string
  file?: string
  thumbnail?: string
  cover?: string
  [key: string]: any
}

/**
 * 文件名信息
 */
interface FileNameInfo {
  /** 文件名(不含扩展名) */
  name: string
  /** 文件扩展名 */
  extension: string
  /** 是否为视频文件 */
  isVideo: boolean
}

/**
 * 解析文件名
 * @param fileName 完整文件名
 * @returns 文件名信息
 */
export function parseFileName(fileName: string): FileNameInfo {
  const parts = fileName.split('.')
  const extension = parts.pop() || ''
  const name = parts.join('.')

  return {
    name,
    extension,
    isVideo: ['MOV', 'MP4', 'AVI', 'MKV'].includes(extension.toUpperCase()),
  }
}

/**
 * 查找匹配的图片文件
 * @param videoFile 视频文件
 * @param fileList 文件列表
 * @returns 匹配的图片文件索引，未找到返回 -1
 */
export function findMatchingImageFile(
  videoFile: FileItem,
  fileList: FileItem[],
): number {
  const videoNameInfo = parseFileName(videoFile.name)

  return fileList.findIndex((file) => {
    const fileNameInfo = parseFileName(file.name)
    // 文件名相同但扩展名不同，且不是视频文件
    return (
      fileNameInfo.name === videoNameInfo.name
      && !fileNameInfo.isVideo
    )
  })
}

/**
 * 处理 Live Photo 文件关联
 * 将 MOV 视频文件与对应的图片文件关联
 * @param uploadedFiles 上传的文件列表
 * @param updateVideoSrc 更新视频源的回调函数
 * @returns 处理后的文件列表
 */
export async function processLivePhotoFiles(
  uploadedFiles: FileItem[],
  updateVideoSrc: (fileId: string, videoSrc: string) => Promise<string | null>,
): Promise<FileItem[]> {
  const processedFiles: FileItem[] = []
  const processedIds = new Set<string>()

  for (const file of uploadedFiles) {
    const fileNameInfo = parseFileName(file.name)

    // 如果是 MOV 视频文件
    if (fileNameInfo.extension.toUpperCase() === 'MOV') {
      // 查找对应的图片文件
      const matchingImageIndex = findMatchingImageFile(file, uploadedFiles)

      if (matchingImageIndex !== -1) {
        const imageFile = uploadedFiles[matchingImageIndex]

        // 如果图片文件已经有视频源，跳过视频文件
        if (!isEmpty(imageFile.videoSrc)) {
          continue
        }

        // 更新图片文件的视频源
        const updatedVideoSrc = await updateVideoSrc(imageFile.id, file.url)

        if (updatedVideoSrc) {
          // 创建更新后的文件对象
          const updatedImageFile = {
            ...imageFile,
            videoSrc: updatedVideoSrc,
          }

          // 如果该图片已经被处理过，替换它
          const existingIndex = processedFiles.findIndex(
            item => item.id === updatedImageFile.id,
          )

          if (existingIndex !== -1) {
            processedFiles[existingIndex] = updatedImageFile
          }
          else {
            processedFiles.push(updatedImageFile)
          }

          processedIds.add(imageFile.id)
        }
      }
      else {
        // 没有找到匹配的图片，添加视频文件本身
        if (!processedIds.has(file.id)) {
          processedFiles.push(file)
          processedIds.add(file.id)
        }
      }
    }
    else {
      // 非 MOV 文件，直接添加
      if (!processedIds.has(file.id)) {
        processedFiles.push(file)
        processedIds.add(file.id)
      }
    }
  }

  return processedFiles
}

/**
 * 合并文件列表，避免重复
 * @param existingFiles 现有文件列表
 * @param newFiles 新文件列表
 * @returns 合并后的文件列表
 */
export function mergeFileList(
  existingFiles: FileItem[],
  newFiles: FileItem[],
): FileItem[] {
  const mergedFiles = [...existingFiles]
  const existingIds = new Set(existingFiles.map(file => file.id))

  for (const newFile of newFiles) {
    if (!existingIds.has(newFile.id)) {
      mergedFiles.push(newFile)
    }
  }

  return mergedFiles
}

/**
 * 从文件列表中移除指定索引的文件
 * @param fileList 文件列表
 * @param index 要移除的索引
 * @returns 新的文件列表
 */
export function removeFileByIndex(
  fileList: FileItem[],
  index: number,
): FileItem[] {
  return fileList.filter((_, i) => i !== index)
}

/**
 * 提取文件 ID 列表
 * @param fileList 文件列表
 * @returns ID 数组
 */
export function extractFileIds(fileList: FileItem[]): string[] {
  return fileList.map(file => file.id)
}
