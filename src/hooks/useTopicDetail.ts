import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { commentsApi, topicsApi } from "@/services/api";
import { transformComment, transformTopic } from "@/utils/transformers";

// 复用共享的交互 hooks
export { useCollectTopic, useLikeTopic } from "./useInteractions";

/** 话题详情 */
export const useTopicDetail = (secUid: string) =>
  useQuery({
    queryKey: queryKeys.topics.detail(secUid),
    queryFn: async () => {
      const res = await topicsApi.getBySecUid(secUid);
      return transformTopic(res.result);
    },
    enabled: !!secUid,
    staleTime: 5 * 60 * 1000,
  });

/** 话题评论列表 */
export const useComments = (topicSecUid: string) =>
  useQuery({
    queryKey: queryKeys.comments.byTopic(topicSecUid),
    queryFn: async () => {
      const res = await commentsApi.listByTopic(topicSecUid, { page: 1, page_size: 50 });
      return (res.result?.list || []).map(transformComment);
    },
    enabled: !!topicSecUid,
    staleTime: 2 * 60 * 1000,
  });

/** 评论回复列表 */
export const useCommentReplies = (commentSecUid: string, enabled = true) =>
  useQuery({
    queryKey: ["commentReplies", commentSecUid],
    queryFn: async () => {
      const res = await commentsApi.list({ page: 1, page_size: 50 });
      return (res.result?.list || []).map(transformComment);
    },
    enabled: enabled && !!commentSecUid,
    staleTime: 2 * 60 * 1000,
  });

/** 创建评论 */
export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { content: string; topicSecUid: string; parentSecUid?: string }) => {
      const res = await commentsApi.create({
        topic_sec_uid: data.topicSecUid,
        content: data.content,
        parent_sec_uid: data.parentSecUid,
      });
      return res.result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.all });
    },
  });
};

/** 删除评论 */
export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (secUid: string) => commentsApi.delete(secUid),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.comments.all }),
  });
};

/** 删除话题 */
export const useDeleteTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (secUid: string) => topicsApi.delete(secUid),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.topics.all }),
  });
};
