import React, { useState, useEffect, useRef, useContext } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { AiFillLike, AiOutlineClose, AiOutlineLike } from "react-icons/ai";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { FaRegPaperPlane } from "react-icons/fa";
import { BsImages } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import {
  checkUserLikedAPI,
  createCommentAPI,
  deleteCommentAPI,
  deleteImagesAPI,
  fetchCommentsAPI,
  getCommentAPI,
  toggleLikeAPI,
  updateCommentAPI,
} from "../services/postService";
import { AuthContext } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import AuthActionWrapper from "./AuthActionWrapper";
import UserAvatar from "./CommonAvatar";
import RatePostModal from "./Post/RatePostModal";
import RateAdvisorModal from "./Post/RateAdvisorModal";

const commentSchema = yup.object().shape({
  text: yup
    .string()
    .trim()
    .optional()
    .max(1000, "Bình luận không được quá 1000 ký tự"),
});

export default function PostModal({
  isOpen,
  onClose,
  post,
  initialImageIndex = 0,
}) {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showInformModal, setShowInformModal] = useState(false);
  const [rateAdvisorModal, setRateAdvisorModal] = useState(null);
  const [isOpenRatePost, setIsOpenRatePost] = useState(false);
  const commentsContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(commentSchema),
    defaultValues: { text: "" },
  });

  const commentValue = watch("text");

  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useInfiniteQuery({
    queryKey: ["comments", post?.id],
    queryFn: fetchCommentsAPI,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!isOpen && !!post?.id,
  });

  const { data: likeData, refetch: refetchLikeStatus } = useQuery({
    queryKey: ["userLiked", post?.id],
    queryFn: () => checkUserLikedAPI(post.id),
    enabled: !!isOpen && !!post?.id && !!user,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: () => toggleLikeAPI(post.id),
    onSuccess: () => {
      refetchLikeStatus();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra, vui lòng thử lại");
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: createCommentAPI,
    onSuccess: () => {
      resetForm();
      setSelectedImages([]);
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi bình luận"
      );
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: updateCommentAPI,
    onSuccess: () => {
      setEditingCommentId(null);
      setEditingText("");
      refetchComments();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật"
      );
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const data = await getCommentAPI(commentId);
      const images = data?.Images || [];

      if (images.length > 0) {
        const publicIds = images.map((img) => img.id);
        await deleteImagesAPI(publicIds);
      }

      return await deleteCommentAPI(commentId);
    },
    onSuccess: () => {
      refetchComments();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa");
    },
  });

  const allComments =
    commentsData?.pages.flatMap((page) => page.comments) ?? [];
  const totalComments = commentsData?.pages[0]?.totalComments ?? 0;

  const onSubmitComment = (data) => {
    const imageFiles = selectedImages.map((img) => img.file);
    createCommentMutation.mutate({
      postId: post.id,
      text: data.text,
      images: imageFiles,
    });
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const handleUpdateComment = () => {
    if (!editingText.trim()) return;
    updateCommentMutation.mutate({
      commentId: editingCommentId,
      text: editingText,
    });
  };

  const handleConfirmDelete = () => {
    if (commentToDelete) {
      deleteCommentMutation.mutate(commentToDelete.id);
      setCommentToDelete(null);
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: Date.now() + Math.random(),
        file: file,
        previewUrl: URL.createObjectURL(file),
      }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    event.target.value = null;
  };

  const removeImage = (imageId) => {
    setSelectedImages((prevImages) => {
      const imageToRemove = prevImages.find((img) => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prevImages.filter((img) => img.id !== imageId);
    });
  };

  const handleScroll = () => {
    const container = commentsContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(initialImageIndex);
      setIsExpanded(false);
      setSelectedImages([]);
      setEditingCommentId(null);
      resetForm();
    }
  }, [isOpen, post, initialImageIndex, resetForm]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [selectedImages]);

  const isNotAdvisorForPostMajor =
    user?.majorId && user?.majorId !== post?.majorId;

  useEffect(() => {
    if (isNotAdvisorForPostMajor) {
      setShowInformModal(true);
    }
  }, [isNotAdvisorForPostMajor]);

  if (!isOpen || !post) {
    return null;
  }

  const images = post.images || [];
  const authorName = post.author?.name || "Người dùng ẩn danh";

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

  const getImageGridClass = (count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-2";
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
                <UserAvatar
                  name={authorName}
                  size="w-9 h-9"
                  src="authorAvatar"
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

            <div className="p-3 border-b overflow-y-auto max-h-72 text-sm">
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
            <div className="flex items-center justify-between gap-4 mt-3 pt-2 pr-4">
              <div className="flex items-center gap-4">
                <AuthActionWrapper onClick={() => toggleLikeMutation.mutate()}>
                  <button
                    disabled={toggleLikeMutation.isPending}
                    className="flex items-center gap-2 text-sm hover:bg-gray-100 rounded-full px-3 py-1 transition-colors"
                  >
                    {likeData?.isLiked ? (
                      <AiFillLike className="fill-deepBlue" />
                    ) : (
                      <AiOutlineLike />
                    )}
                    <span
                      className={
                        likeData?.isLiked
                          ? "text-deepBlue font-medium"
                          : "text-gray-600"
                      }
                    >
                      {likeData?.totalLikes || 0} lượt thích
                    </span>
                  </button>
                </AuthActionWrapper>

                <span className="text-sm text-gray-600">
                  {totalComments} bình luận
                </span>
              </div>

              {user?.majorId && user?.majorId === post?.majorId && (
                <button
                  onClick={() => setIsOpenRatePost(true)}
                  className="bg-[#fecb4e] cursor-pointer hover:bg-yellow-500 text-sm font-semibold rounded-md text-textBlue px-2 py-1"
                >
                  Chấm điểm
                </button>
              )}
            </div>
            <div
              ref={commentsContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-3 space-y-3"
            >
              {isLoadingComments ? (
                <div className="text-center text-gray-500">
                  Đang tải bình luận...
                </div>
              ) : allComments.length > 0 ? (
                allComments.map((comment) => (
                  <div key={comment.id} className="flex gap-2 text-sm group">
                    <div className="min-w-8">
                      <UserAvatar
                        name={comment.author?.name}
                        src={comment.author?.avatar}
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="bg-gray-100 rounded-lg p-2 relative">
                        {editingCommentId === comment.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full p-2  rounded-lg resize-none text-sm outline-none "
                              rows="3"
                              placeholder="Chỉnh sửa bình luận..."
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={handleUpdateComment}
                                disabled={updateCommentMutation.isPending}
                                className="px-4 py-1.5 min-w-[80px] bg-deepBlue text-white rounded-lg text-xs font-medium hover:bg-deepBlue/90 disabled:opacity-50"
                              >
                                Cập nhật
                              </button>
                              <button
                                onClick={() => setEditingCommentId(null)}
                                className="px-4 py-1.5 min-w-[80px] bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
                              >
                                Hủy bỏ
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="flex justify-between">
                              <span className="font-semibold flex-1">
                                {comment?.author?.name}
                              </span>
                              {comment?.author?.role === "ADVISOR" &&
                                post.authorId === user?.id &&
                                post?.author?.role === "STUDENT" && (
                                  <button
                                    onClick={() =>
                                      setRateAdvisorModal((prev) => ({
                                        ...prev,
                                        advisor: comment?.author,
                                        isOpen: true,
                                      }))
                                    }
                                    className="bg-[#fecb4e] text-textBlue font-semibold px-2 py-1 rounded-md hover:bg-yellow-500"
                                  >
                                    Đánh giá người tư vấn
                                  </button>
                                )}
                            </p>
                            <p className="text-gray-800 mt-1">{comment.text}</p>

                            {comment?.Images && comment.Images.length > 0 && (
                              <div
                                className={`grid gap-1 mt-2 ${getImageGridClass(
                                  comment.Images.length
                                )}`}
                              >
                                {comment.Images.map((image) => (
                                  <img
                                    key={image.id}
                                    src={image.url}
                                    className="w-full object-cover rounded"
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-1 ml-2 text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            locale: vi,
                          })}
                        </span>
                        {user?.id === comment?.author?.id &&
                          !editingCommentId && (
                            <>
                              <button
                                onClick={() => handleEditComment(comment)}
                                className="font-medium hover:underline hover:text-deepBlue"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => setCommentToDelete(comment)}
                                className="font-medium hover:underline hover:text-red-500"
                              >
                                Xóa
                              </button>
                            </>
                          )}
                      </div>
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

            <div className="border-t bg-white p-3 sticky bottom-0">
              {user && (
                <form>
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={user?.name}
                      size="w-9 h-9 flex-shrink-0 mt-1"
                      src={user?.avatar}
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl px-3 py-2">
                        <textarea
                          {...register("text")}
                          placeholder={
                            isNotAdvisorForPostMajor
                              ? "Bài viết này không thuộc phạm vi tư vấn của bạn"
                              : "Viết bình luận..."
                          }
                          className="w-full bg-transparent border-none focus:ring-0 resize-none outline-none text-sm min-h-10 placeholder-gray-500"
                          rows="1"
                          onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height =
                              e.target.scrollHeight + "px";
                          }}
                        />

                        {selectedImages.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200">
                            <div className="grid grid-cols-4 gap-2">
                              {selectedImages.map((image) => (
                                <div key={image.id} className="relative group">
                                  <img
                                    src={image.previewUrl}
                                    alt="Preview"
                                    className="w-full h-14 object-cover rounded-md"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(image.id)}
                                    className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs opacity-50 group-hover:opacity-100 hover:!opacity-100 hover:bg-red-500 transition-all duration-200"
                                  >
                                    <IoClose />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1 ml-2">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            title="Đính kèm ảnh"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-500 hover:text-deepBlue p-1 rounded-full"
                          >
                            <BsImages size={18} />
                          </button>
                        </div>
                        <AuthActionWrapper
                          onClick={handleSubmit(onSubmitComment)}
                        >
                          <button
                            disabled={
                              createCommentMutation.isPending ||
                              (!commentValue.trim() &&
                                selectedImages.length === 0)
                            }
                            className="text-deepBlue disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-200"
                          >
                            <FaRegPaperPlane
                              size={16}
                              className="fill-deepBlue  transition-colors duration-200 cursor-pointer"
                            />
                          </button>
                        </AuthActionWrapper>
                      </div>
                      {errors.text && (
                        <p className="text-red-500 text-xs mt-1 ml-2">
                          {errors.text.message}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <ConfirmModal
        isOpen={!!commentToDelete}
        onClose={() => setCommentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={"Xác nhận xoá bình luận"}
        message={
          "Bạn có chắc chắn muốn xoá bình luận này không? Hành động này không thể hoàn tác."
        }
        variant={"warning"}
        isConfirming={deleteCommentMutation.isPending}
        confirmText={"Vẫn xóa"}
      />

      <ConfirmModal
        isOpen={showInformModal}
        onClose={() => setShowInformModal(false)}
        onConfirm={() => setShowInformModal(false)}
        title={"Thông báo phạm vi tư vấn"}
        message={
          "Bài viết này không thuộc phạm vi tư vấn của bạn, vui lòng chú ý trước khi tư vấn"
        }
        variant={"notice"}
        confirmText={"Đã hiểu"}
      />

      <RatePostModal
        isOpen={isOpenRatePost}
        onClose={() => setIsOpenRatePost(false)}
        post={post}
      />

      <RateAdvisorModal
        post={post}
        isOpen={rateAdvisorModal?.isOpen}
        onClose={() => setRateAdvisorModal(null)}
        advisor={rateAdvisorModal?.advisor}
      />
    </AnimatePresence>
  );
}
