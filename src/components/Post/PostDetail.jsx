import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axiosConfig from "../../axios/config";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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

  return (
    <div className="max-w-6xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-3 mb-6 text-sm text-gray-600">
          <img
            src={post.author?.avatar}
            alt={post.author?.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{post.author?.name}</p>
            <p>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</p>
          </div>
        </div>

        {post.images?.length > 0 && (
          <div className="mb-6">
            {post.images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt="post"
                className="w-full mb-4 rounded-lg"
              />
            ))}
          </div>
        )}

        <div className="prose max-w-none">
          <ReactQuill value={post.content} readOnly={true} theme="bubble" />
        </div>
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
