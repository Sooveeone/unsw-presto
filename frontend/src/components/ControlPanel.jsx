// ControlPanel.jsx
import { HiPlusCircle } from "react-icons/hi2";
import SlideNavigationButtons from './SlideNavigationButtons';

const ControlPanel = ({ addSlide, navigateToPreviousSlide, navigateToNextSlide, currentSlideIndex, presentation }) => (
  <div className="flex flex-row items-center justify-between p-1 rounded-lg shadow-md">
    {/* Add Slide 按钮 */}
    <div className="flex-1 flex justify-center">
      <HiPlusCircle
        onClick={addSlide}
        className="w-10 h-10 text-primaryBlue cursor-pointer hover:scale-110 transition-transform duration-200"
      />
    </div>
    {/* Previous and Next Slide Buttons */}
    <SlideNavigationButtons
      navigateToPreviousSlide={navigateToPreviousSlide}
      navigateToNextSlide={navigateToNextSlide}
      currentSlideIndex={currentSlideIndex}
      totalSlides={presentation.slides.length}
    />
  </div>
);

export default ControlPanel;