const DeleteModal = ({ onClose, onDelete }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Are you sure?</h3>
      <p className="mb-4 text-gray-600">Are you sure you want to delete this presentation?</p>
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
        <button onClick={onDelete} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
      </div>
    </div>
  </div>
);
  
export default DeleteModal;
  