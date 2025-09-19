import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import AdvisorDetailModal from "./AdvisorDetailModal";
import axiosConfig from "../axios/config";
import UserAvatar from "./CommonAvatar";
import Select from "react-select";
import customStyles from "../utils/inputSelectStyles";

const fetchAdvisors = async (majorId) => {
  const { data } = await axiosConfig.get("/api/users/advisors-with-ratings", {
    params: { majorId: majorId || "" },
  });
  return data.data;
};

export default function AdvisorList() {
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMajor, setSelectedMajor] = useState(null);

  const { data: majors } = useQuery({
    queryKey: ["majors"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/majors", {
        params: { limit: 1000 },
      });
      return res.data.majors;
    },
  });

  const majorOptions =
    majors?.map((m) => ({ value: m.id, label: m.name })) || [];

  const {
    data: advisors,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["advisors", selectedMajor?.value],
    queryFn: () => fetchAdvisors(selectedMajor?.value),
  });

  const getItemsPerPage = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024 ? 3 : 1;
    }
    return 3;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
      setCurrentIndex(0);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const totalPages = Math.ceil(advisors?.length / itemsPerPage || 1);
  const currentAdvisors = advisors?.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
  };

  const canShowNavigation = totalPages > 1;

  if (isLoading) {
    return (
      <div className="text-center py-8">Đang tải danh sách tư vấn viên...</div>
    );
  }
  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Không thể tải dữ liệu.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex justify-end mb-4 w-full">
        <Select
          options={majorOptions}
          isClearable
          placeholder="Chọn ngành..."
          value={selectedMajor}
          onChange={(option) => {
            setCurrentIndex(0);
            setSelectedMajor(option);
          }}
          className="text-sm w-full"
          styles={customStyles}
        />
      </div>

      {canShowNavigation && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
            aria-label="Previous advisors"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-600" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
            aria-label="Next advisors"
          >
            <FaChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {currentAdvisors?.map((advisor) => (
          <div
            key={advisor.id}
            className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors duration-300 border border-gray-100"
            onClick={() => setSelectedAdvisor(advisor)}
          >
            <div className="p-4 flex flex-col items-center text-center">
              <UserAvatar
                src={advisor.avatar}
                name={advisor.name}
                userId={advisor.id}
                size="w-16 h-16 border-2 border-indigo-400 mb-3"
              />

              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {advisor.name}
              </h3>

              <p className="text-sm text-gray-500 mb-3">
                {advisor?.major?.name}
              </p>

              <div className="flex items-center">
                <FaStar className="w-4 h-4 mr-1 text-yellow-500" />
                <span className="font-bold text-base">
                  {advisor.averageScore.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400 ml-1">
                  ({advisor.ratings.length})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {canShowNavigation && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex
                  ? "bg-indigo-500"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {selectedAdvisor && (
        <AdvisorDetailModal
          advisor={selectedAdvisor}
          onClose={() => setSelectedAdvisor(null)}
        />
      )}
    </div>
  );
}
