import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { register as registerAPI } from "../services/authService.jsx";
import VerifyEmail from "./Verifyemail.jsx";

const schema = yup.object().shape({
  name: yup.string().required("Vui lòng nhập họ tên"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Vui lòng nhập mật khẩu"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Mật khẩu không khớp")
    .required("Vui lòng xác nhận mật khẩu"),
});

const Register = () => {
  const navigate = useNavigate();
  const [openVerify, setOpenVerify] = useState(false);
  const [userId, setUserId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const registerMutation = useMutation({
    mutationFn: registerAPI,
    onSuccess: (data) => {
      if (data.id) {
        setUserId(data.id);
        setOpenVerify(true);
        toast.success(data.message || "Vui lòng xác minh email");
        return;
      }
      toast.success(data.message || "Đăng ký thành công");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Đăng ký thất bại");
    },
  });

  const onSubmit = ({ name, email, password }) => {
    registerMutation.mutate({ name, email, password });
  };

  console.log(registerMutation);
  return (
    <>
      <div className="flex flex-col w-full h-screen p-5 lg:flex-row">
        <div className="flex items-center lg:w-1/2 order-2 lg:order-1">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto bg-white max-w-[450px] w-full flex flex-col  px-5 pt-10 pb-20 shadow-sm rounded-md"
          >
            <img
              src="/logo/logo.svg"
              alt="Logo cổng thông tin tuyển sinh"
              className="w-[300px] mb-12"
            />

            <div className="flex flex-col w-full gap-1 text-sm">
              <label htmlFor="name">Họ tên</label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
              />
              <p className="text-xs text-red-600 min-h-[1.25rem]">
                {errors.name?.message || ""}
              </p>
            </div>

            <div className="flex flex-col w-full gap-1  text-sm">
              <label htmlFor="email">Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
              />

              <p className="ext-xs text-red-600 min-h-[1.25rem]">
                {errors.email?.message || ""}{" "}
              </p>
            </div>

            <div className="flex flex-col w-full gap-1  text-sm">
              <label htmlFor="password">Mật khẩu</label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
              />
              <p className="text-xs text-red-600 min-h-[1.25rem]">
                {errors.password?.message || ""}
              </p>
            </div>

            <div className="flex flex-col w-full gap-1 mb-5 text-sm">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md focus:border-deepBlue"
              />
              <p className="text-xs text-red-600 min-h-[1.25rem]">
                {errors.confirmPassword?.message || ""}
              </p>
            </div>

            <button
              type="submit"
              className={`${
                registerMutation.isPending ? "opacity-80 cursor-wait" : ""
              } w-full px-6 py-2 mb-10 text-white rounded-md bg-deepBlue hover:bg-opacity-90 transition-all duration-150`}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <div className="mx-auto w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : (
                "Đăng ký"
              )}
            </button>

            <p className="mb-10 text-sm text-right">
              Đã có tài khoản?{" "}
              <Link to={"/login"} className="text-deepBlue underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>

        <div className="relative lg:w-1/2 w-full lg:h-full h-48 order-1 lg:order-2">
          <img
            src="/banner_login.jpg"
            alt=""
            className="object-cover h-full lg:w-full rounded-xl w-full"
          />
        </div>
      </div>

      {openVerify && <VerifyEmail userId={userId} />}
    </>
  );
};

export default Register;
