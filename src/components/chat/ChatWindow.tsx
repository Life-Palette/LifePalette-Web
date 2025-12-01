import { Image as ImageIcon, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { apiService } from "@/services/api";
import type { ChatMessage as ChatMessageType, ChatRoom } from "@/types/chat";
import ChatMessage from "./ChatMessage";

interface ChatWindowProps {
  room: ChatRoom;
  messages: ChatMessageType[];
  currentUserId: number;
  onSendMessage: (message: string, type: "TEXT" | "IMAGE" | "FILE", file?: any) => void;
}

export default function ChatWindow({
  room,
  messages,
  currentUserId,
  onSendMessage,
}: ChatWindowProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getRoomName = () => {
    if (room.type === "PRIVATE") {
      return room.otherUser?.name || "未知用户";
    }
    return room.name || "群聊";
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !previewFile) return;

    if (previewFile) {
      // 上传文件
      setIsUploading(true);
      try {
        const response = await apiService.uploadChatFile(previewFile);
        const fileInfo = response.result;

        const messageType = previewFile.type.startsWith("image/") ? "IMAGE" : "FILE";
        onSendMessage("", messageType, fileInfo);

        setPreviewFile(null);
        toast.success("文件发送成功");
      } catch (error) {
        console.error("文件上传失败:", error);
        toast.error("文件上传失败");
      } finally {
        setIsUploading(false);
      }
    } else {
      // 发送文本消息
      onSendMessage(inputMessage.trim(), "TEXT");
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{getRoomName()}</h2>
          {room.type === "GROUP" && room.members && (
            <span className="text-sm text-neutral-400 dark:text-neutral-500 font-medium">
              {room.members.length} 成员
            </span>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <ScrollArea className="flex-1 px-6 py-6 bg-neutral-50/30 dark:bg-neutral-900/50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-neutral-500 dark:text-neutral-400">
            暂无消息，开始聊天吧
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isMine={message.userId === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>

      {/* 文件预览 */}
      {previewFile && (
        <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                {previewFile.name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {(previewFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewFile(null)}
              className="h-6 w-6 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          {/* 附件按钮 */}
          <div className="flex gap-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploading}
              title="发送图片"
            >
              <ImageIcon className="w-5 h-5" />
            </Button>

            <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              title="发送文件"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          </div>

          {/* 输入框 */}
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入消息..."
            className="flex-1 min-h-[35px] max-h-[120px] resize-none"
          />

          {/* 发送按钮 */}
          <Button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && !previewFile) || isUploading}
            size="icon"
            className="h-[44px] w-[44px]"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
