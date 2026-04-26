import { motion } from "framer-motion";
import OptimizedImage from "@/components/media/OptimizedImage";
import type { ChatMessage as ChatMessageType } from "@/types/chat";
import { getUserAvatar } from "@/utils/avatar";
import { formatDistanceToNow } from "@/utils/date";

interface ChatMessageProps {
  isMine: boolean;
  message: ChatMessageType;
}

export default function ChatMessage({ message, isMine }: ChatMessageProps) {
  const avatarUrl = getUserAvatar(message.user);
  const blurhash = message.user.avatarInfo?.blurhash;

  const renderContent = () => {
    switch (message.type) {
      case "TEXT":
        return (
          <div className="rounded-2xl bg-white px-4 py-2 shadow-sm dark:bg-neutral-800">
            <p className="whitespace-pre-wrap break-words text-neutral-900 text-sm dark:text-white">
              {message.content}
            </p>
          </div>
        );

      case "IMAGE": {
        if (!message.file) {
          return null;
        }
        const imageInfo =
          typeof message.file === "string" ? JSON.parse(message.file) : message.file;
        return (
          <div className="max-w-xs overflow-hidden rounded-2xl shadow-sm">
            <OptimizedImage
              className="h-auto w-full"
              image={{
                id: message.id,
                url: imageInfo.url,
                blurhash: imageInfo.blurhash || "",
                width: imageInfo.width || 300,
                height: imageInfo.height || 200,
                type: "image",
                name: imageInfo.name || "image",
              }}
            />
          </div>
        );
      }

      case "FILE": {
        if (!message.file) {
          return null;
        }
        const fileInfo = typeof message.file === "string" ? JSON.parse(message.file) : message.file;
        return (
          <a
            className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm transition-colors hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            href={fileInfo.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-700">
              <svg
                className="h-5 w-5 text-neutral-600 dark:text-neutral-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900 text-sm dark:text-white">
                {fileInfo.name}
              </p>
              {fileInfo.size && (
                <p className="text-neutral-500 text-xs dark:text-neutral-400">
                  {(fileInfo.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
          </a>
        );
      }

      default:
        return null;
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 flex gap-3 ${isMine ? "flex-row-reverse" : "flex-row"}`}
      initial={{ opacity: 0, y: 10 }}
    >
      {/* 头像 */}
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <OptimizedImage
            className="h-10 w-10 rounded-full object-cover"
            height={40}
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
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
            <span className="font-semibold text-neutral-600 text-sm dark:text-neutral-300">
              {message.user.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* 消息内容 */}
      <div className={`flex max-w-[70%] flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}>
        {!isMine && (
          <span className="px-2 text-neutral-500 text-xs dark:text-neutral-400">
            {message.user.name}
          </span>
        )}
        <div className={isMine ? "rounded-2xl bg-blue-500" : ""}>
          {isMine && message.type === "TEXT" ? (
            <div className="rounded-2xl bg-blue-500 px-4 py-2">
              <p className="whitespace-pre-wrap break-words text-sm text-white">
                {message.content}
              </p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
        <span className="px-2 text-neutral-400 text-xs dark:text-neutral-500">
          {formatDistanceToNow(new Date(message.createdAt))}
        </span>
      </div>
    </motion.div>
  );
}
