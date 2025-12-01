const DMS_PATTERN = /(-?\d+)deg (\d+)' (-?\d+\.\d+)"/;
const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3600;

function parseDms(dms: string): number {
  const dmsPattern = DMS_PATTERN;
  const match = dms.match(dmsPattern);

  if (match) {
    const degrees = Number.parseInt(match[1], 10);
    const minutes = Number.parseInt(match[2], 10);
    const seconds = Number.parseFloat(match[3]);

    const decimalDegrees = degrees + minutes / SECONDS_IN_MINUTE + seconds / SECONDS_IN_HOUR;

    return decimalDegrees;
  }
  return 0;
}

// 通过exif获取经纬度
export function getLngLat(exifData: Record<string, any>): number[] {
  const { GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef } = exifData;
  let tempData: number[] = [];

  if (GPSLatitude?.value && GPSLongitude?.value) {
    let lat = parseDms(GPSLatitude.value);
    let lng = parseDms(GPSLongitude.value);
    const latRef = GPSLatitudeRef;
    const lngRef = GPSLongitudeRef;

    if (latRef === "S") {
      lat = -lat;
    }
    if (lngRef === "W") {
      lng = -lng;
    }
    tempData = [lng, lat];
  }
  return tempData;
}

export function getCover(data: Record<string, any>) {
  // 简化版本的图片数据处理，根据实际需要调整
  return {
    preSrc: data?.url || data?.preSrc,
    url: data?.url,
    blurhash: data?.blurhash,
  };
}

export function isEmpty(value: unknown): boolean {
  if (value == null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }
  if (typeof value === "string") {
    return value.trim().length === 0;
  }
  return false;
}

export function customDestr<T = unknown>(
  obj: unknown,
  options: { customVal?: T } = {},
): T | Record<string, unknown> {
  if (!obj) {
    return (options.customVal as T) || {};
  }
  if (typeof obj === "string") {
    try {
      return JSON.parse(obj) as T;
    } catch {
      return (options.customVal as T) || {};
    }
  }
  return obj as T;
}
