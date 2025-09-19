// PostModalContext.jsx
import { createContext, useContext, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPostAPI } from "../services/postService";

const PostModalContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const usePostModal = () => useContext(PostModalContext);

export const PostModalProvider = ({ children }) => {
  const [postId, setPostId] = useState(null);
  const [postData, setPostData] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data: fetchedPost, isLoading } = useQuery({
    queryKey: ["postModal", postId],
    queryFn: () => getPostAPI(postId),
    enabled: !!postId,
  });

  const openPostModal = (options) => {
    if (options?.post) {
      setPostData(options.post);
      setPostId(null);
    } else if (options?.postId) {
      setPostId(options.postId);
      setPostData(null);
    }
  };

  const closePostModal = () => {
    setPostData(null);
    setPostId(null);
  };

  const currentPost = postData || fetchedPost;
  return (
    <PostModalContext.Provider
      value={{
        openPostModal,
        onClose: closePostModal,
        isOpen: !!currentPost,
        isLoading,
        selectedImageIndex,
        setSelectedImageIndex,
        post: currentPost,
      }}
    >
      {children}
    </PostModalContext.Provider>
  );
};
