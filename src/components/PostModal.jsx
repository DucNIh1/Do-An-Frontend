import React, { useState, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Icons
import { AiOutlineClose } from "react-icons/ai";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaRegPaperPlane } from "react-icons/fa";

const fetchCommentsAPI = async ({ queryKey, pageParam = 1 }) => {
  const [_key, postId] = queryKey;
  console.log(`Fetching comments for post ${postId}, page ${pageParam}`);
  await new Promise((resolve) => setTimeout(resolve, 800)); // Giả lập độ trễ mạng

  // Giả lập không có thêm bình luận sau trang 3
  if (pageParam > 3) {
    return { comments: [], nextPage: undefined };
  }

  const comments = Array.from({ length: 15 }).map((_, i) => ({
    id: `comment_${postId}_${pageParam}_${i}`,
    author: {
      name: `Người dùng ${Math.floor(Math.random() * 100)}`,
      avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`,
    },
    content: `Đây là bình luận số ${
      i + 1
    } của trang ${pageParam} cho bài viết.`,
    createdAt: new Date().toISOString(),
  }));

  return { comments, nextPage: pageParam + 1 };
};

export default function PostModal({
  isOpen,
  onClose,
  post,
  initialImageIndex = 0,
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const commentsContainerRef = useRef(null);

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
  } = useInfiniteQuery({
    queryKey: ["comments", post?.id],
    queryFn: fetchCommentsAPI,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!isOpen && !!post?.id,
  });

  const allComments =
    commentsData?.pages.flatMap((page) => page.comments) ?? [];

  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    // Khi người dùng cuộn gần đến cuối (cách 50px), tải trang tiếp theo
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  // Reset trạng thái khi modal đóng/mở hoặc post thay đổi
  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialImageIndex);
      setIsExpanded(false);
    }
  }, [isOpen, post, initialImageIndex]);
  if (!isOpen || !post) {
    return null;
  }

  const images = post.images || [];
  const authorName = post.author?.name || "Người dùng ẩn danh";
  const authorAvatar =
    post.author?.avatar ||
    `https://placehold.co/40x40/EFEFEF/AAAAAA?text=${authorName.charAt(0)}`;
  const formattedDate = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: vi,
      })
    : "";

  const CONTENT_MAX_LENGTH = 150;
  const content = post.content || "";
  const isLongContent = content.length > CONTENT_MAX_LENGTH;

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-lg w-full max-w-4xl lg:max-w-5xl h-[90vh] flex flex-col md:flex-row shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute -top-10 right-2 text-white md:hidden"
          >
            <AiOutlineClose className="w-6 h-6" />
          </button>

          <div className="relative w-full md:w-1/2 lg:w-3/5 bg-black flex items-center justify-center rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
            {images.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={images[currentImageIndex]?.url}
                    alt={`Ảnh bài viết ${currentImageIndex + 1}`}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0.5 }}
                    transition={{ duration: 0.2 }}
                    className="max-h-full max-w-full object-contain"
                  />
                </AnimatePresence>
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                    >
                      <IoChevronBack size={24} />
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors"
                    >
                      <IoChevronForward size={24} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-gray-400">Bài viết không có hình ảnh</div>
            )}
          </div>

          <div className="w-full md:w-1/2 lg:w-2/5 border-l flex flex-col">
            <div className="flex justify-between items-center p-3 border-b">
              <div className="flex items-center gap-3">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm">{authorName}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {formattedDate}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 hidden md:block"
              >
                <AiOutlineClose className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 border-b overflow-y-auto max-h-48 text-sm">
              <h3 className="font-bold text-base mb-2">{post.title}</h3>
              <p className="leading-relaxed whitespace-pre-wrap">
                {isExpanded
                  ? content
                  : `${content.substring(0, CONTENT_MAX_LENGTH)}${
                      isLongContent ? "..." : ""
                    }`}
                {isLongContent && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-deepBlue font-semibold hover:underline cursor-pointer ml-1"
                  >
                    {isExpanded ? "Thu gọn" : "Xem thêm"}
                  </button>
                )}
              </p>
            </div>

            <div
              ref={commentsContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-3 space-y-4"
            >
              {isLoadingComments ? (
                <div className="text-center text-gray-500">
                  Đang tải bình luận...
                </div>
              ) : allComments.length > 0 ? (
                allComments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 text-sm">
                    <img
                      src={comment.author.avatar}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      alt=""
                    />
                    <div className="bg-gray-100 rounded-lg p-2 flex-grow">
                      <p>
                        <span className="font-semibold">
                          {comment.author.name}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            locale: vi,
                          })}
                        </span>
                      </p>
                      <p className="text-gray-800">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  Chưa có bình luận nào.
                </div>
              )}
              {isFetchingNextPage && (
                <div className="text-center text-sm text-gray-500">
                  Đang tải thêm...
                </div>
              )}
              {!hasNextPage && !isLoadingComments && allComments.length > 0 && (
                <div className="text-center text-xs text-gray-400 pt-4">
                  Đã hết bình luận.
                </div>
              )}
            </div>

            <div className="border-t p-2 flex gap-2 items-center">
              <img
                src={authorAvatar}
                className="w-8 h-8 rounded-full"
                alt="Your avatar"
              />
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Viết bình luận..."
                  className="w-full bg-gray-100 rounded-full pl-3 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-deepBlue"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-deepBlue hover:text-blue-700">
                  <FaRegPaperPlane size={18} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
