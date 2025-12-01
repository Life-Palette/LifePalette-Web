import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { type ApiTopic, apiService } from "@/services/api";
import type { Post, PostImage } from "@/types";

// 将API话题数据转换为前端Post类型
const transformApiTopicToPost = (apiTopic: ApiTopic): Post => {
  // 提取图片信息，包含完整的元数据
  // const images: PostImage[] = apiTopic.fileList
  //   .filter((file) => file.type.startsWith("image/"))
  //   .map((file) => ({
  //     id: file.id,
  //     url: file.url,
  //     width: file.width,
  //     height: file.height,
  //     blurhash: file.blurhash,
  //     type: file.type,
  //     name: file.name,
  //   }));
  const images: PostImage[] = apiTopic.fileList || [];

  // 提取标签
  const tags = (apiTopic.topicTags || []).map((topicTag) => topicTag.tag.title);

  // 构建用户头像URL
  const avatar =
    apiTopic.user?.avatarInfo?.url || "https://test.wktest.cn:3001/assets/default/boy.png";

  // 构建位置信息
  const location = apiTopic.user?.ipInfo
    ? `${apiTopic.user.ipInfo.city}·${apiTopic.user.ipInfo.regionName}`
    : undefined;

  return {
    id: String(apiTopic.id),
    title: apiTopic.title,
    content: apiTopic.content,
    images,
    author: {
      name: apiTopic.user?.name || "未知用户",
      avatar,
    },
    tags,
    likes: apiTopic.likesCount || 0,
    comments: apiTopic.commentsCount || 0,
    saves: apiTopic.collectionsCount || 0,
    isLiked: apiTopic.isLiked || false,
    isSaved: apiTopic.isCollected || false,
    createdAt: apiTopic.createdAt,
    location,
  };
};

// 获取话题列表的hook（无限滚动版本）
export const useInfiniteTopics = (params?: {
  size?: number;
  sort?: string;
  title?: string;
  keywords?: string;
  tagId?: number;
  userId?: number;
  exif?: boolean;
}) => {
  return useInfiniteQuery({
    queryKey: queryKeys.topics.infiniteList(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiService.getTopics({
        ...params,
        page: pageParam,
        size: params?.size || 20,
      });

      if (response.code === 200 && response.result) {
        return {
          items: response.result.list.map(transformApiTopicToPost),
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
          hasNextPage: response.result.pagination.page < response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取话题列表失败");
    },
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    staleTime: 10 * 60 * 1000, // 增加到10分钟
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
    retry: 2,
    refetchOnWindowFocus: false, // 配合keep-alive，避免不必要的重新获取
  });
};

// 获取话题列表的hook（普通版本，保持向后兼容）
export const useTopics = (params?: {
  page?: number;
  size?: number;
  sort?: string;
  title?: string;
  keywords?: string;
  tagId?: number;
  userId?: number;
  exif?: boolean;
}) => {
  return useQuery({
    queryKey: queryKeys.topics.list(params),
    queryFn: async () => {
      const response = await apiService.getTopics(params);
      if (response.code === 200 && response.result) {
        return {
          items: response.result.list.map(transformApiTopicToPost),
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取话题列表失败");
    },
    staleTime: 10 * 60 * 1000, // 10分钟内数据被认为是新鲜的
    gcTime: 30 * 60 * 1000, // 30分钟垃圾回收
    retry: 2,
    refetchOnWindowFocus: false, // 配合keep-alive，避免不必要的重新获取
  });
};

// 点赞话题的hook
export const useLikeTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isLiked }: { topicId: number; isLiked: boolean }) => {
      return isLiked ? await apiService.unlikeTopic(topicId) : await apiService.likeTopic(topicId);
    },

    // 乐观更新
    onMutate: async ({ topicId, isLiked }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: queryKeys.topics.all });

      // 保存之前的数据用于回滚
      const previousData = {
        topics: queryClient.getQueryData(queryKeys.topics.lists()),
        infiniteTopics: queryClient.getQueryData(queryKeys.topics.infiniteLists()),
      };

      // 更新函数
      const updateFn = (post: Post) => {
        if (post.id === String(topicId)) {
          return {
            ...post,
            isLiked: !isLiked,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      };

      // 更新所有相关缓存
      queryClient.setQueriesData({ queryKey: queryKeys.topics.lists() }, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, items: oldData.items.map(updateFn) };
      });

      queryClient.setQueriesData({ queryKey: queryKeys.topics.infiniteLists() }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map(updateFn),
          })),
        };
      });

      return { previousData };
    },

    // 错误回滚
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.topics.lists(), context.previousData.topics);
        queryClient.setQueryData(
          queryKeys.topics.infiniteLists(),
          context.previousData.infiniteTopics,
        );
      }

      toast.error("操作失败", {
        description: error.message || "请稍后重试",
      });
    },

    // 成功后重新验证
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
    },
  });
};

// 创建话题的hook
export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      tags?: string[];
      fileIds?: (number | string)[];
      extraData?: string;
      isPinned?: boolean;
    }) => {
      const response = await apiService.createTopic(data);
      if (response.code === 200 && response.result) {
        return transformApiTopicToPost(response.result);
      }
      throw new Error(response.message || "创建话题失败");
    },
    onSuccess: (newPost) => {
      // 将新话题添加到普通查询缓存的开头
      queryClient.setQueryData(queryKeys.topics.lists(), (oldData: any) => {
        if (!oldData) {
          return {
            items: [newPost],
            total: 1,
            page: 1,
            size: 10,
            totalPages: 1,
          };
        }

        return {
          ...oldData,
          items: [newPost, ...oldData.items],
          total: oldData.total + 1,
        };
      });

      // 将新话题添加到无限查询缓存的开头
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.infiniteLists() });

      toast.success("发布成功");
    },
    onError: (error) => {
      toast.error("发布失败", {
        description: error.message || "请稍后重试",
      });
    },
  });
};

// 获取用户喜欢的话题列表（无限滚动版本）
export const useInfiniteLikedTopics = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: queryKeys.likes.infiniteByUser(userId!, {}),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) {
        return {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          totalPages: 0,
          hasNextPage: false,
        };
      }

      const response = await apiService.getUserLikedTopics(userId, {
        page: pageParam,
        size: 20,
      });

      if (response.code === 200 && response.result) {
        return {
          items: response.result.list.map(transformApiTopicToPost),
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
          hasNextPage: response.result.pagination.page < response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取喜欢列表失败");
    },
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// 收藏话题的hook
export const useCollectTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isCollected }: { topicId: number; isCollected: boolean }) => {
      return isCollected
        ? await apiService.uncollectTopic(topicId)
        : await apiService.collectTopic(topicId);
    },

    // 乐观更新
    onMutate: async ({ topicId, isCollected }) => {
      // 取消正在进行的查询
      await queryClient.cancelQueries({ queryKey: queryKeys.topics.all });

      // 保存之前的数据
      const previousData = {
        topics: queryClient.getQueryData(queryKeys.topics.lists()),
        infiniteTopics: queryClient.getQueryData(queryKeys.topics.infiniteLists()),
      };

      // 更新函数
      const updateFn = (post: Post) => {
        if (post.id === String(topicId)) {
          return {
            ...post,
            isSaved: !isCollected,
            saves: isCollected ? post.saves - 1 : post.saves + 1,
          };
        }
        return post;
      };

      // 更新缓存
      queryClient.setQueriesData({ queryKey: queryKeys.topics.lists() }, (oldData: any) => {
        if (!oldData) return oldData;
        return { ...oldData, items: oldData.items.map(updateFn) };
      });

      queryClient.setQueriesData({ queryKey: queryKeys.topics.infiniteLists() }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            items: page.items.map(updateFn),
          })),
        };
      });

      return { previousData };
    },

    // 错误回滚
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKeys.topics.lists(), context.previousData.topics);
        queryClient.setQueryData(
          queryKeys.topics.infiniteLists(),
          context.previousData.infiniteTopics,
        );
      }

      toast.error("操作失败", {
        description: error.message || "请稍后重试",
      });
    },

    // 成功后重新验证
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.topics.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
    },
  });
};

// 获取用户收藏的话题列表（无限滚动版本）
export const useInfiniteCollectedTopics = (userId?: number) => {
  return useInfiniteQuery({
    queryKey: queryKeys.collections.infiniteByUser(userId!, {}),
    initialPageParam: 1,
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId) {
        return {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          totalPages: 0,
          hasNextPage: false,
        };
      }

      const response = await apiService.getUserCollectedTopics(userId, {
        page: pageParam,
        size: 20,
      });

      if (response.code === 200 && response.result) {
        return {
          items: response.result.list.map(transformApiTopicToPost),
          total: response.result.pagination.total,
          page: response.result.pagination.page,
          size: response.result.pagination.pageSize,
          totalPages: response.result.pagination.totalPages,
          hasNextPage: response.result.pagination.page < response.result.pagination.totalPages,
        };
      }
      throw new Error(response.message || "获取收藏列表失败");
    },
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

// 更新话题的hook
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        content?: string;
        tags?: string[];
        fileIds?: (number | string)[];
        extraData?: string;
        isPinned?: boolean;
      };
    }) => {
      const response = await apiService.updateTopic(id, data);
      if (response.code === 200 && response.result) {
        return transformApiTopicToPost(response.result);
      }
      throw new Error(response.message || "更新话题失败");
    },
    onSuccess: (_data, variables) => {
      // 刷新话题详情缓存
      queryClient.invalidateQueries({ queryKey: ["topic", variables.id] });
      // 刷新话题列表缓存
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
    onError: (_error) => {},
  });
};
