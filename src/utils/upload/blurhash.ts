import { encode } from "blurhash";

/**
 * 从图片 URL 加载图片
 */
async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("图片加载失败"));
    img.src = src;
    img.setAttribute("crossOrigin", "anonymous");
  });
}

/**
 * 从图片元素获取 ImageData
 */
function getImageData(image: HTMLImageElement): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("无法创建 Canvas 上下文");
  }

  context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, image.width, image.height);
}

/**
 * 从图片 URL 生成 Blurhash
 */
export async function encodeImageToBlurhash(imageUrl: string): Promise<string> {
  const image = await loadImage(imageUrl);
  const imageData = getImageData(image);
  return encode(imageData.data, imageData.width, imageData.height, 4, 4);
}

/**
 * 从文件生成 Blurhash
 * @param file 图片文件
 * @param maxWidth 最大宽度（用于压缩）
 * @returns Blurhash 字符串
 */
export async function generateBlurhash(file: File, maxWidth = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // 如果图片宽度超过最大宽度，按比例缩放
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.ceil(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("无法创建 Canvas 上下文"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const blurhash = encode(imageData.data, width, height, 4, 3);
        resolve(blurhash);
      } catch (error) {
        reject(error);
      } finally {
        // 清理对象 URL
        URL.revokeObjectURL(img.src);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("图片加载失败"));
    };

    img.src = URL.createObjectURL(file);
  });
}
