import { to } from '@iceywu/utils'
import { ref } from 'vue'
import { fileUpdate } from '~/api/ossUpload'
import { uploadFile } from '~/utils/uploadAli'

/**
 * 文件上传状态
 */
interface UploadState {
  /** 上传进度百分比 */
  percent: number
  /** 上传文本提示 */
  text: string
  /** 是否显示上传加载 */
  showLoading: boolean
}

/**
 * 文件项接口
 */
interface FileItem {
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
 * 上传进度回调参数
 */
interface UploadProgress {
  percent: number
  stage?: 'upload' | 'blushHash'
}

/**
 * 文件上传 Composable
 */
export function useFileUpload() {
  const uploadState = ref<UploadState>({
    percent: 0,
    text: '上传中...',
    showLoading: false,
  })

  /**
   * 上传单个文件
   * @param file 文件对象
   * @param onProgress 进度回调
   */
  async function uploadSingleFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void,
  ): Promise<FileItem | null> {
    try {
      const result = await uploadFile(file, (res: any) => {
        const { percent, stage = 'upload' } = res
        if (onProgress) {
          onProgress({ percent, stage })
        }
      }) as any

      return result
    }
    catch (error) {
      console.error('文件上传失败:', error)
      return null
    }
  }

  /**
   * 批量上传文件
   * @param files 文件列表
   */
  async function uploadMultipleFiles(files: File[]): Promise<FileItem[]> {
    uploadState.value.percent = 0
    uploadState.value.showLoading = true

    const uploadedFiles: FileItem[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const result = await uploadSingleFile(files[i], (res) => {
					const { percent, stage = 'upload' } = res
          const nowPart = (i + 1) / files.length
          uploadState.value.percent = percent * nowPart
          uploadState.value.text = stage === 'upload' ? '上传中...' : '生成blushHash...'
        })

        if (result) {
          uploadedFiles.push(result)
        }
      }
    }
    finally {
      uploadState.value.showLoading = false
    }

    return uploadedFiles
  }

  /**
   * 更新文件的视频源
   * @param fileId 文件ID
   * @param videoSrc 视频源URL
   */
  async function updateFileVideoSrc(fileId: string, videoSrc: string): Promise<string | null> {
    try {
      const updateParams = {
        id: fileId,
        videoSrc,
      }

      const [_error, response] = await to(fileUpdate(updateParams))

      if ((response as any)?.code === 200) {
        return (response as any).result.videoSrc
      }

      return null
    }
    catch (error) {
      console.error('更新文件视频源失败:', error)
      return null
    }
  }

  return {
    uploadState,
    uploadSingleFile,
    uploadMultipleFiles,
    updateFileVideoSrc,
  }
}
