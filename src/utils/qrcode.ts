import QRCode from "qrcode";

/**
 * 生成二维码图片URL
 * @param data 要编码的数据
 * @returns Promise<string> 返回base64格式的图片URL
 */
export async function generateQRCodeImage(data: {
  key: string;
  copyright?: string;
  function?: string;
}): Promise<string> {
  try {
    const qrData = JSON.stringify({
      ...data,
      copyright: "app",
      function: "pc_login",
    });

    const url = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return url;
  } catch (error) {
    console.error("QR Code generation failed:", error);
    throw new Error("二维码生成失败");
  }
}
