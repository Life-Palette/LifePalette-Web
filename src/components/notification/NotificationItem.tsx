import { useNavigate } from "@tanstack/react-router";
import { Bookmark, Heart, MessageCircle, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMarkAsRead } from "@/hooks/useNotifications";
import type { NotificationMessage } from "@/types";

interface NotificationItemProps {
  notification: NotificationMessage;
  onClick?: () => void;
}

// 通知类型映射
const NOTIFICATION_TYPE_MAP = {
  like: {
    label: "点赞",
    icon: Heart,
    color: "text-red-500",
  },
  comment: {
    label: "评论",
    icon: MessageCircle,
    color: "text-blue-500",
  },
  collection: {
    label: "收藏",
    icon: Bookmark,
    color: "text-yellow-500",
  },
  follow: {
    label: "关注",
    icon: UserPlus,
    color: "text-green-500",
  },
};

// 格式化相对时间
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "刚刚";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}天前`;
  }

  // 超过7天显示具体日期
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export default function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const navigate = useNavigate();
  const markAsReadMutation = useMarkAsRead();
  const typeConfig = NOTIFICATION_TYPE_MAP[notification.type];
  const TypeIcon = typeConfig?.icon || Heart;

  const handleClick = () => {
    // 如果未读，标记为已读
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
    onClick?.();
    // 注意：这里暂时注释掉导航，因为话题详情路由可能还未实现
    // navigate({ to: `/topic/${notification.objId}` });
  };

  return (
    <div
      className={`block cursor-pointer border-border border-b p-4 transition-colors hover:bg-accent ${
        !notification.isRead ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* 发送者头像 */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage
              alt={notification.sendUserInfo.name}
              src={notification.sendUserInfo.avatar}
            />
            <AvatarFallback>
              {notification.sendUserInfo.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* 类型图标 */}
          <div
            className={`absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-sm ${typeConfig?.color}`}
          >
            <TypeIcon size={14} />
          </div>
        </div>

        {/* 通知内容 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm">
                {notification.sendUserInfo.name}
              </p>
              <p className="mt-1 text-muted-foreground text-sm">{notification.content}</p>
            </div>
            {/* 未读标识 */}
            {!notification.isRead && (
              <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </div>

          {/* 关联对象预览 */}
          {notification.objInfo && (
            <div className="mt-2 rounded-lg bg-muted/50 p-2">
              <p className="line-clamp-1 font-medium text-sm">{notification.objInfo.title}</p>
              {notification.objInfo.content && (
                <p className="line-clamp-2 mt-1 text-muted-foreground text-xs">
                  {notification.objInfo.content}
                </p>
              )}
            </div>
          )}

          {/* 时间 */}
          <p className="mt-2 text-muted-foreground text-xs">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
