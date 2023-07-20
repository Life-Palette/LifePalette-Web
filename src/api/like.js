import { http } from "~/utils/http";

export const likeFindById = (params) => {
  return http.request(
    "get",
    `/like`,
    {params},
    {
      isNeedToken: false, // 是否需要token
    }
  );
};

// 评论创建
export const likeCreate = (data) => {
  return http.request(
    "post",
    `/like`,
    { data },
    {
      isNeedToken: true, // 是否需要token
    }
  );
};
