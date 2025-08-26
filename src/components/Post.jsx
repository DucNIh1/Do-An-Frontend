import { useState } from "react";
import { PiDotsThreeThin } from "react-icons/pi";
import { FaRegThumbsUp } from "react-icons/fa6";
import { FaRegCommentAlt } from "react-icons/fa";
import { PiShareFatLight } from "react-icons/pi";
import PostModal from "./PostModal";

const Post = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const CONTENT_MAX_LENGTH = 100;

  const post = {
    author: {
      name: "Do Duc Ninh",
      avatar:
        "https://scontent.fhan19-1.fna.fbcdn.net/v/t39.30808-1/469059350_4218318481822099_6869786595398537110_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_ohc=ZLdlkTSHgBsQ7kNvwEJNVXl&_nc_oc=AdkGp1RH-1HS653f7qfqJdaALT1VfIiR5jfW33hFg8zjfaY4J_AnOVbVL4tDT3zlgYu4IDmPFYjMfhEBfx4xCC5q&_nc_zt=24&_nc_ht=scontent.fhan19-1.fna&_nc_gid=aDDJgoPqjStF7PIHb9Oj5Q&oh=00_AfXKfHRP13Q03Fz0CuPN66I1g3kbMu6AmXWF2Y99WaKzCg&oe=68B3BE67",
    },
    createdAt: "12/02/2025",
    text: `Lorem ipsum, dolor sit amet consectetur adipisicing elit. Minus
    incidunt perspiciatis assumenda, recusandae quos officia pariatur
    laboriosam voluptate. Odio eos libero magni aperiam placeat aliquid
    architecto, sint magnam illo ut ipsa officia debitis a harum
    consectetur odit maxime recusandae natus nulla rem veritatis? Ipsam
    exercitationem odit vitae consequatur iste voluptate, molestias
    suscipit tempora.`,
    image: "/image_explore/a1.png",
    likes: 100,
    comments: 6,
  };

  return (
    <div className="flex flex-col text-sm rounded-lg bg-white">
      {/* Head */}
      <div className="flex justify-between px-2 py-4">
        <div className="flex gap-4">
          <img
            src={post.author.avatar}
            alt="Ảnh người đăng bài"
            className="h-10 w-10 rounded-full"
          />
          <div className="flex flex-col">
            <p className="font-medium">{post.author.name}</p>
            <p className="text-xs text-gray-500">{post.createdAt}</p>
          </div>
        </div>
        <PiDotsThreeThin />
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="mb-3 leading-snug">
          {isExpanded || post.text.length <= CONTENT_MAX_LENGTH ? (
            <>
              {post.text}{" "}
              {post.text.length > CONTENT_MAX_LENGTH && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-deepBlue hover:underline cursor-pointer"
                >
                  Thu gọn
                </button>
              )}
            </>
          ) : (
            <>
              {post.text.substring(0, CONTENT_MAX_LENGTH)}...{" "}
              <button
                onClick={() => setIsExpanded(true)}
                className="text-deepBlue hover:underline cursor-pointer"
              >
                Xem thêm
              </button>
            </>
          )}
        </p>

        <img
          src={post.image}
          alt=""
          className="w-full object-cover h-full max-h-[700px] mt-3 rounded-lg"
        />
      </div>

      {/* Foot */}
      <div className="flex justify-between px-5">
        <span className="px-3">{post.likes} likes</span>
        <span className="px-3">{post.comments} bình luận</span>
      </div>
      <div className="h-[1px] bg-gray-200 w-[calc(100%-20px)] mx-auto"></div>
      <div className="px-5 py-2 flex justify-between text-gray-600 text-sm">
        <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1 rounded-md">
          <FaRegThumbsUp /> Thích
        </button>
        <button
          className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1 rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          <FaRegCommentAlt /> Bình luận
        </button>
        <button className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1 rounded-md">
          <PiShareFatLight /> Chia sẻ
        </button>
      </div>

      {/* Comment input */}
      <div className="flex items-center gap-2 px-5 py-3">
        <img src={post.author.avatar} alt="" className="h-8 w-8 rounded-full" />
        <input
          type="text"
          placeholder="Viết bình luận..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
        />
      </div>

      {/* Modal */}
      <PostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        post={post}
      />
    </div>
  );
};

export default Post;
