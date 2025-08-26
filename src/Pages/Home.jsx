import { useForm } from "react-hook-form";
import SliderSection from "../components/SliderSection";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { IoEarthOutline } from "react-icons/io5";
import Counter from "../components/Counter";
const Home = () => {
  const schema = yup.object().shape({
    fullName: yup
      .string()
      .required("Vui lòng nhập họ và tên")
      .min(2, "Họ và tên quá ngắn"),

    dob: yup
      .date()
      .required("Vui lòng chọn ngày sinh")
      .typeError("Ngày sinh không hợp lệ"),

    phone: yup
      .string()
      .required("Vui lòng nhập số điện thoại")
      .matches(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),

    address: yup.string().required("Vui lòng nhập địa chỉ"),

    preference: yup.string().required("Vui lòng chọn nguyện vọng"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };
  return (
    <div>
      <div className="bg-[url('/banner.jpg')] bg-cover bg-center bg-no-repeat h-[400px] mb-20"></div>
      <div className="container mx-auto mb-20">
        <SliderSection />
      </div>
      <section className="bg-white mb-20">
        <div className="max-w-6xl mx-auto text-center mb-8">
          <h2 className="text-xl font-bold text-deepBlue flex items-center justify-center gap-2">
            <span className="bg-deepBlue text-white px-4 py-2 rounded-tl-2xl rounded-br-2xl">
              <IoEarthOutline />
            </span>{" "}
            KHOA HỌC CÔNG NGHỆ
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Counter
            target={25}
            label="ĐẠI HỌC DẪN ĐẦU VỀ NGHIÊN CỨU TẠI"
            sublabel="VIỆT NAM"
          />
          <Counter target={1500} label="CÔNG BỐ QUỐC TẾ" />
          <Counter target={550} label="ĐỀ TÀI/ĐỀ ÁN KHOA HỌC CÔNG NGHỆ" />
        </div>
      </section>
      <section className="px-4 my-10">
        <div className="max-w-7xl mx-auto grid grid-cols-7 gap-6 mb-20">
          <div className="col-span-3 h-[500px]">
            <img
              src="/image_explore/a1.png"
              alt="ảnh 1"
              className="rounded-lg w-full h-full object-center"
            />
          </div>
          <div className="col-span-4 h-[500px]">
            <img
              src="/image_explore/ngoaingu.png"
              alt="ảnh 2"
              className="rounded-lg w-full h-full object-cover"
            />
          </div>
          <div className="col-span-5 row-start-2">
            <iframe
              className="w-full h-[300px] lg:h-full rounded-lg"
              src="https://www.youtube.com/embed/a_BX_Y9yj30"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <div className="col-span-2 row-start-2">
            <img
              src="/image_explore/a5.png"
              alt="ảnh 4"
              className="rounded-lg w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <div className="relative w-full h-screen bg-[url('/banner_login.jpg')] bg-cover bg-center flex justify-end items-center px-10">
        <h5></h5>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" bg-white max-w-[450px] w-full flex flex-col px-5 pt-10 pb-5 shadow-sm rounded-md"
        >
          <img
            src="/logo/logo.svg"
            alt="Logo cổng thông tin tuyển sinh"
            className="w-[300px] mb-12"
          />

          <div className="flex flex-col w-full gap-2 text-sm">
            <label htmlFor="fullName">Họ và tên</label>
            <input
              {...register("fullName")}
              type="text"
              className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600 min-h-[1.25rem]">
              {errors.fullName?.message || ""}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm">
            <label htmlFor="dob">Ngày sinh</label>
            <input
              {...register("dob")}
              type="date"
              className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600 min-h-[1.25rem]">
              {errors.dob?.message || ""}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm">
            <label htmlFor="phone">Số điện thoại</label>
            <input
              {...register("phone")}
              type="tel"
              className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600 min-h-[1.25rem]">
              {errors.phone?.message || ""}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm">
            <label htmlFor="address">Địa chỉ</label>
            <input
              {...register("address")}
              type="text"
              className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600 min-h-[1.25rem]">
              {errors.address?.message || ""}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm mb-5">
            <label htmlFor="preference">Nguyện vọng</label>
            <select
              {...register("preference")}
              className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
            >
              <option value="">-- Chọn nguyện vọng --</option>
              <option value="cntt">Công nghệ thông tin</option>
              <option value="kt">Kinh tế</option>
              <option value="yt">Y tế</option>
              <option value="ktxd">Kỹ thuật xây dựng</option>
            </select>
            <p className="text-xs text-red-600 min-h-[1.25rem]">
              {errors.preference?.message || ""}
            </p>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-2 mb-10 text-white rounded-md bg-deepBlue hover:bg-opacity-90 transition-all duration-150"
          >
            Hoàn thành đăng kí
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
