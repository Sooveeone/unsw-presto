import React, { useEffect, useState, useRef } from 'react';
import { useParams , useNavigate} from 'react-router-dom';
import axios from '../axiosConfig';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('c', c);

function PresentationPreview() {
  const { presentationId, slideIndex } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(Number(slideIndex) - 1 || 0);
  const [transitionStyle, setTransitionStyle] = useState({});
  const [defaultBackground, setDefaultBackground] = useState({
    type: 'solid', 
    value: '#ffffff', 
  });
  // Fetch presentations on mount
  useEffect(() => {
    const fetchPresentation = async () => {
      try {
        const response = await axios.get('/store', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const presentationsData = response.data.store.presentations || [];
        const presentationData = presentationsData.find((p) => p.id === presentationId);
        if (presentationData) {
          setPresentation(presentationData);
        }
      } catch (error) {
        console.error('Failed to fetch presentation:', error);
      }
    };

    fetchPresentation();
  }, [presentationId]);

  // Update URL whenever slide index changes
  
  useEffect(() => {
    navigate(`/preview/${presentationId}/slide/${currentSlideIndex + 1}`, { replace: true });
    // need to wait navigate then highlight the code
    setTimeout(() => {
        const codeElements = document.querySelectorAll('code[class^="language-"]');
        codeElements.forEach((codeElement) => {
          hljs.highlightElement(codeElement);
        });
      }, 200);
  }, [currentSlideIndex, presentationId, navigate]);

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

  const renderCodeElement = (element) => {
    return (
      <pre data-id={element.id}>
        <code className={`language-${element.language}`}>
          {element.code}
        </code>
      </pre>
    );
  };
  

  if (!presentation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
      {/* Slide area */}
      <div className="relative w-full aspect-[16/9] bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden"
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
          }}
      >
        {/* Render elements */}
        {presentation.slides[currentSlideIndex].elements.map((element) => (
          <div
            key={element.id}
            style={{
              position: 'absolute',
              top: `${element.position.y}%`,
              left: `${element.position.x}%`,
              width: `${element.width}%`,
              height: `${element.height}%`,
              fontSize: element.type === 'text' ? `${element.fontSize}em` : 'initial',
              color: element.color,
              zIndex: element.zIndex,
            }}
            className="overflow-hidden"
          >
            {element.type === 'text' ? (
              element.text
            ) : element.type === 'image' ? (
              <img src={element.src} alt={element.alt} className="object-cover w-full h-full" />
            ) : element.type === 'video' ? (
              <iframe
                src={`${element.src}${element.autoplay ? '?autoplay=1' : ''}`}
                width="100%"
                height="100%"
                allow="autoplay"
                frameBorder="0"
                allowFullScreen
                className="object-cover"
              />
            ) : element.type === 'code' ? renderCodeElement(element) : null}
          </div>
        ))}
      </div>

      {/* Slide navigation */}
  <div className="absolute bottom-4 left-4 text-2xl bg-black bg-opacity-80 rounded-lg p-2"
    style={{ zIndex: 1000 }}
  >
    {currentSlideIndex + 1} of {presentation.slides.length}
  </div>
 {/* Navigation buttons container in the right bottom */}
 <div className="absolute bottom-4 right-4 flex items-center space-x-4 bg-black bg-opacity-80 p-3 rounded-lg"
    style={{ zIndex: 1000 }}
 >
    {/* Previous Slide Button */}
    <HiChevronLeft
      onClick={currentSlideIndex > 0 ? navigateToPreviousSlide : undefined}
      className={`w-10 h-10 cursor-pointer transition-transform duration-200 ${
        currentSlideIndex === 0 ? "text-gray-400 cursor-not-allowed" : "text-white hover:scale-125"
      }`}
    />
    {/* Next Slide Button */}
    <HiChevronRight
      onClick={currentSlideIndex < presentation.slides.length - 1 ? navigateToNextSlide : undefined}
      className={`w-10 h-10 cursor-pointer transition-transform duration-200 ${
        currentSlideIndex === presentation.slides.length - 1
          ? "text-gray-400 cursor-not-allowed"
          : "text-white hover:scale-125"
      }`}
    />
  </div>
    </div>
  );
}

export default PresentationPreview;
