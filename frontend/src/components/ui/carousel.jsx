import React, { useState, useEffect, useCallback, useRef } from "react";
import clsx from "clsx";

const animationStyles = {
  fadeIn: "transition-opacity duration-500 ease-in-out",
  zoomIn: "transition-transform duration-500 ease-in-out",
  slideFromTop: "transition-transform duration-500 ease-in-out",
  slideFromLeft: "transition-transform duration-500 ease-in-out",
};

const Carousel = ({ images, interval = 3000, className, priority = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState({});
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef(null);

  // Helper function to get image source regardless of object structure
  const getImageSource = (image) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.image || image.src || image.url || "";
  };

  // Helper function to get image alt text regardless of object structure
  const getImageAlt = (image, index) => {
    if (!image) return `Slide ${index + 1}`;
    if (typeof image === "string") return `Slide ${index + 1}`;
    return image.alt || `Slide ${index + 1}`;
  };

  // Preload images
  useEffect(() => {
    const preloadImages = () => {
      if (!images || images.length === 0) return;

      const imagePromises = images.map((image, index) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = getImageSource(image);
          img.onload = () => {
            setImagesLoaded((prev) => ({ ...prev, [index]: true }));
            resolve();
          };
          img.onerror = () => {
            console.error("Failed to load image:", getImageSource(image));
            resolve(); // Don't block on error
          };
        });
      });

      if (priority) {
        Promise.all([imagePromises[0]]);
      }
    };

    preloadImages();
  }, [images, priority]);

  // Auto slide
  useEffect(() => {
    if (!images || images.length === 0) return;

    const timer = setInterval(() => {
      goToNext();
    }, interval);
    return () => clearInterval(timer);
  }, [currentIndex, interval, images]);

  const goToSlide = useCallback(
    (index) => {
      if (!images || images.length === 0) return;
      if (index === currentIndex || isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    },
    [currentIndex, isTransitioning, images]
  );

  const goToPrev = useCallback(() => {
    if (!images || images.length === 0) return;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  }, [currentIndex, goToSlide, images]);

  const goToNext = useCallback(() => {
    if (!images || images.length === 0) return;
    const nextIndex = (currentIndex + 1) % images.length;
    goToSlide(nextIndex);
  }, [currentIndex, goToSlide, images]);

  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) goToNext();
    if (touchStart - touchEnd < -50) goToPrev();
  };

  // Lazy loading using Intersection Observer
  useEffect(() => {
    if (!carouselRef.current || priority || !images || images.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          images.forEach((image, index) => {
            if (!imagesLoaded[index]) {
              const img = new Image();
              img.src = getImageSource(image);
              img.onload = () => {
                setImagesLoaded((prev) => ({ ...prev, [index]: true }));
              };
            }
          });
          observer.unobserve(carouselRef.current);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(carouselRef.current);

    return () => {
      if (carouselRef.current) {
        observer.unobserve(carouselRef.current);
      }
    };
  }, [images, imagesLoaded, priority]);

  // If no images, show a placeholder
  if (!images || images.length === 0) {
    return (
      <div className={clsx("relative w-full overflow-hidden bg-gray-200", className)}>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No images to display</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={carouselRef}
      className={clsx(
        "relative w-full overflow-hidden",
        className,
        isTransitioning && "pointer-events-none"
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides */}
      <div className="relative h-full">
        {images.map((image, index) => {
          const isCurrent = index === currentIndex;
          const imageUrl = getImageSource(image);

          // Skip rendering if not loaded and not priority
          if (!priority && !imagesLoaded[index]) {
            return (
              <div key={index} className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-pulse h-8 w-8 rounded-full bg-gray-300"></div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className={clsx(
                "absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out",
                isCurrent ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
              aria-hidden={!isCurrent}
            >
              <img
                src={imageUrl}
                alt={getImageAlt(image, index)}
                className="w-full h-full object-cover object-center"
                loading={index === 0 && priority ? "eager" : "lazy"}
                fetchpriority={index === 0 && priority ? "high" : "auto"}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300"
            onClick={goToNext}
            aria-label="Next slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Indicator dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={clsx(
                "w-2 h-2 rounded-full transition-all duration-300 focus:outline-none",
                index === currentIndex ? "bg-white w-4" : "bg-white/50 hover:bg-white/80"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
