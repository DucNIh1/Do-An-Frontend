import { IoSearchSharp } from "react-icons/io5";
import Post from "../components/Post";
const QnAForum = () => {
  return (
    <div className="flex w-full py-10 px-20 bg-gray-50">
      <section className="w-3/5">
        <div className="flex justify-between bg-white p-5 mb-5 rounded-xl shadow-sm">
          <div className="relative w-full max-w-[400px]">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              className="px-4 py-2 pr-10 w-full border focus:border-deepBlue border-gray-300 rounded-lg outline-none"
            />
            <IoSearchSharp className="absolute top-1/2 right-4 transform -translate-y-1/2 text-deepBlue text-xl" />
          </div>
          <button className="bg-deepBlue w-full max-w-[200px] rounded-lg  text-white">
            Đăng bài
          </button>
        </div>
        <div className="bg-white p-5 flex rounded-xl shadow-sm mb-5">
          <StoryList />
        </div>
        <div className="flex flex-col gap-5">
          <Post />
          <Post />
          <Post />
          <Post />
        </div>
      </section>
      <section className="w-2/5 h-screen"></section>
    </div>
  );
};

import { FaChevronRight } from "react-icons/fa";
import { useState, useEffect, useRef, useMemo } from "react";

const stories = [
  {
    username: "x_ae-23b",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    username: "maisenpai",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    username: "saylortswift",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    username: "johndoe",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
  },
  {
    username: "maryjane2",
    avatar: "https://randomuser.me/api/portraits/women/76.jpg",
  },
  {
    username: "obama",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
  },
  {
    username: "elonmusk",
    avatar: "https://randomuser.me/api/portraits/men/99.jpg",
  },
  {
    username: "arianagrande",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    username: "billgates",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    username: "kimkardashian",
    avatar: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    username: "jackma",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
  },
];

const StoryList = () => {
  const containerRef = useRef(null);
  const [maxVisible, setMaxVisible] = useState(7);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const updateMaxVisible = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const width = rect.width;

        const storyWidth = 70 + 16;
        const padding = 32;
        const availableWidth = width - padding;
        const newMaxVisible = Math.max(
          1,
          Math.floor(availableWidth / storyWidth)
        );

        setContainerWidth(width);
        setMaxVisible(newMaxVisible);
      }
    };

    const timeoutId = setTimeout(updateMaxVisible, 100);

    const resizeObserver = new ResizeObserver(() => {
      updateMaxVisible();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateMaxVisible);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMaxVisible);
    };
  }, []);

  const { displayedStories, extraCount, totalPages, hasNext, hasPrev } =
    useMemo(() => {
      const itemsPerPage = maxVisible - 1;
      const totalPages = Math.ceil(stories.length / itemsPerPage);
      const startIndex = currentPage * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, stories.length);

      const currentPageStories = stories.slice(startIndex, endIndex);
      const remainingStories = stories.length - endIndex;

      const showMoreButton = remainingStories > 0;
      const displayedStories = showMoreButton
        ? currentPageStories.slice(0, -1)
        : currentPageStories;

      const extraCount = showMoreButton ? remainingStories + 1 : 0;

      return {
        displayedStories,
        extraCount,
        totalPages,
        hasNext: currentPage < totalPages - 1,
        hasPrev: currentPage > 0,
      };
    }, [maxVisible, currentPage]);

  const handleScroll = (direction) => {
    if (direction === "right" && hasNext) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "left" && hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full flex overflow-x-auto gap-4 px-4 py-2 scrollbar-hide"
        style={{ width: "100%" }}
      >
        {displayedStories.map((story, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center min-w-[70px] cursor-pointer flex-shrink-0 hover:scale-110 transition-transform duration-200"
          >
            <div className="rounded-full p-[2px]">
              <img
                src={story.avatar}
                alt={story.username}
                className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
              />
            </div>
            <p className="text-sm mt-1 text-center truncate w-16">
              {story.username}
            </p>
          </div>
        ))}

        {extraCount > 0 && (
          <div className="flex flex-col items-center justify-center min-w-[70px] w-16 h-16 rounded-full bg-gray-200 cursor-pointer hover:scale-110 transition-transform duration-200 flex-shrink-0">
            <p className="text-sm font-semibold">+{extraCount}</p>
          </div>
        )}
      </div>

      {hasPrev && (
        <button
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow p-2 hover:scale-110 hover:bg-gray-50 transition-all duration-200 z-10"
          onClick={() => handleScroll("left")}
        >
          <FaChevronRight className="w-4 h-4 text-gray-600 rotate-180" />
        </button>
      )}

      {hasNext && (
        <button
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow p-2 hover:scale-110 hover:bg-gray-50 transition-all duration-200 z-10"
          onClick={() => handleScroll("right")}
        >
          <FaChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default QnAForum;
