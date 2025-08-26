import axiosConfig from "../axios/config";

export const verifyEmailRequest = async ({ userId, code }) => {
  const res = await axiosConfig.post(
    `/api/auth/verify-email?userId=${userId}`,
    {
      code,
    }
  );
  return res.data;
};
