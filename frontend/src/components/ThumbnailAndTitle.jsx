// ThumbnailAndTitle.jsx
import React from 'react';
import { HiArrowUpOnSquare } from "react-icons/hi2";
import { AiFillEdit } from "react-icons/ai";

const ThumbnailAndTitle = ({ presentation, setShowEditThumbnailModal, setShowEditTitleModal }) => (
  <div className="flex flex-row items-center space-x-6">
    {/* Thumbnail */}
    <div className="relative w-20 h-20 bg-gray-300 rounded flex items-center justify-center cursor-pointer">
      {presentation.thumbnail ? (
        <img
          src={presentation.thumbnail}
          alt="Thumbnail"
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <span
          className="text-gray-500"
          onClick={() => setShowEditThumbnailModal(true)}
        >
          + Update Thumbnail
        </span>
      )}
      {/* 编辑 Thumbnail 的 Icon */}
      <HiArrowUpOnSquare
        onClick={() => setShowEditThumbnailModal(true)}
        className="absolute bottom-1 right-1 text-primaryBlue w-5 h-5 cursor-pointer hover:scale-110 transition-transform duration-200"
      />
    </div>
    {/* Title 区域 */}
    <div className="flex items-center justify-center space-x-2">
      <h2 className="text-2xl font-bold flex items-center justify-center">{presentation.name}</h2>
      <AiFillEdit
        onClick={() => setShowEditTitleModal(true)}
        className="text-primaryBlue w-6 h-6 cursor-pointer hover:scale-110 transition-transform duration-200"
      />
    </div>
  </div>
);

export default ThumbnailAndTitle;