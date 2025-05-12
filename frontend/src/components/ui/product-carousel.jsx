import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';

const ProductCarousel = ({ 
  title, 
  subtitle, 
  children, 
  autoScroll = true, 
  scrollInterval = 5000,
  slidesToShow = 4
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const totalItems = React.Children.count(children);
  const carouselRef = useRef(null);
  const scrollerRef = useRef(null);
  const [containerRef, inView] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true
  });
  
  // Responsive slides calculation
  const responsiveSlidesToShow = () => {
    if (typeof window === 'undefined') return slidesToShow;
    
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 768) return 2;
    if (window.innerWidth < 1024) return 3;
    return slidesToShow;
  };
  
  const actualSlidesToShow = responsiveSlidesToShow();
  const maxIndex = Math.max(0, totalItems - actualSlidesToShow);
  
  // Add window resize listener for responsive slidesToShow
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render to update actualSlidesToShow
      setCurrentIndex(prev => Math.min(prev, Math.max(0, totalItems - responsiveSlidesToShow())));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [totalItems]);
  
  // Auto scroll functionality
  useEffect(() => {
    if (!autoScroll || isHovered || !inView) return;
    
    const interval = setInterval(() => {
      if (currentIndex >= maxIndex) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, scrollInterval);
    
    return () => clearInterval(interval);
  }, [autoScroll, currentIndex, isHovered, maxIndex, scrollInterval, inView]);
  
  // Animate carousel entrance
  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);
  
  // Scroll to current index
  useEffect(() => {
    if (!scrollerRef.current) return;
    
    const scrollToIndex = () => {
      const itemWidth = scrollerRef.current.querySelector('.carousel-item')?.offsetWidth || 0;
      
      if (itemWidth) {
        const distance = currentIndex * itemWidth;
        scrollerRef.current.scrollTo({
          left: distance,
          behavior: 'smooth',
        });
      }
    };
    
    scrollToIndex();
    
  }, [currentIndex]);
  
  const goToPrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  return (
    <div 
      ref={containerRef}
      className={`${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} transition-all duration-700 ease-out`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section header */}
      <div className="text-center mb-8">
        {subtitle && (
          <span className="text-orange-500 font-medium mb-2 block">{subtitle}</span>
        )}
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{title}</h2>
        )}
        <div className="h-1 w-16 bg-orange-500 mx-auto rounded-full"></div>
      </div>
      
      {/* Carousel container */}
      <div ref={carouselRef} className="relative group">
        {/* Navigation buttons - only show if more items than visible slides */}
        {maxIndex > 0 && (
          <>
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 md:p-3 -ml-4 md:-ml-6 transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50",
                "opacity-0 group-hover:opacity-100",
                currentIndex === 0 ? "cursor-not-allowed text-gray-300" : "text-gray-800 hover:text-orange-500"
              )}
              aria-label="Previous slides"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            
            <button
              onClick={goToNext}
              disabled={currentIndex >= maxIndex}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-2 md:p-3 -mr-4 md:-mr-6 transition-all duration-300",
                "focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50",
                "opacity-0 group-hover:opacity-100",
                currentIndex >= maxIndex ? "cursor-not-allowed text-gray-300" : "text-gray-800 hover:text-orange-500"
              )}
              aria-label="Next slides"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </>
        )}
        
        {/* Scrollable carousel */}
        <div 
          ref={scrollerRef}
          className="flex overflow-x-auto scrollbar-hide snap-mandatory snap-x scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {React.Children.map(children, (child, index) => (
            <div 
              className={cn(
                'carousel-item flex-none px-2 snap-start',
                {
                  'w-full': actualSlidesToShow === 1,
                  'w-1/2': actualSlidesToShow === 2,
                  'w-1/3': actualSlidesToShow === 3,
                  'w-1/4': actualSlidesToShow === 4,
                  'w-1/5': actualSlidesToShow === 5,
                }
              )}
            >
              {/* Only render items that are visible or close to the viewport for performance */}
              {(Math.abs(index - currentIndex) <= actualSlidesToShow * 1.5) && 
                React.cloneElement(child, {
                  // Pass priority prop to images in the currently visible slides
                  priority: index >= currentIndex && index < currentIndex + actualSlidesToShow
                })
              }
            </div>
          ))}
        </div>
        
        {/* Dot indicators */}
        {totalItems > actualSlidesToShow && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentIndex === index ? "bg-orange-500 w-4" : "bg-gray-300 hover:bg-gray-400"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCarousel;
