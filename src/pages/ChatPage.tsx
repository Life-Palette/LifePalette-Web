import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ChatRoomList from "@/components/chat/ChatRoomList";
import ChatWindow from "@/components/chat/ChatWindow";
import PageLayout from "@/components/layout/PageLayout";
import { useCurrentUser } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { apiService } from "@/services/api";
import type { ChatMessage, ChatRoom } from "@/types/chat";

export default function ChatPage() {
  // 获取当前用户信息
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();

  const currentUserId = currentUser?.id;

  // 加载中
  if (isLoadingUser) {
    return (
      <PageLayout activeTab="chat">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">加载中...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 如果没有登录，显示提示
  if (!currentUserId) {
    return (
      <PageLayout activeTab="chat">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
              请先登录
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400">您需要登录后才能使用聊天功能</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout activeTab="chat">
      <ChatPageContent currentUserId={currentUserId} />
    </PageLayout>
  );
}

function ChatPageContent({ currentUserId }: { currentUserId: number }) {
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomListVersion, setRoomListVersion] = useState(0);

  // 使用 ref 保存最新的 currentRoom，避免闭包问题
  const currentRoomRef = useRef<ChatRoom | null>(null);

  useEffect(() => {
    currentRoomRef.current = currentRoom;
  }, [currentRoom]);

  // 获取聊天室列表
  const { data: roomsData } = useQuery({
    queryKey: ["chatRooms", roomListVersion],
    queryFn: () => apiService.getChatRooms({ page: 1, size: 50 }),
  });

  const rooms = roomsData?.result?.list || [];

  // WebSocket 连接 - 简化回调，避免依赖变化
  const { isConnected, joinRoom, sendTextMessage, sendImageMessage, sendFileMessage } = useChat({
    userId: currentUserId,
    onMessage: (message) => {
      const currentRoomId = currentRoomRef.current?.id;

      // 添加到当前房间的消息列表 - 确保类型匹配
      setMessages((prev) => {
        const messageRoomId = Number(message.roomId);
        const currentRoomIdNum = currentRoomId ? Number(currentRoomId) : null;

        if (messageRoomId === currentRoomIdNum) {
          // 检查是否已存在该消息（避免重复）
          const exists = prev.some((m) => m.id === message.id);
          if (exists) {
            return prev;
          }
          return [...prev, message];
        }
        return prev;
      });
      // 触发房间列表刷新
      setRoomListVersion((v) => v + 1);
    },
    onConnect: () => {
      // WebSocket 连接成功
    },
    onDisconnect: () => {
      // WebSocket 断开连接
    },
    onError: (error) => {
      console.error("WebSocket 错误:", error);
    },
  });

  // 选择聊天室
  const handleSelectRoom = useCallback(
    async (room: ChatRoom) => {
      setCurrentRoom(room);

      // 加入房间
      joinRoom(room.id);

      // 加载消息
      try {
        const response = await apiService.getChatMessages(room.id, {
          page: 1,
          size: 50,
        });
        const messageList = response.result?.list || [];
        // 确保消息按时间正序排列（旧消息在前）
        const sortedMessages = [...messageList].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        setMessages(sortedMessages);

        // 标记为已读
        await apiService.markChatRoomAsRead(room.id);

        // 刷新房间列表以更新未读数
        setRoomListVersion((v) => v + 1);
      } catch (error) {
        console.error("加载消息失败:", error);
        toast.error("加载消息失败");
      }
    },
    [joinRoom],
  );

  // 发送消息
  const handleSendMessage = useCallback(
    (message: string, type: "TEXT" | "IMAGE" | "FILE", file?: any) => {
      if (!currentRoom) return;

      switch (type) {
        case "TEXT":
          sendTextMessage(currentRoom.id, message);
          break;
        case "IMAGE":
          sendImageMessage(currentRoom.id, file);
          break;
        case "FILE":
          sendFileMessage(currentRoom.id, file);
          break;
      }
    },
    [currentRoom, currentUserId, sendTextMessage, sendImageMessage, sendFileMessage],
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* 左侧：聊天室列表 */}
        <div className="w-80 flex-shrink-0">
          <div className="h-full rounded-2xl overflow-hidden shadow-sm border border-neutral-200/50 dark:border-neutral-800">
            <ChatRoomList
              rooms={rooms}
              currentRoomId={currentRoom?.id}
              onSelectRoom={handleSelectRoom}
            />
          </div>
        </div>

        {/* 右侧：聊天窗口 */}
        <div className="flex-1 min-w-0">
          <div className="h-full rounded-2xl overflow-hidden shadow-sm border border-neutral-200/50 dark:border-neutral-800">
            {currentRoom ? (
              <ChatWindow
                room={currentRoom}
                messages={messages}
                currentUserId={currentUserId}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-white dark:bg-neutral-900">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-neutral-400 dark:text-neutral-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
                    选择一个聊天
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    从左侧列表中选择一个聊天室开始对话
                  </p>
                  {!isConnected && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-900/20">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-sm text-red-600 dark:text-red-400">聊天服务未连接</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
