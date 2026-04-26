import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { adaptPage, tagsApi } from "@/services/api";

/** 标签列表 */
export const useTags = (params?: { page?: number; size?: number; sort?: string }) =>
  useQuery({
    queryKey: queryKeys.tags.list(params),
    queryFn: async () => {
      const res = await tagsApi.list({
        page: params?.page,
        page_size: params?.size,
        sort: params?.sort,
      });
      return adaptPage(res.result);
    },
    staleTime: 10 * 60 * 1000,
  });
