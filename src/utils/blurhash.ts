// 验证blurhash字符串是否有效
export const isValidBlurhash = (hash: string): boolean => {
  if (!hash || typeof hash !== "string") {
    return false;
  }

  // blurhash必须至少6个字符
  if (hash.length < 6) {
    return false;
  }

  // 检查是否只包含有效的base83字符
  const validChars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";
  for (let i = 0; i < hash.length; i++) {
    if (!validChars.includes(hash[i])) {
      return false;
    }
  }

  return true;
};

// 生成默认的blurhash（灰色渐变）
export const getDefaultBlurhash = (): string => "L9AB*A~q00~q009F~q~q00~q~q~q";
