import { useForm, Controller } from "react-hook-form";
import SliderSection from "../components/SliderSection";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { IoEarthOutline } from "react-icons/io5";
import Counter from "../components/Counter";
import Select from "react-select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import axiosConfig from "../axios/config";

const schema = yup.object().shape({
  fullName: yup
    .string()
    .required("Vui lòng nhập họ và tên")
    .min(2, "Họ và tên quá ngắn"),
  birthDate: yup
    .date()
    .required("Vui lòng chọn ngày sinh")
    .typeError("Ngày sinh không hợp lệ"),
  phoneNumber: yup
    .string()
    .required("Vui lòng nhập số điện thoại")
    .matches(/^(0|\+84)[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  address: yup.string().required("Vui lòng nhập địa chỉ"),
  majorId: yup.string().nullable().required("Vui lòng chọn ngành"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
});

const Home = () => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      birthDate: "",
      phoneNumber: "",
      address: "",
      majorId: null,
      email: "",
    },
  });

  const {
    data: majorsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["majors"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/majors?limit=1000");
      return res.data.majors;
    },
  });

  const majorOptions =
    majorsData?.map((m) => ({
      value: m.id,
      label: m.name,
    })) || [];

  const createRequestMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await axiosConfig.post(
        "/api/consultation-requests",
        formData
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Đăng ký tư vấn thành công!");
      reset();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"
      );
    },
  });

  const onSubmit = (data) => {
    createRequestMutation.mutate(data);
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

      <div
        id="tu-van-xet-tuyen"
        className="relative w-full h-screen bg-[url('/banner_login.jpg')] bg-cover bg-center flex justify-end items-center px-10"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white max-w-[450px] w-full flex flex-col px-5 pt-10 pb-5 shadow-sm rounded-md"
        >
          <img
            src="/logo/logo.svg"
            alt="Logo cổng thông tin tuyển sinh"
            className="w-[300px] mb-12"
          />

          <div className="flex flex-col w-full gap-2 text-sm">
            <label>Họ và tên</label>
            <input
              {...register("fullName")}
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600">{errors.fullName?.message}</p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm">
            <label>Ngày sinh</label>
            <input
              {...register("birthDate")}
              type="date"
              className="w-full px-4 py-2 border rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600">{errors.birthDate?.message}</p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm">
            <label>Số điện thoại</label>
            <input
              {...register("phoneNumber")}
              type="tel"
              className="w-full px-4 py-2 border rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600">
              {errors.phoneNumber?.message}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm">
            <label>Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-2 border rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600">{errors.email?.message}</p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm">
            <label>Địa chỉ</label>
            <input
              {...register("address")}
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:border-deepBlue"
            />
            <p className="text-xs text-red-600">{errors.address?.message}</p>
          </div>

          <div className="flex flex-col w-full gap-2 text-sm mb-5">
            <label>Nguyện vọng</label>
            <Controller
              name="majorId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={majorOptions}
                  isLoading={isLoading}
                  placeholder="Chọn ngành"
                  value={
                    majorOptions.find((opt) => opt.value === field.value) ||
                    null
                  }
                  onChange={(option) =>
                    field.onChange(option ? option.value : null)
                  }
                />
              )}
            />
            {isError && (
              <p className="text-red-600 text-xs mt-1">
                Không thể tải danh sách ngành
              </p>
            )}
            <p className="text-xs text-red-600">{errors.majorId?.message}</p>
          </div>

          <button
            type="submit"
            disabled={createRequestMutation.isPending}
            className="w-full px-6 py-2 mb-10 text-white rounded-md bg-deepBlue hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            {createRequestMutation.isPending
              ? "Đang xử lý..."
              : "Hoàn thành đăng ký"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home;
