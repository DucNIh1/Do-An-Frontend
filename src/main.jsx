import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./i18n";
import MainLayout from "./layout/MainLayout";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import Register from "./Pages/Register";
import QnAForum from "./Pages/QnAForum";
import AuthContexProvider from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";
import { PostModalProvider } from "./context/PostModalContext";
import News from "./Pages/News";
import PostDetail from "./components/Post/PostDetail";
import ConsultationRequestsTable from "./Pages/ListConsultationRequest";

const queryClient = new QueryClient();
const clientId = import.meta.env.VITE_GG_CLIENT_ID;
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Register />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/tu-van-hoi-dap",
        element: <QnAForum />,
      },
      {
        path: "/tin-tuc",
        element: <News />,
      },
      {
        path: "/tin-tuc/:id",
        element: <PostDetail />,
      },
      {
        path: "/danh-sach-tu-van",
        element: <ConsultationRequestsTable />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer
      position="top-right"
      autoClose={2000}
      newestOnTop={false}
      closeOnClick
      theme="light"
    />
    <QueryClientProvider client={queryClient}>
      <AuthContexProvider>
        <PostModalProvider>
          <GoogleOAuthProvider clientId={clientId}>
            <SocketProvider>
              <ChatProvider>
                <RouterProvider router={router} />
              </ChatProvider>
            </SocketProvider>
          </GoogleOAuthProvider>
        </PostModalProvider>
      </AuthContexProvider>
    </QueryClientProvider>
  </StrictMode>
);
