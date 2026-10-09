import { analyzeMedia } from "@life-palette/media";
import {
  type UploadedFile as ApiUploadedFile,
  type UploadProgress as ApiUploadProgress,
  compressImage,
  createUploader,
  detectLivePhotoPairs,
} from "@life-palette/uploader";
import { config } from "@/config/env";
import { filesApi } from "@/services/api";

export const uploader = createUploader({
  apiBaseUrl: config.API_BASE_URL,
  getToken: () => localStorage.getItem("auth_token"),
});

export interface UploadedFile extends ApiUploadedFile {
  blurhash?: string | null;
  height?: number | null;
  width?: number | null;
}

export type UploadStage =
  | ApiUploadProgress["stage"]
  | "compress"
  | "analyze"
  | "complete";
export interface UploadProgress {
  percent: number;
  stage: UploadStage;
}

export interface MediaUploadOptions {
  compress?: boolean;
  isPrivate?: boolean;
  location?: { lat: number; lng: number };
  maxSizeMB?: number;
  onProgress?: (progress: UploadProgress) => void;
}

export const DEFAULT_UPLOAD_OPTIONS = {
  compress: true,
  isPrivate: false,
  maxSizeMB: 1,
} as const;

export async function uploadMedia(
  file: File,
  options: MediaUploadOptions = {}
): Promise<UploadedFile> {
  const compressionWeight = options.compress ? 10 : 0;
  if (options.compress) {
    options.onProgress?.({ percent: 0, stage: "compress" });
  }
  const processed = options.compress
    ? await compressImage(file, {
        maxSizeMB: options.maxSizeMB,
        onProgress: (percent) =>
          options.onProgress?.({
            percent: Math.round(percent * 0.1),
            stage: "compress",
          }),
      })
    : file;
  if (options.compress) {
    options.onProgress?.({ percent: compressionWeight, stage: "compress" });
  }
  const metadata = await analyzeMedia(processed, {
    colorCount: 5,
    includeRawExif: true,
    onProgress: ({ percent, stage }) => {
      options.onProgress?.({
        percent: Math.round(
          compressionWeight +
            (stage === "md5"
              ? percent * 0.1
              : 10 + percent * ((20 - compressionWeight) / 100))
        ),
        stage: stage === "md5" ? "md5" : "analyze",
      });
    },
  });
  if (options.location) {
    if (metadata.image) {
      Object.assign(metadata.image.exif, options.location);
    } else if (metadata.video) {
      metadata.video.exif = { ...metadata.video.exif, ...options.location };
    }
  }
  const ranges = {
    completing: [90, 10],
    initializing: [30, 10],
    md5: [30, 0],
    uploading: [40, 50],
  } as const;
  return uploader.upload(processed, {
    checksum: metadata.basic.md5,
    isPrivate: options.isPrivate ?? false,
    metadata,
    onProgress: ({ percent, stage }) => {
      const [start, weight] = ranges[stage];
      options.onProgress?.({
        percent: Math.round(start + (percent / 100) * weight),
        stage,
      });
    },
  });
}

export async function linkLivePhotoPairs(files: UploadedFile[]) {
  for (const { image, video } of detectLivePhotoPairs(files)) {
    // biome-ignore lint/performance/noAwaitInLoops: link each pair after both files are persisted
    await filesApi.update(image.uid, { live_photo_video_sec_uid: video.uid });
  }
}

// biome-ignore lint/performance/noBarrelFile: exposes the package pairing utility used by the media picker
export { detectLivePhotoPairs } from "@life-palette/uploader";
