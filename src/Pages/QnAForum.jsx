import { useState, useEffect, useContext } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import Select from "react-select";
import { IoSearchSharp } from "react-icons/io5";

import { AuthContext } from "../context/AuthContext";
import useDebounce from "../hooks/useDebounce";
import CreatePostModal from "../components/CreatePostModal";
import Post from "../components/Post";
import PostSkeleton from "../components/PostSkeleton";
import { getPostsAPI } from "../services/postService";
import StoryList from "../components/StoryList";

const QnAForum = () => {
  const { user } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMajor, setSelectedMajor] = useState(null);

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

  const majorOptions =
    majorsData?.map((m) => ({ value: m.id, label: m.name })) || [];

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const allPosts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen py-5 md:py-10 px-4 sm:px-8 md:px-12 lg:px-20 bg-gray-50 gap-8">
      <section className="w-full lg:w-3/5">
        {user && (
          <div className="sticky top-[70px] z-10 bg-gray-50 pt-2 pb-5">
            <StoryList />
            <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 md:p-5 rounded-xl shadow-sm gap-4">
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 pr-10 w-full border focus:border-deepBlue border-gray-300 rounded-lg outline-none transition-colors"
                  />
                  <IoSearchSharp className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400 text-xl" />
                </div>
                <Select
                  options={majorOptions}
                  isClearable
                  placeholder="Chọn chuyên ngành"
                  value={selectedMajor}
                  onChange={setSelectedMajor}
                  className="w-full sm:w-56 text-sm rounded-lg"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: "8px",
                      height: "100%",
                      boxShadow: "none",
                      borderColor: state.isFocused
                        ? "#083970"
                        : base.borderColor,
                      "&:hover": {
                        borderColor: state.isFocused
                          ? "#083970"
                          : base.borderColor,
                      },
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: "8px",
                    }),
                  }}
                />
              </div>
              <div className="w-full md:w-auto flex-shrink-0">
                <CreatePostModal />
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-5 mt-5">
          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : error ? (
            <p className="text-center text-red-500">
              Đã có lỗi xảy ra khi tải bài viết.
            </p>
          ) : allPosts.length > 0 ? (
            allPosts.map((post) => <Post key={post.id} post={post} />)
          ) : (
            <p className="text-center text-gray-500 mt-10">
              Không tìm thấy bài viết nào.
            </p>
          )}

          <div ref={ref} className="h-1"></div>

          {isFetchingNextPage && (
            <div className="text-center py-4 text-gray-600">
              Đang tải thêm...
            </div>
          )}

          {!hasNextPage && !isLoading && allPosts.length > 0 && (
            <div className="text-center py-4 text-gray-500">
              Đã xem hết tất cả bài viết.
            </div>
          )}
        </div>
      </section>

      <aside className="hidden lg:block w-2/5 h-screen sticky top-[80px]">
        <div className="bg-white p-5 rounded-xl shadow-sm">
          <h3 className="font-bold text-lg">Chuyên ngành nổi bật</h3>
        </div>
      </aside>
    </div>
  );
};

export default QnAForum;
