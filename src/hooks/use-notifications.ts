import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { notificationsApi } from "@/services/api";
import type { NotificationMessage } from "@/types";
import { useInfiniteList } from "./use-infinite-list";

interface NotificationPages {
  pageParams: unknown[];
  pages: Array<{ items: NotificationMessage[] }>;
}

// 获取通知列表的hook（无限滚动版本）
export const useNotifications = (params?: {
  type?: string;
  isRead?: boolean;
  pageSize?: number;
}) =>
  useInfiniteList<NotificationMessage>(
    queryKeys.notifications.infinite(params),
    (page) =>
      notificationsApi.list({
        is_read: params?.isRead,
        page,
        page_size: params?.pageSize || 10,
        type: params?.type,
      }),
    { staleTime: 5 * 60 * 1000 }
  );

// 获取未读通知数量的hook
export const useUnreadCount = () =>
  useQuery({
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      try {
        const res = await notificationsApi.getUnreadCount();
        if (res.result !== undefined && res.result !== null) {
          return res.result.count ?? 0;
        }
        return 0;
      } catch (error) {
        console.error("获取未读通知数量失败:", error);
        return 0;
      }
    },
    queryKey: queryKeys.notifications.unreadCount(),
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

// 标记通知为已读的hook
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) =>
      await notificationsApi.markAsRead(notificationId),
    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.infinite(),
          context.previousNotifications
        );
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.all,
      });

      const previousNotifications = queryClient.getQueryData(
        queryKeys.notifications.infinite()
      );

      queryClient.setQueryData(
        queryKeys.notifications.infinite(),
        (oldData: NotificationPages | undefined) => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification: NotificationMessage) => {
                if (notification.id === notificationId) {
                  return { ...notification, isRead: true };
                }
                return notification;
              }),
            })),
          };
        }
      );

      queryClient.setQueryData(
        queryKeys.notifications.unreadCount(),
        (oldCount = 0) => Math.max(0, oldCount - 1)
      );

      return { previousNotifications };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

// 标记所有通知为已读的hook
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await notificationsApi.markAllAsRead(),
    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.infinite(),
          context.previousNotifications
        );
      }
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.notifications.all,
      });

      const previousNotifications = queryClient.getQueryData(
        queryKeys.notifications.infinite()
      );

      queryClient.setQueryData(
        queryKeys.notifications.infinite(),
        (oldData: NotificationPages | undefined) => {
          if (!oldData) {
            return oldData;
          }
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((notification: NotificationMessage) => ({
                ...notification,
                isRead: true,
              })),
            })),
          };
        }
      );

      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0);

      return { previousNotifications };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
