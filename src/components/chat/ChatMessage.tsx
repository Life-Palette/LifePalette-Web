import { motion } from "framer-motion";
import OptimizedImage from "@/components/media/OptimizedImage";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { formatDistanceToNow } from "@/utils/date";

interface ChatMessageProps {
  message: ChatMessageType;
  isMine: boolean;
}

export default function ChatMessage({ message, isMine }: ChatMessageProps) {
  const avatarUrl = message.user.avatarInfo?.url || message.user.avatar;
  const blurhash = message.user.avatarInfo?.blurhash;

  const renderContent = () => {
    switch (message.type) {
      case "TEXT":
        return (
          <div className="px-4 py-2 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
            <p className="text-sm text-neutral-900 dark:text-white whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>
        );

      case "IMAGE":
        if (!message.file) return null;
        const imageInfo =
          typeof message.file === "string" ? JSON.parse(message.file) : message.file;
        return (
          <div className="rounded-2xl overflow-hidden shadow-sm max-w-xs">
            <OptimizedImage
              image={{
                id: message.id,
                url: imageInfo.url,
                blurhash: imageInfo.blurhash || "",
                width: imageInfo.width || 300,
                height: imageInfo.height || 200,
                type: "image",
                name: imageInfo.name || "image",
              }}
              className="w-full h-auto"
            />
          </div>
        );

      case "FILE":
        if (!message.file) return null;
        const fileInfo = typeof message.file === "string" ? JSON.parse(message.file) : message.file;
        return (
          <a
            href={fileInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-neutral-600 dark:text-neutral-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {fileInfo.name}
              </p>
              {fileInfo.size && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {(fileInfo.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </a>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 mb-4 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* 头像 */}
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <OptimizedImage
            image={{
              id: message.user.id,
              url: avatarUrl,
              blurhash: blurhash || "",
              width: 40,
              height: 40,
              type: "image",
              name: message.user.name,
            }}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
              {message.user.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex flex-col gap-1 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
        {!isMine && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 px-2">
            {message.user.name}
          </span>
        )}
        <div className={isMine ? "bg-blue-500 rounded-2xl" : ""}>
          {isMine && message.type === "TEXT" ? (
            <div className="px-4 py-2 rounded-2xl bg-blue-500">
              <p className="text-sm text-white whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500 px-2">
          {formatDistanceToNow(new Date(message.createdAt))}
        </span>
      </div>
    </motion.div>
  );
}
