import { useState } from "react";
import ChatBox from "./ChatBox";

const ChatPopup = ({ conversations, onClose }) => {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
      {!activeChat ? (
        <div className="max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="text-sm font-medium">Đoạn chat</h3>
            <button onClick={onClose}>✖</button>
          </div>
          {conversations.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
              onClick={() => setActiveChat(c)}
            >
              <img
                src={c.avatar || "/default-avatar.png"}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {c.lastMessage?.text || "Chưa có tin nhắn"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ChatBox conversation={activeChat} onBack={() => setActiveChat(null)} />
      )}
    </div>
  );
};

export default ChatPopup;
