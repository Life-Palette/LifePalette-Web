import { useCallback, useState } from "react";
import { uploadFile, uploadFiles } from "@/services/upload/uploadService";
import type { FileItem, UploadOptions, UploadProgress, UploadStage } from "@/types/upload";

/**
 * 上传状态
 */
interface UploadState {
  /** 是否正在上传 */
  isUploading: boolean;
  /** 上传进度 (0-100) */
  progress: number;
  /** 当前阶段 */
  stage: UploadStage | "";
  /** 阶段文本 */
  stageText: string;
  /** 错误信息 */
  error: Error | null;
}

/**
 * 阶段文本映射
 */
const STAGE_TEXT_MAP: Record<UploadStage, string> = {
  compress: "压缩中...",
  md5: "计算 MD5...",
  upload: "上传中...",
  blurhash: "生成预览...",
  save: "保存中...",
};

/**
 * 文件上传 Hook
 */
export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    stage: "",
    stageText: "",
    error: null,
  });

  /**
   * 重置上传状态
   */
  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      stage: "",
      stageText: "",
      error: null,
    });
  }, []);

  /**
   * 上传单个文件
   */
  const uploadSingleFile = useCallback(
    async (file: File, options?: Omit<UploadOptions, "onProgress">): Promise<FileItem | null> => {
      try {
        setUploadState({
          isUploading: true,
          progress: 0,
          stage: "",
          stageText: "准备上传...",
          error: null,
        });

        const result = await uploadFile(file, {
          ...options,
          onProgress: (progress: UploadProgress) => {
            setUploadState({
              isUploading: true,
              progress: progress.percent,
              stage: progress.stage,
              stageText: STAGE_TEXT_MAP[progress.stage] || "处理中...",
              error: null,
            });
          },
        });

        setUploadState({
          isUploading: false,
          progress: 100,
          stage: "save",
          stageText: "上传完成",
          error: null,
        });

        return result;
      } catch (error) {
        const err = error as Error;
        setUploadState({
          isUploading: false,
          progress: 0,
          stage: "",
          stageText: "",
          error: err,
        });
        console.error("文件上传失败:", err);
        return null;
      }
    },
    [],
  );

  /**
   * 批量上传文件
   */
  const uploadMultipleFiles = useCallback(
    async (files: File[], options?: Omit<UploadOptions, "onProgress">): Promise<FileItem[]> => {
      if (files.length === 0) {
        return [];
      }

      try {
        setUploadState({
          isUploading: true,
          progress: 0,
          stage: "",
          stageText: "准备上传...",
          error: null,
        });

        const uploadedFiles: FileItem[] = [];
        const totalFiles = files.length;

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileIndex = i + 1;

          const result = await uploadFile(file, {
            ...options,
            onProgress: (progress: UploadProgress) => {
              // 计算总体进度
              const fileProgress = progress.percent / 100;
              const totalProgress = ((i + fileProgress) / totalFiles) * 100;

              setUploadState({
                isUploading: true,
                progress: Math.round(totalProgress),
                stage: progress.stage,
                stageText: `${STAGE_TEXT_MAP[progress.stage]} (${fileIndex}/${totalFiles})`,
                error: null,
              });
            },
          });

          uploadedFiles.push(result);
        }

        setUploadState({
          isUploading: false,
          progress: 100,
          stage: "save",
          stageText: "全部上传完成",
          error: null,
        });

        return uploadedFiles;
      } catch (error) {
        const err = error as Error;
        setUploadState({
          isUploading: false,
          progress: 0,
          stage: "",
          stageText: "",
          error: err,
        });
        console.error("批量上传失败:", err);
        throw err;
      }
    },
    [],
  );

  return {
    uploadState,
    uploadSingleFile,
    uploadMultipleFiles,
    resetState,
  };
}
