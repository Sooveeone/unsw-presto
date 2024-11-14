import { useEffect, useState } from 'react';
import { useParams , useNavigate} from 'react-router-dom';
import axios from '../axiosConfig';
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

function PresentationPreview() {
  const { presentationId, slideIndex } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(Number(slideIndex) - 1 || 0);

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
  }, [currentSlideIndex, presentationId, navigate]);

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

  if (!presentation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Slide area */}
      <div className="relative w-full max-w-5xl aspect-[16/9] bg-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
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
            ) : element.type === 'code' ? (
              <pre style={{ fontSize: `${element.fontSize}em`, color: element.color }}>
                {element.text}
              </pre>
            ) : null}
          </div>
        ))}
      </div>

      {/* Slide navigation */}
      <div className="flex flex-row items-center justify-between mt-4 w-full max-w-5xl">
        {/* Previous Slide Button */}
        <HiChevronLeft
          onClick={currentSlideIndex > 0 ? navigateToPreviousSlide : undefined}
          className={`w-12 h-12 cursor-pointer transition-transform duration-200 ${
            currentSlideIndex === 0 ? "text-gray-400 cursor-not-allowed" : "text-white hover:scale-110"
          }`}
        />

        {/* Slide Index */}
        <div className="text-lg">
          Slide {currentSlideIndex + 1} of {presentation.slides.length}
        </div>

        {/* Next Slide Button */}
        <HiChevronRight
          onClick={currentSlideIndex < presentation.slides.length - 1 ? navigateToNextSlide : undefined}
          className={`w-12 h-12 cursor-pointer transition-transform duration-200 ${
            currentSlideIndex === presentation.slides.length - 1
              ? "text-gray-400 cursor-not-allowed"
              : "text-white hover:scale-110"
          }`}
        />
      </div>
    </div>
  );
}

export default PresentationPreview;
