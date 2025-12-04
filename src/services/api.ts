import { config } from "@/config/env";

const API_BASE_URL = config.API_BASE_URL;

// API响应基础类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  result: T;
  timestamp: number;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  list: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 话题相关类型
export interface ApiTopic {
  id: number;
  title: string;
  content: string;
  extraData: any;
  createdAt: string;
  updatedAt: string;
  userId: number;
  isPinned?: boolean;
  user: {
    id: number;
    username: string | null;
    name: string;
    sex: number;
    avatarInfo?: {
      id: number;
      url: string;
      blurhash: string;
      width: number;
      height: number;
    } | null;
    backgroundInfo?: {
      id: number;
      url: string;
      blurhash: string;
      width: number;
      height: number;
    } | null;
    ipInfo?: {
      country: string;
      regionName: string;
      city: string;
      createdAt: string;
      updatedAt: string;
    };
  };
  topicTags: Array<{
    tagId: number;
    topicId: number;
    createdAt: string;
    updatedAt: string;
    tag: {
      id: number;
      title: string;
      cover: string;
      thumbnailPath?: string;
      createdAt: string;
      updatedAt: string;
    };
  }>;
  fileList: Array<{
    id: number;
    name: string;
    type: string;
    url: string;
    width: number;
    height: number;
    blurhash: string;
    videoSrc?: string | null;
    fromIphone: boolean;
  }>;
  likesCount?: number;
  collectionsCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isCollected?: boolean;
  isCommented?: boolean;
}

// 点赞相关类型
export interface CreateLikeDto {
  topicId: number;
}

// 收藏相关类型
export interface CreateCollectionDto {
  topicId: number;
}

// 用户类型
export interface ApiUser {
  id: number;
  account: string;
  mobile?: string;
  name: string;
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
  chatRoomId?: number;
  avatarFileMd5?: string;
  backgroundInfoFileMd5?: string;
  username?: string | null;
  userId?: number | null;
  openid?: string;
  ipInfoId?: number;
  avatarInfo?: {
    id: number;
    name: string;
    url: string;
    width: number;
    height: number;
    blurhash: string;
  } | null;
  backgroundInfo?: any;
}

// 登录响应类型
export interface LoginResponse {
  admin: ApiUser;
  token: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}

class ApiService {
  private readonly baseURL = API_BASE_URL;
  private token: string | null = null;

  constructor() {
    // 从localStorage获取token
    this.token = localStorage.getItem("auth_token");
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // 处理401未授权错误
    if (response.status === 401) {
      this.clearToken();
      throw new Error("登录已过期，请重新登录");
    }

    // 处理错误响应
    if (!response.ok || data.code !== 200) {
      // 处理字段验证错误 (msg是数组)
      if (Array.isArray(data.msg) && data.msg.length > 0) {
        const errorMessages = data.msg.map((err: any) => err.message).join(", ");
        throw new Error(errorMessages);
      }
      // 处理普通错误消息
      throw new Error(data.msg || data.message || "操作失败，请重试");
    }

    return data;
  }

  // 设置认证token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token);
  }

  // 清除认证token
  clearToken() {
    this.token = null;
    localStorage.removeItem("auth_token");
  }

  // 刷新token（从localStorage重新读取）
  refreshToken() {
    this.token = localStorage.getItem("auth_token");
  }

  // 获取话题列表
  async getTopics(params?: {
    page?: number;
    size?: number;
    sort?: string;
    title?: string;
    keywords?: string;
    tagId?: number;
    userId?: number;
    exif?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<ApiTopic>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/topic${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<ApiTopic>>(endpoint);
  }

  // 创建话题
  async createTopic(data: {
    title: string;
    content: string;
    tags?: string[];
    fileIds?: (number | string)[];
    extraData?: string;
    isPinned?: boolean;
  }): Promise<ApiResponse<ApiTopic>> {
    return this.request<ApiTopic>("/api/topic", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 更新话题
  async updateTopic(
    id: number,
    data: {
      title?: string;
      content?: string;
      tags?: string[];
      fileIds?: (number | string)[];
      extraData?: string;
      isPinned?: boolean;
    },
  ): Promise<ApiResponse<ApiTopic>> {
    return this.request<ApiTopic>(`/api/topic/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // 点赞话题
  async likeTopic(topicId: number): Promise<ApiResponse<any>> {
    return this.request("/api/like", {
      method: "POST",
      body: JSON.stringify({ topicId }),
    });
  }

  // 取消点赞
  async unlikeTopic(topicId: number): Promise<ApiResponse<any>> {
    return this.request("/api/like", {
      method: "DELETE",
      body: JSON.stringify({ topicId }),
    });
  }

  // 获取话题详情
  async getTopicDetail(
    id: number,
    userId?: number,
    exif?: boolean,
  ): Promise<ApiResponse<ApiTopic>> {
    const searchParams = new URLSearchParams();
    if (userId) {
      searchParams.append("userId", String(userId));
    }
    if (exif) {
      searchParams.append("exif", String(exif));
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/topic/${id}${queryString ? `?${queryString}` : ""}`;

    return this.request<ApiTopic>(endpoint);
  }

  // 获取评论列表
  async getComments(params?: {
    page?: number;
    size?: number;
    topicId?: number;
    userId?: number;
    parentId?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/comment${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // 创建评论（包括一级评论和回复）
  async createComment(data: {
    content: string;
    userId: number;
    topicId?: number;
    parentId?: number;
    replyToUserId?: number;
  }): Promise<ApiResponse<any>> {
    return this.request("/api/comment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 删除评论
  async deleteComment(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/comment/${id}`, {
      method: "DELETE",
    });
  }

  // 删除动态
  async deleteTopic(topicId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/topic/${topicId}`, {
      method: "DELETE",
    });
  }

  // 登录
  async login(account: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/api/auth/loginV2", {
      method: "POST",
      body: JSON.stringify({ account, password }),
    });

    if (response.code === 200 && response.result?.token?.access_token) {
      this.setToken(response.result.token.access_token);
    }

    return response;
  }

  // 验证码登录
  async loginByCode(account: string, code: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/api/auth/loginByCode", {
      method: "POST",
      body: JSON.stringify({ account, code }),
    });

    if (response.code === 200 && response.result?.token?.access_token) {
      this.setToken(response.result.token.access_token);
    }

    return response;
  }

  // 重置密码
  async resetPassword(data: {
    account: string;
    code: string;
    password: string;
    password_confirm: string;
  }): Promise<ApiResponse<any>> {
    return this.request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 注册
  async register(data: {
    email: string;
    password: string;
    password_confirm: string;
    code: string;
  }): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.code === 200 && response.result?.token?.access_token) {
      this.setToken(response.result.token.access_token);
    }

    return response;
  }

  // 登出
  async logout(): Promise<void> {
    try {
      await this.request("/api/auth/logout", {
        method: "POST",
      });
    } catch (_error) {
    } finally {
      this.clearToken();
    }
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>("/api/auth/current");
  }

  // 获取点赞统计
  async getLikeStats(topicId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/like/stats/${topicId}`);
  }

  // 获取用户喜欢的话题列表
  async getUserLikedTopics(
    userId: number,
    params?: {
      page?: number;
      size?: number;
    },
  ): Promise<ApiResponse<PaginatedResponse<ApiTopic>>> {
    const searchParams = new URLSearchParams();

    // 添加 userId 参数
    searchParams.append("userId", String(userId));

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/like?${queryString}`;

    return this.request<PaginatedResponse<ApiTopic>>(endpoint);
  }

  // 获取用户旅行统计
  async getUserTravelStats(userId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/user/${userId}/travel-stats`);
  }

  // 获取用户信息
  async getUserById(userId: number): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>(`/api/user/${userId}`);
  }

  // 获取用户互动统计
  async getUserStats(userId: number): Promise<
    ApiResponse<{
      userId: number;
      likeCount: number;
      collectionCount: number;
      followingCount: number;
      followerCount: number;
    }>
  > {
    return this.request(`/api/user/${userId}/stats`);
  }

  // 获取用户访问过的城市
  async getUserCities(
    userId: number,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: "photoCount" | "lastVisitAt" | "firstVisitAt";
      sortOrder?: "asc" | "desc";
      country?: string;
    },
  ): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/user/${userId}/cities${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint);
  }

  // 更新用户信息
  async updateUserProfile(data: {
    name?: string;
    signature?: string;
  }): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>("/api/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // 更新用户信息（完整版）
  async updateUser(
    userId: number,
    data: {
      name?: string;
      mobile?: string;
      email?: string;
      avatar?: string;
      sex?: number;
      birthday?: string;
      city?: string;
      job?: string;
      company?: string;
      signature?: string;
      website?: string;
      github?: string;
      avatarFileMd5?: string;
      backgroundInfoFileMd5?: string;
    },
  ): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>(`/api/user/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // 上传头像
  async uploadAvatar(file: File): Promise<
    ApiResponse<{
      id: number;
      name: string;
      url: string;
      width: number;
      height: number;
      blurhash: string;
      md5: string;
    }>
  > {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseURL}/api/upload/avatar`;
    const headers: Record<string, string> = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (response.status === 401) {
      this.clearToken();
      throw new Error("登录已过期，请重新登录");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || "头像上传失败");
    }

    return data;
  }

  // 更新用户头像
  async updateUserAvatar(avatarFileMd5: string): Promise<ApiResponse<ApiUser>> {
    return this.request<ApiUser>("/api/user/avatar", {
      method: "PUT",
      body: JSON.stringify({ avatarFileMd5 }),
    });
  }

  // 收藏话题
  async collectTopic(topicId: number): Promise<ApiResponse<any>> {
    return this.request("/api/collection", {
      method: "POST",
      body: JSON.stringify({ topicId }),
    });
  }

  // 取消收藏
  async uncollectTopic(topicId: number): Promise<ApiResponse<any>> {
    return this.request("/api/collection", {
      method: "DELETE",
      body: JSON.stringify({ topicId }),
    });
  }

  // 获取收藏列表
  async getCollections(params?: {
    page?: number;
    size?: number;
    topicId?: number;
    userId?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/collection${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // 获取用户收藏的话题列表
  async getUserCollectedTopics(
    userId: number,
    params?: {
      page?: number;
      size?: number;
    },
  ): Promise<ApiResponse<PaginatedResponse<ApiTopic>>> {
    const searchParams = new URLSearchParams();

    // 添加 userId 参数
    searchParams.append("userId", String(userId));

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/collection?${queryString}`;

    return this.request<PaginatedResponse<ApiTopic>>(endpoint);
  }

  // 获取文件详情
  async getFileDetail(fileId: number): Promise<
    ApiResponse<{
      id: number;
      fileName: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
      fileMd5: string;
      blurhash: string;
      width: number;
      height: number;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    return this.request(`/api/file/${fileId}`);
  }

  // 生成二维码
  async generateQRCode(): Promise<ApiResponse<{ key: string }>> {
    return this.request<{ key: string }>("/api/qr/generate");
  }

  // 刷新二维码
  async refreshQRCode(key: string): Promise<ApiResponse<{ key: string }>> {
    return this.request<{ key: string }>(`/api/qr/regenerate/${key}`);
  }

  // 检查二维码状态
  async checkQRCodeStatus(key: string): Promise<
    ApiResponse<{
      status: "pending" | "confirm" | "timeout" | "success";
      token?: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
      user?: ApiUser;
    }>
  > {
    return this.request(`/api/qr/check/${key}`);
  }

  // 获取通知列表
  async getNotifications(params?: {
    page?: number;
    pageSize?: number;
    type?: string;
    isRead?: boolean;
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/message/getOneByInfo${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint);
  }

  // 标记单个通知为已读
  async markNotificationAsRead(id: number): Promise<ApiResponse<any>> {
    return this.request(`/api/message/${id}/read`, {
      method: "PATCH",
    });
  }

  // 标记所有通知为已读
  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    return this.request("/api/message/read-all", {
      method: "PATCH",
    });
  }

  // 获取未读通知数量
  async getUnreadNotificationCount(): Promise<ApiResponse<{ count: number }>> {
    return this.request<{ count: number }>("/api/message/getOneByInfo");
  }

  // 获取标签列表
  async getTags(params?: {
    page?: number;
    size?: number;
    sort?: string;
    title?: string;
    tagId?: number;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/tag${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // ============ 聊天相关接口 ============

  // 获取聊天室列表
  async getChatRooms(params?: {
    page?: number;
    size?: number;
    type?: "PRIVATE" | "GROUP";
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/chat/rooms${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // 获取聊天室详情
  async getChatRoomDetail(roomId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/rooms/${roomId}`);
  }

  // 创建私聊房间
  async createPrivateChat(targetUserId: number): Promise<ApiResponse<any>> {
    return this.request("/api/chat/private", {
      method: "POST",
      body: JSON.stringify({ targetUserId }),
    });
  }

  // 创建群聊房间
  async createGroupChat(data: {
    name: string;
    avatar?: string;
    memberIds: number[];
  }): Promise<ApiResponse<any>> {
    return this.request("/api/chat/rooms/group", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // 获取聊天室消息列表
  async getChatMessages(
    roomId: number,
    params?: {
      page?: number;
      size?: number;
    },
  ): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/chat/rooms/${roomId}/messages${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // 标记聊天室消息为已读
  async markChatRoomAsRead(roomId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/rooms/${roomId}/read`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  // 上传聊天文件
  async uploadChatFile(file: File): Promise<
    ApiResponse<{
      id: number;
      name: string;
      url: string;
      size: number;
      type: string;
      width?: number;
      height?: number;
      blurhash?: string;
    }>
  > {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseURL}/api/chat/upload`;
    const headers: Record<string, string> = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (response.status === 401) {
      this.clearToken();
      throw new Error("登录已过期，请重新登录");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || "文件上传失败");
    }

    return data;
  }

  // 删除聊天室
  async deleteChatRoom(roomId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/rooms/${roomId}`, {
      method: "DELETE",
    });
  }

  // 退出聊天室
  async leaveChatRoom(roomId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/rooms/${roomId}/leave`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  // 添加群聊成员
  async addChatRoomMembers(roomId: number, memberIds: number[]): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/rooms/${roomId}/members`, {
      method: "POST",
      body: JSON.stringify({ memberIds }),
    });
  }

  // 移除群聊成员
  async removeChatRoomMember(roomId: number, userId: number): Promise<ApiResponse<any>> {
    return this.request(`/api/chat/rooms/${roomId}/members/${userId}`, {
      method: "DELETE",
    });
  }

  // 更新文件位置信息
  async updateFileLocation(
    fileId: number,
    data: { lat: number; lng: number },
  ): Promise<ApiResponse<any>> {
    return this.request(`/api/file/${fileId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // ============ 颜色管理相关接口 ============

  // 获取用户的色彩集合
  async getUserColors(params?: {
    userId?: number;
    page?: number;
    size?: number;
    sort?: string;
    primaryOnly?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/color/user${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // 获取颜色使用统计
  async getColorStats(params?: {
    userId?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/color/stats${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // 根据颜色查找文件
  async getFilesByColor(params?: {
    hex?: string;
    colorId?: number;
    userId?: number;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<ApiResponse<PaginatedResponse<any>>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/color/files-by-color${queryString ? `?${queryString}` : ""}`;

    return this.request<PaginatedResponse<any>>(endpoint);
  }

  // 获取文件的颜色列表
  async getFileColors(params?: {
    fileId?: number;
    fileMd5?: string;
    includeTopics?: boolean;
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/color/file${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint);
  }

  // 获取用户文件列表
  async getUserFiles(params?: {
    page?: number;
    size?: number;
    userId?: number;
    sort?: string;
    includeExif?: boolean;
    filterEmptyLocation?: boolean;
  }): Promise<
    ApiResponse<{
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
      };
      list: Array<{
        id: number;
        name: string;
        url: string;
        type: string;
        blurhash: string;
        videoSrc?: string | null;
        fromIphone: boolean;
        width: number;
        height: number;
        lng: number;
        lat: number;
        takenAt?: string;
        createdAt: string;
        updatedAt: string;
        isPrivate?: boolean;
        hasTopic?: boolean;
      }>;
    }>
  > {
    // 确保使用最新的token（用户登录后能带上认证信息）
    this.refreshToken();

    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/file/user/files${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint);
  }

  // 更新文件信息
  async updateFile(
    fileId: number,
    data: {
      isPrivate?: boolean;
      name?: string;
    },
  ): Promise<ApiResponse<any>> {
    this.refreshToken();
    return this.request(`/api/file/${fileId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // 删除文件
  async deleteFile(fileId: number): Promise<ApiResponse<any>> {
    this.refreshToken();
    return this.request(`/api/file/${fileId}`, {
      method: "DELETE",
    });
  }

  // ============ 更新日志相关接口 ============

  // 获取已发布的更新日志列表（公开接口）
  async getPublishedChangelogs(params?: {
    page?: number;
    size?: number;
  }): Promise<
    ApiResponse<{
      list: Array<{
        id: number;
        version: string;
        title: string;
        content: string;
        type: "feature" | "bugfix" | "improvement" | "breaking";
        isPublished: boolean;
        publishedAt: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        current_page: number;
        size: number;
        totalElements: number;
        totalPages: number;
      };
    }>
  > {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/changelog/public${queryString ? `?${queryString}` : ""}`;

    return this.request(endpoint);
  }

  // 获取最新发布的更新日志
  async getLatestChangelog(): Promise<
    ApiResponse<{
      id: number;
      version: string;
      title: string;
      content: string;
      type: "feature" | "bugfix" | "improvement" | "breaking";
      isPublished: boolean;
      publishedAt: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    return this.request("/api/changelog/latest");
  }

  // 获取更新日志详情（支持ID或版本号）
  async getChangelogByIdentifier(identifier: string | number): Promise<
    ApiResponse<{
      id: number;
      version: string;
      title: string;
      content: string;
      type: "feature" | "bugfix" | "improvement" | "breaking";
      isPublished: boolean;
      publishedAt: string | null;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    return this.request(`/api/changelog/${identifier}`);
  }
}

export const apiService = new ApiService();
export default apiService;
