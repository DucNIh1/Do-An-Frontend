import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// Icons
import { PiDotsThreeThin } from "react-icons/pi";
import { FaRegThumbsUp } from "react-icons/fa6";
import { FaRegCommentAlt } from "react-icons/fa";
import { PiShareFatLight } from "react-icons/pi";

// Components
import PostModal from "./PostModal";

const CONTENT_MAX_LENGTH = 250;

const Post = ({ post }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!post) {
    return null;
  }

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

  const title = post.title || "";
  const content = post.content || post.text || "";
  const images = post.images || [];

  const fullText = content;
  const isLongContent = fullText.length > CONTENT_MAX_LENGTH;
  const displayContent = isExpanded
    ? fullText
    : fullText.substring(0, CONTENT_MAX_LENGTH) + (isLongContent ? "..." : "");

  const handleImageError = (imageId) => {
    setImageError((prev) => ({ ...prev, [imageId]: true }));
  };

  const getPlaceholderImage = () => {
    return "https://placehold.co/400x300/f3f4f6/9ca3af?text=Ảnh+không+tải+được";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={authorAvatar}
            alt={`${authorName} avatar`}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
            onError={(e) => {
              e.target.src = `https://placehold.co/40x40/667eea/ffffff?text=${authorName.charAt(
                0
              )}`;
            }}
          />
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">
              {authorName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
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
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <PiDotsThreeThin className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="px-4 pb-3">
        {title && (
          <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
            {title}
          </h2>
        )}

        {content && (
          <div className="text-gray-700 leading-relaxed mb-3">
            <p className="whitespace-pre-wrap">{displayContent}</p>
            {isLongContent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-deepBlue hover:text-opacity-90 font-medium text-sm mt-1 hover:underline transition-colors"
              >
                {isExpanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className={`grid gap-1 w-full rounded-lg overflow-hidden
    ${images.length === 1 ? "grid-cols-1" : ""}
    ${images.length === 2 ? "grid-cols-2" : ""}
    ${images.length === 3 ? "grid-cols-2 grid-rows-2 auto-rows-fr" : ""}
    ${images.length >= 4 ? "grid-cols-2 grid-rows-2" : ""}`}
      >
        {images.slice(0, 4).map((image, index) => {
          const imageId = image.id || index;
          const imageSrc = imageError[imageId]
            ? getPlaceholderImage()
            : image.url || image.src || getPlaceholderImage();

          return (
            <div
              key={imageId}
              className="relative group cursor-pointer"
              onClick={() => {
                setIsModalOpen(true);
                setSelectedImageIndex(index);
              }}
            >
              <img
                src={imageSrc}
                alt={`Hình ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300"
                onError={() => handleImageError(imageId)}
              />

              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-lg font-semibold">
                  +{images.length - 4}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500">
        <div className="flex items-center gap-4">
          {post.likesCount > 0 && <span>{post.likesCount} lượt thích</span>}
        </div>
        <div className="flex items-center gap-4">
          {post.commentsCount > 0 && (
            <span>{post.commentsCount} bình luận</span>
          )}
          {post.sharesCount > 0 && <span>{post.sharesCount} lượt chia sẻ</span>}
        </div>
      </div>

      <div className="h-px bg-gray-200 mx-4" />

      <div className="grid grid-cols-3 p-2">
        <button className="flex items-center justify-center gap-2 py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
          <FaRegThumbsUp className="w-4 h-4" />
          <span>Thích</span>
        </button>
        <button
          className="flex items-center justify-center gap-2 py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium"
          onClick={() => setIsModalOpen(true)}
        >
          <FaRegCommentAlt className="w-4 h-4" />
          <span>Bình luận</span>
        </button>
        <button className="flex items-center justify-center gap-2 py-2 px-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors font-medium">
          <PiShareFatLight className="w-4 h-4" />
          <span>Chia sẻ</span>
        </button>
      </div>

      <div className="flex items-center gap-3 p-4 border-t border-gray-100 bg-gray-50/50">
        <img
          src={authorAvatar}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
          onError={(e) => {
            e.target.src = `https://placehold.co/32x32/667eea/ffffff?text=U`;
          }}
        />
        <div className="flex-1">
          <input
            type="text"
            placeholder="Viết bình luận..."
            className="w-full bg-white rounded-full px-4 py-2 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={post}
        initialImageIndex={selectedImageIndex}
      />
    </div>
  );
};

export default Post;
