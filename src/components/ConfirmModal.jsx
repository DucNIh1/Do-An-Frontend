import React from "react";
import { AnimatePresence, motion } from "framer-motion";

import { IoWarningOutline, IoInformationCircleOutline } from "react-icons/io5";
import { AiOutlineClose } from "react-icons/ai";

const variants = {
  warning: {
    Icon: IoWarningOutline,
    iconColor: "text-red-500",
    confirmButtonColor: "bg-red-600 hover:bg-opacity-90",
    title: "Cảnh báo",
  },
  notice: {
    Icon: IoInformationCircleOutline,
    iconColor: "text-blue-500",
    confirmButtonColor: "bg-deepBlue hover:bg-opacity-90",
    title: "Thông báo",
  },
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  variant = "notice",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  isConfirming = false,
}) => {
  const currentVariant = variants[variant] || variants.notice;
  const { Icon, iconColor, confirmButtonColor } = currentVariant;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Đóng modal"
            >
              <AiOutlineClose size={20} />
            </button>

            <div className="p-6 text-center">
              <div className="mb-4">
                <Icon className={`w-16 h-16 mx-auto ${iconColor}`} />
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {title || currentVariant.title}
              </h3>

              <p className="text-gray-600 mb-6 text-sm">{message}</p>

              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isConfirming}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center min-w-[120px] ${confirmButtonColor} ${
                    isConfirming ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isConfirming ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
