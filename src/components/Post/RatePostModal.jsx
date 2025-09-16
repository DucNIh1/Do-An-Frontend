import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  ratePostAPI,
  updateRatePostAPI,
  checkUserRatedPostAPI,
} from "../../services/postService";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  score: yup
    .number()
    .typeError("Điểm phải là số từ 1 - 10")
    .required("Vui lòng nhập điểm")
    .min(1, "Điểm tối thiểu là 1")
    .max(10, "Điểm tối đa là 10"),
  comment: yup.string().max(250, "Nhận xét tối đa 250 ký tự").nullable(),
});

export default function RatePostModal({ isOpen, onClose, post }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { score: "", comment: "" },
  });

  const { data: userRatingData, isLoading } = useQuery({
    queryKey: ["checkUserRatedPost", post?.id],
    queryFn: () => checkUserRatedPostAPI(post.id),
    enabled: !!post?.id && isOpen,
  });

  const isEditing = !!userRatingData?.data?.hasRated;

  useEffect(() => {
    if (isEditing) {
      reset({
        score: userRatingData.data.rating.score,
        comment: userRatingData.data.rating.comment || "",
      });
    } else {
      reset({ score: "", comment: "" });
    }
  }, [userRatingData, isOpen, isEditing, reset]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? updateRatePostAPI({ postId: post.id, ...data })
        : ratePostAPI({ postId: post.id, ...data }),
    onSuccess: () => {
      toast.success(
        isEditing ? "Đã cập nhật đánh giá!" : "Đã chấm điểm bài viết!"
      );
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi chấm điểm");
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

          <h2 className="text-lg font-bold mb-4 mt-2 text-center">
            {isEditing ? "Cập nhật điểm cho câu hỏi" : "Chấm điểm câu hỏi"}{" "}
          </h2>

          {isLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : (
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Điểm (1 - 10)
                  </label>
                  <input
                    type="number"
                    {...register("score")}
                    min={1}
                    max={10}
                    className="w-full border rounded-lg px-3 py-2 focus:border-deepBlue outline-none"
                  />
                  {errors.score && (
                    <p className="text-crimsonRed text-xs mt-1">
                      {errors.score.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nhận xét
                  </label>
                  <textarea
                    rows="4"
                    {...register("comment")}
                    placeholder="Nhập nhận xét (tối đa 250 ký tự)..."
                    className="w-full border focus:border-deepBlue outline-none rounded-lg px-3 py-2 resize-none"
                  />
                  {errors.comment && (
                    <p className="text-crimsonRed text-xs mt-1">
                      {errors.comment.message}
                    </p>
                  )}
                </div>

                <p className="text-xs text-crimsonRed">
                  * Điểm số sẽ ảnh hưởng đến đề xuất của câu hỏi
                </p>
              </div>

              <div className="flex justify-end gap-4 mt-6">
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
                  {mutation.isPending
                    ? "Đang lưu..."
                    : isEditing
                    ? "Cập nhật"
                    : "Xác nhận"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
