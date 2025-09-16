import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosConfig from "../axios/config";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import HeroFeatured from "../components/Post/HeroFeatured";
import SmallCard from "../components/Post/SmallCard";
import formatDate from "../utils/formatDate";
import { useNavigate } from "react-router";
import Select from "react-select";

export default function NewsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [selectedMajor, setSelectedMajor] = useState(null);

  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ["featuredPosts"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/posts", {
        params: {
          isFeatured: true,
          sort: "desc",
          limit: 100,
          isFromSchool: true,
        },
      });
      return res.data;
    },
  });
  const { data: latestData, isLoading: loadingLatest } = useQuery({
    queryKey: ["latestPosts"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/posts", {
        params: { limit: 6, sort: "desc", isFromSchool: true },
      });
      return res.data;
    },
  });

  const { data: majorsData } = useQuery({
    queryKey: ["majors"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/majors", {
        params: { limit: 1000 },
      });
      return res.data.majors.map((m) => ({
        value: m.id,
        label: m.name,
      }));
    },
  });

  const { data: othersData, isLoading: loadingOthers } = useQuery({
    queryKey: ["othersPosts", page, selectedMajor?.value],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/posts", {
        params: {
          page,
          limit: 9,
          sort: "desc",
          isFromSchool: true,
          majorId: selectedMajor?.value || undefined,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  if (loadingFeatured || loadingLatest || loadingOthers) {
    return <div className="p-8">Đang tải...</div>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold">Tin tức</h1>
        <p className="text-gray-600 mt-1 mb-2">
          Cập nhật mới nhất — tin nổi bật và các bài viết khác
        </p>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop={true}
        >
          {featuredData?.posts?.map((post) => (
            <SwiperSlide key={post.id}>
              <HeroFeatured post={post} />
            </SwiperSlide>
          ))}
        </Swiper>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          loop
          className="rounded-2xl shadow-lg"
        ></Swiper>
      </header>

      <section className="mb-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bên trái: Tin nổi bật */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Tin nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredData?.posts?.map((post, index) => {
              if (index >= 4) return null;
              return <HeroFeatured key={post.id} post={post} />;
            })}
          </div>
        </div>

        {/* Bên phải: Tin mới nhất */}
        <aside>
          <h2 className="text-2xl font-bold mb-4">Tin mới nhất</h2>
          <div className="flex flex-col gap-4">
            {latestData?.posts?.map((post) => (
              <SmallCard key={post.id} post={post} />
            ))}
          </div>
        </aside>
      </section>

      <div className="mb-6 ml-full w-full  flex gap-3 items-center ">
        <Select
          options={majorsData}
          value={selectedMajor}
          onChange={(val) => {
            setSelectedMajor(val);
            setPage(1);
          }}
          placeholder="Lọc theo chuyên ngành..."
          isClearable
        />
        <span className="text-deepBlue font-semibold">
          Lọc bài viết theo chuyên ngành
        </span>
      </div>

      {othersData?.posts?.length === 0 && (
        <p className="text-center my-40">Không tìm thấy bài viết nào</p>
      )}
      {othersData?.posts?.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Các bài viết khác</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {othersData.posts.map((p) => (
              <article
                key={p.id}
                className="bg-white rounded-xl shadow overflow-hidden"
                onClick={() => navigate(`/tin-tuc/${p.id}`)}
              >
                {p.images?.length > 0 && (
                  <img
                    src={p.images[0].url}
                    alt={p.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-4 cursor-pointer hover:bg-gray-50 h-full">
                  <div className="text-xs text-gray-400">
                    {formatDate(p.createdAt)}
                  </div>
                  <h3 className="mt-2 font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{p.excerpt}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            {Array.from({ length: othersData.totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded ${
                    p === othersData.currentPage
                      ? "bg-deepBlue text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>
        </section>
      )}

      <footer className="mt-12 text-center text-sm text-gray-500">
        © 2025 Trang Tin Tức
      </footer>
    </main>
  );
}
