export interface PostImage {
  id: number;
  url: string;
  width: number;
  height: number;
  blurhash: string;
  type: string;
  name: string;
  lat?: number;
  lng?: number;
  videoSrc?: string | null; // 实况照片的视频源
}

export interface Post {
  id: string;
  title: string;
  content: string;
  images?: PostImage[];
  fileIds?: (number | string)[];
  author: {
    id?: number;
    name: string;
    avatar: string;
  };
  tags?: string[];
  likes: number;
  comments: number;
  saves: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt?: string;
  location?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
}

// 用户资料更新相关类型
export interface UpdateProfileData {
  name?: string;
  signature?: string;
  avatarFile?: File | null;
  backgroundFile?: File | null;
  mobile?: string;
  email?: string;
  sex?: number;
  birthday?: string;
  city?: string;
  job?: string;
  company?: string;
  website?: string;
  github?: string;
  avatarFileMd5?: string;
  backgroundInfoFileMd5?: string;
  code?: string; // 邮箱验证码，更改邮箱时需要
}

export interface FormErrors {
  name?: string;
  signature?: string;
  avatar?: string;
  background?: string;
  mobile?: string;
  email?: string;
}

// 通知相关类型
export interface NotificationUserInfo {
  id: number;
  mobile?: string;
  name: string;
  password?: string;
  avatar?: string;
  github?: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  sex: number;
  birthday?: string | null;
  city?: string | null;
  job?: string | null;
  company?: string | null;
  signature?: string | null;
  email?: string | null;
  website?: string | null;
  freezed: boolean;
  uuId?: string | null;
  background?: string | null;
  chatRoomId?: number | null;
  avatarFileMd5?: string;
  backgroundInfoFileMd5?: string;
  username?: string | null;
  userId?: number | null;
  openid?: string;
  ipInfoId?: number;
}

export interface NotificationObjectInfo {
  id: number;
  title: string;
  content: string;
  extraData?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  isPinned?: boolean;
}

export interface NotificationMessage {
  id: number;
  type: "like" | "comment" | "collection" | "follow";
  content: string;
  createdAt: string;
  updatedAt: string;
  senderId: number;
  receiverId: number;
  isRead: boolean;
  objId: number;
  sendUserInfo: NotificationUserInfo;
  receiveUserInfo: NotificationUserInfo;
  objInfo: NotificationObjectInfo;
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

// 标签相关类型
export interface Tag {
  id: number;
  title: string;
  cover: string;
  thumbnailPath?: string;
  createdAt: string;
  updatedAt: string;
  topicsCount?: number;
}

// 导出聊天相关类型
export * from "./chat";
