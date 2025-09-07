import { createContext, useEffect, useState } from "react";
import axiosConfig from "../axios/config.js";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

const AuthContexProvider = ({ children }) => {
  const getStoredUser = () => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored) return null;

    if (stored.expiry && stored.expiry > Date.now()) {
      return stored.value;
    } else {
      localStorage.removeItem("user");
      return null;
    }
  };

  const [user, setUser] = useState(getStoredUser());
  const [openProfile, setOpenProfile] = useState(false);

  const login = async ({ email, password }) => {
    const res = await axiosConfig.post("/api/auth/login", { email, password });
    if (!res.data.user) return res;
    setUser(res.data?.user);
    return res;
  };

  const logout = async () => {
    const res = await axiosConfig.post("/api/auth/logout");
    setUser(null);
    return res.data?.message;
  };

  const register = async (data) => {
    const res = await axiosConfig.post("/api/auth/signup", data);
    return res.data;
  };

  const loginWithGoogle = async (credentialResponse) => {
    try {
      const res = await axiosConfig.post(`/api/auth/google-auth`, {
        token: credentialResponse.credential,
      });
      setUser(res.data?.user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      const item = {
        value: user,
        expiry: Date.now() + 60 * 60 * 1000,
      };
      localStorage.setItem("user", JSON.stringify(item));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        setUser,
        loginWithGoogle,
        openProfile,
        setOpenProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContexProvider;
