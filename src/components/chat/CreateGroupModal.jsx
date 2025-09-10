import { useState, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from "react-select";
import axiosConfig from "../../axios/config";
import { AuthContext } from "../../context/AuthContext.jsx";

const schema = yup.object().shape({
  name: yup.string().trim().required("Vui lòng nhập tên nhóm"),
  members: yup
    .array()
    .min(2, "Cần chọn ít nhất 2 thành viên")
    .required("Vui lòng chọn thành viên"),
});

export default function CreateGroupModal({ onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [visibleCount, setVisibleCount] = useState(10);

  const { user } = useContext(AuthContext);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/users");
      return res.data.results;
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { name: "", members: [] },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axiosConfig.post("/api/conversations", payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["conversations"]);
      onSuccess?.(data);
      onClose();
    },
  });

  const options = users
    .filter((u) => u.id !== user?.id)
    .slice(0, visibleCount)
    .map((u) => ({ value: u.id, label: `${u.name} (${u.email})` }));

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#083970" : "#d1d5db",
      boxShadow: "none",
      "&:hover": {
        borderColor: state.isFocused ? "#083970" : "#9ca3af",
      },
      border: "1px solid #e5e7eb",
      outline: "none",
      minHeight: "38px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#f3f4f6"
        : state.isFocused
        ? "#f3f4f6"
        : "white",
      color: "#374151",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#f3f4f6",
      borderRadius: 6,
      padding: "0 2px",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#374151",
      fontSize: "0.85rem",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "#6b7280",
      cursor: "pointer",
      ":hover": {
        backgroundColor: "#dddddd",
        color: "white",
        cursor: "pointer",
      },
    }),
  };

  const onSubmit = (data) => {
    createGroupMutation.mutate({
      name: data.name,
      userIds: data.members.map((m) => m.value),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[2000]">
      <div className="bg-white w-96 rounded-lg shadow-lg p-4">
        <h2 className="text-lg font-medium mb-3 ">Tạo nhóm mới</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Tên nhóm"
              {...register("name")}
              className="w-full border focus:border-deepBlue outline-none p-2 rounded mb-1 text-sm"
            />
            <p className="text-xs text-red-600 min-h-[1.25rem]">
              {errors.name?.message || ""}
            </p>
          </div>

          <div className="mb-3 z-[2000]">
            <p className="text-sm font-medium mb-1">Chọn thành viên</p>
            {isLoading ? (
              <p className="text-gray-500 text-sm">Đang tải...</p>
            ) : (
              <>
                <Controller
                  name="members"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      options={options}
                      closeMenuOnSelect={false}
                      styles={customStyles}
                      placeholder="Chọn thành viên..."
                      menuPortalTarget={document.body}
                    />
                  )}
                />
                <p className="text-xs text-red-600 min-h-[1.25rem]">
                  {errors.members?.message || ""}
                </p>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createGroupMutation.isLoading}
              className="px-3 py-1 text-sm bg-deepBlue text-white rounded hover:bg-blue-900"
            >
              {createGroupMutation.isLoading ? "Đang tạo..." : "Tạo nhóm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
