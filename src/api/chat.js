import { http } from "~/utils/http";
//聊天记录查找
export const chatMsgFindAll = (params) => {
  return http.request(
    "get",
    `chat/getMsgsByRoomId`,
    { params },
    {
      isNeedToken: true, // 是否需要token
    }
  );
};
