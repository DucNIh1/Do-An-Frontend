import axiosConfig from "../axios/config";

export const uploadImagesAPI = async (imageFiles, extraData = {}) => {
  const formData = new FormData();
  console.log(extraData);
  imageFiles.forEach((file) => {
    formData.append("images", file);
  });

  if (!extraData.folder) {
    formData.append("folder", "others");
  }

  Object.entries(extraData).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  console.log(formData);
  const res = await axiosConfig.post(`api/images/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const createPostAPI = async (postData) => {
  const res = await axiosConfig.post(`api/posts`, postData);
  return res.data;
};

export const deletePostAPI = async (id) => {
  const res = await axiosConfig.delete(`api/posts/${id}`);
  return res.data;
};
export const deleteImagesAPI = async (imageIds) => {
  const res = await axiosConfig.delete(`api/images/delete`, {
    data: { ids: imageIds },
  });
  return res.data;
};

export const getPostsAPI = async (filters = {}) => {
  const res = await axiosConfig.get("api/posts", { params: filters });
  return res.data;
};

export const getPostAPI = async (id) => {
  const res = await axiosConfig.get(`api/posts/${id}`);
  return res.data;
};
