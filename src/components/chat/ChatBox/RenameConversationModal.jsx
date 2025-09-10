import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosConfig from "../../../axios/config";
import { useChat } from "../../../context/ChatContext";

export default function RenameConversationModal({ conversation, onClose }) {
  const { selectedConversation, openConversation } = useChat();
  const [name, setName] = useState(conversation?.name || "");
  const queryClient = useQueryClient();

  const renameMutation = useMutation({
    mutationFn: (newName) =>
      axiosConfig.patch(`/api/conversations/${conversation.id}/rename`, {
        name: newName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["conversation", conversation.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", conversation.id],
      });

      if (selectedConversation?.conversation?.id === conversation.id) {
        openConversation({
          conversation: {
            ...selectedConversation.conversation,
            name,
          },
          receiver: selectedConversation.receiver,
        });
      }

      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed && trimmed !== conversation.name) {
      renameMutation.mutate(trimmed);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[4000]">
      <form
        onSubmit={handleSubmit}
        className="bg-white w-80 rounded-lg shadow-lg p-4"
      >
        <h2 className="text-lg font-medium mb-3">Đổi tên đoạn chat</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên mới..."
          className="w-full border rounded p-2 text-sm outline-none focus:border-[#083970]"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={renameMutation.isPending}
            className="px-3 py-1 text-sm bg-deepBlue text-white rounded hover:bg-opacity-90 disabled:opacity-50"
          >
            {renameMutation.isPending ? "Đang lưu..." : "Lưu"}
          </button>
        </div>

        {renameMutation.isError && (
          <p className="text-red-500 text-xs mt-2">
            Có lỗi xảy ra, vui lòng thử lại.
          </p>
        )}
      </form>
    </div>
  );
}
