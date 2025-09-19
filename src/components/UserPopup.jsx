import { FloatingPortal } from "@floating-ui/react";
import { useContext, useState } from "react";
import { FaEnvelope, FaTag } from "react-icons/fa";
import { useChat } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

const UserPopup = ({
  user,
  refs,
  floatingStyles,
  getFloatingProps,
  isLoading,
  isError,
}) => {
  const { user: currentUser } = useContext(AuthContext);
  const [imgError, setImgError] = useState(false);
  const { openConversation } = useChat();

  const handleOpenChat = (user) => {
    openConversation({ conversationId: null, receiver: user });
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "ADVISOR":
        return {
          label: "Cố vấn",
          bgColor: "bg-indigo-100",
          textColor: "text-indigo-700",
        };
      case "STUDENT":
        return {
          label: "Học sinh",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
        };
      case "ADMIN":
        return {
          label: "Admin",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
        };
      default:
        return null;
    }
  };

  const roleInfo = user?.role ? getRoleLabel(user.role) : null;

  const renderAvatarContent = () => {
    if (imgError || !user.avatar) {
      return (
        <div
          className={`size-24 bg-deepBlue rounded-full flex items-center justify-center text-white text-sm font-medium`}
        >
          {user?.name && user?.name.charAt(0).toUpperCase()}
        </div>
      );
    }
    return (
      <img
        src={user?.avatar}
        alt={user?.name}
        className={`size-24 rounded-full object-cover`}
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <FloatingPortal>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        {...getFloatingProps()}
        className="p-4 bg-white rounded-xl shadow-2xl z-[9999] min-w-[350px] border border-gray-100 "
      >
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <svg
              className="animate-spin h-6 w-6 mr-3 text-indigo-500"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-500">Đang tải...</p>
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-8">
            <p className="text-red-500">Không thể tải thông tin người dùng.</p>
          </div>
        )}

        {user && !isLoading && !isError && (
          <>
            <div className="flex flex-col items-center border-b pb-4 mb-4">
              {renderAvatarContent()}
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              {roleInfo && (
                <span
                  className={`mt-1 px-3 py-1 ${roleInfo.bgColor} ${roleInfo.textColor} text-xs font-semibold rounded-full`}
                >
                  {roleInfo.label}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 text-gray-700 mb-6">
              <div className="flex items-center gap-2">
                <FaEnvelope className="h-5 w-5 text-indigo-500" />
                <span>{user.email || "Không có email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaTag className="h-5 w-5 text-indigo-500" />
                <span>{user?.major?.name || "Không có chuyên ngành"}</span>
              </div>
            </div>

            {currentUser && (
              <div className="flex mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenChat(user);
                  }}
                  className="flex-1 py-2 px-4 rounded-full  text-white font-medium bg-deepBlue transition-colors"
                >
                  Nhắn tin
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </FloatingPortal>
  );
};

export default UserPopup;
