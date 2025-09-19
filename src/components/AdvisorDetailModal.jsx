import Modal from "react-modal";
import { FaStar, FaEnvelope, FaTag } from "react-icons/fa";
import { IoCloseCircle } from "react-icons/io5";
import UserAvatar from "./CommonAvatar";

Modal.setAppElement("#root");
export default function AdvisorDetailModal({ advisor, onClose }) {
  if (!advisor) return null;
  return (
    <Modal
      isOpen={!!advisor}
      onRequestClose={onClose}
      className="modal-content-advisor fixed top-[10%] left-1/2 -translate-x-1/2 shadow-sm"
      overlayClassName="modal-overlay-advisor"
    >
      <div className="bg-white rounded-lg shadow-2xl p-6 relative w-full max-w-2xl mx-auto my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
        >
          <IoCloseCircle className="h-6 w-6" />
        </button>

        <div className="flex flex-col items-center border-b pb-4 mb-4">
          <UserAvatar
            src={advisor.avatar}
            name={advisor.name}
            userId={advisor.id}
            size="w-24 h-24 border-4 border-indigo-500 mb-2"
          />

          <h2 className="text-2xl font-bold text-gray-900">{advisor.name}</h2>
          <div className="flex items-center  mt-1">
            <FaStar className="h-5 w-5 mr-1 fill-yellow-500" />
            <span className="font-semibold text-lg">
              {advisor?.averageScore.toFixed(1)}
            </span>
            <span className="text-gray-500 ml-2">
              ({advisor?.ratings?.length} đánh giá)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
          <div className="flex items-center gap-2">
            <FaEnvelope className="h-5 w-5 text-indigo-500" />
            <span>{advisor.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaTag className="h-5 w-5 text-indigo-500" />
            <span>{advisor?.major?.name}</span>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto pr-4">
          <h3 className="text-xl font-semibold mb-3 border-b pb-2">
            Các đánh giá
          </h3>
          {advisor.ratings.length > 0 ? (
            <div className="space-y-4">
              {advisor.ratings.map((rating) => (
                <div key={rating.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2 gap-4">
                    <UserAvatar
                      src={rating.rater?.avatar}
                      name={rating.rater?.name}
                      userId={rating?.rater?.id}
                      size="w-24 h-24 border-4 border-indigo-500 mb-2"
                    />
                    <div>
                      <p className="font-medium text-sm text-gray-800">
                        {rating.rater?.name || "Người dùng ẩn danh"}
                      </p>
                      <div className="flex items-center text-yellow-400">
                        {Array.from({ length: 5 }, (_, i) => {
                          const normalizedScore = rating.score / 2;

                          return (
                            <FaStar
                              key={i}
                              className={`h-4 w-4 ${
                                i < normalizedScore
                                  ? "fill-yellow-500"
                                  : "fill-gray-300"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{rating.comment}"</p>
                  <p className="text-xs text-gray-400 mt-2">
                    - Trong bài viết:{" "}
                    <span className="underline">{rating.post?.title}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Chưa có đánh giá nào.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
