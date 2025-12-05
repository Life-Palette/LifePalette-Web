// 默认头像路径
export const DEFAULT_AVATAR = {
  MALE: "/boy.png",
  FEMALE: "/girl.png",
};

/**
 * 根据用户信息获取头像 URL
 * @param user - 用户对象，包含 avatarInfo 和 sex 字段
 * @returns 头像 URL
 */
export function getUserAvatar(
  user?: {
    avatarInfo?: { url: string } | null;
    sex?: number;
  } | null,
): string {
  // 如果有自定义头像，使用自定义头像
  if (user?.avatarInfo?.url) {
    return user.avatarInfo.url;
  }

  // 根据性别返回默认头像
  // sex: 1 = 男, 2 = 女
  if (user?.sex === 2) {
    return DEFAULT_AVATAR.FEMALE;
  }

  // 默认返回男性头像
  return DEFAULT_AVATAR.MALE;
}

/**
 * 根据性别获取默认头像
 * @param sex - 性别：1 = 男, 2 = 女
 * @returns 默认头像 URL
 */
export function getDefaultAvatar(sex?: number): string {
  return sex === 2 ? DEFAULT_AVATAR.FEMALE : DEFAULT_AVATAR.MALE;
}
