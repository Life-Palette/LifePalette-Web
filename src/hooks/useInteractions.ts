import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/query-keys";
import { collectionsApi, likesApi } from "@/services/api";

/** 点赞/取消点赞 — 全局唯一实现 */
export const useLikeTopic = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isLiked }: { topicId: string; isLiked: boolean }) =>
      isLiked ? likesApi.delete(topicId) : likesApi.create(topicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.topics.all });
      qc.invalidateQueries({ queryKey: queryKeys.likes.all });
    },
    onError: (err) => toast.error("操作失败", { description: err.message }),
  });
};

/** 收藏/取消收藏 — 全局唯一实现 */
export const useCollectTopic = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ topicId, isCollected }: { topicId: string; isCollected: boolean }) =>
      isCollected ? collectionsApi.delete(topicId) : collectionsApi.create(topicId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.topics.all });
      qc.invalidateQueries({ queryKey: queryKeys.collections.all });
    },
    onError: (err) => toast.error("操作失败", { description: err.message }),
  });
};

// ============ 防抖封装 ============

import { debounce } from "@iceywu/utils";
import { useCallback, useMemo, useRef } from "react";
import { useIsAuthenticated } from "./useAuth";

/** 带防抖的点赞/收藏操作，用于卡片列表和详情页 */
export function usePostActions(options: { debounceMs?: number; onUnauthorized?: () => void } = {}) {
  const { debounceMs = 300, onUnauthorized } = options;
  const { isAuthenticated } = useIsAuthenticated();
  const likeMutation = useLikeTopic();
  const collectMutation = useCollectTopic();
  const likeRef = useRef(likeMutation);
  const collectRef = useRef(collectMutation);
  likeRef.current = likeMutation;
  collectRef.current = collectMutation;

  const debouncedLike = useMemo(
    () =>
      debounce((topicId: string, isLiked: boolean) => {
        likeRef.current.mutate({ topicId, isLiked });
      }, debounceMs),
    [debounceMs]
  );

  const debouncedCollect = useMemo(
    () =>
      debounce((topicId: string, isSaved: boolean) => {
        collectRef.current.mutate({ topicId, isCollected: isSaved });
      }, debounceMs),
    [debounceMs]
  );

  const handleLike = useCallback(
    (topicId: string, isLiked: boolean) => {
      if (!isAuthenticated) {
        onUnauthorized?.();
        return;
      }
      debouncedLike(topicId, isLiked);
    },
    [isAuthenticated, onUnauthorized, debouncedLike]
  );

  const handleSave = useCallback(
    (topicId: string, isSaved: boolean) => {
      if (!isAuthenticated) {
        onUnauthorized?.();
        return;
      }
      debouncedCollect(topicId, isSaved);
    },
    [isAuthenticated, onUnauthorized, debouncedCollect]
  );

  return { handleLike, handleSave, isLoading: likeMutation.isPending || collectMutation.isPending };
}
