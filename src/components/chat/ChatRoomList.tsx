import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import OptimizedImage from "@/components/media/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import type { ChatRoom } from "@/types/chat";
import { getUserAvatar } from "@/utils/avatar";
import { formatDistanceToNow } from "@/utils/date";

interface ChatRoomListProps {
  rooms: ChatRoom[];
  currentRoomId?: number;
  onSelectRoom: (room: ChatRoom) => void;
}

export default function ChatRoomList({ rooms, currentRoomId, onSelectRoom }: ChatRoomListProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // 使用 TanStack Virtual 进行虚拟化
  const virtualizer = useVirtualizer({
    count: rooms.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76, // 估计每个聊天室项的高度 (48px头像 + padding)
    overscan: 3, // 预渲染3个项目
  });

  const getRoomName = (room: ChatRoom) => {
    if (room.type === "PRIVATE") {
      return room.otherUser?.name || "未知用户";
    }
    return room.name || "群聊";
  };

  const getRoomAvatar = (room: ChatRoom) => {
    if (room.type === "PRIVATE") {
      return getUserAvatar(room.otherUser);
    }
    return room.avatar;
  };

  const getRoomBlurhash = (room: ChatRoom) => {
    if (room.type === "PRIVATE") {
      return room.otherUser?.avatarInfo?.blurhash;
    }
    return undefined;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      {/* 头部 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">消息</h2>
      </div>

      {/* 聊天室列表 */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="w-16 h-16 mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-neutral-400"
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
          <p className="text-sm text-neutral-500 dark:text-neutral-400">暂无聊天</p>
        </div>
      ) : (
        <div ref={parentRef} className="flex-1 overflow-auto py-2">
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const room = rooms[virtualItem.index];
              const isActive = currentRoomId === room.id;
              const avatarUrl = getRoomAvatar(room);
              const blurhash = getRoomBlurhash(room);

              return (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div
                    onClick={() => onSelectRoom(room)}
                    className={`
                      flex items-start gap-3 px-4 py-3 mx-2 my-1 cursor-pointer transition-all rounded-xl
                      ${isActive ? "bg-neutral-100 dark:bg-neutral-800 shadow-sm" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/30"}
                    `}
                  >
                    {/* 头像 */}
                    <div className="relative flex-shrink-0">
                      {avatarUrl ? (
                        <OptimizedImage
                          image={{
                            id: room.id,
                            url: avatarUrl,
                            blurhash: blurhash || "",
                            width: 48,
                            height: 48,
                            type: "image",
                            name: getRoomName(room),
                          }}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                          <span className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                            {getRoomName(room).charAt(0)}
                          </span>
                        </div>
                      )}
                      {room.unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] font-bold"
                        >
                          {room.unreadCount > 99 ? "99+" : room.unreadCount}
                        </Badge>
                      )}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                          {getRoomName(room)}
                        </h3>
                        {room.lastMessageTime && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 flex-shrink-0 ml-2">
                            {formatDistanceToNow(new Date(room.lastMessageTime))}
                          </span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p
                          className={`text-sm truncate ${
                            room.unreadCount > 0
                              ? "text-neutral-900 dark:text-neutral-100 font-medium"
                              : "text-neutral-500 dark:text-neutral-400"
                          }`}
                        >
                          {room.lastMessage.type === "TEXT"
                            ? room.lastMessage.content
                            : `[${room.lastMessage.type === "IMAGE" ? "图片" : "文件"}]`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
