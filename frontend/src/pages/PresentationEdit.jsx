import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';

function PresentationEdit() {
  const { presentationId } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [allPresentations, setAllPresentations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showEditThumbnailModal, setShowEditThumbnailModal] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Fetch presentations on mount
  const fetchPresentations = async () => {
    try {
      const response = await axios.get('/store', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const presentationsData = response.data.store.presentations || [];
      setAllPresentations(presentationsData);

      const presentationData = presentationsData.find((p) => p.id === presentationId);
      if (presentationData) {
        setPresentation(presentationData);
        setEditedTitle(presentationData.name || '');
        setThumbnail(presentationData.thumbnail || '');
      }
    } catch (error) {
      console.error('Failed to fetch presentations:', error);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, [presentationId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') navigateToPreviousSlide();
      if (event.key === 'ArrowRight') navigateToNextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlideIndex, presentation]);

  // Handle thumbnail file selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result);
      };
      reader.onerror = () => console.error("Error reading thumbnail file");
      reader.readAsDataURL(file);
    }
  };

  const saveUpdatedTitle = async () => {
    if (!presentation) return;

    const updatedPresentation = { ...presentation, name: editedTitle };
    const updatedPresentations = allPresentations.map((p) =>
      p.id === presentationId ? updatedPresentation : p
    );

    try {
      await axios.put('/store', { store: { presentations: updatedPresentations } });
      setPresentation(updatedPresentation);
      setShowEditTitleModal(false);
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const saveUpdatedThumbnail = async () => {
    if (!presentation) return;

    const updatedPresentation = { ...presentation, thumbnail };
    const updatedPresentations = allPresentations.map((p) =>
      p.id === presentationId ? updatedPresentation : p
    );

    try {
      await axios.put('/store', { store: { presentations: updatedPresentations } });
      setPresentation(updatedPresentation);
      setShowEditThumbnailModal(false);
    } catch (error) {
      console.error('Failed to update thumbnail:', error);
    }
  };

  const addSlide = () => {
    if (!presentation) return;
    const newSlide = { id: `slide-${Date.now()}`, elements: [] };
    setPresentation({
      ...presentation,
      slides: [...presentation.slides, newSlide],
    });
  };

  const deleteSlide = (slideId) => {
    if (!presentation) return;
    const updatedSlides = presentation.slides.filter((slide) => slide.id !== slideId);
    
    // Move to the previous slide if the last slide was deleted
    if (currentSlideIndex >= updatedSlides.length && currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1); 
    }
    
    setPresentation({ ...presentation, slides: updatedSlides });
  };

  const navigateToNextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const navigateToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleDeletePresentation = async () => {
    const updatedPresentations = allPresentations.filter((p) => p.id !== presentationId);
    try {
      await axios.put('/store', { store: { presentations: updatedPresentations } });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete presentation:', error);
    }
  };

  if (!presentation) {
    return <div>Loading.....</div>;
  }

  return (
    <div className="flex flex-col min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete Presentation
        </button>
      </div>

      {/* Title and Edit Button */}
      <div className="flex items-center mb-6">
        <h2 className="text-3xl font-bold">{presentation.name}</h2>
        <button onClick={() => setShowEditTitleModal(true)} className="ml-4 text-blue-500 hover:underline">
          Edit Title
        </button>
        <button onClick={() => setShowEditThumbnailModal(true)} className="ml-4 text-blue-500 hover:underline">
          Edit Thumbnail
        </button>
      </div>

      {/* Display Thumbnail */}
      {thumbnail && (
        <div className="mb-6">
          <img src={thumbnail} alt="Thumbnail" className="w-32 h-32 object-cover rounded" />
        </div>
      )}

      {/* Slide Navigation Controls */}
      <div className="flex items-center justify-center space-x-4 mb-4">
        {currentSlideIndex > 0 && (
          <button onClick={navigateToPreviousSlide} className="p-2 text-blue-500">
            ← Previous
          </button>
        )}
        <span>Slide {currentSlideIndex + 1} of {presentation.slides.length}</span>
        {currentSlideIndex < presentation.slides.length - 1 && (
          <button onClick={navigateToNextSlide} className="p-2 text-blue-500">
            Next →
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <p className="text-lg font-semibold">Slide {presentation.slides[currentSlideIndex].id}</p>
        <button
          onClick={() => deleteSlide(presentation.slides[currentSlideIndex].id)}
          className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Delete Slide
        </button>
      </div>

      <button
        onClick={addSlide}
        className="self-start mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add New Slide
      </button>

      {/* Save Changes Button */}
      <button
        onClick={saveUpdatedThumbnail}
        className="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        Save Changes
      </button> 

      {/* Edit Title Modal */}
      {showEditTitleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Title</h3>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="New Title"
              className="border p-2 w-full mb-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowEditTitleModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={saveUpdatedTitle} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Thumbnail Modal */}
      {showEditThumbnailModal && (
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
              <button onClick={() => setShowEditThumbnailModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={saveUpdatedThumbnail} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Are you sure?</h3>
            <p className="mb-4 text-gray-600">Are you sure you want to delete this presentation?</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={handleDeletePresentation} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresentationEdit;