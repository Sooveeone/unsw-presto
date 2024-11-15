import React from "react";
import { HiHome, HiEye, HiPencil, HiTrash, HiCommandLine, HiVideoCamera } from "react-icons/hi2";
import { AiFillFileImage } from "react-icons/ai";

function Sidebar({
  onHomeClick,
  onViewClick,
  onTextClick,
  onImageClick,
  onVideoClick,
  onCodeClick,
  onDeleteClick,
}) {
  const icons = [
    { icon: HiHome, onClick: onHomeClick, label: "Home" },
    { icon: HiEye, onClick: onViewClick, label: "View" },
    { icon: HiPencil, onClick: onTextClick, label: "Text" },
    { icon: AiFillFileImage, onClick: onImageClick, label: "Image" },
    { icon: HiVideoCamera, onClick: onVideoClick, label: "Video" },
    { icon: HiCommandLine, onClick: onCodeClick, label: "Code" },
    { icon: HiTrash, onClick: onDeleteClick, label: "Delete" },
  ];

  return (
    <div className="flex flex-col w-1/8 bg-black justify-between p-4">
      {icons.map(({ icon: Icon, onClick, label }, index) => (
        <div key={index} className="flex flex-col text-white font-extralight">
          <Icon
            onClick={onClick}
            className="text-platinumLight w-11 h-11 cursor-pointer hover:scale-125 transition-transform duration-200"
          />
          <span className="ml-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default Sidebar