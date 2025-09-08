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
    <AuthContexProvider>
      <SocketProvider>
        <ChatProvider>
          <GoogleOAuthProvider clientId={clientId}>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
            </QueryClientProvider>
          </GoogleOAuthProvider>
        </ChatProvider>
      </SocketProvider>
    </AuthContexProvider>
  </StrictMode>
);
