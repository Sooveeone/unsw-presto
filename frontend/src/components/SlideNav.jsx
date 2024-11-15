// SlideNavigationButtons.jsx
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

const SlideNavigationButtons = ({ navigateToPreviousSlide, navigateToNextSlide, currentSlideIndex, totalSlides }) => (
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
      onClick={currentSlideIndex < totalSlides - 1 ? navigateToNextSlide : undefined}
      className={`w-8 h-8 cursor-pointer transition-transform duration-200 ${
        currentSlideIndex === totalSlides - 1 ? "text-gray-400 cursor-not-allowed" : "text-primaryBlue hover:scale-110"
      }`}
    />
  </div>
);

export default SlideNavigationButtons;