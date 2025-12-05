import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/services/api";
import { uploadFile } from "@/services/upload/uploadService";
import type { UpdateProfileData } from "@/types";

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      let avatarFileMd5: string | undefined;
      let backgroundFileMd5: string | undefined;

      // 如果有头像文件，使用统一的上传服务
      if (data.avatarFile) {
        const uploadedFile = await uploadFile(data.avatarFile, {
          compressPNG: true,
          compressJPEG: true,
          maxSizeMB: 1,
        });

        avatarFileMd5 = uploadedFile.md5 || uploadedFile.fileMd5;
      }

      // 如果有背景图片文件，使用统一的上传服务
      if (data.backgroundFile) {
        const uploadedFile = await uploadFile(data.backgroundFile, {
          compressPNG: true,
          compressJPEG: true,
          maxSizeMB: 5,
        });

        backgroundFileMd5 = uploadedFile.md5 || uploadedFile.fileMd5;
      }

      // 获取当前用户信息以获取 userId
      const currentUserResponse = await apiService.getCurrentUser();
      const userId = currentUserResponse.result.id;

      // 构建更新数据
      const updateData: {
        name?: string;
        signature?: string;
        mobile?: string;
        email?: string;
        sex?: number;
        birthday?: string;
        city?: string;
        job?: string;
        company?: string;
        website?: string;
        github?: string;
        avatarFileMd5?: string;
        backgroundInfoFileMd5?: string;
        code?: string;
      } = {};

      // 只添加有值的字段
      if (data.name !== undefined) updateData.name = data.name;
      if (data.signature !== undefined) updateData.signature = data.signature;
      if (data.mobile !== undefined) updateData.mobile = data.mobile;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.code !== undefined) updateData.code = data.code; // 邮箱验证码
      if (data.sex !== undefined) updateData.sex = data.sex;
      if (data.birthday !== undefined) updateData.birthday = data.birthday;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.job !== undefined) updateData.job = data.job;
      if (data.company !== undefined) updateData.company = data.company;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.github !== undefined) updateData.github = data.github;
      if (avatarFileMd5) updateData.avatarFileMd5 = avatarFileMd5;
      if (backgroundFileMd5) updateData.backgroundInfoFileMd5 = backgroundFileMd5;
      if (data.backgroundInfoFileMd5 !== undefined)
        updateData.backgroundInfoFileMd5 = data.backgroundInfoFileMd5;

      // 调用新的更新接口
      const response = await apiService.updateUser(userId, updateData);

      return response.result;
    },
    onSuccess: () => {
      // 刷新用户数据缓存
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      // 错误会被组件捕获并处理
    },
  });
};
