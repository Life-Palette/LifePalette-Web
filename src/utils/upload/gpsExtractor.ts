import initMetaprobe, { extractMetaFastSized } from "metaprobe";

/**
 * GPS坐标信息
 */
export interface GPSCoordinates {
  lat: number;
  lng: number;
}

/**
 * 从图片文件中提取GPS坐标信息
 * @param file 图片文件
 * @returns GPS坐标，如果没有GPS信息则返回null
 */
export async function extractGPSFromImage(file: File): Promise<GPSCoordinates | null> {
  try {
    // 只处理图片文件
    if (!file.type.startsWith("image/")) {
      return null;
    }

    await initMetaprobe();
    const metadata = extractMetaFastSized(
      new Uint8Array(await file.arrayBuffer()),
      file.name,
      file.size
    ) as { exif?: { latitude?: unknown; longitude?: unknown; GPSLatitude?: unknown; GPSLongitude?: unknown } };
    const latitude = Number(metadata.exif?.latitude ?? metadata.exif?.GPSLatitude);
    const longitude = Number(metadata.exif?.longitude ?? metadata.exif?.GPSLongitude);

    // 检查是否有有效的GPS坐标
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return {
        lat: latitude,
        lng: longitude,
      };
    }

    return null;
  } catch (error) {
    console.error("提取GPS信息失败:", error);
    return null;
  }
}

/**
 * 检查图片文件是否包含GPS信息
 * @param file 图片文件
 * @returns 是否包含GPS信息
 */
export async function hasGPSData(file: File): Promise<boolean> {
  const gps = await extractGPSFromImage(file);
  return gps !== null;
}

/**
 * 批量检查多个文件的GPS信息
 * @param files 文件数组
 * @returns 每个文件的GPS信息状态
 */
export async function batchCheckGPS(files: File[]): Promise<Map<File, GPSCoordinates | null>> {
  const results = new Map<File, GPSCoordinates | null>();

  await Promise.all(
    files.map(async (file) => {
      const gps = await extractGPSFromImage(file);
      results.set(file, gps);
    })
  );

  return results;
}
