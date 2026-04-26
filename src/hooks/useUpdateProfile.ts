import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { usersApi } from "@/services/api";
import { uploader } from "@/services/upload";
import type { UpdateProfileData } from "@/types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      let avatarSecUID: string | undefined;
      let backgroundSecUID: string | undefined;

      if (data.avatarFile) {
        const uploaded = await uploader.upload(data.avatarFile, { compress: true, maxSizeMB: 1 });
        avatarSecUID = uploaded.sec_uid;
      }

      if (data.backgroundFile) {
        const uploaded = await uploader.upload(data.backgroundFile, {
          compress: true,
          maxSizeMB: 5,
        });
        backgroundSecUID = uploaded.sec_uid;
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
      if (avatarSecUID) {
        updateData.avatar_sec_uid = avatarSecUID;
      }
      if (backgroundSecUID) {
        updateData.background_sec_uid = backgroundSecUID;
      }

      const res = await usersApi.updateMe(updateData);
      return res.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
    onError: () => {},
  });
};
