// src/components/NotificationsPopup.jsx

import { useState, useRef, useEffect, Fragment } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  BsThreeDotsVertical,
  BsCheck2,
  BsTrash,
  BsFillCircleFill,
} from "react-icons/bs";
import UserAvatar from "./CommonAvatar";
import axiosConfig from "../axios/config";
import { useSocket } from "../context/SocketContext"; // Đảm bảo bạn có SocketContext

// --- Các hàm gọi API thật sự ---
const fetchNotificationsAPI = async ({ pageParam = 1, queryKey }) => {
  const [, filter] = queryKey;
  const params = {
    page: pageParam,
    limit: 10,
  };
  if (filter === "unread") {
    params.read = false;
  }
  const { data } = await axiosConfig.get("/api/notifications", { params });
  return data;
};

const markAsReadAPI = async (notificationId) => {
  const { data } = await axiosConfig.patch(
    `/api/notifications/${notificationId}/markAsRead`
  );
  return data;
};

const markAllAsReadAPI = async () => {
  const { data } = await axiosConfig.patch("/api/notifications/marksAllAsRead");
  return data;
};

const deleteNotificationAPI = async (notificationId) => {
  await axiosConfig.delete(`/api/notifications/${notificationId}`);
  return { notificationId };
};
// -----------------------------------------------------------

const NotificationsPopup = () => {
  const { socket } = useSocket();
  const [filter, setFilter] = useState("all");
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);
  const queryClient = useQueryClient();
  const queryKey = ["notifications", filter];

  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey,
      queryFn: fetchNotificationsAPI,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.currentPage < lastPage.totalPage) {
          return lastPage.currentPage + 1;
        }
        return undefined;
      },
    });

  const allNotifications =
    data?.pages.flatMap((page) => page.notifications) ?? [];

  const updateCacheOptimistically = (updateFn) => {
    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map(updateFn),
      };
    });
  };

  const markAsReadMutation = useMutation({
    mutationFn: markAsReadAPI,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      updateCacheOptimistically((page) => ({
        ...page,
        notifications: page.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        ),
      }));
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: deleteNotificationAPI,
    onMutate: async (notificationId) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      updateCacheOptimistically((page) => ({
        ...page,
        notifications: page.notifications.filter(
          (n) => n.id !== notificationId
        ),
      }));
      return { previousData };
    },
    onError: (context) => {
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsReadAPI,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      updateCacheOptimistically((page) => ({
        ...page,
        notifications: page.notifications.map((n) => ({ ...n, read: true })),
      }));
      return { previousData };
    },
    onError: (context) => {
      queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "all"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
    },
  });

  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notificationData) => {
      console.log("Received new notification:", notificationData);
      const newNotification = {
        id: notificationData.id || Date.now(),
        sender: notificationData.createdBy,
        message: notificationData.message,
        createdAt: new Date().toISOString(),
        read: false,
        ...notificationData,
      };

      ["all", "unread"].forEach((f) => {
        queryClient.setQueryData(["notifications", f], (oldData) => {
          if (!oldData) return oldData;
          const newPages = [...oldData.pages];
          newPages[0] = {
            ...newPages[0],
            notifications: [newNotification, ...newPages[0].notifications],
          };
          return { ...oldData, pages: newPages };
        });
      });
    };

    socket.on("newNotification", handleNewNotification);
    return () => {
      socket.off("newNotification", handleNewNotification);
    };
  }, [queryClient, socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border z-50 flex flex-col max-h-[80vh] min-h-[300px]">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="text-xl font-bold text-gray-800">Thông báo</h3>
        <div className="relative">
          <button
            onClick={() => setActiveMenu(activeMenu === "main" ? null : "main")}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <BsThreeDotsVertical />
          </button>
          {activeMenu === "main" && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-10 py-1"
            >
              <button
                onClick={() => {
                  markAllAsReadMutation.mutate();
                  setActiveMenu(null);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              >
                <BsCheck2 className="w-4 h-4" /> Đánh dấu tất cả đã đọc
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-2 border-b flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            filter === "all"
              ? "bg-blue-100 text-deepBlue"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            filter === "unread"
              ? "bg-blue-100 text-deepBlue"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Chưa đọc
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <p className="p-4 text-center text-gray-500">Đang tải...</p>
        ) : allNotifications.length > 0 ? (
          <>
            {allNotifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-center gap-3 p-3 cursor-pointer ${
                  !n.read ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <UserAvatar
                  src={n.createdBy?.avatar}
                  name={n.createdBy?.name}
                  size="w-14 h-14"
                />
                <div
                  className="flex-1"
                  onClick={() => !n.read && markAsReadMutation.mutate(n.id)}
                >
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <span
                    className={`text-xs font-medium ${
                      !n.read ? "text-deepBlue" : "text-gray-500"
                    }`}
                  >
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!n.read && (
                    <BsFillCircleFill className="w-2.5 h-2.5 text-deepBlue" />
                  )}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === n.id ? null : n.id);
                      }}
                      className="p-2 rounded-full hover:bg-gray-200"
                    >
                      <BsThreeDotsVertical />
                    </button>
                    {activeMenu === n.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-lg border z-10 py-1"
                      >
                        {!n.read && (
                          <button
                            onClick={() => {
                              markAsReadMutation.mutate(n.id);
                              setActiveMenu(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                          >
                            <BsCheck2 className="w-4 h-4" /> Đánh dấu đã đọc
                          </button>
                        )}
                        <button
                          onClick={() => {
                            deleteNotificationMutation.mutate(n.id);
                            setActiveMenu(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                        >
                          <BsTrash className="w-4 h-4" /> Xóa thông báo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {hasNextPage && (
              <div className="p-2">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="w-full text-center text-sm text-deepBlue font-medium hover:underline"
                >
                  {isFetchingNextPage ? "Đang tải thêm..." : "Xem thêm"}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="p-4 text-center text-gray-500">
            Không có thông báo nào.
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationsPopup;
