import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { checkAdvisorRated, rateAdvisor } from "../../services/postService";
import UserAvatar from "../CommonAvatar";

const schema = yup.object().shape({
  score: yup
    .number()
    .typeError("Điểm phải là số từ 1 - 10")
    .required("Vui lòng nhập điểm")
    .min(1, "Điểm tối thiểu là 1")
    .max(10, "Điểm tối đa là 10"),
  comment: yup.string().max(250, "Nhận xét tối đa 250 ký tự"),
});

export default function RateAdvisorModal({ isOpen, onClose, post, advisor }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { score: "", comment: "" },
  });

  const { data: userRatingData, isLoading } = useQuery({
    queryKey: ["checkUserRatedAdvisor", advisor?.id, post?.id],
    queryFn: () => checkAdvisorRated(advisor?.id, post?.id),
    enabled: !!advisor?.id && !!post?.id && isOpen,
  });
  useEffect(() => {
    if (userRatingData?.hasRated) {
      setValue("score", userRatingData.rating?.score);
      setValue("comment", userRatingData.rating?.comment || "");
    } else {
      reset({ score: "", comment: "" });
    }
  }, [userRatingData, isOpen, setValue, reset]);

  const mutation = useMutation({
    mutationFn: (values) =>
      rateAdvisor(advisor?.id, post?.id, values.score, values.comment),
    onSuccess: () => {
      toast.success("Đã đánh giá tư vấn viên!");
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi đánh giá");
    },
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg p-6 w-full max-w-md relative"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-3 top-3 text-gray-600 hover:text-black"
          >
            <IoClose size={20} />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <UserAvatar
              src={advisor?.avatar}
              name={advisor?.name}
              size="w-12 h-12"
            />

            <div>
              <p className="font-semibold text-lg">{advisor?.name}</p>
              <p className="text-sm text-gray-500">{advisor?.email}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-4">Đánh giá tư vấn viên</h2>

          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : userRatingData?.hasRated ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-green-700 font-medium mb-2">
                Bạn đã đánh giá tư vấn viên này.
              </p>
              <p className="text-gray-700">
                <strong>Điểm:</strong> {userRatingData.rating.score}/10
              </p>
              {userRatingData.rating.comment && (
                <p className="text-gray-700 mt-1">
                  <strong>Nhận xét:</strong> {userRatingData.rating.comment}
                </p>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Điểm (1 - 10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    {...register("score")}
                    className="w-full border rounded-lg px-3 py-2 focus:border-deepBlue outline-none"
                  />
                  {errors.score && (
                    <p className="text-crimsonRed text-xs">
                      {errors.score.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nhận xét (tùy chọn)
                  </label>
                  <textarea
                    rows="3"
                    {...register("comment")}
                    placeholder="Nhập nhận xét..."
                    className="w-full border focus:border-deepBlue outline-none rounded-lg px-3 py-2 resize-none"
                  />
                  {errors.comment && (
                    <p className="text-crimsonRed text-xs">
                      {errors.comment.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-4 py-2 bg-[#fecb4e] text-textBlue font-semibold rounded-md hover:bg-yellow-500 disabled:opacity-50"
                >
                  {mutation.isPending ? "Đang lưu..." : "Xác nhận"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
