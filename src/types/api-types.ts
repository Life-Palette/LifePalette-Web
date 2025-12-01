/**
 * API 相关的类型定义
 */

// ============ 通用类型 ============

/**
 * 基础查询参数
 */
export interface BaseQueryParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * 分页数据
 */
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

/**
 * 无限查询数据
 */
export interface InfiniteQueryData<T> extends PaginatedData<T> {
  hasNextPage: boolean;
}

// ============ 话题相关类型 ============

/**
 * 话题查询参数
 */
export interface TopicQueryParams extends BaseQueryParams {
  title?: string;
  keywords?: string;
  tagId?: number;
  userId?: number;
  exif?: boolean;
}

/**
 * 创建话题数据
 */
export interface CreateTopicData {
  title: string;
  content: string;
  tags?: string[];
  fileIds?: (number | string)[];
  extraData?: string;
  isPinned?: boolean;
}

/**
 * 更新话题数据
 */
export interface UpdateTopicData {
  title?: string;
  content?: string;
  tags?: string[];
  fileIds?: (number | string)[];
  extraData?: string;
  isPinned?: boolean;
}

// ============ 用户相关类型 ============

/**
 * 更新用户资料数据
 */
export interface UpdateUserProfileData {
  name?: string;
  signature?: string;
  email?: string;
  mobile?: string;
  city?: string;
  job?: string;
  company?: string;
  website?: string;
  github?: string;
}

/**
 * 用户城市查询参数
 */
export interface UserCitiesParams {
  page?: number;
  limit?: number;
  sortBy?: "photoCount" | "lastVisitAt" | "firstVisitAt";
  sortOrder?: "asc" | "desc";
  country?: string;
}

// ============ 评论相关类型 ============

/**
 * 评论查询参数
 */
export interface CommentQueryParams extends BaseQueryParams {
  topicId?: number;
  userId?: number;
  parentId?: number;
}

/**
 * 创建评论数据
 */
export interface CreateCommentData {
  content: string;
  userId: number;
  topicId?: number;
  parentId?: number;
  replyToUserId?: number;
}

// ============ 通知相关类型 ============

/**
 * 通知查询参数
 */
export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
  type?: string;
  isRead?: boolean;
}

// ============ 标签相关类型 ============

/**
 * 标签查询参数
 */
export interface TagQueryParams extends BaseQueryParams {
  title?: string;
  tagId?: number;
}

// ============ 认证相关类型 ============

/**
 * 登录数据
 */
export interface LoginData {
  account: string;
  password: string;
}

/**
 * 验证码登录数据
 */
export interface LoginByCodeData {
  account: string;
  code: string;
}

/**
 * 注册数据
 */
export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  code: string;
}

/**
 * 重置密码数据
 */
export interface ResetPasswordData {
  account: string;
  code: string;
  password: string;
  password_confirm: string;
}

// ============ 文件上传相关类型 ============

/**
 * 上传文件响应
 */
export interface UploadFileResponse {
  id: number;
  name: string;
  url: string;
  width: number;
  height: number;
  blurhash: string;
  md5: string;
}
