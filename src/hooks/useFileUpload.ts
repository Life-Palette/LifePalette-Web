import { useCallback, useState } from "react";
import { type OSSFile, type UploadProgress, type UploadStage, uploader } from "@/services/upload";

interface UploadState {
  error: Error | null;
  isUploading: boolean;
  progress: number;
  stage: UploadStage | "";
  stageText: string;
}

const STAGE_TEXT: Record<UploadStage, string> = {
  compress: "压缩中...",
  md5: "计算 MD5...",
  upload: "上传中...",
  complete: "完成...",
};

export function useFileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    stage: "",
    stageText: "",
    error: null,
  });

  const resetState = useCallback(() => {
    setUploadState({ isUploading: false, progress: 0, stage: "", stageText: "", error: null });
  }, []);

  const uploadSingleFile = useCallback(
    async (
      file: File,
      options?: { compress?: boolean; maxSizeMB?: number; isPrivate?: boolean }
    ): Promise<OSSFile | null> => {
      try {
        setUploadState({
          isUploading: true,
          progress: 0,
          stage: "",
          stageText: "准备上传...",
          error: null,
        });
        const result = await uploader.upload(file, {
          ...options,
          onProgress: (p: UploadProgress) => {
            setUploadState({
              isUploading: true,
              progress: p.percent,
              stage: p.stage,
              stageText: STAGE_TEXT[p.stage] || "处理中...",
              error: null,
            });
          },
        });
        setUploadState({
          isUploading: false,
          progress: 100,
          stage: "complete",
          stageText: "上传完成",
          error: null,
        });
        return result;
      } catch (error) {
        const err = error as Error;
        setUploadState({ isUploading: false, progress: 0, stage: "", stageText: "", error: err });
        return null;
      }
    },
    []
  );

  const uploadMultipleFiles = useCallback(
    async (
      files: File[],
      options?: { compress?: boolean; maxSizeMB?: number; isPrivate?: boolean },
      locationMap?: Map<File, { lat: number; lng: number }>
    ): Promise<OSSFile[]> => {
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
        const results: OSSFile[] = [];
        const total = files.length;

        for (let i = 0; i < files.length; i++) {
          const fileLocation = locationMap?.get(files[i]);
          const result = await uploader.upload(files[i], {
            ...options,
            location: fileLocation,
            onProgress: (p: UploadProgress) => {
              const totalProgress = ((i + p.percent / 100) / total) * 100;
              setUploadState({
                isUploading: true,
                progress: Math.round(totalProgress),
                stage: p.stage,
                stageText: `${STAGE_TEXT[p.stage]} (${i + 1}/${total})`,
                error: null,
              });
            },
          });
          results.push(result);
        }

        setUploadState({
          isUploading: false,
          progress: 100,
          stage: "complete",
          stageText: "全部上传完成",
          error: null,
        });
        // 上传完成后自动关联实况照片
        await uploader.associateLivePhotos(results);
        return results;
      } catch (error) {
        const err = error as Error;
        setUploadState({ isUploading: false, progress: 0, stage: "", stageText: "", error: err });
        throw err;
      }
    },
    []
  );

  return { uploadState, uploadSingleFile, uploadMultipleFiles, resetState };
}
