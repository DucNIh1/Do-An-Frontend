import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { toast } from "react-toastify";

import { IoClose } from "react-icons/io5";
import { BsImages } from "react-icons/bs";
import {
  uploadImagesAPI,
  createPostAPI,
  deletePostAPI,
} from "../services/postService";
import axiosConfig from "../axios/config";

const postSchema = yup.object().shape({
  title: yup.string().trim().required("Tiêu đề không được để trống."),
  content: yup.string().trim().required("Nội dung không được để trống."),
  majorId: yup.string().nullable(),
});

const CreatePostModal = () => {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const fileInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      majorId: null,
    },
  });

  const {
    data: majorsData,
    isLoading: isLoadingMajors,
    isError,
  } = useQuery({
    queryKey: ["majors"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/majors");
      return res.data.majors;
    },
  });

  const majorOptions =
    majorsData?.map((m) => ({
      value: m.id,
      label: m.name,
    })) || [];

  const createPostMutation = useMutation({
    mutationFn: async (formData) => {
      let createdPost = null;

      createdPost = await createPostAPI(formData);
      const postId = createdPost.data?.id;

      if (selectedImages.length > 0) {
        try {
          const imageFiles = selectedImages.map((img) => img.file);
          await uploadImagesAPI(imageFiles, { folder: "posts", postId });
        } catch {
          await deletePostAPI(postId);

          throw new Error(
            "Không thể tải lên hình ảnh. Bài viết đã được tự động hủy."
          );
        }
      }

      return createdPost;
    },
    onSuccess: () => {
      toast.success("Đăng bài viết thành công!");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      closeModal();
    },
    onError: (error) => {
      toast.error(error.message || "Có lỗi xảy ra, vui lòng thử lại!");
    },
  });

  const openModal = () => setIsModalOpen(true);

  const resetAllForms = useCallback(() => {
    reset();
    setSelectedImages([]);
  }, [reset]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(resetAllForms, 300);
  }, [resetAllForms]);

  const onSubmit = (formData) => {
    createPostMutation.mutate(formData);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: Date.now() + Math.random(),
        file: file,
        previewUrl: URL.createObjectURL(file),
      }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    event.target.value = null;
  };

  const removeImage = (imageId) => {
    setSelectedImages((prevImages) => {
      const imageToRemove = prevImages.find((img) => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prevImages.filter((img) => img.id !== imageId);
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeModal();
    };
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, [selectedImages]);

  const watchedTitle = watch("title");
  useEffect(() => {
    const el = document.getElementById("title-textarea");
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [watchedTitle]);

  const getImageGridClass = (count) => {
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-2 grid-rows-2";
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-deepBlue hover:bg-opacity-90 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-transform transform hover:-translate-y-0.5"
      >
        Tạo bài viết
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]"
          onClick={closeModal}
        >
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-xl shadow-2xl w-[500px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative text-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">Tạo bài viết</h2>
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 w-9 h-9 flex items-center justify-center rounded-full"
              >
                <IoClose className="text-gray-600 text-xl" />
              </button>
            </div>

            <div className="overflow-y-auto flex-grow p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  DN
                </div>
                <div className="w-full">
                  <h4 className="font-semibold text-gray-800">Đỗ Đức Ninh</h4>
                  <Controller
                    name="majorId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={majorOptions}
                        isLoading={isLoadingMajors}
                        isClearable
                        placeholder="Chọn chuyên ngành"
                        value={
                          majorOptions.find((o) => o.value === field.value) ||
                          null
                        }
                        onChange={(option) =>
                          field.onChange(option ? option.value : null)
                        }
                        className="text-xs mt-1 z-20"
                        styles={{ menu: (base) => ({ ...base, zIndex: 9999 }) }}
                      />
                    )}
                  />
                  {isError && (
                    <p className="text-red-500 text-xs mt-1">
                      Lỗi tải danh sách ngành
                    </p>
                  )}
                </div>
              </div>

              <div>
                <textarea
                  id="title-textarea"
                  {...register("title")}
                  placeholder="Tiêu đề bài viết..."
                  rows="1"
                  className="w-full border-none resize-none text-md outline-none placeholder:text-gray-400 font-normal overflow-hidden"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}

                <textarea
                  {...register("content")}
                  placeholder="Ninh ơi, bạn đang nghĩ gì thế?"
                  className="w-full border-none outline-none resize-none text-base placeholder:text-gray-500 min-h-[120px] mt-2"
                />
                {errors.content && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.content.message}
                  </p>
                )}
              </div>

              {selectedImages.length > 0 && (
                <div className="relative border rounded-lg p-2">
                  <div
                    className={`grid gap-2 ${getImageGridClass(
                      selectedImages.length
                    )}`}
                  >
                    {selectedImages.slice(0, 4).map((image, index) => (
                      <div
                        key={image.id}
                        className={`relative aspect-square ${
                          selectedImages.length === 3 && index === 0
                            ? "row-span-2"
                            : ""
                        }`}
                      >
                        <img
                          src={image.previewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 w-6 h-6 flex items-center justify-center rounded-full"
                        >
                          <IoClose className="text-white text-sm" />
                        </button>
                        {index === 3 && selectedImages.length > 4 && (
                          <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-2xl font-bold rounded-md">
                            +{selectedImages.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="absolute top-2 left-2 bg-white/80 hover:bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-md shadow flex items-center gap-1.5"
                  >
                    <BsImages /> Thêm ảnh
                  </button>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="w-full flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-green-500 p-1.5 rounded-full">
                    <BsImages className="text-white" />
                  </div>
                  <span className="font-semibold text-gray-700">
                    Thêm Ảnh/Video
                  </span>
                </button>
              </div>
            </div>

            <div className="p-4 border-t">
              <button
                type="submit"
                disabled={createPostMutation.isPending}
                className="w-full bg-deepBlue hover:bg-opacity-90 disabled:bg-gray-300 disabled:cursor-wait text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {createPostMutation.isPending ? "Đang xử lý..." : "Đăng"}
              </button>
            </div>
          </form>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default CreatePostModal;
