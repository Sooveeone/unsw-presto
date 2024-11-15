import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../axiosConfig';
import { HiHome, HiEye, HiTrash, HiEyeDropper, HiArrowUpOnSquare, HiChevronLeft, HiChevronRight, HiOutlinePlusCircle, HiPencil, HiVideoCamera, HiCommandLine } from "react-icons/hi2";
import { AiFillEdit, AiFillFileImage} from "react-icons/ai";
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('c', c);

function PresentationEdit() {
  const { presentationId, slideIndex } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [allPresentations, setAllPresentations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditTitleModal, setShowEditTitleModal] = useState(false);
  const [showEditThumbnailModal, setShowEditThumbnailModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false); 
  const [editedTitle, setEditedTitle] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  const [currentSlideIndex, setCurrentSlideIndex] = useState(Number(slideIndex) - 1 || 0);

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
    width: 30,
    height: 20,
    fontSize: 1,
    color: '#000000',
    position: { x: 0, y: 0 }
  });

  const [isEditingElement, setIsEditingElement] = useState(false); // is txt editing
  const [editingElementId, setEditingElementId] = useState(null); // add editing elment logic


  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editingImageElementId, setEditingImageElementId] = useState(null);


  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [editingVideoElementId, setEditingVideoElementId] = useState(null);

  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editingCodeElementId, setEditingCodeElementId] = useState(null);

  // ! Function to handle setting selected element
  const [selectedElementId, setSelectedElementId] = useState(null);

  // TODO:................................................................

  // THis will update the url when switch slides
  useEffect(() => {
    if (presentation) {
      // only update the slideshowd deck, not the whole page.
      window.history.replaceState(null, '', `/edit/${presentationId}/slide/${currentSlideIndex + 1}`);
    }
  }, [currentSlideIndex, presentation, presentationId]);

  // TODO: ..............................................................

  const [defaultBackground, setDefaultBackground] = useState({
    type: 'solid', 
    value: '#ffffff', 
  });
  
  const [currentSlideBackground, setCurrentSlideBackground] = useState({
    type: 'solid', 
    value: '', 
  });
  
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [backgroundError, setBackgroundError] = useState('');

  const [transitionStyle, setTransitionStyle] = useState({});

  // Handle dragging element
  const handleDragMouseDown = (e, elementId) => {
    e.preventDefault();
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
    width: 50,
    height: 50,
    autoplay: false,
    position: { x: 0, y: 0 }
  });

  const handleAddImageElement = () => {
    if (isEditingImage && editingImageElementId) {
      // eddit logic
      const updatedSlides = presentation.slides.map((slide, index) =>
        index === currentSlideIndex
          ? {
              ...slide,
              elements: slide.elements.map(el =>
                el.id === editingImageElementId ? { ...el, ...newImageElement } : el
              ),
            }
          : slide
      );
  
      setPresentation({ ...presentation, slides: updatedSlides });
    } else {

      const newElement = {
        id: `element-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
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
    }
    setShowAddImageModal(false);
    setIsEditingImage(false);
    setEditingImageElementId(null);
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
      setIsEditingImage(true);
      setEditingImageElementId(elementId);
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



    // Function to reset newTextElement to default values
    const resetNewImageElement = () => {
      setNewImageElement({
        src: '',
        width: 50,
        height: 30,
        alt: '',
        position: { x: 0, y: 0 }
      });
    };

  const handleSetAsDefault = () => {
    if (!currentSlideBackground.value) {
      setBackgroundError('Please select a valid background to set as default.');
      return;
    }
  
    const newDefaultBackground = {
      ...currentSlideBackground,
      isDefaultColor: true, // Mark the new default background
    };
  
    // Update slides with the new default background
    const updatedSlides = presentation.slides.map((slide) => {
      // If the slide's background is marked as default or matches the previous default, update it
      if (
        slide.background?.isDefaultColor || 
        (!slide.background || // No custom background
          (slide.background.value === defaultBackground.value &&
            slide.background.type === defaultBackground.type))
      ) {
        return { ...slide, background: newDefaultBackground };
      }
  
      // Retain slides with custom backgrounds
      return {
        ...slide,
        background: {
          ...slide.background,
          isDefaultColor: false, // Mark other slides as not default
        },
      };
    });
  
    setDefaultBackground(newDefaultBackground);
    setPresentation({ ...presentation, slides: updatedSlides });
    setShowBackgroundModal(false); // Close modal
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
    const newSlide = {
      id: `slide-${Date.now()}`,
      elements: [],
      background: { ...defaultBackground, isDefaultColor: true }, 
    };
  
    setPresentation({
      ...presentation,
      slides: [...presentation.slides, newSlide],
    });

    setTransitionStyle({
      opacity: 0,
      transform: 'translateX(10%)', 
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    });



    setTimeout(() => {
      setCurrentSlideIndex(presentation.slides.length);
      setTransitionStyle({
        opacity: 1,
        transform: 'translateX(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      });
    }, 500); 
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
      setTransitionStyle({
        opacity: 0,
        transform: 'translateX(-10%)', 
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      });
  
      setTimeout(() => {
        setCurrentSlideIndex(currentSlideIndex + 1);
        setTransitionStyle({
          opacity: 1,
          transform: 'translateX(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        });
      }, 500); 
    }
  };
  
  const navigateToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setTransitionStyle({
        opacity: 0,
        transform: 'translateX(10%)', 
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      });
  
      setTimeout(() => {
        setCurrentSlideIndex(currentSlideIndex - 1);
        setTransitionStyle({
          opacity: 1,
          transform: 'translateX(0)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        });
      }, 500); 
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
      hljs.highlightAll();
    }
  }, [presentation, currentSlideIndex]);

  useEffect(() => {
    if (!currentSlideBackground.value) {
      setCurrentSlideBackground({ ...defaultBackground });
    }
  }, [showBackgroundModal]);
  
  

  if (!presentation) {
    return <div>Loading.....</div>;
  }

  // function that save and back to dashboard
  const handleBackAndSave = () => {
    saveUpdatedThumbnail(); 
    navigate('/dashboard');
  };



  return (
    <div className="flex flex-row min-h-screen space-x-4 bg-gradient-to-r from-slate-500 to-slate-300">
      {/*Sidebar on left */}
      <div className="flex flex-col w-1/8 bg-black justify-between p-4">
        {/* Back button refine later */}
        <div className="flex flex-col text-white font-extralight">
          <HiHome 
            onClick={handleBackAndSave} 
            className="text-platinumLight w-11 h-11 cursor-pointer hover:scale-125 transition-transform duration-200" 
          />
          <span>Home</span>
        </div>
        
        <div className="flex flex-col text-white font-extralight">
          <HiEye
            onClick={async () => {
              await saveUpdatedThumbnail();
              window.open(`/preview/${presentationId}/slide/${currentSlideIndex + 1}`, '_blank');
            }}
            className="text-platinumLight w-11 h-11 cursor-pointer hover:scale-125 transition-transform duration-200" 
          />
          <span className="ml-1">View</span>
        </div>
        
        <div className="flex flex-col text-white font-extralight">
          <HiPencil
            onClick={() => setShowAddTextModal(true)}
            className="text-platinumLight w-11 h-11 cursor-pointer hover:scale-125 transition-transform duration-200" 
          />
          <span className="ml-1">Text</span>
        </div>
        
        <div className="flex flex-col text-white font-extralight">
          <AiFillFileImage
            onClick={() => setShowAddImageModal(true)} 
            className="text-platinumLight w-11 h-11 cursor-pointer hover:scale-125 transition-transform duration-200" 
          />
          <span>Image</span>
        </div>

        <div className="flex flex-col text-white font-extralight">
          <HiVideoCamera 
            onClick={() => {
              
              setShowAddVideoModal(true);
            }}
            className="text-platinumLight w-11 h-11 cursor-pointer hover:scale-125 transition-transform duration-200"
          />
          <span>Video</span>
        </div>

        <div className="flex flex-col text-white font-extralight">
          <HiCommandLine
            onClick={() => {
              
              // Reset to add modal mode
              setIsEditingCode(false); 
              setEditingCodeElementId(null); 
              setShowAddCodeModal(true);
            }}
            className="text-platinumLight w-11 h-11 cursor-pointer hover:scale-125 transition-transform duration-200"
          />  
          <span className="ml-0.5">Code</span>
        </div>
        
        <div className="flex flex-col text-white font-extralight">
          <HiTrash  
            onClick={() => setShowDeleteModal(true)} 
            className="text-platinumLight w-11 h-11  hover:scale-125 transition-transform duration-200"
          />
          <span>Delete</span>
        </div>

      </div>

      {/* Presentation area*/}
      <div className="flex flex-col flex-grow p-2 space-y-4">
        {/*Title and Thumbnail */}
        <div className="flex flex-row items-center justify-between  mt-4">
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
                Thumbnail
              </span>
            )}
            
            <HiArrowUpOnSquare
                onClick={() => setShowEditThumbnailModal(true)}
                className=" bottom-1 right-1 text-primaryBlue w-7 h-7 cursor-pointer hover:scale-125 transition-transform duration-200"
            />
          </div>
          
          {/* Title 区域 */}
          <div className="flex-1 flex flex-row items-center justify-center space-x-2 pr-10">
            <h2 className="text-3xl font-bold flex items-center justify-center">{presentation.name}</h2>
            <AiFillEdit
              onClick={() => setShowEditTitleModal(true)}
              className="text-primaryBlue w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </div>
        </div>
        


        {/* Slideshow deck */}
        <div className="flex flex-row flex-grow space-x-4">

          {/* Slide area refine later for shadow*/}
          <div className="flex-grow flex items-center justify-center   rounded-lg">
            {/* show slides */}
            <div className="relative w-full max-w-5xl aspect-[16/9] bg-gray-200 flex items-center justify-center rounded-lg"
                style={{
                  ...transitionStyle,
                  background:
                    presentation.slides[currentSlideIndex].background?.type === 'image'
                      ? `url(${presentation.slides[currentSlideIndex].background.value})`
                      : presentation.slides[currentSlideIndex].background?.type === 'gradient'
                      ? presentation.slides[currentSlideIndex].background.value
                      : presentation.slides[currentSlideIndex].background?.value || 
                        (defaultBackground.type === 'image'
                          ? `url(${defaultBackground.value})`
                          : defaultBackground.type === 'gradient'
                          ? defaultBackground.value
                          : defaultBackground.value),
                  backgroundSize:
                    presentation.slides[currentSlideIndex].background?.type === 'image' ||
                    defaultBackground.type === 'image'
                      ? 'cover'
                      : 'initial',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}>
              
              {/* Slide Index */}
              <div className="absolute bottom-2 left-2 text-lg text-gray-700 w-12 h-12 flex items-center justify-center"
                style={{ zIndex: 1000 }}
              >
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
                          e.preventDefault();
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
                        className="absolute w-3 h-3 bg-blue-500 cursor-pointer"
                        style={{ top: '-5px', left: '-5px' }}
                        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'top-left')}
                      />
                      {/* Top-right handle */}
                      <div
                        className="absolute w-3 h-3 bg-blue-500 cursor-pointer"
                        style={{ top: '-5px', right: '-5px' }}
                        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'top-right')}
                      />
                      {/* Bottom-left handle */}
                      <div
                        className="absolute w-3 h-3 bg-blue-500 cursor-pointer"
                        style={{ bottom: '-5px', left: '-5px' }}
                        onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'bottom-left')}
                      />
                      {/* Bottom-right handle */}
                      <div
                        className="absolute w-3 h-3 bg-blue-500 cursor-pointer"
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
          <div className="w-1/8 flex flex-col space-y-6">
            
            <HiTrash  
              onClick={() => deleteSlide(presentation.slides[currentSlideIndex].id)}
              className=" w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200"
            />

            <HiEyeDropper 
              onClick={() => setShowBackgroundModal(true)}
              className=" w-8 h-8 cursor-pointer hover:scale-110 transition-transform duration-200"
            />

          </div>

        </div>
        
        {/* Control Panel */}
        <div className="flex flex-row items-center justify-between  p-1 rounded-lg  space-x-2">


          {/* Add Slide 按钮 */}

          <div className="flex-1 flex justify-center">
      
            <HiOutlinePlusCircle 
              onClick={addSlide}
              className="w-12 h-12  text-black cursor-pointer hover:scale-110 transition-transform duration-200"
            />
          </div>

          {/* <button
            onClick={() => setShowBackgroundModal(true)}
            className="px-4 py-2 bg-primaryBlue text-white rounded-lg hover:bg-blue-600"
          >
            Set Backgroudcolor
          </button> */}
          
          {/* Previous and Next Slide Buttons */}
          <div className="flex flex-row items-center space-x-4">
            {/* Previous Slide Button */}
            <HiChevronLeft
              onClick={currentSlideIndex > 0 ? navigateToPreviousSlide : undefined}
              className={`w-10 h-10 cursor-pointer transition-transform duration-200 ${
                currentSlideIndex === 0 ? "text-gray-400 cursor-not-allowed" : "text-black hover:scale-125"
              }`}
            />

            {/* Next Slide Button */}
            <HiChevronRight
              onClick={currentSlideIndex < presentation.slides.length - 1 ? navigateToNextSlide : undefined}
              className={`w-10 h-10 cursor-pointer transition-transform duration-200 ${
                currentSlideIndex === presentation.slides.length - 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-black hover:scale-125"
              }`}
            />
          </div>


        </div>




      </div>
      
      <div className="relative">
      {/* Error Modal for Last Slide Deletion */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        style={{ zIndex: 1000 }}
        >
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 1000 }}
        >
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 1000 }}
        >
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          style={{ zIndex: 1000 }}
        >
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
          className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center"
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
        className="fixed inset-0  bg-black bg-opacity-50 flex items-center justify-center"
        style={{ zIndex: 1000 }} 
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {isEditingImage ? 'Edit Image' : 'Add Image'}
            </h3>
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
            <div className="flex justify-end space-x-2">
              <button onClick={() => {
                setShowAddImageModal(false)
                setIsEditingImage(false);
                setEditingImageElementId(null);
                resetNewImageElement();
              }} 
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              
              <button 
                onClick={() => {
                  if (isEditingImage) {
                    handleAddImageElement();
                    resetNewImageElement();
                  } else {
                    handleAddImageElement();
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {isEditingImage ? 'Save' : 'Add'}
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
              value={newCodeElement.fontSize}
              onChange={(e) => setNewCodeElement({ ...newCodeElement, fontSize: e.target.value })}
              placeholder="Font Size (em)"
              className="border p-2 w-full mb-4 rounded"
            />
            
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

      {showBackgroundModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 2001,
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              width: '24rem',
              maxWidth: '90%',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1a202c' }}>
              Set Background
            </h3>

            {/* Background Type Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                Background Type:
              </label>
              <select
                value={currentSlideBackground.type || defaultBackground.type}
                onChange={(e) =>
                  setCurrentSlideBackground({ ...currentSlideBackground, type: e.target.value })
                }
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              >
                <option value="solid">Solid Color</option>
                <option value="gradient">Gradient</option>
                <option value="image">Image</option>
              </select>
            </div>

            {/* Solid Color Picker */}
            {currentSlideBackground.type === 'solid' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Color:
                </label>
                <input
                  type="color"
                  value={currentSlideBackground.value || defaultBackground.value}
                  onChange={(e) =>
                    setCurrentSlideBackground({ ...currentSlideBackground, value: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
              </div>
            )}

            {/* Gradient Color Picker */}
            {currentSlideBackground.type === 'gradient' && (
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Gradient Colors:
                </label>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Color From:
                    </label>
                    <input
                      type="color"
                      value={currentSlideBackground.colorFrom || '#ffffff'}
                      onChange={(e) => {
                        const newColorFrom = e.target.value;
                        setCurrentSlideBackground((prev) => {
                          const updatedBackground = {
                            ...prev,
                            colorFrom: newColorFrom,
                            value: `linear-gradient(to right, ${newColorFrom}, ${prev.colorTo || '#000000'})`,
                          };
                          return updatedBackground;
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      Color To:
                    </label>
                    <input
                      type="color"
                      value={currentSlideBackground.colorTo || '#000000'}
                      onChange={(e) => {
                        const newColorTo = e.target.value;
                        setCurrentSlideBackground((prev) => {
                          const updatedBackground = {
                            ...prev,
                            colorTo: newColorTo,
                            value: `linear-gradient(to right, ${prev.colorFrom || '#ffffff'}, ${newColorTo})`,
                          };
                          return updatedBackground;
                        });
                      }}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Image URL Input */}
            {currentSlideBackground.type === 'image' && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Image URL:
                </label>
                <input
                  type="text"
                  placeholder="Enter image URL"
                  value={currentSlideBackground.value || ''}
                  onChange={(e) => {
                    setBackgroundError(''); // Reset error on input change
                    setCurrentSlideBackground({ ...currentSlideBackground, value: e.target.value });
                  }}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                {backgroundError && (
                  <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    {backgroundError}
                  </div>
                )}
                {currentSlideBackground.value && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <img
                      src={currentSlideBackground.value}
                      alt="Background Preview"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                      }}
                      onError={() => setBackgroundError('Invalid image URL. Please check the URL.')}
                    />
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={handleSetAsDefault}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Set as Default
              </button>
              <button
                onClick={() => {
                  setShowBackgroundModal(false);
                  setBackgroundError(''); // Reset error when modal closes
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setBackgroundError('');
                  if (currentSlideBackground.type === 'image') {
                    if (!currentSlideBackground.value) {
                      setBackgroundError('Image URL cannot be empty. Please enter a valid URL.');
                      return;
                    }
                    const image = new Image();
                    image.onload = () => {
                      const updatedSlides = presentation.slides.map((slide, idx) =>
                        idx === currentSlideIndex
                          ? { ...slide, background: currentSlideBackground }
                          : slide
                      );
                      setPresentation({ ...presentation, slides: updatedSlides });
                      setShowBackgroundModal(false);
                    };
                    image.onerror = () => {
                      setBackgroundError('Invalid image URL. Please check the URL.');
                    };
                    image.src = currentSlideBackground.value; // Trigger the image validation
                  } else {
                    const updatedSlides = presentation.slides.map((slide, idx) =>
                      idx === currentSlideIndex
                        ? { ...slide, background: currentSlideBackground }
                        : slide
                    );
                    setPresentation({ ...presentation, slides: updatedSlides });
                    setShowBackgroundModal(false);
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
    </div>
  );
}

export default PresentationEdit;


