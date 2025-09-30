import { FaChevronRight } from "react-icons/fa";
import { useRef, useMemo, useState, useEffect, useContext } from "react";
import { useSocket } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import UserAvatar from "./CommonAvatar";

const StoryList = () => {
  const containerRef = useRef(null);
  const { user } = useContext(AuthContext);
  const { openConversation } = useChat();
  const { onlineUsers } = useSocket();
  const listRenderOnlineUsers = onlineUsers.filter((u) => u.userId !== user.id);
  const [maxVisible, setMaxVisible] = useState(7);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const updateMaxVisible = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;
        const storyWidth = 70 + 16;
        const padding = 32;
        const availableWidth = width - padding;
        const newMaxVisible = Math.max(
          1,
          Math.floor(availableWidth / storyWidth)
        );
        setContainerWidth(width);
        setMaxVisible(newMaxVisible);
      }
    };

    const timeoutId = setTimeout(updateMaxVisible, 100);
    const resizeObserver = new ResizeObserver(() => updateMaxVisible());

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateMaxVisible);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMaxVisible);
    };
  }, []);

  const { displayedStories, extraCount, totalPages, hasNext, hasPrev } =
    useMemo(() => {
      const itemsPerPage = maxVisible - 1;
      const totalPages = Math.ceil(listRenderOnlineUsers.length / itemsPerPage);
      const startIndex = currentPage * itemsPerPage;
      const endIndex = Math.min(
        startIndex + itemsPerPage,
        listRenderOnlineUsers.length
      );
      const currentPageStories = listRenderOnlineUsers.slice(
        startIndex,
        endIndex
      );
      const remainingStories = listRenderOnlineUsers.length - endIndex;
      const showMoreButton = remainingStories > 0;
      const displayedStories = showMoreButton
        ? currentPageStories.slice(0, -1)
        : currentPageStories;
      const extraCount = showMoreButton ? remainingStories + 1 : 0;

      return {
        displayedStories,
        extraCount,
        totalPages,
        hasNext: currentPage < totalPages - 1,
        hasPrev: currentPage > 0,
      };
    }, [maxVisible, currentPage, listRenderOnlineUsers]);

  const handleScroll = (direction) => {
    if (direction === "right" && hasNext) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "left" && hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleOpenChat = (user) => {
    openConversation({ conversationId: null, receiver: user });
  };

  if (displayedStories.length === 0) return null;
  return (
    <div className="relative w-full  shadow-sm rounded-md mb-2">
      <div
        ref={containerRef}
        className="w-full flex overflow-x-auto gap-4 px-4 py-2 scrollbar-hide"
        style={{ width: "100%" }}
      >
        {displayedStories.map((user) => (
          <div
            key={user.userId}
            className="flex flex-col items-center min-w-[70px] cursor-pointer flex-shrink-0 hover:scale-110 transition-transform duration-200"
            onClick={() => handleOpenChat(user)}
          >
            <div className="rounded-full p-[2px]">
              <UserAvatar
                size="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
                name={user.name}
                src={user.avatar}
                userId={user.userId}
              />
            </div>
            <p className="text-sm mt-1 text-center truncate w-16">
              {user.name}
            </p>
          </div>
        ))}

        {extraCount > 0 && (
          <div className="flex flex-col items-center justify-center min-w-[70px] w-16 h-16 rounded-full bg-gray-200 cursor-pointer hover:scale-110 transition-transform duration-200 flex-shrink-0">
            <p className="text-sm font-semibold">+{extraCount}</p>
          </div>
        )}
      </div>

      {hasPrev && (
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow p-2 hover:scale-110 hover:bg-gray-50 transition-all duration-200 z-10"
          onClick={() => handleScroll("left")}
        >
          <FaChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
        </button>
      )}

      {hasNext && (
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow p-2 hover:scale-110 hover:bg-gray-50 transition-all duration-200 z-10"
          onClick={() => handleScroll("right")}
        >
          <FaChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default StoryList;
