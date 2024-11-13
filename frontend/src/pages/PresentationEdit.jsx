import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';
import { HiHome, HiTrash, HiArrowUpOnSquare, HiChevronLeft, HiChevronRight, HiPlusCircle, HiPencil, HiVideoCamera, HiCommandLine } from "react-icons/hi2";
import { AiFillEdit, AiFillFileImage } from "react-icons/ai";

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
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [showAddImageModal, setShowAddImageModal] = useState(false); 
  const [newTextElement, setNewTextElement] = useState({
    text: '',
    width: 50,
    height: 20,
    fontSize: 1,
    color: '#000000',
    position: { x: 0, y: 0 }
  });

  const [isEditingElement, setIsEditingElement] = useState(false); // is txt editing
  const [editingElementId, setEditingElementId] = useState(null); // add editing elment logic

  // ! Function to handle setting selected element
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Handle resizing element
  const handleResizeMouseDown = (e, elementId, corner) => {
    e.stopPropagation();
    const element = presentation.slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (!element) return;

    const slideRef = e.target.closest('.relative');
    if (!slideRef) return;

    // get slide area's position
    

    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    const initialPosition = { ...element.position };
    const initialWidth = element.width;
    const initialHeight = element.height;

    const handleMouseMove = (moveEvent) => {

      // if (moveEvent.clientX > initialMouseX) {
      //   deltaX = Math.min(moveEvent.clientX - initialMouseX, slideRight - initialMouseX);
      // } else {
      //   deltaX = Math.max(moveEvent.clientX - initialMouseX, slideLeft - initialMouseX);
      // }

      // if (moveEvent.clientY > initialMouseY) {
      //   deltaY = Math.min(moveEvent.clientY - initialMouseY, slideBottom - initialMouseY);
      // } else {
      //   deltaY = Math.max(moveEvent.clientY - initialMouseY, slideTop - initialMouseY);
      // }

      const slideRect = slideRef.getBoundingClientRect();
      const slideLeft = slideRect.left; 
      const slideTop = slideRect.top;
      const slideRight = slideRect.right;
      const slideBottom = slideRect.bottom;

      let deltaX = moveEvent.clientX - initialMouseX;
      let deltaY = moveEvent.clientY - initialMouseY;
      let newWidth = initialWidth;
      let newHeight = initialHeight;
      let newX = initialPosition.x;
      let newY = initialPosition.y;

      if (corner.includes('right')) {
        deltaX = Math.min(deltaX, slideRight - initialMouseX);
        newWidth = Math.min(100, Math.max(1, initialWidth + (deltaX / slideRef.clientWidth) * 100));
      }
      if (corner.includes('left')) {
        deltaX = Math.max(deltaX, slideLeft - initialMouseX);
        newWidth = Math.min(100, Math.max(1, initialWidth - (deltaX / slideRef.clientWidth) * 100));

        if (newWidth !== initialWidth && newWidth >= 1) {
          newX = Math.max(0, Math.min(initialPosition.x + (deltaX / slideRef.clientWidth) * 100, initialPosition.x + initialWidth - 1));
        }
      }
      if (corner.includes('bottom')) {
        deltaY = Math.min(deltaY, slideBottom - initialMouseY);
        newHeight = Math.min(100, Math.max(1, initialHeight + (deltaY / slideRef.clientHeight) * 100));
      }
      if (corner.includes('top')) {
        deltaY = Math.max(deltaY, slideTop - initialMouseY);
        newHeight = Math.min(100, Math.max(1, initialHeight - (deltaY / slideRef.clientHeight) * 100));

        if (newHeight !== initialHeight && newHeight >= 1) {
          newY = Math.max(0, Math.min(initialPosition.y + (deltaY / slideRef.clientHeight) * 100, initialPosition.y + initialHeight - 1));
        }
      }

      // Ensure the element stays within the bounds of the slide
      newX = Math.max(0, Math.min(100 - newWidth, newX));
      newY = Math.max(0, Math.min(100 - newHeight, newY));

      const updatedElements = presentation.slides[currentSlideIndex].elements.map((el) =>
        el.id === elementId ? { ...el, position: { x: newX, y: newY }, width: newWidth, height: newHeight } : el
      );
      setPresentation({
        ...presentation,
        slides: presentation.slides.map((slide, idx) =>
          idx === currentSlideIndex ? { ...slide, elements: updatedElements } : slide 
        )
      });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };
// ! ************************************************************************************************

  const [newImageElement, setNewImageElement] = useState({
    src: '',
    width: 50,
    height: 30,
    alt: '',
    position: { x: 0, y: 0 }
  });


  const handleAddImageElement = () => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: 'image',
      ...newImageElement,
      zIndex: presentation.slides[currentSlideIndex].elements.length + 1
    };

    const updatedSlides = presentation.slides.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, newElement] }
        : slide
    );

    setPresentation({ ...presentation, slides: updatedSlides });
    setShowAddImageModal(false);
  };

  // Handle add text elements
  const handleAddTextElement = () => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: 'image',
      ...newImageElement,
      zIndex: presentation.slides[currentSlideIndex].elements.length + 1
    };

    const updatedSlides = presentation.slides.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, newElement] }
        : slide
    );

    setPresentation({ ...presentation, slides: updatedSlides });
    setShowAddImageModal(false);
  };

  // Handle add text elements ********************************
  const handleAddTextElement = () => {
    const newElement = {
      id: `element-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      type: 'text',
      ...newTextElement,
      zIndex: presentation.slides[currentSlideIndex].elements.length + 1 
    };

    const updatedSlides = presentation.slides.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, newElement] }
        : slide
    );

    setPresentation({ ...presentation, slides: updatedSlides });
    setShowAddTextModal(false);
  };

  const handleEditTextElement = (elementId) => {
    const element = presentation.slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element) {
      setNewTextElement({ ...element }); 
      setEditingElementId(elementId); // save the id
      setIsEditingElement(true);
      setShowAddTextModal(true); 
    }
  };

  const handleEditImageElement = (elementId) => {
    const element = presentation.slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element && element.type === 'image') {
      setNewImageElement({ ...element });
      setShowAddImageModal(true);
    }
  };

  const handleEditImageElement = (elementId) => {
    const element = presentation.slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element && element.type === 'image') {
      setNewImageElement({ ...element });
      setShowAddImageModal(true);
    }
  };

  const handleDeleteElement = (elementId) => {
    const updatedSlides = presentation.slides.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: slide.elements.filter(el => el.id !== elementId) }
        : slide
    );
    setPresentation({ ...presentation, slides: updatedSlides });
  };

  const handleUpdateTextElement = () => {
    const updatedSlides = presentation.slides.map((slide, index) => {
      if (index === currentSlideIndex) {
        return {
          ...slide,
          elements: slide.elements.map((el) =>
            el.id === editingElementId ? { ...newTextElement, id: editingElementId } : el
          ),
        };
      }
      return slide;
    });
  
    setPresentation({ ...presentation, slides: updatedSlides });
    setShowAddTextModal(false); 
    setIsEditingElement(false); 
    setEditingElementId(null); 
  };
  
  // Function to reset newTextElement to default values
  const resetNewTextElement = () => {
    setNewTextElement({
      text: '',
      width: 50,
      height: 20,
      fontSize: 1,
      color: '#000000',
      position: { x: 0, y: 0 }
    });
  };


//****************************************************** 


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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageElement({ ...newImageElement, src: reader.result });
      };
      reader.onerror = () => console.error("Error reading image file");
      reader.readAsDataURL(file);
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

        <HiPencil
          onClick={() => setShowAddTextModal(true)}
          className="text-platinumLight w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200" 
        />

        <AiFillFileImage
          onClick={() => setShowAddImageModal(true)} 
          className="text-platinumLight w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200" 
        />

        <HiVideoCamera 
          // onClick={handleBackAndSave} 
          className="text-platinumLight w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200" 
        />

        <HiCommandLine
          // onClick={handleBackAndSave} 
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

          {/* Slide area refine later for shadow*/}
          <div className="flex-grow flex items-center justify-center  shadow-md rounded-lg">
            {/* show slides */}
            <div className="relative w-full max-w-5xl aspect-[16/9] bg-gray-200 flex items-center justify-center rounded-lg">
              
              {/* Slide Index */}
              <div className="absolute bottom-2 left-2 text-xs text-gray-700 w-12 h-12 flex items-center justify-center">
                {currentSlideIndex + 1}
              </div>

              {/* Render elements */}
              {presentation.slides[currentSlideIndex].elements.map((element) => (
                <div
                  key={element.id}
                  onDoubleClick={() => element.type === 'text' ? handleEditTextElement(element.id) : handleEditImageElement(element.id)}
                  onClick={() => setSelectedElementId(element.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // e.stopPropagation();
                    handleDeleteElement(element.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: `${element.position.y}%`,
                    left: `${element.position.x}%`,
                    width: `${element.width}%`,
                    height: `${element.height}%`,
                    fontSize: element.type === 'text' ? `${element.fontSize}em` : 'initial',
                    color: element.color,
                    zIndex: element.zIndex,
                    border: element.type === 'text' ? '1px solid #d3d3d3' : 'none'
                  }}
                  className="overflow-hidden"
                >
                  {element.type === 'text' ? element.text : (
                    <img src={element.src} alt={element.alt} className="object-cover w-full h-full" />
                  )}
                  {selectedElementId === element.id && (
                    <>
                      {/* Top-left handle */}
                      <div
                        className="absolute w-2 h-2 bg-blue-500 cursor-pointer"
                        style={{ top: '-5px', left: '-5px' }}
                        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'top-left')}
                      />
                      {/* Top-right handle */}
                      <div
                        className="absolute w-2 h-2 bg-blue-500 cursor-pointer"
                        style={{ top: '-5px', right: '-5px' }}
                        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'top-right')}
                      />
                      {/* Bottom-left handle */}
                      <div
                        className="absolute w-2 h-2 bg-blue-500 cursor-pointer"
                        style={{ bottom: '-5px', left: '-5px' }}
                        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'bottom-left')}
                      />
                      {/* Bottom-right handle */}
                      <div
                        className="absolute w-2 h-2 bg-blue-500 cursor-pointer"
                        style={{ bottom: '-5px', right: '-5px' }}
                        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'bottom-right')}
                      />
                    </>
                  )}
                </div>
              ))}
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

      {showAddTextModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 1000 }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {isEditingElement ? 'Edit Text Element' : 'Add Text Element'}
            </h3>
            <input
              type="text"
              value={newTextElement.text}
              onChange={(e) => setNewTextElement({ ...newTextElement, text: e.target.value })}
              placeholder="Text Content"
              className="border p-2 w-full mb-4 rounded focus:outline-none text-gray-800"
            />
            <input
              type="number"
              value={newTextElement.width}
              onChange={(e) => setNewTextElement({ ...newTextElement, width: e.target.value })}
              placeholder="Width (%)"
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            <input
              type="number"
              value={newTextElement.height}
              onChange={(e) => setNewTextElement({ ...newTextElement, height: e.target.value })}
              placeholder="Height (%)"
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            <input
              type="number"
              value={newTextElement.fontSize}
              onChange={(e) => setNewTextElement({ ...newTextElement, fontSize: e.target.value })}
              placeholder="Font Size (em)"
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            <input
              type="color"
              value={newTextElement.color}
              onChange={(e) => setNewTextElement({ ...newTextElement, color: e.target.value })}
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            {/* {isEditingElement && (
              <>
                <input
                  type="number"
                  value={newTextElement.position?.x}
                  onChange={(e) => setNewTextElement({ ...newTextElement, position: { ...newTextElement.position, x: e.target.value } })}
                  placeholder="Position X (%)"
                  className="border p-2 w-full mb-4 rounded focus:outline-none"
                />
                <input
                  type="number"
                  value={newTextElement.position?.y}
                  onChange={(e) => setNewTextElement({ ...newTextElement, position: { ...newTextElement.position, y: e.target.value } })}
                  placeholder="Position Y (%)"
                  className="border p-2 w-full mb-4 rounded focus:outline-none"
                />
              </>
            )} */}
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setShowAddTextModal(false);
                  setIsEditingElement(false);
                  setEditingElementId(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (isEditingElement) {
                    handleUpdateTextElement();
                    resetNewTextElement();
                  } else {
                    handleAddTextElement();
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {isEditingElement ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showAddImageModal && (
        <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style={{ zIndex: 1000 }} 
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit Image Element</h3>
            <input
              type="text"
              value={newImageElement.src}
              onChange={(e) => setNewImageElement({ ...newImageElement, src: e.target.value })}
              placeholder="Image URL"
              className="border p-2 w-full mb-4 rounded focus:outline-none text-gray-800"
            />
            <input
              type="file"
              onChange={handleImageUpload}
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            <input
              type="text"
              value={newImageElement.alt}
              onChange={(e) => setNewImageElement({ ...newImageElement, alt: e.target.value })}
              placeholder="Alt Description"
              className="border p-2 w-full mb-4 rounded focus:outline-none text-gray-800"
            />
            <input
              type="number"
              value={newImageElement.width}
              onChange={(e) => setNewImageElement({ ...newImageElement, width: e.target.value })}
              placeholder="Width (%)"
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            <input
              type="number"
              value={newImageElement.height}
              onChange={(e) => setNewImageElement({ ...newImageElement, height: e.target.value })}
              placeholder="Height (%)"
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowAddImageModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button onClick={handleAddImageElement} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default PresentationEdit;
