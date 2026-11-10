export interface UploadLocation {
  lat: number;
  lng: number;
}

export function isValidUploadLocation(
  location?: { lat?: number | null; lng?: number | null } | null
): location is UploadLocation {
  return (
    typeof location?.lat === "number" &&
    Number.isFinite(location.lat) &&
    Math.abs(location.lat) <= 90 &&
    typeof location.lng === "number" &&
    Number.isFinite(location.lng) &&
    Math.abs(location.lng) <= 180
  );
}
