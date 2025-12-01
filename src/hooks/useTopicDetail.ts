import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import type { Post, PostImage } from "@/types";

// 将API话题数据转换为前端Post类型（复用之前的逻辑）
const transformApiTopicToPost = (apiTopic: any): Post => {
  // 处理文件列表 - 可能是 fileList 数组或 FileList 数组
  const fileList = apiTopic.fileList || apiTopic.FileList || [];
  const images: PostImage[] = fileList
    .filter((item: any) => {
      const file = item.file || item;
      // 保留图片和视频文件
      return file.type && (file.type.startsWith("image/") || file.type.startsWith("video/"));
    })
    .map((item: any) => {
      const file = item.file || item;
      return {
        ...file,
      };
    });

  const tags = (apiTopic.topicTags || []).map((topicTag: any) => topicTag.tag.title);

  const avatar =
    apiTopic.user?.avatarInfo?.url || "https://test.wktest.cn:3001/assets/default/boy.png";

  const location = apiTopic.user?.ipInfo
    ? `${apiTopic.user.ipInfo.city}·${apiTopic.user.ipInfo.regionName}`
    : undefined;

  // 使用新的响应字段
  const isLiked = apiTopic.isLiked || false;
  const isSaved = apiTopic.isCollected || false;

  return {
    id: String(apiTopic.id),
    title: apiTopic.title,
    content: apiTopic.content,
    images,
    author: {
      id: apiTopic.user?.id || apiTopic.userId,
      name: apiTopic.user?.name || "未知用户",
      avatar,
    },
    tags,
    likes: apiTopic.likesCount || 0,
    comments: apiTopic.commentsCount || 0,
    saves: apiTopic.collectionsCount || 0,
    isLiked,
    isSaved,
    createdAt: apiTopic.createdAt,
    updatedAt: apiTopic.updatedAt,
    location,
  };
};

// 获取话题详情的hook
export const useTopicDetail = (id: number, userId?: number) =>
  useQuery({
    queryKey: ["topic", id, userId],
    queryFn: async () => {
      const response = await apiService.getTopicDetail(id, userId, true);
      if (response.code === 200 && response.result) {
        return transformApiTopicToPost(response.result);
      }
      throw new Error(response.message || "获取话题详情失败");
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

// 获取评论列表的hook
export const useComments = (topicId: number) =>
  useQuery({
    queryKey: ["comments", topicId],
    queryFn: async () => {
      const response = await apiService.getComments({
        topicId,
        page: 1,
        size: 50,
      });
      if (response.code === 200 && response.result) {
        return response.result.list;
      }
      throw new Error(response.message || "获取评论失败");
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

// 获取某个评论的回复列表的hook
export const useCommentReplies = (commentId: number, enabled: boolean = true) =>
  useQuery({
    queryKey: ["commentReplies", commentId],
    queryFn: async () => {
      const response = await apiService.getComments({
        parentId: commentId,
        page: 1,
        size: 50,
      });
      if (response.code === 200 && response.result) {
        return response.result.list;
      }
      throw new Error(response.message || "获取回复失败");
    },
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

// 创建评论的hook（包括一级评论和回复）
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      content: string;
      userId: number;
      topicId?: number;
      parentId?: number;
      replyToUserId?: number;
    }) => {
      const response = await apiService.createComment(data);
      if (response.code === 200) {
        return response.result;
      }
      throw new Error(response.message || "创建评论失败");
    },
    onSuccess: (_data, variables) => {
      // 刷新评论列表
      if (variables.topicId) {
        queryClient.invalidateQueries({
          queryKey: ["comments", variables.topicId],
        });
      } else {
        // 如果没有topicId，刷新所有评论
        queryClient.invalidateQueries({
          queryKey: ["comments"],
        });
      }
    },
    onError: (_error) => {},
  });
};

// 删除评论的hook
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: number) => {
      const response = await apiService.deleteComment(commentId);
      if (response.code === 200) {
        return response.result;
      }
      throw new Error(response.message || "删除评论失败");
    },
    onSuccess: () => {
      // 刷新所有评论相关的查询
      queryClient.invalidateQueries({
        queryKey: ["comments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["commentReplies"],
      });
    },
    onError: (_error) => {},
  });
};

// 删除动态的hook
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (topicId: number) => {
      const response = await apiService.deleteTopic(topicId);
      if (response.code === 200) {
        return response.result;
      }
      throw new Error(response.message || "删除动态失败");
    },
    onSuccess: () => {
      // 刷新话题列表
      queryClient.invalidateQueries({
        queryKey: ["topics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userTopics"],
      });
    },
    onError: (_error) => {},
  });
};

// 点赞/取消点赞话题的hook
export const useLikeTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isLiked }: { topicId: number; isLiked: boolean }) => {
      const response = isLiked
        ? await apiService.unlikeTopic(topicId)
        : await apiService.likeTopic(topicId);
      if (response.code === 200) {
        return response.result;
      }
      throw new Error(response.message || (isLiked ? "取消点赞失败" : "点赞失败"));
    },
    onMutate: async ({ topicId, isLiked }) => {
      // 取消所有相关的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: ["topic", topicId] });

      // 获取之前的数据作为快照
      const previousTopic = queryClient.getQueryData(["topic", topicId]);

      // 乐观更新
      queryClient.setQueryData(["topic", topicId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isLiked: !isLiked,
          likes: isLiked ? old.likes - 1 : old.likes + 1,
        };
      });

      return { previousTopic };
    },
    onError: (_error, { topicId }, context) => {
      // 如果失败，回滚到之前的状态
      if (context?.previousTopic) {
        queryClient.setQueryData(["topic", topicId], context.previousTopic);
      }
    },
    onSettled: (_data, _error, { topicId }) => {
      // 无论成功还是失败，都重新获取数据以确保同步
      queryClient.invalidateQueries({ queryKey: ["topic", topicId] });
    },
  });
};

// 收藏/取消收藏话题的hook
export const useCollectTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isSaved }: { topicId: number; isSaved: boolean }) => {
      const response = isSaved
        ? await apiService.uncollectTopic(topicId)
        : await apiService.collectTopic(topicId);
      if (response.code === 200) {
        return response.result;
      }
      throw new Error(response.message || (isSaved ? "取消收藏失败" : "收藏失败"));
    },
    onMutate: async ({ topicId, isSaved }) => {
      // 取消所有相关的查询，避免覆盖我们的乐观更新
      await queryClient.cancelQueries({ queryKey: ["topic", topicId] });

      // 获取之前的数据作为快照
      const previousTopic = queryClient.getQueryData(["topic", topicId]);

      // 乐观更新
      queryClient.setQueryData(["topic", topicId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isSaved: !isSaved,
          saves: isSaved ? old.saves - 1 : old.saves + 1,
        };
      });

      return { previousTopic };
    },
    onError: (_error, { topicId }, context) => {
      // 如果失败，回滚到之前的状态
      if (context?.previousTopic) {
        queryClient.setQueryData(["topic", topicId], context.previousTopic);
      }
    },
    onSettled: (_data, _error, { topicId }) => {
      // 无论成功还是失败，都重新获取数据以确保同步
      queryClient.invalidateQueries({ queryKey: ["topic", topicId] });
    },
  });
};
