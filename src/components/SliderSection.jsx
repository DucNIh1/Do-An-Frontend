// src/components/SliderSection.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";

const data = [
  {
    image: "/image_explore/a1.png",
    text: "Môi trường học tập năng động, hiện đại, giúp sinh viên phát triển bản thân",
  },
  {
    image: "/image_explore/a5.png",
    text: "Chương trình đào tạo cập nhật, gắn đào tạo với nhu cầu thực tế của doanh nghiệp",
  },
  {
    image: "/image_explore/ngoaingu.png",
    text: "Cơ sở vật chất hiện đại đáp ứng nhu cầu học tập và phát triển toàn diện",
  },
  {
    image: "/image_explore/santruong.png",
    text: "Đội ngũ giảng viên giỏi, tâm huyết, yêu nghề và luôn hỗ trợ sinh viên",
  },
];

export default function SliderSection() {
  return (
    <div className=" py-10">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-textBlue mb-4">
          TẠI SAO NÊN CHỌN ĐẠI HỌC CÔNG NGHIỆP HÀ NỘI
        </h2>
        <p className="text-gray-600 w-full max-w-lg text-center mx-auto">
          Trường Đại học Đại HỌC CÔNG NGHIỆP HÀ NỘI mang đến môi trường học hiện
          đại, thân thiện và chuyên nghiệp.
        </p>
      </div>
      <Swiper
        spaceBetween={20}
        slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
        className="px-10"
      >
        {data.map((item, index) => (
          <SwiperSlide key={index}>
            <div
              className="h-80 bg-cover bg-center rounded-xl shadow-md flex items-end p-4 text-white text-sm"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <div className="bg-black/50 p-3 rounded-md">{item.text}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
