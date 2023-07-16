import { http } from "~/utils/http";

export const tagFindAll = (params) => {
  return http.request(
    "get",
    "/tag",
    { params },
    {
      // isNeedFullRes: false, // 是否需要返回完整的响应对象
      // isShowLoading: true, // 是否显示loading
      isNeedToken: true, // 是否需要token
    }
  );
};
