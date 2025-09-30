import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import { MdRefresh, MdDelete } from "react-icons/md";
import axiosConfig from "../axios/config";
import ConfirmModal from "../components/ConfirmModal";
import useDebounce from "../hooks/useDebounce";
import { AuthContext } from "../context/AuthContext";

const statusOptions = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xử lý" },
  { value: "IN_PROGRESS", label: "Đang xử lý" },
  { value: "DONE", label: "Hoàn thành" },
  { value: "REJECTED", label: "Từ chối" },
];

export default function ConsultationRequestsTable() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filterEmail, setFilterEmail] = useState("");
  const [filterMajor, setFilterMajor] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(filterEmail, 500);

  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    request: null,
    nextStatus: null,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "consultationRequests",
      page,
      debouncedSearch,
      filterMajor,
      sortOrder,
      statusFilter,
    ],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/consultation-requests", {
        params: {
          page,
          limit,
          search: debouncedSearch || "",
          majorId: user.majorId,
          sort: sortOrder,
          status: statusFilter,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      axiosConfig.patch(`/api/consultation-requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultationRequests"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosConfig.delete(`/api/consultation-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["consultationRequests"] });
      closeModal();
    },
  });

  const closeModal = () =>
    setModalState({
      isOpen: false,
      type: null,
      request: null,
      nextStatus: null,
    });

  const handleConfirm = () => {
    if (!modalState.request) return;

    if (modalState.type === "status" && modalState.nextStatus) {
      updateStatusMutation.mutate({
        id: modalState.request.id,
        status: modalState.nextStatus,
      });
    }

    if (modalState.type === "delete") {
      deleteMutation.mutate(modalState.request.id);
    }
  };

  if (isLoading) return <div className="p-4">Đang tải...</div>;
  if (isError)
    return <div className="p-4 text-red-500">Lỗi khi tải dữ liệu</div>;

  const { requests, currentPage, totalPage } = data;

  const statusLabels = {
    PENDING: "Chờ xử lý",
    IN_PROGRESS: "Đang xử lý",
    DONE: "Hoàn thành",
    REJECTED: "Từ chối",
  };

  const statusColors = {
    PENDING: "bg-yellow-200 text-yellow-800",
    IN_PROGRESS: "bg-blue-200 text-blue-800",
    DONE: "bg-green-200 text-green-800",
    REJECTED: "bg-red-200 text-red-800",
  };

  const modalContent =
    modalState.type === "status" && modalState.nextStatus
      ? {
          variant: "notice",
          title: "Thay đổi trạng thái?",
          message: (
            <span>
              Bạn có chắc chắn muốn đổi trạng thái của yêu cầu{" "}
              <strong>{modalState.request?.fullName}</strong> thành{" "}
              <strong>{statusLabels[modalState.nextStatus]}</strong>?
            </span>
          ),
          confirmText: "Xác nhận",
        }
      : modalState.type === "delete"
      ? {
          variant: "warning",
          title: "Xoá yêu cầu?",
          message: (
            <span>
              Bạn có chắc chắn muốn xoá yêu cầu tư vấn của{" "}
              <strong>{modalState.request?.fullName}</strong> không?
            </span>
          ),
          confirmText: "Xoá",
        }
      : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-[#344054] ">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h1 className="text-xl font-semibold">Quản lý yêu cầu tư vấn</h1>
        <button
          onClick={() => {
            setPage(1);
            refetch();
            setFilterEmail("");
            setFilterMajor("");
            setStatusFilter("");
            setSortOrder("desc");
          }}
          className="flex items-center gap-2 px-3 py-2 bg-[#083970] hover:bg-opacity-90 text-white rounded"
        >
          <MdRefresh className="fill-white" /> Làm mới
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Lọc theo email..."
          value={filterEmail}
          onChange={(e) => {
            setPage(1);
            setFilterEmail(e.target.value);
          }}
          className="px-3 py-2 border rounded w-full flex-1 "
        />

        <select
          value={sortOrder}
          onChange={(e) => {
            setPage(1);
            setSortOrder(e.target.value);
          }}
          className="px-3 py-2 border rounded w-full flex-1"
        >
          <option value="desc">Mới nhất</option>
          <option value="asc">Cũ nhất</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="px-3 py-2 border rounded text-sm flex-1"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left font-semibold min-w-[120px]">
                Tên
              </th>
              <th className="px-3 py-2 text-left font-semibold">Email</th>
              <th className="px-3 py-2 text-left font-semibold">
                Số điện thoại
              </th>
              <th className="px-3 py-2 text-left font-semibold min-w-[200px]">
                Ngành
              </th>
              <th className="px-3 py-2 text-center font-semibold min-w-[100px]">
                Trạng thái
              </th>
              <th className="px-3 py-2 text-center font-semibold min-w-[200px]">
                Ngày tạo
              </th>
              <th className="px-3 py-2 text-center font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-t border-gray-200">
                <td className="px-3 py-2">{r.fullName}</td>
                <td className="px-3 py-2">{r.email}</td>
                <td className="px-3 py-2">{r.phoneNumber}</td>
                <td className="px-3 py-2">{r.major?.name || "-"}</td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      statusColors[r.status]
                    }`}
                  >
                    {statusLabels[r.status]}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  {new Date(r.createdAt).toLocaleString("vi-VN")}
                </td>
                <td className="px-3 py-2 text-center flex items-center justify-center gap-2">
                  <select
                    value=""
                    onChange={(e) =>
                      setModalState({
                        isOpen: true,
                        type: "status",
                        request: r,
                        nextStatus: e.target.value,
                      })
                    }
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value="">Đổi trạng thái...</option>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() =>
                      setModalState({
                        isOpen: true,
                        type: "delete",
                        request: r,
                        nextStatus: null,
                      })
                    }
                    className="p-2 bg-crimsonRed hover:bg-red-700  rounded"
                  >
                    <MdDelete className="fill-white" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 ? (
        <div className="p-4 text-center">Không có yêu cầu nào.</div>
      ) : (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            Trang {currentPage}/{totalPage}
          </span>
          <button
            onClick={() => setPage((p) => (p < totalPage ? p + 1 : p))}
            disabled={currentPage === totalPage}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {modalContent && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onConfirm={handleConfirm}
          variant={modalContent.variant}
          title={modalContent.title}
          message={modalContent.message}
          confirmText={modalContent.confirmText}
          cancelText="Hủy"
          isConfirming={
            updateStatusMutation.isPending || deleteMutation.isPending
          }
        />
      )}
    </div>
  );
}
