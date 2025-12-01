import type { PostImage } from "@/types";

/**
 * Determines if a PostImage is a video file
 * @param image - The PostImage object to check
 * @returns true if the image is a video file, false otherwise
 */
export function isVideo(image: PostImage): boolean {
  return image.type?.startsWith("video/") || false;
}

/**
 * Determines if a PostImage is a live photo
 * @param image - The PostImage object to check
 * @returns true if the image is a live photo, false otherwise
 */
export function isLivePhoto(image: PostImage): boolean {
  return !!(image.videoSrc && !isVideo(image));
}

/**
 * Generates OSS video frame capture URL
 * Captures frame at 1 second, returns JPG format
 * @param videoUrl - The original video URL
 * @returns URL with OSS video snapshot parameters
 */
export function getVideoThumbnailUrl(videoUrl: string): string {
  return `${videoUrl}?x-oss-process=video/snapshot,t_1000,f_jpg,w_0,h_0,m_fast`;
}

/**
 * Returns the appropriate display URL for a media item
 * - For videos: returns frame capture URL
 * - For images: returns original URL
 * @param image - The PostImage object
 * @returns The appropriate URL for display
 */
export function getMediaDisplayUrl(image: PostImage): string {
  if (isVideo(image)) {
    return getVideoThumbnailUrl(image.url);
  }
  return image.url;
}

/**
 * Generates OSS image processing parameters for optimization
 * @param originalWidth - Original image width
 * @param originalHeight - Original image height
 * @param targetWidth - Target width for resizing
 * @param quality - Image quality (1-100), default 10
 * @returns OSS image processing parameter string
 */
export function generateOssImageParams(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  quality: number = 10,
): string {
  const targetHeight = Math.round((originalHeight / originalWidth) * targetWidth);
  return `?x-oss-process=image/resize,w_${targetWidth},h_${targetHeight},m_lfit/quality,q_${quality}/format,webp`;
}
