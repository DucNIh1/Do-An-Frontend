import axiosConfig from "../axios/config.js";

export const getMessagesAPI = async ({
  senderId,
  receiverId,
  conversationId,
  cursor,
  limit,
}) => {
  const res = await axiosConfig.get("/api/messages", {
    params: { senderId, receiverId, conversationId, before: cursor, limit },
  });
  return res.data.data;
};

export const sendMessageAPI = async (payload) => {
  const res = await axiosConfig.post("/api/messages", payload);
  return res.data.data;
};
