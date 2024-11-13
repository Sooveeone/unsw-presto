import { HiHome, HiTrash } from "react-icons/hi2";

const Sidebar = ({ handleBackAndSave, setShowDeleteModal }) => (
  <div className="flex flex-col w-1/8 bg-black justify-between">
    <HiHome
      onClick={handleBackAndSave}
      className="text-platinumLight w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200"
    />
    <HiTrash
      onClick={() => setShowDeleteModal(true)}
      className="text-primaryBlue w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200"
    />
  </div>
);

export default Sidebar;
