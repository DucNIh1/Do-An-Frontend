import { useState } from "react";
import {
  offset,
  shift,
  useFloating,
  useHover,
  useInteractions,
} from "@floating-ui/react";
import UserPopup from "./UserPopup";
import { useQuery } from "@tanstack/react-query";
import axiosConfig from "../axios/config";

const fetchUserById = async (userId) => {
  const res = await axiosConfig.get(`/api/users/${userId}`);
  return res.data.data;
};

const UserAvatar = ({ src = "", alt = "", size = "w-8 h-8", name, userId }) => {
  console.log(userId);
  const [imgError, setImgError] = useState(false);
  const [open, setOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [
      offset(10),
      shift({
        padding: 10,
      }),
    ],
  });

  const hover = useHover(context, { delay: 200 });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  const renderAvatarContent = () => {
    if (imgError || !src) {
      return (
        <div
          className={`${size} bg-deepBlue rounded-full flex items-center justify-center text-white text-sm font-medium`}
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

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        className="inline-block relative"
      >
        {renderAvatarContent()}
      </div>
      {open && user && (
        <UserPopup
          user={user}
          refs={refs}
          floatingStyles={floatingStyles}
          getFloatingProps={getFloatingProps}
        />
      )}
    </>
  );
};

export default UserAvatar;
