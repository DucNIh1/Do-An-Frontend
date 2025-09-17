import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axiosConfig from "../../axios/config";
import "react-quill/dist/quill.snow.css";
import { IoCalendar } from "react-icons/io5";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: postData, isLoading } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const res = await axiosConfig.get(`/api/posts/${id}`);
      return res.data.post;
    },
    enabled: !!id,
  });

  const { data: latestPosts } = useQuery({
    queryKey: ["latestPosts"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/posts", {
        params: { limit: 6, sort: "desc", isFromSchool: true },
      });
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;

  const post = postData;
  const currentDate = post
    ? new Date(post.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="max-w-6xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <article className="max-w-3xl mx-auto p-6">
          {post.thumbnail && (
            <div className="mb-6">
              <img
                src={post.thumbnail}
                alt="Thumbnail"
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-1">
              <IoCalendar className="h-4 w-4" />
              <span>{currentDate}</span>
            </div>

            <span>•</span>
            <span>
              {post.isFromSchool
                ? "Bài viết từ trường"
                : "Bài viết tư vấn/ hỏi đáp"}{" "}
            </span>
            {post.isFeatured && (
              <>
                <span>•</span>
                <span className="text-yellow-600 font-medium">Nổi bật</span>
              </>
            )}
          </div>

          {post.teaser && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-[#083970]">
              <p className="text-gray-700 italic text-lg leading-relaxed">
                {post.teaser}
              </p>
            </div>
          )}

          <div className="prose max-w-none">
            <div
              className="ql-editor border-0 p-0"
              style={{ fontSize: "16px", lineHeight: "1.6" }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>

      <div className="lg:col-span-1">
        <h2 className="text-xl font-semibold mb-4">Tin mới nhất</h2>
        <div className="space-y-4">
          {latestPosts?.posts.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/tin-tuc/${p.id}`)}
              className="flex gap-3 hover:bg-gray-50 p-2 rounded cursor-pointer"
            >
              <img
                src={p.thumbnail || p.images?.[0]?.url}
                alt={p.title}
                className="w-20 h-16 object-cover rounded"
              />
              <div>
                <h3 className="font-medium text-sm line-clamp-2">{p.title}</h3>
                <p className="text-xs text-gray-500">
                  {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
