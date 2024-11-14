import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';
import { HiHome, HiTrash, HiArrowUpOnSquare, HiChevronLeft, HiChevronRight, HiPlusCircle, HiPencil, HiVideoCamera, HiCommandLine } from "react-icons/hi2";
import { AiFillEdit, AiFillFileImage } from "react-icons/ai";
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('c', c);

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
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showAddCodeModal, setShowAddCodeModal] = useState(false);
  const [newCodeElement, setNewCodeElement] = useState({
    code: '',
    language: 'javascript', 
    width: 50,
    height: 50,
    fontSize: 1,
    position: { x: 0, y: 0 },
  });
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





  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editingVideoElementId, setEditingVideoElementId] = useState(null);

  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editingCodeElementId, setEditingCodeElementId] = useState(null);

  // ! Function to handle setting selected element
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Handle dragging element
  const handleDragMouseDown = (e, elementId) => {
    e.stopPropagation();
    const element = presentation.slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (!element) return;

    const slideRef = e.target.closest('.relative');
    if (!slideRef) return;

    const initialMouseX = e.clientX;
    const initialMouseY = e.clientY;
    const initialPosition = { ...element.position };

    const handleMouseMove = (moveEvent) => {
      let deltaX = (moveEvent.clientX - initialMouseX) / slideRef.clientWidth * 100;
      let deltaY = (moveEvent.clientY - initialMouseY) / slideRef.clientHeight * 100;

      let newX = Math.max(0, Math.min(100 - element.width, initialPosition.x + deltaX));
      let newY = Math.max(0, Math.min(100 - element.height, initialPosition.y + deltaY));

      const updatedElements = presentation.slides[currentSlideIndex].elements.map((el) =>
        el.id === elementId ? { ...el, position: { x: newX, y: newY } } : el
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

  
  const [newVideoElement, setNewVideoElement] = useState({
    src: '',
    width: 100,
    height: 100,
    autoplay: false,
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
 // Handle add text elements ********************************
 const handleAddTextElement = () => {
  const newElement = {
    id: `element-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    type: 'text',
    ...newTextElement, 
    zIndex: presentation.slides[currentSlideIndex].elements.length + 1,
  };

  const updatedSlides = presentation.slides.map((slide, index) =>
    index === currentSlideIndex
      ? { ...slide, elements: [...slide.elements, newElement] }
      : slide
  );

  setPresentation({ ...presentation, slides: updatedSlides });
  setShowAddTextModal(false);
};

  // Handle add text elements ********************************
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

  const handleAddVideoElement = () => {
    const embeddedURL = convertToEmbeddedURL(newVideoElement.src);
  
    if (isEditingVideo) {
      // Update existing element
      const updatedSlides = presentation.slides.map((slide, index) => {
        if (index === currentSlideIndex) {
          return {
            ...slide,
            elements: slide.elements.map(el =>
              el.id === editingVideoElementId ? { ...newVideoElement, id: editingVideoElementId, src: embeddedURL } : el
            ),
          };
        }
        return slide;
      });
  
      setPresentation({ ...presentation, slides: updatedSlides });
      setIsEditingVideo(false);
      setEditingVideoElementId(null);
    } else {
      // Create new element
      const newElement = {
        id: `element-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: 'video',
        src: embeddedURL,
        width: newVideoElement.width,
        height: newVideoElement.height,
        autoplay: newVideoElement.autoplay,
        position: newVideoElement.position,
        zIndex: presentation.slides[currentSlideIndex].elements.length + 1
      };
  
      const updatedSlides = presentation.slides.map((slide, index) =>
        index === currentSlideIndex
          ? { ...slide, elements: [...slide.elements, newElement] }
          : slide
      );
  
      setPresentation({ ...presentation, slides: updatedSlides });
    }
  
    setShowAddVideoModal(false);
  };
  
  const handleEditVideoElement = (elementId) => {
    console.log(`Editing video element with id: ${elementId}`);
    const element = presentation.slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element && element.type === 'video') {
      setNewVideoElement({ ...element });
      setEditingVideoElementId(elementId);
      setIsEditingVideo(true);
      setShowAddVideoModal(true);
    } else {
      console.error("Video element not found or not a video type.");
    }
  };

  

  const convertToEmbeddedURL = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
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
  
  const handleAddCodeElement = () => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: 'code',
      ...newCodeElement,
      zIndex: presentation.slides[currentSlideIndex].elements.length + 1,
    };

    const updatedSlides = presentation.slides.map((slide, index) =>
      index === currentSlideIndex
        ? { ...slide, elements: [...slide.elements, newElement] }
        : slide
    );

    setPresentation({ ...presentation, slides: updatedSlides });
    setShowAddCodeModal(false);
  };

  const handleEditCodeElement = (elementId) => {
    const element = presentation.slides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element && element.type === 'code') {
      setNewCodeElement({ ...element });
      setEditingCodeElementId(elementId);
      setIsEditingCode(true);
      setShowAddCodeModal(true);
    }
  };

  const handleUpdateCodeElement = () => {
    const updatedSlides = presentation.slides.map((slide, index) =>
      index === currentSlideIndex
        ? {
            ...slide,
            elements: slide.elements.map((el) =>
              el.id === editingCodeElementId
                ? { ...newCodeElement, id: editingCodeElementId }
                : el
            ),
          }
        : slide
    );
  
    setPresentation({ ...presentation, slides: updatedSlides });
  
    setTimeout(() => {
      const codeElement = document.querySelector(`pre[data-id="${editingCodeElementId}"] code`);
      if (codeElement) {
        codeElement.className = `language-${newCodeElement.language}`;
        hljs.highlightElement(codeElement); 
      }
    }, 0);
  
    setShowAddCodeModal(false);
    setIsEditingCode(false);
    setEditingCodeElementId(null);
  };

  const renderCodeElement = (element) => (
    <pre
      data-id={element.id} 
      onDoubleClick={() => handleEditCodeElement(element.id)}
    >
      <code className={`language-${element.language}`}>
        {element.code}
      </code>
    </pre>
  );

  useEffect(() => {
    if (presentation) {
      setTimeout(() => hljs.highlightAll(), 0);
    }
  }, [presentation]);

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
           onClick={() => {
            // setNewVideoElement({
            //   src: '',
            //   width: 50,
            //   height: 30,
            //   autoplay: false,
            //   position: { x: 0, y: 0 }
            // });
            setShowAddVideoModal(true);
          }}
          className="text-platinumLight w-12 h-12 cursor-pointer hover:scale-110 transition-transform duration-200"
        />

        <HiCommandLine
           onClick={() => {
            // setNewCodeElement({
            //   code: '',
            //   language: 'javascript',
            //   width: 50,
            //   height: 30,
            //   fontSize: 1,
            //   position: { x: 0, y: 0 },
            // });
            // Reset to add modal mode
            setIsEditingCode(false); 
            setEditingCodeElementId(null); 
            setShowAddCodeModal(true);
          }}
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
                 onMouseDown={(e) => handleDragMouseDown(e, element.id)}
                 onDoubleClick={() =>
                  element.type === 'text'
                    ? handleEditTextElement(element.id)
                    : element.type === 'image'
                    ? handleEditImageElement(element.id)
                    : element.type === 'code'
                    ? handleEditCodeElement(element.id)
                    : element.type === 'video'
                    ? handleEditVideoElement(element.id)
                    : null
                 }
                 onClick={() => setSelectedElementId(element.id)}
                 onContextMenu={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   handleDeleteElement(element.id);
                 }}
                 style={{
                   position: 'absolute',
                   top: `${element.position.y}%`,
                   left: `${element.position.x}%`,
                   width: `${element.width}%`,
                   height: `${element.height}%`,
                   fontSize: element.type === 'text' ? `${element.fontSize}em` : 'initial',
                   fontFamily: element.type === 'text' ? element.fontFamily : 'initial',
                   color: element.color,
                   zIndex: element.zIndex,
                   border: element.type === 'video' ? '2px dashed blue' : '1px solid #d3d3d3'
                 }}
                 className="overflow-hidden"
               >
                 {element.type === 'text' ? (
                   element.text
                 ) : element.type === 'image' ? (
                   <img src={element.src} alt={element.alt} className="object-cover w-full h-full" />
                 ) : element.type === 'video' ? (
                      <div
                      style={{
                          position: 'absolute',
                          top: `${element.position.y}%`,
                          left: `${element.position.x}%`,
                          width: `${element.width}%`,
                          height: `${element.height}%`,
                          zIndex: element.zIndex,
                          border: '2px dashed blue',
                          boxSizing: 'border-box',
                        }}
                        onClick={(e) => {
                          // Enable interactivity on single click
                          e.stopPropagation();
                          const iframe = e.currentTarget.querySelector('iframe');
                          if (iframe) {
                            iframe.style.pointerEvents = 'auto';
                          }
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log(`Double-clicked video element with id: ${element.id}`);
                          handleEditVideoElement(element.id);
                    
                          
                        }}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Deleting");
                          console.log("Deleting");
                          console.log("Deleting");
                          console.log("Deleting");
                          console.log("Deleting");
                          handleDeleteElement(element.id);
                        }}
                        className="video-container"
                      >
                        <iframe
                          src={`${element.src}${element.autoplay ? '?autoplay=1' : ''}`}
                          width="100%"
                          height="100%"
                          allow="autoplay"
                          frameBorder="0"
                          allowFullScreen
                          style={{
                            pointerEvents: 'none', 
                            objectFit: 'cover', 
                          }}
                          className="object-cover"
                        />
                      </div>
                  ) : element.type === 'code' ? renderCodeElement(element): null} 
                  {/* Resizeing below */}
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
            <select
              value={newTextElement.fontFamily}
              onChange={(e) => setNewTextElement({ ...newTextElement, fontFamily: e.target.value })}
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            >
              <option value="Times New Roman">Times New Roman</option>
              <option value="Arial">Arial</option>
              <option value="Comic Sans MS">Comic Sans MS</option>
              <option value="Trebuchet MS">Trebuchet MS</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
            </select>
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

      {showAddVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 1000 }}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {newVideoElement.id ? 'Edit Video Element' : 'Add Video Element'}
            </h3>
            <input
              type="text"
              value={newVideoElement.src}
              onChange={(e) => setNewVideoElement({ ...newVideoElement, src: e.target.value })}
              placeholder="YouTube Embedded URL"
              className="border p-2 w-full mb-4 rounded focus:outline-none text-gray-800"
            />
            <input
              type="number"
              value={newVideoElement.width}
              onChange={(e) => setNewVideoElement({ ...newVideoElement, width: e.target.value })}
              placeholder="Width (%)"
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            <input
              type="number"
              value={newVideoElement.height}
              onChange={(e) => setNewVideoElement({ ...newVideoElement, height: e.target.value })}
              placeholder="Height (%)"
              className="border p-2 w-full mb-4 rounded focus:outline-none"
            />
            <input
              type="number"
              value={newVideoElement.position.x}
              onChange={(e) =>
                setNewVideoElement({
                  ...newVideoElement,
                  position: { ...newVideoElement.position, x: e.target.value },
                })
              }
              placeholder="Position X (%)"
              className="border p-2 w-full mb-4 rounded"
            />
            <input
              type="number"
              value={newVideoElement.position.y}
              onChange={(e) =>
                setNewVideoElement({
                  ...newVideoElement,
                  position: { ...newVideoElement.position, y: e.target.value },
                })
              }
              placeholder="Position Y (%)"
              className="border p-2 w-full mb-4 rounded"
            />
            <label className="block text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={newVideoElement.autoplay}
                onChange={(e) => setNewVideoElement({ ...newVideoElement, autoplay: e.target.checked })}
                className="mr-2"
              />
              Auto-play
            </label>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowAddVideoModal(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={newVideoElement.id ? handleAddVideoElement : handleAddVideoElement}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {newVideoElement.id ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code modal */}
      {showAddCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center " style={{ zIndex: 1000 }}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4">{isEditingCode ? 'Edit Code Element' : 'Add Code Element'}</h3>
            <textarea
              rows="5"
              value={newCodeElement.code}
              onChange={(e) => setNewCodeElement({ ...newCodeElement, code: e.target.value })}
              placeholder="Write your code here"
              className="border p-2 w-full mb-4 rounded"
              style={{ whiteSpace: 'pre' }}
            />
            <select
              value={newCodeElement.language}
              onChange={(e) => setNewCodeElement({ ...newCodeElement, language: e.target.value })}
              className="border p-2 w-full mb-4 rounded"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="c">C</option>
            </select>
            <input
              type="number"
              value={newCodeElement.width}
              onChange={(e) => setNewCodeElement({ ...newCodeElement, width: e.target.value })}
              placeholder="Width (%)"
              className="border p-2 w-full mb-4 rounded"
            />
            <input
              type="number"
              value={newCodeElement.height}
              onChange={(e) => setNewCodeElement({ ...newCodeElement, height: e.target.value })}
              placeholder="Height (%)"
              className="border p-2 w-full mb-4 rounded"
            />
            <input
              type="number"
              value={newCodeElement.fontSize}
              onChange={(e) => setNewCodeElement({ ...newCodeElement, fontSize: e.target.value })}
              placeholder="Font Size (em)"
              className="border p-2 w-full mb-4 rounded"
            />
            {isEditingCode && (
              <>
                <input
                  type="number"
                  value={newCodeElement.position.x}
                  onChange={(e) =>
                    setNewCodeElement({
                      ...newCodeElement,
                      position: { ...newCodeElement.position, x: e.target.value },
                    })
                  }
                  placeholder="Position X (%)"
                  className="border p-2 w-full mb-4 rounded"
                />
                <input
                  type="number"
                  value={newCodeElement.position.y}
                  onChange={(e) =>
                    setNewCodeElement({
                      ...newCodeElement,
                      position: { ...newCodeElement.position, y: e.target.value },
                    })
                  }
                  placeholder="Position Y (%)"
                  className="border p-2 w-full mb-4 rounded"
                />
              </>
            )}
            <div className="flex justify-end space-x-2">
              <button
                
                onClick={() => {
                  setShowAddCodeModal(false);
                  setIsEditingElement(false);
                  setEditingElementId(null);
                }}
               
                className="px-4 py-2 bg-gray-300 rounded-lg"
              
              >
                Cancel
              </button>
              <button
                
                onClick={isEditingCode ? handleUpdateCodeElement : isEditingElement ? handleUpdateTextElement : handleAddCodeElement}
               
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              
              >
                {isEditingCode ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default PresentationEdit;

