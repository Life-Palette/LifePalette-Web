import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { apiService } from "@/services/api";
import type { NotificationMessage } from "@/types";

// 获取通知列表的hook（无限滚动版本）
export const useNotifications = (params?: {
  type?: string;
  isRead?: boolean;
  pageSize?: number;
}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.infiniteList(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getNotifications({
        ...params,
        page: pageParam,
        pageSize: params?.pageSize || 10,
      });

      if (response.code === 200 && response.result) {
        return {
          items: response.result.list as NotificationMessage[],
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          pageSize: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
          hasNextPage: response.result.pagination.page < response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取通知列表失败");
    },
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    gcTime: 15 * 60 * 1000, // 15分钟垃圾回收
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// 获取未读通知数量的hook
export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      try {
        const response = await apiService.getUnreadNotificationCount();
        if (response.code === 200 && response.result !== undefined && response.result !== null) {
          return response.result.count ?? 0;
        }
        return 0;
      } catch (error) {
        console.error("获取未读通知数量失败:", error);
        return 0; // 确保总是返回一个数字
      }
    },
    staleTime: 2 * 60 * 1000, // 2分钟内数据被认为是新鲜的
    gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
    retry: 1,
    refetchOnWindowFocus: true, // 窗口聚焦时重新获取
    refetchInterval: 5 * 60 * 1000, // 每5分钟轮询一次
  });
};

// 标记通知为已读的hook
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiService.markNotificationAsRead(notificationId);
    },
    onMutate: async (notificationId) => {
      // 乐观更新：立即更新UI
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      // 保存之前的数据以便回滚
      const previousNotifications = queryClient.getQueryData(
        queryKeys.notifications.infiniteLists(),
      );

      // 更新通知列表缓存
      queryClient.setQueryData(queryKeys.notifications.infiniteLists(), (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map((notification: NotificationMessage) => {
              if (notification.id === notificationId) {
                return {
                  ...notification,
                  isRead: true,
                };
              }
              return notification;
            }),
          })),
        };
      });

      // 更新未读数量
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), (oldCount: number = 0) =>
        Math.max(0, oldCount - 1),
      );

      return { previousNotifications };
    },
    onError: (_error, _notificationId, context) => {
      // 发生错误时回滚
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.notifications.infiniteLists(),
          context.previousNotifications,
        );
      }
      // 重新获取未读数量
      queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(),
      });
    },
    onSettled: () => {
      // 无论成功或失败，都重新获取数据以确保同步
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

// 标记所有通知为已读的hook
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await apiService.markAllNotificationsAsRead();
    },
    onMutate: async () => {
      // 乐观更新：立即更新UI
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // 保存之前的数据以便回滚
      const previousNotifications = queryClient.getQueryData(["notifications", "infinite"]);

      // 更新通知列表缓存，将所有通知标记为已读
      queryClient.setQueryData(["notifications", "infinite"], (oldData: any) => {
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

      // 将未读数量设置为0
      queryClient.setQueryData(["notifications", "unreadCount"], 0);

      return { previousNotifications };
    },
    onError: (_error, _variables, context) => {
      // 发生错误时回滚
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications", "infinite"], context.previousNotifications);
      }
      // 重新获取未读数量
      queryClient.invalidateQueries({
        queryKey: ["notifications", "unreadCount"],
      });
    },
    onSettled: () => {
      // 无论成功或失败，都重新获取数据以确保同步
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
