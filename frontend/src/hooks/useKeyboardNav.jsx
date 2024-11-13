import { useEffect } from 'react';

const useKeyboardNavigation = (navigateToPreviousSlide, navigateToNextSlide) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') navigateToPreviousSlide();
      if (event.key === 'ArrowRight') navigateToNextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigateToPreviousSlide, navigateToNextSlide]);
};

export default useKeyboardNavigation;
