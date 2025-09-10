import { NavLink, useNavigate } from "react-router";
import { useState, useRef, useEffect, useContext } from "react";
import { MdMenu, MdKeyboardArrowDown } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { FiUser, FiLogOut, FiSettings, FiMessageSquare } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import socket from "../socket/socket.js";
import ChatPopup from "./chat/ChatPopup";
import { IoChatbubblesOutline } from "react-icons/io5";
import UserAvatar from "./CommonAvatar.jsx";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [conversations, setConversations] = useState([]);

  const userMenuRef = useRef(null);

  const navLinks = [
    { name: "Trang chủ", path: "/" },
    { name: "Tư vấn hỏi đáp", path: "/tu-van-hoi-dap" },
    { name: "Bài đăng", path: "/posts" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/conversations`, {
        credentials: "include",
      });
      const data = await res.json();
      setConversations(data);
    };
    fetchConversations();

    socket.on("newMessage", (msg) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId ? { ...c, lastMessage: msg } : c
        )
      );
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("user");
    } catch {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!!");
    }
    setIsUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 p-4 z-[999] shadow-lg h-20 bg-white">
      <div className="flex justify-between items-center h-full">
        <img
          src="/logo/logo.svg"
          alt="Logo cổng thông tin tuyển sinh"
          className="w-[220px] sm:w-[300px]"
        />

        <nav className="hidden md:flex items-center justify-center gap-8">
          <ul className="flex items-center gap-5 text-sm">
            {navLinks.map((link) => (
              <li key={link.path} className="relative group cursor-pointer">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `text-sm transition-colors ${
                      isActive
                        ? "text-deepBlue font-medium"
                        : "text-gray-700 hover:text-deepBlue"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
                <span
                  className={`
                    absolute left-0 -bottom-1 h-[2px] w-full origin-left scale-x-0 bg-current transition-transform duration-300
                    group-hover:scale-x-100
                  `}
                />
              </li>
            ))}
          </ul>

          <button className="bg-deepBlue px-4 py-2 rounded-3xl text-white text-sm font-medium hover:opacity-90 transition-all duration-150">
            Tư vấn xét tuyển
          </button>

          <div className="flex gap-2">
            {/* Icon tin nhắn */}
            <div className="relative">
              <button
                className="p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setIsChatOpen(!isChatOpen)}
              >
                <IoChatbubblesOutline className="w-6 h-6 text-gray-700" />
              </button>

              {isChatOpen && (
                <ChatPopup
                  conversations={conversations}
                  onClose={() => setIsChatOpen(false)}
                />
              )}
            </div>
          </div>

          <div className="relative">
            {!user ? (
              <button
                onClick={handleLogin}
                className="gap-2 px-4 py-2 border group border-deepBlue text-deepBlue rounded-lg hover:bg-deepBlue  transition-all duration-200"
              >
                <span className="text-sm font-medium group-hover:text-white">
                  Đăng nhập
                </span>
              </button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <UserAvatar
                    src={user.avatar}
                    alt={user.name}
                    name={user.name}
                  />
                  <span className="text-sm font-medium text-gray-700 max-w-20 truncate">
                    {user.name}
                  </span>
                  <MdKeyboardArrowDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                    <div className="px-4 py-3 border-b">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={user.avatar}
                          alt={user.name}
                          size="w-10 h-10"
                          name={user.name}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                        <FiUser className="w-4 h-4" />
                        Thông tin cá nhân
                      </button>
                      <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                        <FiSettings className="w-4 h-4" />
                        Cài đặt
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                      >
                        <FiLogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </nav>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <IoMdClose className="w-6 h-6" />
          ) : (
            <MdMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg border-t mt-2 rounded-lg">
          <ul className="flex flex-col gap-3 p-4 text-sm">
            {navLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 ${
                      isActive
                        ? "text-deepBlue font-medium"
                        : "text-gray-700 hover:text-deepBlue"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
            <li>
              <button className="w-full bg-deepBlue px-4 py-2 rounded-3xl text-white text-sm font-medium hover:opacity-90 transition-all">
                Tư vấn xét tuyển
              </button>
            </li>
            <li className="flex gap-3 items-center">
              <img src="/logo/vn.webp" alt="VN" className="w-8" />
              <img src="/logo/en.webp" alt="EN" className="w-8" />
            </li>

            {/* Mobile Auth Section */}
            <li className="pt-3 border-t">
              {!user ? (
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-deepBlue text-deepBlue rounded-lg hover:bg-deepBlue hover:text-white transition-all duration-200"
                >
                  <FiUser className="w-4 h-4" />
                  <span className="text-sm font-medium">Đăng nhập</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <UserAvatar
                      src={user.avatar}
                      alt={user.name}
                      name={user.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                    <FiUser className="w-4 h-4" />
                    Thông tin cá nhân
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3">
                    <FiSettings className="w-4 h-4" />
                    Cài đặt
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
