import { Outlet } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatBox from "../components/chat/ChatBox";
import { usePostModal } from "../context/PostModalContext";
import PostModal from "../components/PostModal";
import GoToTop from "../components/GotoTop";

const MainLayout = () => {
  const { onClose, isOpen, selectedImageIndex, post } = usePostModal();
  return (
    <>
      <div>
        <Header />
        <div className="mt-20">
          <Outlet />
          <ChatBox />
        </div>
        <Footer />
        {isOpen && (
          <PostModal
            isOpen={isOpen}
            onClose={onClose}
            post={post}
            initialImageIndex={selectedImageIndex}
          />
        )}
        <GoToTop />
      </div>
    </>
  );
};

export default MainLayout;
