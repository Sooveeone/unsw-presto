import React from 'react';

const EditThumbnailModal = ({ onClose, onSave, thumbnail, handleThumbnailChange }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Thumbnail</h3>
      <input
        type="file"
        onChange={handleThumbnailChange}
        className="border p-2 w-full mb-4 rounded focus:outline-none"
      />
      {thumbnail && (
        <div className="mb-4">
          <img src={thumbnail} alt="Thumbnail Preview" className="w-24 h-24 object-cover rounded" />
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
          Cancel
        </button>
        <button onClick={onSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Save
        </button>
      </div>
    </div>
  </div>
);

export default EditThumbnailModal;