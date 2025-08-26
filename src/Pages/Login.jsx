import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "react-toastify";
import { GoogleLogin } from "@react-oauth/google";

import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import {
  login as loginAPI,
  loginWithGoogle,
} from "../services/authService.jsx";
import VerifyEmail from "./Verifyemail.jsx";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  password: yup
    .string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

const Login = () => {
  const navigate = useNavigate();
  const [openVerify, setOpenVerify] = useState(false);
  const [userId, setUserId] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const loginMutation = useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      if (data.id) {
        setUserId(data.id);
        setOpenVerify(true);
        toast.success(data.message || "Vui lòng xác minh email");
        return;
      }
      navigate("/");
      toast.success(data.message || "Đăng nhập thành công");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Đăng nhập thất bại");
    },
  });

  const loginWithGoogleMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: () => {
      toast.success("Đăng nhập Google thành công");
      navigate("/");
    },
    onError: () => {
      toast.error("Đăng nhập Google thất bại 😱");
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <>
      <div className="flex flex-col w-full h-screen p-5 lg:flex-row">
        <div className="flex items-center lg:w-1/2 order-2 lg:order-1">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto bg-white max-w-[450px] w-full flex flex-col  px-5 pt-10 pb-20 shadow-sm rounded-md "
          >
            <img
              src="/logo/logo.svg"
              alt="Logo cổng thông tin tuyển sinh"
              className="w-[300px] mb-12"
            />

            <div className="flex flex-col w-full gap-2  text-sm">
              <label htmlFor="email">Tài khoản/Email</label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md  focus:border-deepBlue"
              />
              <p className="text-xs text-red-600 min-h-[1.25rem]">
                {errors.email?.message || ""}
              </p>
            </div>

            <div className="flex flex-col w-full gap-2 mb-5 text-sm">
              <label htmlFor="password">Mật khẩu</label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-4 py-2 text-gray-800 border outline-none border-slate-300 rounded-md  focus:border-deepBlue"
              />
              <p className="text-xs text-red-600 min-h-[1.25rem]">
                {errors.password?.message || ""}
              </p>
            </div>

            <Link
              to={"/forgot-password"}
              className="block w-full mb-5 text-sm text-deepBlue text-end hover:text-teal-950"
            >
              Quên mật khẩu?
            </Link>

            <button
              type="submit"
              className="w-full px-6 py-2 mb-10  text-white rounded-md bg-deepBlue hover:bg-opacity-90 transition-all duration-150"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? (
                <div className=" mx-auto w-8 h-8 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
              ) : (
                "Đăng nhập"
              )}
            </button>

            <p className="mb-10 text-sm text-right">
              Chưa có tài khoản?{" "}
              <Link to={"/signup"} className=" text-deepBlue underline">
                Đăng kí
              </Link>
            </p>

            <GoogleLogin
              onSuccess={(credentialResponse) =>
                loginWithGoogleMutation.mutate(credentialResponse)
              }
              onError={() => toast.error("Đăng nhập Google thất bại 😱")}
            />
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

export default Login;
