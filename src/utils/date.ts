/**
 * 日期和时间相关的工具函数
 */

/**
 * 格式化相对时间
 * @param dateString - ISO 日期字符串
 * @returns 格式化后的相对时间文本
 *
 * @example
 * ```ts
 * formatRelativeTime('2024-01-10T10:00:00Z') // "2小时前"
 * ```
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInHours < 1) return "刚刚";
  if (diffInHours < 24) return `${diffInHours}小时前`;
  if (diffInDays === 0) return "今天";
  if (diffInDays === 1) return "昨天";
  if (diffInDays < 7) return `${diffInDays}天前`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}周前`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}个月前`;

  return `${Math.floor(diffInDays / 365)}年前`;
};

/**
 * 格式化距离现在的时间
 * @param date - Date 对象
 * @returns 格式化后的相对时间文本
 */
export const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return "刚刚";
  if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
  if (diffInHours < 24) return `${diffInHours}小时前`;
  if (diffInDays === 1) return "昨天";
  if (diffInDays < 7) return `${diffInDays}天前`;

  // 超过7天显示具体日期
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};
