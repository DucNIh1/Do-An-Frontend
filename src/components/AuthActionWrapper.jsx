import React, { useState, useContext } from "react";
import { useNavigate } from "react-router";

import { AuthContext } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

const AuthActionWrapper = ({ children, onClick, ...restProps }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleActionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (user) {
      if (onClick) {
        onClick(e);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleConfirmLogin = () => {
    setIsModalOpen(false);
    navigate("/login");
  };

  return (
    <>
      <span onClick={handleActionClick} {...restProps}>
        {children}
      </span>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmLogin}
        variant="notice"
        title="Yêu cầu đăng nhập"
        message="Bạn cần đăng nhập để thực hiện hành động này. Chuyển đến trang đăng nhập ngay?"
        confirmText="Đăng nhập"
        cancelText="Để sau"
      />
    </>
  );
};

export default AuthActionWrapper;
