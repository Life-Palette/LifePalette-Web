/**
 * 聊天相关类型定义
 */

import type { ApiUser } from "@/services/api";

// ============ 消息类型 ============

/**
 * 消息类型枚举
 */
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "VIDEO" | "AUDIO";

/**
 * 聊天室类型
 */
export type ChatRoomType = "PRIVATE" | "GROUP";

/**
 * 消息状态
 */
export type MessageStatus = "sending" | "sent" | "failed" | "read";

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: number;
  roomId: number;
  userId: number;
  content: string;
  type: MessageType;
  file?: string; // JSON string containing file info
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
    avatarInfo?: {
      url: string;
      blurhash: string;
    };
  };
  status?: MessageStatus;
}

/**
 * 聊天室
 */
export interface ChatRoom {
  id: number;
  name?: string;
  avatar?: string;
  type: ChatRoomType;
  createdAt: string;
  updatedAt: string;
  lastMessage?: ChatMessage;
  lastMessageTime?: string;
  unreadCount: number;
  // 私聊时的对方用户信息
  otherUser?: {
    id: number;
    name: string;
    avatar?: string;
    avatarInfo?: {
      url: string;
      blurhash: string;
    };
  };
  // 群聊成员
  members?: Array<{
    id: number;
    userId: number;
    roomId: number;
    role: "OWNER" | "ADMIN" | "MEMBER";
    user: ApiUser;
  }>;
}

/**
 * 文件信息
 */
export interface ChatFileInfo {
  id?: number;
  name: string;
  url: string;
  size?: number;
  type?: string;
  width?: number;
  height?: number;
  blurhash?: string;
}

// ============ API 请求/响应类型 ============

/**
 * 获取聊天室列表参数
 */
export interface GetChatRoomsParams {
  page?: number;
  size?: number;
  type?: ChatRoomType;
}

/**
 * 获取消息列表参数
 */
export interface GetMessagesParams {
  page?: number;
  size?: number;
}

/**
 * 发送消息参数
 */
export interface SendMessageParams {
  roomId: number;
  userId: number;
  message: string;
  type: MessageType;
  file?: ChatFileInfo;
}

/**
 * 创建私聊房间参数
 */
export interface CreatePrivateChatParams {
  targetUserId: number;
}

/**
 * 创建群聊房间参数
 */
export interface CreateGroupChatParams {
  name: string;
  avatar?: string;
  memberIds: number[];
}

// ============ WebSocket 事件类型 ============

/**
 * WebSocket 连接参数
 */
export interface WebSocketConnectParams {
  userId: number;
}

/**
 * 加入房间事件
 */
export interface JoinRoomEvent {
  roomId: number;
  userId: number;
}

/**
 * 发送消息事件
 */
export interface ChatEvent {
  roomId: number;
  userId: number;
  message: string;
  type: MessageType;
  file?: ChatFileInfo;
}

/**
 * 用户加入事件
 */
export interface UserJoinedEvent {
  roomId: number;
  user: ApiUser;
}

/**
 * 提及事件
 */
export interface MentionedEvent {
  roomId: number;
  messageId: number;
  fromUser: ApiUser;
  content: string;
}

/**
 * WebSocket 错误事件
 */
export interface WebSocketError {
  code: string;
  message: string;
}
