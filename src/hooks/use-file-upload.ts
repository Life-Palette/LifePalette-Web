import { useCallback, useState } from "react";
import {
  type OSSFile,
  type UploadProgress,
  type UploadStage,
  uploader,
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
  compress: "压缩中...",
  md5: "计算 MD5...",
  upload: "上传中...",
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
      options?: {
        analyze?: boolean;
        compress?: boolean;
        maxSizeMB?: number;
        isPrivate?: boolean;
      }
    ): Promise<OSSFile | null> => {
      try {
        setUploadState({
          error: null,
          isUploading: true,
          progress: 0,
          stage: "",
          stageText: "准备上传...",
        });
        const result = await uploader.upload(file, {
          ...options,
          analyze: options?.analyze ?? false,
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
      options?: {
        analyze?: boolean;
        compress?: boolean;
        maxSizeMB?: number;
        isPrivate?: boolean;
      },
      locationMap?: Map<File, { lat: number; lng: number }>
    ): Promise<OSSFile[]> => {
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
        const results: OSSFile[] = [];
        const total = files.length;

        for (let i = 0; i < files.length; i += 1) {
          const fileLocation = locationMap?.get(files[i]);
          // biome-ignore lint/performance/noAwaitInLoops: uploads are intentionally sequential to preserve progress order
          const result = await uploader.upload(files[i], {
            ...options,
            analyze: options?.analyze ?? false,
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

        setUploadState({
          error: null,
          isUploading: false,
          progress: 100,
          stage: "complete",
          stageText: "全部上传完成",
        });
        // 上传完成后自动关联实况照片
        await uploader.associateLivePhotos(results);
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
