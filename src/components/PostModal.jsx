import { AiOutlineClose } from "react-icons/ai";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const allFakeComments = Array.from({ length: 60 }).map((_, i) => ({
  id: i + 1,
  user: `Do Duc Ninh`,
  avatar: `https://i.pravatar.cc/40?img=${i + 1}`,
  content: `Đây là bình luận sốasdsadasdasdasdasdsad ${i + 1} nè 👍`,
  time: `${Math.floor(Math.random() * 59) + 1} phút trước`,
}));

export default function PostModal({ isOpen, onClose, post }) {
  const [visibleComments, setVisibleComments] = useState([]);
  const [count, setCount] = useState(20);
  const [isExpanded, setIsExpanded] = useState(false);
  const CONTENT_MAX_LENGTH = 100;
  const commentsRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setVisibleComments(allFakeComments.slice(0, count));
    }
  }, [isOpen, count]);

  // lắng nghe scroll để load thêm
  const handleScroll = () => {
    if (!commentsRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = commentsRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      // gần chạm đáy
      setCount((prev) => {
        if (prev >= allFakeComments.length) return prev;
        return prev + 10; // load thêm 10 comment
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60"
        >
          {/* Modal box */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg max-w-6xl w-full h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b">
              <p className="font-semibold">Bài viết</p>
              <button onClick={onClose}>
                <AiOutlineClose className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto flex">
              {/* Left: Image */}
              <div className="flex-1 bg-black flex items-center justify-center">
                <img
                  src={post.image}
                  alt=""
                  className="max-h-full max-w-full"
                />
              </div>

              <div className="w-[35%] border-l flex flex-col">
                {/* Post content */}
                <div className="p-3 border-b">
                  <p className="mb-3 leading-snug">
                    {isExpanded || post.text.length <= CONTENT_MAX_LENGTH ? (
                      <>
                        {post.text}{" "}
                        {post.text.length > CONTENT_MAX_LENGTH && (
                          <button
                            onClick={() => setIsExpanded(false)}
                            className="text-deepBlue hover:underline cursor-pointer"
                          >
                            Thu gọn
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {post.text.substring(0, CONTENT_MAX_LENGTH)}...{" "}
                        <button
                          onClick={() => setIsExpanded(true)}
                          className="text-deepBlue hover:underline cursor-pointer"
                        >
                          Xem thêm
                        </button>
                      </>
                    )}
                  </p>
                </div>

                {/* Comments */}
                <div
                  ref={commentsRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto p-3 space-y-3"
                >
                  {visibleComments.map((c) => (
                    <div key={c.id} className="flex gap-2">
                      <img
                        src={c.avatar}
                        className="w-8 h-8 rounded-full"
                        alt=""
                      />
                      <div className="bg-gray-100 rounded-lg p-2">
                        <p className="text-sm">
                          <span className="font-semibold">{c.user}: </span>
                          {c.content}
                        </p>
                        <span className="text-xs text-gray-400">{c.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="border-t p-2 flex gap-2 items-center">
                  <img
                    src="https://i.pravatar.cc/40"
                    className="w-8 h-8 rounded-full"
                    alt=""
                  />
                  <input
                    type="text"
                    placeholder="Viết bình luận..."
                    className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
