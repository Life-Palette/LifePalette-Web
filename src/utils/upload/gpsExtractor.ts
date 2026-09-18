import initMetaprobe, { extractMetaFastSized } from "metaprobe";

/**
 * GPS坐标信息
 */
export interface GPSCoordinates {
  lat: number;
  lng: number;
}

interface ExifGPSValue {
  GPSLatitude?: unknown;
  GPSLatitudeRef?: unknown;
  GPSLongitude?: unknown;
  GPSLongitudeRef?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

/** 将 EXIF 常见的十进制、度分秒或数组格式统一成十进制度。 */
function parseGPSCoordinate(value: unknown, reference: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    const parts = value.map(Number);
    if (parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)) {
      const [degrees, minutes, seconds] = parts;
      const result = Math.abs(degrees) + minutes / 60 + seconds / 3600;
      return String(reference).toUpperCase().startsWith("S") ||
        String(reference).toUpperCase().startsWith("W")
        ? -result
        : result;
    }
  }

  if (typeof value !== "string") {
    return null;
  }

  const text = value.trim();
  const dms = text.match(
    /(-?\d+(?:\.\d+)?)\s*(?:deg|°)\s*(\d+(?:\.\d+)?)?\s*(?:['′’]|min)?\s*(\d+(?:\.\d+)?)?\s*(?:["″”]|sec)?\s*([NSEW])?/i
  );
  if (dms) {
    const degrees = Number(dms[1]);
    const minutes = Number(dms[2] || 0);
    const seconds = Number(dms[3] || 0);
    const result = Math.abs(degrees) + minutes / 60 + seconds / 3600;
    const direction = (dms[4] || String(reference)).toUpperCase();
    return direction.startsWith("S") || direction.startsWith("W") ? -result : result;
  }

  const decimal = Number.parseFloat(text);
  if (Number.isFinite(decimal)) {
    const direction = String(reference).toUpperCase();
    return direction.startsWith("S") || direction.startsWith("W") ? -Math.abs(decimal) : decimal;
  }

  return null;
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
    ) as { exif?: ExifGPSValue };
    const latitude = parseGPSCoordinate(
      metadata.exif?.latitude ?? metadata.exif?.GPSLatitude,
      metadata.exif?.GPSLatitudeRef
    );
    const longitude = parseGPSCoordinate(
      metadata.exif?.longitude ?? metadata.exif?.GPSLongitude,
      metadata.exif?.GPSLongitudeRef
    );

    // 检查是否有有效的GPS坐标
    if (latitude !== null && longitude !== null) {
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
