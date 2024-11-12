import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';
import { HiHome, HiTrash, HiArrowUpOnSquare, HiChevronLeft, HiChevronRight, HiPlusCircle } from "react-icons/hi2";
import { AiFillEdit } from "react-icons/ai";

function PresentationEdit() {
  const { presentationId } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [allPresentations, setAllPresentations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showEditThumbnailModal, setShowEditThumbnailModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); 
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

    if (presentation.slides.length === 1) {
      setShowErrorModal(true);
      return;
    }

    const updatedSlides = presentation.slides.filter((slide) => slide.id !== slideId);
    
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

  // function that save and back to dashboard
  const handleBackAndSave = () => {
    saveUpdatedThumbnail(); 
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-row min-h-screen space-x-4 bg-gradient-to-r from-lightGray to-lightBlue">
      {/*Sidebar on left */}
      <div className="flex flex-col w-1/8 bg-black justify-between">
        {/* Back button refine later */}
  
        <HiHome 
          onClick={handleBackAndSave} 
          className="text-platinumLight w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200" 
        />
        
        <HiTrash  
          onClick={() => setShowDeleteModal(true)} 
          className="text-primaryBlue w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200"
        />

      </div>

      {/* Presentation area*/}
      <div className="flex flex-col flex-grow p-2 space-y-4">
        {/*Title and Thumbnail */}
        <div className="flex flex-row items-center space-x-6">
          {/* Thumbnail */}
          <div className="w-25 h-20 bg-gray-300 rounded flex items-center justify-center cursor-pointer">
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
            
            <HiArrowUpOnSquare
                onClick={() => setShowEditThumbnailModal(true)}
                className=" bottom-1 right-1 text-primaryBlue w-5 h-5 cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </div>
          <div>
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
        


        {/* Slideshow deck */}
        <div className="flex flex-row flex-grow space-x-4">
          {/* Slide area*/}
          <div className="flex-grow flex items-center justify-center bg-white shadow-md rounded-lg">
            {/* show slides */}
            <div className="w-full h-full bg-gray-200 relative flex items-center justify-center rounded-lg">
              <p className="text-lg font-semibold">Slide {presentation.slides[currentSlideIndex].id}</p>
              {/* Slide Index */}
              <div className="absolute bottom-2 left-2 text-xs text-gray-700 w-12 h-12 flex items-center justify-center">
                {currentSlideIndex + 1}
              </div>
            </div>
          </div>

          {/* Slideshow Deck Sidebar */}
          <div className="w-1/8 flex flex-col">
            {/* <button
              onClick={() => deleteSlide(presentation.slides[currentSlideIndex].id)}
              className="px-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete Slide
            </button> */}
            <HiTrash  
              onClick={() => deleteSlide(presentation.slides[currentSlideIndex].id)}
              className="text-red-500 w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </div>

        </div>
        
        {/* Control Panel */}
        <div className="flex flex-row items-center justify-between  p-1 rounded-lg shadow-md">
          {/* Add Slide 按钮 */}
          <div className="flex-1 flex justify-center">
            {/* <button
              onClick={addSlide}
              className="px-4 py-2 bg-primaryBlue text-white rounded-lg hover:bg-green-600"
            >
              Add Slide
            </button> */}
            <HiPlusCircle 
              onClick={addSlide}
              className="w-10 h-10  text-primaryBlue cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </div>
          
          {/* Previous and Next Slide Buttons */}
          <div className="flex flex-row items-center space-x-4">
            {/* Previous Slide Button */}
            <HiChevronLeft
              onClick={currentSlideIndex > 0 ? navigateToPreviousSlide : undefined}
              className={`w-8 h-8 cursor-pointer transition-transform duration-200 ${
                currentSlideIndex === 0 ? "text-gray-400 cursor-not-allowed" : "text-primaryBlue hover:scale-110"
              }`}
            />

            {/* Next Slide Button */}
            <HiChevronRight
              onClick={currentSlideIndex < presentation.slides.length - 1 ? navigateToNextSlide : undefined}
              className={`w-8 h-8 cursor-pointer transition-transform duration-200 ${
                currentSlideIndex === presentation.slides.length - 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-primaryBlue hover:scale-110"
              }`}
            />
          </div>


        </div>




      </div>
      

      {/* Error Modal for Last Slide Deletion */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4 text-gray-800">This is the last slide in your presentation!</h3>
            <p className="mb-4 text-gray-600">To delete this slide, you should delete the presentation instead.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowErrorModal(false)} className="px-4 py-2 bg-lightGray rounded-lg hover:bg-gray-400">
                Close
              </button>
            </div>
          </div>
        </div>
      )} 

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