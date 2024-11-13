import React from 'react';

const SlideShowDeck = ({ presentation, currentSlideIndex }) => (
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
);

export default SlideShowDeck;