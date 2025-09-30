import { useState, useEffect, useContext } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import Select from "react-select";
import { IoSearchSharp } from "react-icons/io5";

import { AuthContext } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import Post from "../components/Post";
import PostSkeleton from "../components/PostSkeleton";
import { getPostsAPI, getTopPostsAPI } from "../services/postService";
import StoryList from "../components/StoryList";
import CreatePostModal from "../components/Post/CreatePostModal";
import PostModal from "../components/PostModal";
import TopPostsSidebar from "../components/Post/TopPostsSidebar";
import AdvisorList from "../components/AdvisorList";
import axiosConfig from "../axios/config";
import customStyles from "../utils/inputSelectStyles";

const QnAForum = () => {
  const { user } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [
      "posts",
      { title: debouncedSearchTerm, majorId: selectedMajor?.value },
    ],
    queryFn: ({ pageParam = 1 }) =>
      getPostsAPI({
        page: pageParam,
        limit: 10,
        isFromSchool: false,
        status: "verified",
        title: debouncedSearchTerm,
        majorId: selectedMajor?.value,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.posts.length ? allPages.length + 1 : undefined;
    },
  });

  const { data: majorsData } = useQuery({
    queryKey: ["majors"],
    queryFn: async () => {
      const res = await axiosConfig.get("/api/majors");
      return res.data.majors;
    },
  });

  const { data: topPosts, isLoading: loadingTopPosts } = useQuery({
    queryKey: ["topPosts"],
    queryFn: () => getTopPostsAPI(5),
  });

  const majorOptions =
    majorsData?.map((m) => ({ value: m.id, label: m.name })) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen py-6 md:py-10 px-4 sm:px-8 md:px-12 lg:px-20 bg-gray-50 gap-8">
      <aside className="w-full lg:w-2/5 lg:sticky lg:top-20 flex flex-col gap-6 h-fit order-first lg:order-last">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Tư vấn viên
          </h2>
          <AdvisorList />
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Câu hỏi nổi bật
          </h2>
          <TopPostsSidebar
            loadingTopPosts={loadingTopPosts}
            topPosts={topPosts}
            setSelectedPost={(post) => setSelectedPost(post)}
          />
        </div>
      </aside>

      <section className="w-full lg:w-3/5">
        {user && (
          <div className="mb-6">
            <StoryList />
            <div className="flex justify-end mt-4">
              <CreatePostModal />
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-1/3">
            <Select
              options={majorOptions}
              isClearable
              placeholder="Chọn chuyên ngành..."
              value={selectedMajor}
              onChange={setSelectedMajor}
              className="text-sm"
              styles={customStyles}
            />
          </div>
          <div className="relative w-full sm:flex-1">
            <IoSearchSharp className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-[44px] border border-gray-300 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-deepBlue transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 mt-6">
          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : error ? (
            <p className="text-center text-red-500 py-6">
              Đã có lỗi xảy ra khi tải bài viết.
            </p>
          ) : allPosts.length > 0 ? (
            allPosts.map((post) => <Post key={post.id} post={post} />)
          ) : (
            <p className="text-center text-gray-500 mt-12">
              Không tìm thấy bài viết nào.
            </p>
          )}

          <div ref={ref} className="h-1"></div>
          {isFetchingNextPage && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Đang tải thêm...
            </div>
          )}
          {!hasNextPage && !isLoading && allPosts.length > 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              Đã xem hết tất cả bài viết.
            </div>
          )}
        </div>
      </section>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          isOpen={true}
        />
      )}
    </div>
  );
};

export default QnAForum;
