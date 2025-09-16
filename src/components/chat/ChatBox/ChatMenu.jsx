import { useContext, useState } from "react";
import ManageMembersModal from "./ManageMembersModal.jsx";
import RenameConversationModal from "./RenameConversationModal.jsx";
import ConfirmModal from "./ConfirmModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosConfig from "../../../axios/config.js";
import { useChat } from "../../../context/ChatContext";
import { AuthContext } from "../../../context/AuthContext.jsx";

export default function ChatMenu({ conversation, isGroupChat, onClose }) {
  const { user } = useContext(AuthContext);

  const [activeModal, setActiveModal] = useState(null);
  const queryClient = useQueryClient();
  const { closeConversation } = useChat();

  const handleModalClose = () => {
    setActiveModal(null);
    onClose();
  };

  const leaveGroupMutation = useMutation({
    mutationFn: () =>
      axiosConfig.post(`/api/conversations/${conversation.id}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
      handleModalClose();
      closeConversation();
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: () => axiosConfig.delete(`/api/messages/${conversation.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
      handleModalClose();
      closeConversation();
    },
  });

  return (
    <>
      <div className="absolute top-8 right-0 w-56 bg-white border rounded-lg shadow-xl py-1 z-10">
        <ul>
          {isGroupChat && (
            <>
              {user.role !== "STUDENT" && (
                <li
                  onClick={() => setActiveModal("rename")}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Đổi tên đoạn chat
                </li>
              )}

              <li
                onClick={() => setActiveModal("members")}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Thành viên
              </li>
              <li
                onClick={() => setActiveModal("leave")}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
              >
                Rời khỏi nhóm
              </li>
            </>
          )}
          {!isGroupChat && (
            <li
              onClick={() => setActiveModal("delete")}
              className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Xóa cuộc trò chuyện
            </li>
          )}
        </ul>
      </div>

      {activeModal === "rename" && (
        <RenameConversationModal
          conversation={conversation}
          onClose={handleModalClose}
        />
      )}
      {activeModal === "members" && (
        <ManageMembersModal
          conversation={conversation}
          onClose={handleModalClose}
        />
      )}
      {activeModal === "leave" && (
        <ConfirmModal
          title="Rời khỏi nhóm?"
          message="Bạn có chắc chắn muốn rời khỏi cuộc trò chuyện này không?"
          onConfirm={() => leaveGroupMutation.mutate()}
          onCancel={handleModalClose}
          isLoading={leaveGroupMutation.isPending}
        />
      )}
      {activeModal === "delete" && (
        <ConfirmModal
          title="Xóa cuộc trò chuyện?"
          message="Hành động này không thể hoàn tác. Toàn bộ lịch sử tin nhắn sẽ bị xóa."
          onConfirm={() => deleteConversationMutation.mutate()}
          onCancel={handleModalClose}
          isLoading={deleteConversationMutation.isPending}
        />
      )}
    </>
  );
}
