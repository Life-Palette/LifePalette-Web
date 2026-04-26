import type { PostImage } from "@/types";

// 颜色项类型
export interface ColorItem {
  count: number;
  hex: string;
  id: number;
  isPrimary?: boolean;
  percentage?: number;
  // 代表图片（用于卡片背景）
  representativeImage?: {
    url: string;
    blurhash?: string;
  };
  rgb?: { r: number; g: number; b: number };
}

// 文件项类型 - 与 PostImage 兼容
export interface FileItem extends PostImage {}

// 计算颜色亮度
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return 0;
  }
  const { r, g, b } = rgb;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// hex转rgb
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null;
}
