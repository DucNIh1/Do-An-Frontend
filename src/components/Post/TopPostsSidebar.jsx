import { AiOutlineLike } from "react-icons/ai";
import { FaRegCommentDots } from "react-icons/fa6";
import UserAvatar from "../CommonAvatar";

// - topPosts: Mảng các bài viết nổi bật
// - loadingTopPosts: Trạng thái boolean cho biết có đang tải hay không
// - setSelectedPost: Hàm để xử lý khi người dùng click vào một bài viết

const TopPostsSidebar = ({ topPosts, loadingTopPosts, setSelectedPost }) => {
  const SkeletonItem = () => (
    <div className="flex items-start gap-3 animate-pulse p-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 mt-1 flex-shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm  h-fit">
      {loadingTopPosts ? (
        <div className="space-y-2">
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </div>
      ) : topPosts?.length > 0 ? (
        <ul className="space-y-1">
          {topPosts.map((post) => (
            <li
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="cursor-pointer  p-3 rounded-lg transition-colors duration-200 bg-gray-50"
            >
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={post.author?.name}
                  src={post.author?.avatar}
                  userId={post.author?.id}
                  size="w-10 h-10 mt-1 flex-shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="font-semibold text-sm text-gray-800 line-clamp-2 leading-tight hover:text-deepBlue transition-colors">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Bởi{" "}
                    <span className="font-medium text-gray-700 hover:underline">
                      {post.author?.name || "Người dùng ẩn danh"}
                    </span>
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span
                      className="flex items-center gap-1.5"
                      title="Lượt thích"
                    >
                      <AiOutlineLike className="text-base" />
                      <span>{post._count.likes}</span>
                    </span>
                    <span
                      className="flex items-center gap-1.5"
                      title="Bình luận"
                    >
                      <FaRegCommentDots className="text-sm" />
                      <span>{post._count.comments}</span>
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm text-center py-4">
          Chưa có bài viết nổi bật.
        </p>
      )}
    </div>
  );
};

export default TopPostsSidebar;
