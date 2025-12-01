// 用户资料验证规则
export const PROFILE_VALIDATION = {
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 20,
  },
  SIGNATURE: {
    MAX_LENGTH: 100,
  },
  AVATAR: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp"],
    COMPRESSION: {
      MAX_SIZE_MB: 1,
      MAX_WIDTH_OR_HEIGHT: 800,
    },
  },
} as const;

// 错误消息
export const VALIDATION_MESSAGES = {
  NAME_REQUIRED: "昵称不能为空",
  NAME_TOO_LONG: "昵称不能超过20个字符",
  SIGNATURE_TOO_LONG: "签名不能超过100个字符",
  AVATAR_INVALID_TYPE: "请选择 JPG、PNG 或 WEBP 格式的图片",
  AVATAR_TOO_LARGE: "图片大小不能超过 5MB",
} as const;
