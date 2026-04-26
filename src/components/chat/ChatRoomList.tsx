import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import OptimizedImage from "@/components/media/OptimizedImage";
import { Badge } from "@/components/ui/badge";
import type { ChatRoom } from "@/types/chat";
import { getUserAvatar } from "@/utils/avatar";
import { formatDistanceToNow } from "@/utils/date";

interface ChatRoomListProps {
  currentRoomId?: number;
  onSelectRoom: (room: ChatRoom) => void;
  rooms: ChatRoom[];
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
    <div className="flex h-full flex-col bg-white dark:bg-neutral-900">
      {/* 头部 */}
      <div className="flex items-center justify-between border-neutral-100 border-b px-5 py-4 dark:border-neutral-800">
        <h2 className="font-bold text-neutral-900 text-xl dark:text-white">消息</h2>
      </div>

      {/* 聊天室列表 */}
      {rooms.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center p-8 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <svg
              className="h-8 w-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <p className="text-neutral-500 text-sm dark:text-neutral-400">暂无聊天</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto py-2" ref={parentRef}>
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
                  data-index={virtualItem.index}
                  key={virtualItem.key}
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
                    className={`mx-2 my-1 flex cursor-pointer items-start gap-3 rounded-xl px-4 py-3 transition-all ${isActive ? "bg-neutral-100 shadow-sm dark:bg-neutral-800" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/30"}
                    `}
                    onClick={() => onSelectRoom(room)}
                  >
                    {/* 头像 */}
                    <div className="relative flex-shrink-0">
                      {avatarUrl ? (
                        <OptimizedImage
                          className="h-12 w-12 rounded-full object-cover"
                          height={48}
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
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                          <span className="font-semibold text-lg text-neutral-600 dark:text-neutral-300">
                            {getRoomName(room).charAt(0)}
                          </span>
                        </div>
                      )}
                      {room.unreadCount > 0 && (
                        <Badge
                          className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 font-bold text-[10px]"
                          variant="destructive"
                        >
                          {room.unreadCount > 99 ? "99+" : room.unreadCount}
                        </Badge>
                      )}
                    </div>

                    {/* 内容 */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="truncate font-semibold text-neutral-900 dark:text-white">
                          {getRoomName(room)}
                        </h3>
                        {room.lastMessageTime && (
                          <span className="ml-2 flex-shrink-0 text-neutral-400 text-xs dark:text-neutral-500">
                            {formatDistanceToNow(new Date(room.lastMessageTime))}
                          </span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p
                          className={`truncate text-sm ${
                            room.unreadCount > 0
                              ? "font-medium text-neutral-900 dark:text-neutral-100"
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
