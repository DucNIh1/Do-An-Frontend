import { useNavigate } from "react-router";
import formatDate from "../../utils/formatDate";

export default function SmallCard({ post }) {
  const navigate = useNavigate();
  return (
    <article
      className="flex gap-4 items-center hover:bg-gray-50 p-2 rounded cursor-pointer"
      onClick={() => navigate(`/tin-tuc/${post.id}`)}
    >
      {post.images?.length > 0 && (
        <img
          src={post.images[0].url}
          alt={post.title}
          className="w-28 h-20 object-cover rounded cursor-pointer"
        />
      )}
      <div>
        <h3 className="font-semibold leading-tight text-sm">{post.title}</h3>
        <p className="text-xs text-gray-600 mt-1">{post.excerpt}</p>
        <div className="mt-2 text-xs text-gray-400">
          {formatDate(post.createdAt)}
        </div>
      </div>
    </article>
  );
}
