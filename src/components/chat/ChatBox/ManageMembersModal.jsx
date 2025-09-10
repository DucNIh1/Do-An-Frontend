import { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import axiosConfig from "../../../axios/config";
import { AuthContext } from "../../../context/AuthContext";
import { IoClose } from "react-icons/io5";
import UserAvatar from "../../CommonAvatar";

export default function ManageMembersModal({ conversation, onClose }) {
  const { user: currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");

  const {
    data: membersData,
    isLoading: isLoadingMembers,
    isFetching: isFetchingMembers,
  } = useQuery({
    queryKey: ["conversationMembers", conversation.id, page, limit, search],
    queryFn: async () => {
      const res = await axiosConfig.get(
        `/api/conversations/${conversation.id}/members?page=${page}&limit=${limit}&search=${search}`
      );
      return res.data;
    },
    keepPreviousData: true,
  });

  const members = membersData?.results || [];
  const totalPages = membersData?.totalPages || 1;

  const { data: allUsers = [], isLoading: isLoadingAllUsers } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/users");
      return res.data.results;
    },
  });

  const addMembersMutation = useMutation({
    mutationFn: (userIds) =>
      axiosConfig.post(`/api/conversations/${conversation.id}/members`, {
        userIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversationMembers", conversation.id],
      });
      setSelectedUsers([]);
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId) =>
      axiosConfig.delete(
        `/api/conversations/${conversation.id}/members/${userId}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["conversationMembers", conversation.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", conversation.id],
      });
    },
  });

  const memberIds = new Set(members.map((m) => m.id));
  const userOptions = allUsers
    .filter((u) => !memberIds.has(u.id))
    .map((u) => ({ value: u.id, label: u.name }));

  const handleAddMembers = () => {
    if (selectedUsers.length === 0) return;
    const userIdsToAdd = selectedUsers.map((u) => u.value);
    addMembersMutation.mutate(userIdsToAdd);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[4000]">
      <div className="bg-white w-[400px] rounded-lg shadow-lg p-4 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Thành viên nhóm</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            ✕
          </button>
        </div>

        {currentUser.role !== "STUDENT" && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Thêm thành viên</p>
            <div className="flex gap-2">
              <Select
                isMulti
                options={userOptions}
                isLoading={isLoadingAllUsers}
                onChange={setSelectedUsers}
                value={selectedUsers}
                placeholder="Tìm kiếm thành viên..."
                className="flex-1"
                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                menuPortalTarget={document.body}
              />
              <button
                onClick={handleAddMembers}
                disabled={
                  addMembersMutation.isPending || selectedUsers.length === 0
                }
                className="px-3 py-1 text-sm bg-deepBlue text-white rounded hover:bg-opacity-90 disabled:opacity-50"
              >
                {addMembersMutation.isPending ? "Đang thêm..." : "Thêm"}
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">
              Tất cả thành viên ({membersData?.total || 0})
            </p>
            {isFetchingMembers && <span className="text-xs">Đang tải...</span>}
          </div>

          <div className="mb-3">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm kiếm thành viên..."
              className="w-full border p-2 rounded text-sm outline-none focus:border-deepBlue"
            />
          </div>
          {isLoadingMembers ? (
            <p>Đang tải...</p>
          ) : (
            <ul className="space-y-2">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between p-1 rounded hover:bg-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      src={member.avatar}
                      name={member.name}
                      size="w-8 h-8"
                    />
                    <span className="text-sm">{member.name}</span>
                  </div>
                  {currentUser.id !== member.id &&
                    currentUser.role !== "STUDENT" && (
                      <button
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        disabled={removeMemberMutation.isPending}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <IoClose />
                      </button>
                    )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-between items-center mt-3 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span>
            Trang {page}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-2 py-1 bg-gray-100 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
