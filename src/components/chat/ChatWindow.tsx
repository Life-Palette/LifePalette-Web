import { Image as ImageIcon, Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { chatApi } from "@/services/api";
import type { ChatMessage as ChatMessageType, ChatRoom } from "@/types/chat";
import ChatMessage from "./ChatMessage";

interface ChatWindowProps {
  currentUserId: number;
  messages: ChatMessageType[];
  onSendMessage: (message: string, type: "TEXT" | "IMAGE" | "FILE", file?: any) => void;
  room: ChatRoom;
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
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getRoomName = () => {
    if (room.type === "PRIVATE") {
      return room.otherUser?.name || "未知用户";
    }
    return room.name || "群聊";
  };

  const handleSendMessage = async () => {
    if (!(inputMessage.trim() || previewFile)) {
      return;
    }

    if (previewFile) {
      // 上传文件
      setIsUploading(true);
      try {
        const response = await chatApi.uploadFile(previewFile);
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
    <div className="flex h-full flex-col bg-white dark:bg-neutral-900">
      {/* 头部 */}
      <div className="flex items-center justify-between border-neutral-100 border-b px-6 py-4 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-neutral-900 text-xl dark:text-white">{getRoomName()}</h2>
          {room.type === "GROUP" && room.members && (
            <span className="font-medium text-neutral-400 text-sm dark:text-neutral-500">
              {room.members.length} 成员
            </span>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <ScrollArea className="flex-1 bg-neutral-50/30 px-6 py-6 dark:bg-neutral-900/50">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-neutral-500 dark:text-neutral-400">
            暂无消息，开始聊天吧
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                isMine={message.userId === currentUserId}
                key={message.id}
                message={message}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>

      {/* 文件预览 */}
      {previewFile && (
        <div className="border-neutral-100 border-t bg-white px-6 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center gap-3 rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800">
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-neutral-900 text-sm dark:text-white">
                {previewFile.name}
              </p>
              <p className="text-neutral-500 text-xs dark:text-neutral-400">
                {(previewFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              className="h-6 w-6 rounded-full"
              onClick={() => setPreviewFile(null)}
              size="icon"
              variant="ghost"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-neutral-100 border-t bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          {/* 附件按钮 */}
          <div className="flex gap-2">
            <input
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
              ref={imageInputRef}
              type="file"
            />
            <Button
              disabled={isUploading}
              onClick={() => imageInputRef.current?.click()}
              size="icon"
              title="发送图片"
              variant="ghost"
            >
              <ImageIcon className="h-5 w-5" />
            </Button>

            <input className="hidden" onChange={handleFileSelect} ref={fileInputRef} type="file" />
            <Button
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              size="icon"
              title="发送文件"
              variant="ghost"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>

          {/* 输入框 */}
          <Textarea
            className="max-h-[120px] min-h-[35px] flex-1 resize-none"
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="输入消息..."
            value={inputMessage}
          />

          {/* 发送按钮 */}
          <Button
            className="h-[44px] w-[44px]"
            disabled={!(inputMessage.trim() || previewFile) || isUploading}
            onClick={handleSendMessage}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
