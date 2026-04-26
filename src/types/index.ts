export interface PostImage {
  blurhash: string;
  height: number;
  lat?: number;
  lng?: number;
  name: string;
  sec_uid: string;
  type: string;
  url: string;
  videoSrc?: string | null; // 实况照片的视频源
  width: number;
}

export interface Post {
  author: {
    id?: number;
    name: string;
    avatar: string;
  };
  comments: number;
  content: string;
  contentType?: string;
  createdAt: string;
  file_sec_uids?: string[];
  id: string;
  images?: PostImage[];
  isLiked: boolean;
  isSaved: boolean;
  likes: number;
  location?: string;
  saves: number;
  tags?: string[];
  title: string;
  updatedAt?: string;
}

export interface Comment {
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  id: string;
  isLiked: boolean;
  likes: number;
  postId: string;
}

// 用户资料更新相关类型
export interface UpdateProfileData {
  avatarFile?: File | null;
  backgroundFile?: File | null;
  birthday?: string;
  city?: string;
  company?: string;
  email?: string;
  job?: string;
  lp_id?: string;
  mobile?: string;
  name?: string;
  sex?: number;
  signature?: string;
  website?: string;
}

export interface FormErrors {
  avatar?: string;
  background?: string;
  email?: string;
  mobile?: string;
  name?: string;
  signature?: string;
}

// 通知相关类型
export interface NotificationUserInfo {
  avatar?: string;
  avatarFileMd5?: string;
  background?: string | null;
  backgroundInfoFileMd5?: string;
  birthday?: string | null;
  chatRoomId?: number | null;
  city?: string | null;
  company?: string | null;
  createdAt: string;
  email?: string | null;
  freezed: boolean;
  github?: string | null;
  id: number;
  ipInfoId?: number;
  job?: string | null;
  mobile?: string;
  name: string;
  openid?: string;
  password?: string;
  role: string;
  sex: number;
  signature?: string | null;
  updatedAt: string;
  userId?: string | null;
  username?: string | null;
  uuId?: string | null;
  website?: string | null;
}

export interface NotificationObjectInfo {
  content: string;
  createdAt: string;
  extraData?: string;
  id: number;
  isPinned?: boolean;
  title: string;
  updatedAt: string;
  userId: string;
}

export interface NotificationMessage {
  content: string;
  createdAt: string;
  id: number;
  isRead: boolean;
  objId: number;
  objInfo: NotificationObjectInfo;
  receiverId: number;
  receiveUserInfo: NotificationUserInfo;
  senderId: number;
  sendUserInfo: NotificationUserInfo;
  type: "like" | "comment" | "collection" | "follow";
  updatedAt: string;
}

export interface NotificationListResponse {
  list: NotificationMessage[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 更新日志相关类型
export type ChangelogType = "feature" | "bugfix" | "improvement" | "breaking";

export interface Changelog {
  content: string;
  createdAt: string;
  id?: number;
  isPublished: boolean;
  publishedAt: string | null;
  title: string;
  type: ChangelogType;
  updatedAt: string;
  version: string;
}

// 标签相关类型
export interface Tag {
  cover: string;
  createdAt: string;
  id: number;
  thumbnailPath?: string;
  title: string;
  topicsCount?: number;
  updatedAt: string;
}

// 导出聊天相关类型
export * from "./chat";
