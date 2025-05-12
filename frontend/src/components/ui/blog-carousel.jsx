import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const BlogCarousel = ({ 
  title, 
  subtitle, 
  children, 
  autoScroll = true, 
  scrollInterval = 5000,
  slidesToShow = 4
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalItems = React.Children.count(children);
  const carouselRef = useRef(null);
  
  const getResponsiveSlidesToShow = () => {
    if (typeof window === 'undefined') return slidesToShow;
    
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return slidesToShow;
  };
  
  const [responsiveSlides, setResponsiveSlides] = useState(getResponsiveSlidesToShow());
  const maxIndex = Math.max(0, totalItems - responsiveSlides);
  
  useEffect(() => {
    const handleResize = () => {
      const newResponsiveSlides = getResponsiveSlidesToShow();
      setResponsiveSlides(newResponsiveSlides);
      setCurrentIndex(prev => Math.min(prev, Math.max(0, totalItems - newResponsiveSlides)));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalItems]);
  
  useEffect(() => {
    let intervalId;
    
    if (autoScroll && !isHovered && totalItems > responsiveSlides) {
      intervalId = setInterval(() => {
        setCurrentIndex(prevIndex => {
          // Loop back to 0 if reached the end
          if (prevIndex >= maxIndex) {
            return 0;
          }
          return prevIndex + 1;
        });
      }, scrollInterval);
    }
    
    return () => intervalId && clearInterval(intervalId);
  }, [autoScroll, isHovered, scrollInterval, totalItems, responsiveSlides, maxIndex]);
  
  const goToNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Loop back to start
      setCurrentIndex(0);
    }
  };
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // Loop to end
      setCurrentIndex(maxIndex);
    }
  };
  
  const handleDotClick = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  return (
    <div className="w-full">
      {/* Header with Title and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 px-4">
        <div className="mb-4 sm:mb-0 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <div className="w-10 h-1 bg-orange-500 rounded"></div>
            {title && (
              <h2 className="text-3xl font-bold text-gray-900">
                <span className="text-black">{title.split(' ')[0]}</span>{' '}
                <span className="text-orange-600">{title.split(' ').slice(1).join(' ')}</span>
              </h2>
            )}
            <div className="w-10 h-1 bg-orange-500 rounded"></div>
          </div>
          {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
        </div>
        
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button 
            onClick={goToPrevious}
            className="bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 shadow-sm border border-gray-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={goToNext}
            className="bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2 shadow-sm border border-gray-200 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Carousel Container */}
      <div 
        className="relative overflow-hidden px-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        ref={carouselRef}
      >
        {/* Track */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / responsiveSlides)}%)`,
            width: `${(totalItems / responsiveSlides) * 100}%`
          }}
        >
          {/* Items */}
          {React.Children.map(children, (child, index) => (
            <div 
              className={cn(
                "px-3",
                {
                  "w-full sm:w-1/2 md:w-1/3 lg:w-1/4": slidesToShow === 4,
                  "w-full sm:w-1/2 md:w-1/3": slidesToShow === 3,
                  "w-full sm:w-1/2": slidesToShow === 2,
                  "w-full": slidesToShow === 1
                }
              )}
              key={index}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      
      {/* Dots */}
      {totalItems > responsiveSlides && (
        <div className="flex justify-center mt-6">
          {[...Array(Math.min(5, Math.ceil(totalItems / responsiveSlides)))].map((_, index) => {
            const isActive = index === Math.min(4, Math.floor(currentIndex / responsiveSlides));
            return (
              <button
                key={index}
                onClick={() => handleDotClick(index * responsiveSlides)}
                className={`mx-1 h-2 rounded-full transition-all ${
                  isActive ? 'w-6 bg-orange-500' : 'w-2 bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlogCarousel;
