import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import io from "socket.io-client";
import { config } from "@/config/env";
import type {
  ChatEvent,
  ChatMessage,
  JoinRoomEvent,
  MentionedEvent,
  UserJoinedEvent,
  WebSocketError,
} from "@/types/chat";

interface UseChatOptions {
  userId: number;
  onMessage?: (message: ChatMessage) => void;
  onUserJoined?: (data: UserJoinedEvent) => void;
  onMentioned?: (data: MentionedEvent) => void;
  onError?: (error: WebSocketError) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useChat(options: UseChatOptions) {
  const { userId, onMessage, onUserJoined, onMentioned, onError, onConnect, onDisconnect } =
    options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const hasInitializedRef = useRef(false); // 防止重复初始化
  const maxReconnectAttempts = 3;

  // 初始化 WebSocket 连接
  useEffect(() => {
    // 如果已经初始化过，直接返回
    if (hasInitializedRef.current) {
      return;
    }

    // 如果没有 userId 或 userId 为 0，不连接
    if (!userId || userId === 0) {
      return;
    }

    hasInitializedRef.current = true; // 标记为已初始化

    const socket = io(config.WS_URL, {
      transports: ["websocket", "polling"],
      query: {
        userId: String(userId),
      },
      reconnection: false, // 先禁用自动重连，方便调试
    });

    socketRef.current = socket;

    // 连接成功
    socket.on("connect", () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // 重置重连次数

      // 发送测试消息确认连接
      socket.emit("hello", { name: "test" });

      onConnect?.();
    });

    // 断开连接
    socket.on("disconnect", (reason) => {
      setIsConnected(false);
      onDisconnect?.();
    });

    // 接收消息
    socket.on("message", (data: ChatMessage) => {
      onMessage?.(data);
    });

    // 用户加入
    socket.on("userJoined", (data: UserJoinedEvent) => {
      onUserJoined?.(data);
    });

    // 被提及
    socket.on("mentioned", (data: MentionedEvent) => {
      onMentioned?.(data);
    });

    // 错误处理
    socket.on("error", (error: WebSocketError) => {
      console.error("WebSocket 错误:", error);
      onError?.(error);
    });

    // 连接错误
    socket.on("connect_error", (error) => {
      reconnectAttemptsRef.current += 1;
      console.error(
        `连接错误 (${reconnectAttemptsRef.current}/${maxReconnectAttempts}):`,
        error.message,
      );
      setIsConnected(false);

      // 达到最大重连次数后停止重连
      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.error("已达到最大重连次数，停止重连");
        socket.disconnect();
      }
    });

    // 重连失败
    socket.on("reconnect_failed", () => {
      console.error("重连失败，已达到最大重连次数");
      setIsConnected(false);
    });

    // 清理函数
    return () => {
      hasInitializedRef.current = false; // 重置初始化标记
      socket.disconnect();
    };
  }, [userId]); // 只依赖 userId，避免回调变化导致重新连接

  // 加入房间
  const joinRoom = useCallback(
    (roomId: number) => {
      if (!socketRef.current) {
        return;
      }

      const data: JoinRoomEvent = {
        roomId,
        userId,
      };

      socketRef.current.emit("joinRoom", data);
      setCurrentRoomId(roomId);
    },
    [userId],
  );

  // 离开房间
  const leaveRoom = useCallback(
    (roomId: number) => {
      if (!socketRef.current) {
        return;
      }

      socketRef.current.emit("leaveRoom", { roomId, userId });
      if (currentRoomId === roomId) {
        setCurrentRoomId(null);
      }
    },
    [userId, currentRoomId],
  );

  // 发送消息
  const sendMessage = useCallback(
    (data: Omit<ChatEvent, "userId">) => {
      if (!socketRef.current || !isConnected) {
        return;
      }

      const chatEvent: ChatEvent = {
        ...data,
        userId,
      };

      socketRef.current.emit("chat", chatEvent);
    },
    [userId, isConnected],
  );

  // 发送文本消息（便捷方法）
  const sendTextMessage = useCallback(
    (roomId: number, message: string) => {
      sendMessage({
        roomId,
        message,
        type: "TEXT",
      });
    },
    [sendMessage],
  );

  // 发送图片消息（便捷方法）
  const sendImageMessage = useCallback(
    (roomId: number, fileInfo: any) => {
      sendMessage({
        roomId,
        message: "",
        type: "IMAGE",
        file: fileInfo,
      });
    },
    [sendMessage],
  );

  // 发送文件消息（便捷方法）
  const sendFileMessage = useCallback(
    (roomId: number, fileInfo: any) => {
      sendMessage({
        roomId,
        message: "",
        type: "FILE",
        file: fileInfo,
      });
    },
    [sendMessage],
  );

  return {
    socket: socketRef.current,
    isConnected,
    currentRoomId,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTextMessage,
    sendImageMessage,
    sendFileMessage,
  };
}
