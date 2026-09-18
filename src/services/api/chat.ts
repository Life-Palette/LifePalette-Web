/* biome-ignore-all lint/suspicious/noExplicitAny: this existing integration requires the current implementation */
import { http } from "../http";

export const chatApi = {
  /** 创建私聊 */
  createPrivateChat: (targetSecUid: string) =>
    http.post("/chat/rooms", {
      member_sec_uids: [targetSecUid],
      type: "private",
    }),

  /** 获取聊天消息 */
  getMessages: (
    roomId: number,
    params?: { page?: number; page_size?: number }
  ) => http.get(`/chat/rooms/${roomId}/messages`, params),
  /** 获取聊天室列表 */
  getRooms: (params?: { page?: number; page_size?: number }) =>
    http.get("/chat/rooms", params),

  /** 标记已读 */
  markAsRead: (roomId: number) => http.put(`/chat/rooms/${roomId}/read`),

  /** 发送消息 */
  sendMessage: (data: { room_id: number; content: string; type?: string }) =>
    http.post("/chat/messages", data),

  /** 上传聊天文件 */
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.request("/chat/upload", {
      body: formData,
      headers: {}, // 让浏览器自动设置 Content-Type
      method: "POST",
    } as any);
  },
};
