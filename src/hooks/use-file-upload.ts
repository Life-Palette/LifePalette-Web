import { useCallback, useState } from "react";
import {
  DEFAULT_UPLOAD_OPTIONS,
  linkLivePhotoPairs,
  type MediaUploadOptions,
  type UploadedFile,
  type UploadProgress,
  type UploadStage,
  uploadMedia,
} from "@/services/upload";

interface UploadState {
  error: Error | null;
  isUploading: boolean;
  progress: number;
  stage: UploadStage | "";
  stageText: string;
}

const STAGE_TEXT: Record<UploadStage, string> = {
  analyze: "分析媒体信息...",
  complete: "完成...",
  completing: "保存文件...",
  compress: "压缩图片...",
  initializing: "初始化上传...",
  md5: "计算 MD5...",
  uploading: "上传中...",
};

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    error: null,
    isUploading: false,
    progress: 0,
    stage: "",
    stageText: "",
  });

  const resetState = useCallback(() => {
    setUploadState({
      error: null,
      isUploading: false,
      progress: 0,
      stage: "",
      stageText: "",
    });
  }, []);

  const uploadSingleFile = useCallback(
    async (
      file: File,
      options?: MediaUploadOptions
    ): Promise<UploadedFile | null> => {
      try {
        setUploadState({
          error: null,
          isUploading: true,
          progress: 0,
          stage: "",
          stageText: "准备上传...",
        });
        const result = await uploadMedia(file, {
          ...DEFAULT_UPLOAD_OPTIONS,
          ...options,
          onProgress: (p: UploadProgress) => {
            setUploadState({
              error: null,
              isUploading: true,
              progress: p.percent,
              stage: p.stage,
              stageText: STAGE_TEXT[p.stage] || "处理中...",
            });
          },
        });
        setUploadState({
          error: null,
          isUploading: false,
          progress: 100,
          stage: "complete",
          stageText: "上传完成",
        });
        return result;
      } catch (error) {
        const err = error as Error;
        console.error("文件上传失败", err);
        setUploadState({
          error: err,
          isUploading: false,
          progress: 0,
          stage: "",
          stageText: "",
        });
        return null;
      }
    },
    []
  );

  const uploadMultipleFiles = useCallback(
    async (
      files: File[],
      options?: MediaUploadOptions,
      locationMap?: Map<File, { lat: number; lng: number }>
    ): Promise<UploadedFile[]> => {
      if (files.length === 0) {
        return [];
      }
      try {
        setUploadState({
          error: null,
          isUploading: true,
          progress: 0,
          stage: "",
          stageText: "准备上传...",
        });
        const results: UploadedFile[] = [];
        const total = files.length;

        for (let i = 0; i < files.length; i += 1) {
          const fileLocation = locationMap?.get(files[i]);
          // biome-ignore lint/performance/noAwaitInLoops: uploads are intentionally sequential to preserve progress order
          const result = await uploadMedia(files[i], {
            ...DEFAULT_UPLOAD_OPTIONS,
            ...options,
            location: fileLocation,
            onProgress: (p: UploadProgress) => {
              const totalProgress = ((i + p.percent / 100) / total) * 100;
              setUploadState({
                error: null,
                isUploading: true,
                progress: Math.round(totalProgress),
                stage: p.stage,
                stageText: `${STAGE_TEXT[p.stage]} (${i + 1}/${total})`,
              });
            },
          });
          results.push(result);
        }

        // 两个文件保存完成后再按当前文件接口关联实况照片。
        await linkLivePhotoPairs(results);
        setUploadState({
          error: null,
          isUploading: false,
          progress: 100,
          stage: "complete",
          stageText: "全部上传完成",
        });
        return results;
      } catch (error) {
        const err = error as Error;
        console.error("批量文件上传失败", err);
        setUploadState({
          error: err,
          isUploading: false,
          progress: 0,
          stage: "",
          stageText: "",
        });
        throw err;
      }
    },
    []
  );

  return { resetState, uploadMultipleFiles, uploadSingleFile, uploadState };
}
