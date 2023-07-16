import { http } from "~/utils/http";

export const topicFindAll = (params) => {
  return http.request(
    "get",
    "/topic",
    { params },
    {
      // isNeedFullRes: false, // 是否需要返回完整的响应对象
      // isShowLoading: true, // 是否显示loading
      isNeedToken: false, // 是否需要token
    }
  );
};
export const topicFindById = (id) => {
  return http.request(
    "get",
    `/topic/${id}`,
    {},
    {
      isNeedToken: false, // 是否需要token
    }
  );
};

// 文件上传
export const topicCreate = (data) => {
  return http.request(
    "post",
    `/topic`,
    { data },
    {
      isNeedToken: true, // 是否需要token
    }
  );
};
