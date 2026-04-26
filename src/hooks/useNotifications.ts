import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { notificationsApi } from "@/services/api";
import type { NotificationMessage } from "@/types";
import { useInfiniteList } from "./useInfiniteList";

// 获取通知列表的hook（无限滚动版本）
export const useNotifications = (params?: { type?: string; isRead?: boolean; pageSize?: number }) =>
  useInfiniteList<NotificationMessage>(
    queryKeys.notifications.infinite(params),
    (page) =>
      notificationsApi.list({
        page,
        page_size: params?.pageSize || 10,
        type: params?.type,
        is_read: params?.isRead,
      }),
    { staleTime: 5 * 60 * 1000 }
  );

// 获取未读通知数量的hook
export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
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
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000,
  });
};

// 标记通知为已读的hook
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      return await notificationsApi.markAsRead(notificationId);
    },
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.infinite());

      queryClient.setQueryData(queryKeys.notifications.infinite(), (oldData: any) => {
        if (!oldData) {
          return oldData;
        }
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((notification: NotificationMessage) => {
              if (notification.id === notificationId) {
                return { ...notification, isRead: true };
              }
              return notification;
            }),
          })),
        };
      });

      queryClient.setQueryData(queryKeys.notifications.unreadCount(), (oldCount = 0) =>
        Math.max(0, oldCount - 1)
      );

      return { previousNotifications };
    },
    onError: (_error, _notificationId, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.infinite(), context.previousNotifications);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
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
    mutationFn: async () => {
      return await notificationsApi.markAllAsRead();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      const previousNotifications = queryClient.getQueryData(queryKeys.notifications.infinite());

      queryClient.setQueryData(queryKeys.notifications.infinite(), (oldData: any) => {
        if (!oldData) {
          return oldData;
        }
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((notification: NotificationMessage) => ({
              ...notification,
              isRead: true,
            })),
          })),
        };
      });

      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0);

      return { previousNotifications };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(queryKeys.notifications.infinite(), context.previousNotifications);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
