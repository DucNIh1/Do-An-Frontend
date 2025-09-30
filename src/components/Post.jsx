import { useContext, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { FaRegCommentAlt, FaStar } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkUserLikedAPI,
  deletePostAPI,
  toggleLikeAPI,
} from "../services/postService";
import { toast } from "react-toastify";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import AuthActionWrapper from "./AuthActionWrapper";
import { AuthContext } from "../context/AuthContext";
import { usePostModal } from "../context/PostModalContext";
import { BsThreeDots } from "react-icons/bs";
import ConfirmModal from "./ConfirmModal";
import UserAvatar from "./CommonAvatar";

const CONTENT_MAX_LENGTH = 250;

const Post = ({ post }) => {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const { openPostModal, setSelectedImageIndex } = usePostModal();
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageError, setImageError] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: likeData, refetch: refetchLikeStatus } = useQuery({
    queryKey: ["userLiked", post?.id],
    queryFn: () => checkUserLikedAPI(post.id),
    enabled: !!post?.id && !!user,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: () => toggleLikeAPI(post.id),
    onSuccess: () => {
      refetchLikeStatus();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
  });

  const deletePostMutation = useMutation({
    mutationFn: () => deletePostAPI(post.id),
    onSuccess: () => {
      toast.success("Đã xoá bài viết");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setShowConfirm(false);
    },
    onError: () => toast.error("Xoá bài viết thất bại"),
  });

  if (!post) return null;

  const authorName = post.author?.name;
  const authorAvatar =
    post.author?.avatar ||
    `https://placehold.co/40x40/667eea/ffffff?text=${authorName.charAt(0)}`;

  const formattedDate = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
        locale: vi,
      })
    : "Vừa xong";

  const content = post.content || post.text || "";
  const isLongContent = content.length > CONTENT_MAX_LENGTH;
  const displayContent = isExpanded
    ? content
    : content.substring(0, CONTENT_MAX_LENGTH) + (isLongContent ? "..." : "");

  const handleImageError = (imageId) =>
    setImageError((prev) => ({ ...prev, [imageId]: true }));

  const getPlaceholderImage = () =>
    "https://placehold.co/400x300/f3f4f6/9ca3af?text=Ảnh+không+tải+được";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-start sm:items-center justify-between p-4 flex-col sm:flex-row gap-3 sm:gap-0">
        <div className="flex items-start sm:items-center gap-3 w-full sm:w-auto">
          <UserAvatar
            src={authorAvatar}
            alt={`${authorName} avatar`}
            name={authorName}
            size="w-10 h-10 ring-2 ring-gray-100"
            userId={post.author?.id}
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm flex flex-wrap gap-2 mb-1">
              <span>{authorName}</span>
              {post.author?.role === "ADVISOR" && (
                <span className="text-xs bg-blue-100 text-deepBlue font-bold px-2 py-0.5 rounded-full">
                  Tư vấn viên
                </span>
              )}
            </h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>{formattedDate}</span>
              {post.major && (
                <>
                  <span>•</span>
                  <span className="text-deepBlue font-medium">
                    {post.major.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {["ADVISOR", "ADMIN"].includes(post.author?.role) && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs sm:text-sm font-medium">
              <FaStar className="w-4 h-4 fill-yellow-500" />
              Nổi bật
            </span>
          )}
          {user?.id === post.authorId && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <BsThreeDots size={18} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg z-50">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setShowConfirm(true);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                  >
                    Xoá bài viết
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {post.title && (
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 leading-tight">
            {post.title}
          </h2>
        )}
        {content && (
          <div className="text-gray-700 leading-relaxed mb-3 text-sm sm:text-base">
            <p className="whitespace-pre-wrap">{displayContent}</p>
            {isLongContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-deepBlue hover:text-opacity-90 font-medium text-xs sm:text-sm mt-1 hover:underline transition-colors"
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        )}
      </div>

      {post.images?.length > 0 && (
        <div
          className={`grid gap-1 w-full rounded-lg overflow-hidden
          ${post.images.length === 1 ? "grid-cols-1" : ""}
          ${post.images.length === 2 ? "grid-cols-2" : ""}
          ${
            post.images.length === 3
              ? "grid-cols-2 grid-rows-2 auto-rows-fr"
              : ""
          }
          ${post.images.length >= 4 ? "grid-cols-2 grid-rows-2" : ""}`}
        >
          {post.images.slice(0, 4).map((image, index) => {
            const imageId = image.id || index;
            const imageSrc = imageError[imageId]
              ? getPlaceholderImage()
              : image.url || getPlaceholderImage();

            return (
              <div
                key={imageId}
                className="relative group cursor-pointer"
                onClick={() => {
                  openPostModal({ post });
                  setSelectedImageIndex(index);
                }}
              >
                <img
                  src={imageSrc}
                  alt={`Hình ${index + 1}`}
                  className="w-full h-40 sm:h-60 object-cover transition-transform duration-300"
                  onError={() => handleImageError(imageId)}
                />
                {index === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                    +{post.images.length - 4}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 py-2 text-xs sm:text-sm text-gray-500 gap-1 sm:gap-0">
        <div>
          {post.likesCount > 0 && <span>{post.likesCount} lượt thích</span>}
        </div>
        <div className="flex gap-4">
          {post.commentsCount > 0 && (
            <span>{post.commentsCount} bình luận</span>
          )}
          {post.sharesCount > 0 && <span>{post.sharesCount} lượt chia sẻ</span>}
        </div>
      </div>

      <div className="h-px bg-gray-200 mx-4" />

      <div className="flex p-2 justify-around text-xs sm:text-sm">
        <AuthActionWrapper onClick={() => toggleLikeMutation.mutate()}>
          <button
            disabled={toggleLikeMutation.isPending}
            className="flex items-center gap-2 py-2 px-3 rounded-lg transition-colors font-medium hover:bg-blue-50"
          >
            {likeData?.isLiked ? (
              <AiFillLike className="fill-deepBlue" />
            ) : (
              <AiOutlineLike />
            )}
            <span>
              {likeData?.totalLikes || 0}{" "}
              {likeData?.totalLikes > 1 ? "lượt thích" : "Thích"}
            </span>
          </button>
        </AuthActionWrapper>

        <button
          className="flex items-center gap-2 py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
          onClick={() => openPostModal({ post })}
        >
          <FaRegCommentAlt className="w-4 h-4" />
          <span>Bình luận</span>
        </button>
      </div>

      <div className="flex items-center gap-3 p-3 sm:p-4 border-t border-gray-100 bg-gray-50/50">
        <img
          src={authorAvatar}
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.target.src = `https://placehold.co/32x32/667eea/ffffff?text=U`;
          }}
        />
        <div className="flex-1" onClick={() => openPostModal({ post })}>
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="w-full bg-white rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-200 outline-none focus:border-transparent transition-all"
          />
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => deletePostMutation.mutate()}
        title="Xác nhận xoá"
        message="Bạn có chắc muốn xoá bài viết này? Hành động này không thể hoàn tác."
        variant="warning"
        confirmText="Xoá"
        cancelText="Hủy"
        isConfirming={deletePostMutation.isPending}
      />
    </div>
  );
};

export default Post;
