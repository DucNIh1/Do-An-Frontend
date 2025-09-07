import React, { useState, useEffect, useRef, useContext } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { FaRegPaperPlane } from "react-icons/fa";
import { BsImages } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { AuthContext } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { getMessagesAPI, sendMessageAPI } from "../../services/chatService";
import { uploadImagesAPI } from "../../services/postService";

export default function ChatBox({ user, onClose }) {
  const { user: currentUser } = useContext(AuthContext);
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const [text, setText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["messages", user?.userId],
      queryFn: ({ pageParam = null }) =>
        getMessagesAPI({
          senderId: currentUser.id,
          receiverId: user.userId,
          cursor: pageParam,
          limit: 20,
        }),
      getNextPageParam: (lastPage) => lastPage.pagination?.nextCursor,
      enabled: !!user,
    });

  const allMessages = React.useMemo(() => {
    return (
      data?.pages
        .flatMap((page) => page.messages)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) ?? []
    );
  }, [data]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ text, images }) => {
      let uploadedImages = [];
      if (images.length > 0) {
        uploadedImages = await uploadImagesAPI(images, { folder: "messages" });
      }
      console.log("Uploaded images:", uploadedImages);
      return sendMessageAPI({
        receiverId: user.userId,
        text,
        imageIds: uploadedImages.data?.map((img) => img.id),
      });
    },
    onMutate: async (variables) => {
      const tempId = Date.now();

      const optimisticMessage = {
        id: tempId,
        text: variables.text,
        images: variables.images.map((file) => ({
          id: `temp-${Date.now()}-${file.name}`,
          url: URL.createObjectURL(file), // preview ngay lập tức
          optimistic: true,
        })),
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        createdAt: new Date().toISOString(),
        optimistic: true,
      };

      queryClient.setQueryData(["messages", user.userId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: [
            ...oldData.pages.slice(0, -1),
            {
              ...oldData.pages[oldData.pages.length - 1],
              messages: [
                ...oldData.pages[oldData.pages.length - 1].messages,
                optimisticMessage,
              ],
            },
          ],
        };
      });
    },
    onSuccess: (res) => {
      const message = res.data.message;

      queryClient.setQueryData(["messages", user.userId], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: [
            ...oldData.pages.slice(0, -1),
            {
              ...oldData.pages[oldData.pages.length - 1],
              messages: [
                ...oldData.pages[oldData.pages.length - 1].messages.filter(
                  (m) => !m.optimistic
                ),
                message,
              ],
            },
          ],
        };
      });

      setText("");
      setSelectedImages([]);
      scrollToBottom();
    },
  });

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload) => {
      const { conversationId, message } = payload;

      if (
        !user.conversationId &&
        (message.sender.id === user.userId ||
          message.sender.id === currentUser.id)
      ) {
        user.conversationId = conversationId;
      }

      if (
        conversationId === user.conversationId &&
        message.sender.id !== currentUser.id
      ) {
        queryClient.setQueryData(["messages", user.userId], (oldData) => {
          if (!oldData) return oldData;

          const lastPage = oldData.pages[oldData.pages.length - 1];
          const messageExists = lastPage.messages.some(
            (msg) => msg.id === message.id
          );

          if (messageExists) return oldData;

          return {
            ...oldData,
            pages: [
              ...oldData.pages.slice(0, -1),
              {
                ...lastPage,
                messages: [...lastPage.messages, message],
              },
            ],
          };
        });
        scrollToBottom();
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, user, currentUser, queryClient]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: Date.now() + Math.random(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
    setSelectedImages((prev) => [...prev, ...newImages]);
    event.target.value = null;
  };

  const removeImage = (id) => {
    setSelectedImages((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleSend = () => {
    if (!text.trim() && selectedImages.length === 0) return;
    sendMessageMutation.mutate({
      text,
      images: selectedImages.map((i) => i.file),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-[350px] h-[500px] flex flex-col border rounded-lg shadow-lg bg-white">
      <div className="flex items-center justify-between p-2 border-b bg-gray-100">
        <div className="flex items-center gap-2">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <p className="font-medium ">{user.name}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-textRed hover:bg-slate-200 rounded-full w-6 h-6 flex items-center justify-center transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {hasNextPage && (
          <button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="text-sm text-deepBlue hover:underline mx-auto block"
          >
            {isFetchingNextPage ? "Đang tải..." : "Xem thêm"}
          </button>
        )}
        {allMessages.map((msg, index) => {
          const isCurrentUser = msg.sender?.id === currentUser.id;
          const prevMsg = allMessages[index - 1];
          const showAvatar = !prevMsg || prevMsg.sender?.id !== msg.sender?.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex-shrink-0 ${isCurrentUser ? "order-2" : ""}`}
              >
                {showAvatar ? (
                  <img
                    src={
                      isCurrentUser ? currentUser.avatar : msg.sender?.avatar
                    }
                    alt={isCurrentUser ? currentUser.name : msg.sender?.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6"></div>
                )}
              </div>

              <div
                className={`p-2 rounded-lg max-w-[70%] ${
                  isCurrentUser
                    ? "bg-deepBlue rounded-br-sm"
                    : "bg-gray-100  rounded-bl-sm"
                }`}
              >
                {msg.text && (
                  <p
                    className={`text-sm  ${
                      isCurrentUser ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
                {msg.images?.length > 0 &&
                  msg.images.map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt="img"
                      className="rounded-lg mt-1 max-h-40 w-full object-cover"
                    />
                  ))}
                <p
                  className={`text-xs mt-1 opacity-70 ${
                    isCurrentUser ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {(() => {
                    try {
                      return formatDistanceToNow(
                        new Date(String(msg.createdAt)),
                        {
                          locale: vi,
                          addSuffix: true,
                        }
                      );
                    } catch {
                      return "Vừa xong";
                    }
                  })()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {selectedImages.length > 0 && (
        <div className="flex gap-2 p-2 border-t bg-gray-50">
          {selectedImages.map((img) => (
            <div key={img.id} className="relative group">
              <img
                src={img.previewUrl}
                alt="preview"
                className="w-12 h-12 object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute -top-1 -right-1 bg-gray-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs opacity-50 group-hover:opacity-100 hover:bg-red-500 transition-all"
              >
                <IoClose />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center p-2 border-t gap-2 bg-white">
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500 hover:text-blue-500 transition-colors p-1"
        >
          <BsImages size={20} />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border rounded-full px-3 py-2 text-sm outline-none focus:border-deepBlue transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={
            sendMessageMutation.isPending ||
            (!text.trim() && selectedImages.length === 0)
          }
          className="bg-deepBlue text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors"
        >
          <FaRegPaperPlane size={16} className="fill-white" />
        </button>
      </div>
    </div>
  );
}
