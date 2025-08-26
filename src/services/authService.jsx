import axiosConfig from "../axios/config";

export const login = async ({ email, password }) => {
  const res = await axiosConfig.post("/api/auth/login", { email, password });
  return res.data;
};

export const logout = async () => {
  const res = await axiosConfig.post("/api/auth/logout");
  return res.data;
};

export const register = async (data) => {
  const res = await axiosConfig.post("/api/auth/signup", data);
  return res.data;
};

export const loginWithGoogle = async (credentialResponse) => {
  try {
    const res = await axiosConfig.post(`/api/auth/google-auth`, {
      token: credentialResponse.credential,
    });
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
