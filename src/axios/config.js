import axios from "axios";

const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL,
  withCredentials: true,
});

axiosConfig.interceptors.request.use(
  function (config) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosConfig.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config; // Thông tin về request ban đầu

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Attempting to refresh token...");

      axiosConfig
        .post("/api/auth/refresh-token")
        .then((res) => {
          console.log(res.data);
          return axiosConfig(originalRequest); // Gửi lại request ban đầu
        })
        .catch(async (err) => {
          if (err.status === 401 || err.status === 403) {
            {
              localStorage.removeItem("user");
              await axiosConfig.post("/api/auth/logout");
              window.location.href = "/login";
            }
          }
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  }
);

export default axiosConfig;
