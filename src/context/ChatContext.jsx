import { createContext, useState, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showChatPopup, setShowChatPopup] = useState(false);

  const openConversation = ({ conversation, receiver }) => {
    setSelectedConversation({ conversation, receiver });
    setShowChatPopup(false);
  };

  const closeConversation = () => {
    setSelectedConversation(null);
  };

  return (
    <ChatContext.Provider
      value={{
        selectedConversation,
        showChatPopup,
        setShowChatPopup,
        openConversation,
        closeConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => useContext(ChatContext);
