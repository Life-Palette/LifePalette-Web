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
  content: string;
  createdAt: string;
  file?: string; // JSON string containing file info
  id: number;
  roomId: number;
  status?: MessageStatus;
  type: MessageType;
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
  userId: number;
}

/**
 * 聊天室
 */
export interface ChatRoom {
  avatar?: string;
  createdAt: string;
  id: number;
  lastMessage?: ChatMessage;
  lastMessageTime?: string;
  // 群聊成员
  members?: Array<{
    id: number;
    userId: number;
    roomId: number;
    role: "OWNER" | "ADMIN" | "MEMBER";
    user: ApiUser;
  }>;
  name?: string;
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
  type: ChatRoomType;
  unreadCount: number;
  updatedAt: string;
}

/**
 * 文件信息
 */
export interface ChatFileInfo {
  blurhash?: string;
  height?: number;
  id?: number;
  name: string;
  size?: number;
  type?: string;
  url: string;
  width?: number;
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
  file?: ChatFileInfo;
  message: string;
  roomId: number;
  type: MessageType;
  userId: number;
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
  avatar?: string;
  memberIds: number[];
  name: string;
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
  file?: ChatFileInfo;
  message: string;
  roomId: number;
  type: MessageType;
  userId: number;
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
  content: string;
  fromUser: ApiUser;
  messageId: number;
  roomId: number;
}

/**
 * WebSocket 错误事件
 */
export interface WebSocketError {
  code: string;
  message: string;
}
