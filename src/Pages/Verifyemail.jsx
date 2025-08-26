import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { AuthContext } from "../context/authContext";
import { useMutation } from "@tanstack/react-query";
import { verifyEmailRequest } from "../services/apis";

const VerifyEmail = ({ userId }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: ({ userId, code }) => verifyEmailRequest({ userId, code }),
    onSuccess: (data) => {
      toast.success(data?.message || "Xác thực email thành công");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Xác thực email thất bại");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ userId, code: code.join("") });
  };

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25">
      <div className="bg-white rounded-xl shadow-2xl md:p-10 p-6 w-[80%] md:max-w-md top-1/2 -translate-y-1/2 absolute py-16 left-1/2 -translate-x-1/2">
        <h2 className="text-3xl font-medium mb-6 text-center text-deepBlue">
          Xác thực email
        </h2>
        <p className="text-center text-slate-600 mb-6">
          Nhập 6 mã số được gửi qua email
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="md:w-12 md:h-12 w-9 h-9 text-center text-2xl font-bold bg-slate-100 text-gray-800 border border-slate-300 rounded-md focus:border-deepBlue focus:outline-none"
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={isPending || code.some((digit) => !digit)}
            className="w-full bg-deepBlue text-white py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-deepBlue focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Đang xác thực..." : "Xác thực email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
