import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { adaptPage, topicsApi, usersApi } from "@/services/api";
import { transformTopic } from "@/utils/transformers";
import { useInfiniteList } from "./useInfiniteList";

// ============ 查询 ============

/** 话题列表（普通分页） */
export const useTopics = (params?: {
  page?: number;
  size?: number;
  sort?: string;
  keywords?: string;
  tagId?: number;
}) =>
  useQuery({
    queryKey: queryKeys.topics.list(params),
    queryFn: async () => {
      const res = await topicsApi.list({
        page: params?.page,
        page_size: params?.size,
        sort: params?.sort,
        search: params?.keywords,
        tag_id: params?.tagId,
      });
      const pg = adaptPage(res.result);
      return { items: pg.list.map(transformTopic), ...pg };
    },
    staleTime: 10 * 60 * 1000,
  });

/** 话题列表（无限滚动） */
export const useInfiniteTopics = (params?: {
  size?: number;
  sort?: string;
  keywords?: string;
  tagId?: number;
  userSecUid?: string;
}) =>
  useInfiniteList(
    queryKeys.topics.infinite(params),
    (page) =>
      topicsApi.list({
        page,
        page_size: params?.size || 20,
        sort: params?.sort,
        search: params?.keywords,
        tag_id: params?.tagId,
        user_sec_uid: params?.userSecUid,
      }),
    { transform: transformTopic }
  );

/** 用户点赞的话题（无限滚动） */
export const useInfiniteLikedTopics = (userSecUid?: string) =>
  useInfiniteList(
    queryKeys.likes.infinite(userSecUid!, {}),
    (page) => usersApi.getLikes(userSecUid!, { page, page_size: 20 }),
    {
      transform: (item: any) => transformTopic(item.topic || item),
      enabled: !!userSecUid,
    }
  );

/** 用户收藏的话题（无限滚动） */
export const useInfiniteCollectedTopics = (userSecUid?: string) =>
  useInfiniteList(
    queryKeys.collections.infinite(userSecUid!, {}),
    (page) => usersApi.getCollections(userSecUid!, { page, page_size: 20 }),
    {
      transform: (item: any) => transformTopic(item.topic || item),
      enabled: !!userSecUid,
    }
  );

// ============ 变更 ============

/** 创建话题 */
export const useCreateTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      content_type?: string;
      tags?: string[];
      file_sec_uids?: string[];
    }) => {
      const res = await topicsApi.create(data);
      return transformTopic(res.result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.topics.all });
      toast.success("发布成功");
    },
    onError: (err) => toast.error("发布失败", { description: err.message }),
  });
};

/** 更新话题 */
export const useUpdateTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ secUid, ...data }: { secUid: string } & Record<string, any>) => {
      const res = await topicsApi.update(secUid, data);
      return transformTopic(res.result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.topics.all });
      toast.success("更新成功");
    },
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
