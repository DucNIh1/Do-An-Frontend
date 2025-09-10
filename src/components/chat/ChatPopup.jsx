import { useState, useContext } from "react";
import { IoSearch } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import axiosConfig from "../../axios/config";
import { AuthContext } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import CreateGroupModal from "./CreateGroupModal";
import UserAvatar from "../CommonAvatar";

async function getConversationsAPI(search = "") {
  const res = await axiosConfig.get("/api/conversations", {
    params: { search },
  });
  return res.data;
}

export default function ChatPopup({ onClose }) {
  const { user: currentUser } = useContext(AuthContext);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { openConversation } = useChat();

  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["conversations", search],
    queryFn: () => getConversationsAPI(search),
    keepPreviousData: true,
  });

  const handleSetSelectedConversation = (c, partner) => {
    openConversation({
      conversation: c,
      receiver: partner,
    });
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl flex z-[1000] flex-col border-l border-gray-200">
      <div className="p-3 flex justify-between items-center text-white">
        <h2 className="text-lg font-semibold">Đoạn chat</h2>
        <div className="flex gap-2">
          {currentUser.role !== "STUDENT" && (
            <>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="text-sm px-3 py-1 bg-deepBlue text-white rounded hover:bg-opacity-90"
              >
                + Tạo nhóm
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="text-gray-800 hover:text-textRed bg-slate-50 w-8 h-8 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
          <IoSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trên Messenger"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none px-2 text-sm text-gray-800"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="text-center text-gray-500 mt-4">Đang tải...</p>
        ) : isError ? (
          <p className="text-center text-red-500 mt-4">Lỗi tải hội thoại</p>
        ) : !data || data.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">
            Không có hội thoại nào
          </p>
        ) : (
          data.map((c) => {
            const lastMsg = c.messages?.[0];
            const lastText = lastMsg
              ? `${lastMsg.sender.name}: ${lastMsg.text || "[File]"}`
              : "Chưa có tin nhắn";
            const partner = c.isGroup
              ? null
              : c.members.find((m) => m.user.id !== currentUser.id)?.user;

            return (
              <div
                key={c.id}
                onClick={() => handleSetSelectedConversation(c, partner)}
                className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition"
              >
                <UserAvatar
                  size="w-10 h-10"
                  alt=""
                  name={c.isGroup ? c.name : partner?.name || "User"}
                  src={partner?.avatar || c.avatar}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {c.isGroup ? c.name : partner?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{lastText}</p>
                </div>

                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {c.updatedAt
                    ? formatDistanceToNow(new Date(c.updatedAt), {
                        addSuffix: true,
                        locale: vi,
                      })
                    : ""}
                </p>
              </div>
            );
          })
        )}
      </div>

      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onSuccess={(newGroup) => {
            console.log("Nhóm vừa tạo:", newGroup);
          }}
        />
      )}
    </div>
  );
}
