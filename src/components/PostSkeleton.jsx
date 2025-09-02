import React from "react";

const PostSkeleton = () => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="mt-4 h-8 bg-gray-200 rounded-full w-1/4"></div>
    </div>
  );
};

export default PostSkeleton;
