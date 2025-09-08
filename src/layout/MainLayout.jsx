import { Outlet } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatBox from "../components/chat/ChatBox";

const MainLayout = () => {
  return (
    <div>
      <Header />
      <div className="mt-20">
        <Outlet />
        <ChatBox />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
