import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';

function PresentationEdit() {
  const { presentationId } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [allPresentations, setAllPresentations] = useState([]); 
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchPresentations = async () => {
    try {
      const response = await axios.get('/store', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const presentationsData = response.data.store.presentations;
      setAllPresentations(presentationsData);
  
      const presentationData = presentationsData.find((p) => p.id === presentationId);
      setPresentation(presentationData || { slides: [] });
    } catch (error) {
      console.error('Failed to fetch presentations:', error);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, [presentationId]);


  const addSlide = () => {
    const newSlide = { id: `slide-${Date.now()}`, elements: [] };
    setPresentation({
      ...presentation,
      slides: [...presentation.slides, newSlide],
    });
  };

  const deleteSlide = (slideId) => {
    const updatedSlides = presentation.slides.filter((slide) => slide.id !== slideId);
    setPresentation({ ...presentation, slides: updatedSlides });
  };

  const savePresentation = async () => {
    try {
      const updatedPresentations = allPresentations.map((p) =>
        p.id === presentationId ? presentation : p
      );
      await axios.put('/store', {
        store: { presentations: updatedPresentations },
      });
      console.log("Presentation saved");
    } catch (error) {
      console.error('Failed to save presentation:', error);
    }
  };

  const handleDeletePresentation = async () => {
    try {
      const updatedPresentations = allPresentations.filter((p) => p.id !== presentationId);
      await axios.put('/store', { store: { presentations: updatedPresentations } });
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete presentation:', error);
    }
  };

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

      <h2 className="text-3xl font-bold mb-6">{presentation?.name}</h2>

      {/* Slides*/}
      <div className="flex flex-col space-y-4">
        {presentation?.slides.map((slide) => (
          <div key={slide.id} className="bg-white p-4 rounded shadow">
            <p className="text-lg font-semibold">Slide {slide.id}</p>
            <button
              onClick={() => deleteSlide(slide.id)}
              className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Delete Slide
            </button>
          </div>
        ))}

        <button
          onClick={addSlide}
          className="self-start bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Slide
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={savePresentation}
        className="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
      >
        Save Changes
      </button>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Are you sure?</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete this presentation?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePresentation}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
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