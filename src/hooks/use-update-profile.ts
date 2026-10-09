/* biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: this existing integration requires the current implementation */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usersApi } from "@/services/api";
import { DEFAULT_UPLOAD_OPTIONS, uploadMedia } from "@/services/upload";
import type { UpdateProfileData } from "@/types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      let avatarUID: string | undefined;
      let backgroundUID: string | undefined;

      if (data.avatarFile) {
        const uploaded = await uploadMedia(data.avatarFile, {
          ...DEFAULT_UPLOAD_OPTIONS,
        });
        avatarUID = uploaded.uid;
      }

      if (data.backgroundFile) {
        const uploaded = await uploadMedia(data.backgroundFile, {
          ...DEFAULT_UPLOAD_OPTIONS,
        });
        backgroundUID = uploaded.uid;
      }

      const updateData: Record<string, unknown> = {};
      if (data.lp_id !== undefined) {
        updateData.lp_id = data.lp_id;
      }
      if (data.name !== undefined) {
        updateData.username = data.name;
      }
      if (data.signature !== undefined) {
        updateData.signature = data.signature;
      }
      if (data.mobile !== undefined) {
        updateData.mobile = data.mobile;
      }
      if (data.email !== undefined) {
        updateData.email = data.email;
      }
      if (data.sex !== undefined) {
        updateData.sex = data.sex;
      }
      if (data.birthday !== undefined) {
        updateData.birthday = data.birthday;
      }
      if (data.city !== undefined) {
        updateData.city = data.city;
      }
      if (data.job !== undefined) {
        updateData.job = data.job;
      }
      if (data.company !== undefined) {
        updateData.company = data.company;
      }
      if (data.website !== undefined) {
        updateData.website = data.website;
      }
      if (avatarUID) {
        updateData.avatar_uid = avatarUID;
      }
      if (backgroundUID) {
        updateData.background_uid = backgroundUID;
      }

      const res = await usersApi.updateMe(updateData);
      return res.result;
    },
    onError: (error: Error) => {
      console.error("更新用户资料失败:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
  });
};
