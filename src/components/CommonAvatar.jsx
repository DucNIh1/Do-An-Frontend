import { useState } from "react";

const UserAvatar = ({ src = "", alt = "", size = "w-8 h-8", name }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !src) {
    return (
      <div
        className={`${size}  bg-deepBlue rounded-full flex items-center justify-center text-white text-sm font-medium`}
      >
        {name && name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${size} rounded-full object-cover`}
      onError={() => setImgError(true)}
    />
  );
};

export default UserAvatar;
