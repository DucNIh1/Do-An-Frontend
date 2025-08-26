import { createContext, useEffect, useState } from "react";
import axiosConfig from "../axios/config.js";

export const AuthContext = createContext();

const AuthContexProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [openProfile, setOpenProfile] = useState(false);

  const login = async (data) => {
    const res = await axiosConfig.post("/api/auth/login", data);
    if (!res.data.user) return res;
    setUser(res.data?.user);
    return res;
  };

  const logout = async () => {
    const res = await axiosConfig.post("/api/auth/logout");
    setUser(null);
    return res;
  };

  const register = async (data) => {
    const res = await axiosConfig.post("/api/auth/signup", data);
    return res;
  };

  const handleLoginWithGoogle = async (credentialResponse) => {
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
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        setUser,
        handleLoginWithGoogle,
        openProfile,
        setOpenProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContexProvider;
