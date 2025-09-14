import { useNavigate } from "react-router";
import formatDate from "../../utils/formatDate";

export default function HeroFeatured({ post }) {
  const navigate = useNavigate();
  return (
    <article
      className="relative rounded-2xl overflow-hidden shadow-lg hover:bg-slate-50 "
      onClick={() => navigate(`/tin-tuc/${post.id}`)}
    >
      {post.images?.length > 0 && (
        <img
          src={post.images[0].url}
          alt={post.title}
          className="w-full h-56 object-cover cursor-pointer"
        />
      )}
      <div className="absolute font-medium top-2 right-2 bg-deepBlue text-white px-2 py-1 rounded-lg">
        Tin nổi bật
      </div>
      <div className="p-4 cursor-pointer">
        <div className="mt-2 text-xs ">{formatDate(post.createdAt)}</div>
        <h2 className="mt-2 text-lg font-semibold text-text ">{post.title}</h2>
      </div>
    </article>
  );
}
