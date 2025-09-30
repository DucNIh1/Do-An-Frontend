import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { useQuery } from "@tanstack/react-query";
import axiosConfig from "../axios/config";
import { useNavigate } from "react-router";
import formatDate from "../utils/formatDate";

export default function SliderSection() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["featuredPostsSlider"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/posts", {
        params: {
          isFeatured: true,
          sort: "desc",
          limit: 10,
          isFromSchool: true,
        },
      });
      return res.data;
    },
  });

  if (isLoading) {
    return <div className="text-center py-10">Đang tải...</div>;
  }

  return (
    <div className="py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-textBlue mb-4">
          TIN NỔI BẬT TỪ ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI
        </h2>
        <p className="text-gray-600 w-full max-w-lg text-center mx-auto">
          Cập nhật nhanh những bài viết nổi bật, sự kiện và thông tin quan
          trọng.
        </p>
      </div>
      <Swiper
        spaceBetween={20}
        slidesPerView={3}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000 }}
        loop
        modules={[Pagination, Autoplay]}
        className="px-10"
      >
        {data?.posts?.map((post) => (
          <SwiperSlide key={post.id}>
            <div
              className="h-80 bg-cover bg-center rounded-xl shadow-md flex flex-col justify-end cursor-pointer group overflow-hidden"
              style={{
                backgroundImage: `url(${
                  post.images?.[0]?.url || "/default_news.png"
                })`,
              }}
              onClick={() => navigate(`/tin-tuc/${post.id}`)}
            >
              <div className="bg-black/50 p-4 text-white min-h-[90px] transition group-hover:bg-black/80">
                <div className="text-xs text-gray-300">
                  {formatDate(post.createdAt)}
                </div>
                <h3 className="font-semibold line-clamp-2 text-white">
                  {post.title}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
