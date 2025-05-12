import React, { useState, useEffect } from 'react';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import { generateSrcSet, imageSizes } from '../../lib/imageOptimization';

/**
 * Optimized image component with lazy loading, blur-up effect, and responsive sizing
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = '',
  objectFit = 'cover',
  priority = false,
  blurDataURL = null,
  sizes = '100vw',
  onLoad = () => {},
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [ref, isInView] = useIntersectionObserver({
    triggerOnce: true,
    rootMargin: '200px 0px', // Load images 200px before they enter viewport
  });
  // Check if this is a backend API image
  const isBackendImage = src && (src.includes('/image/') || src.includes('/uploads/'));
  
  // Generate srcset for responsive images if available (not for backend images)
  const srcSet = src && !isBackendImage ? generateSrcSet(src) : '';
  
  // Handle image load event
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  // If priority is true, we want to load the image immediately
  const shouldLoad = priority || isInView;

  return (
    <div 
      ref={!priority ? ref : null}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Show blur placeholder until image is loaded */}
      {blurDataURL && !isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 blur-sm scale-105 transform"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      
      {/* Loading indicator as a subtle background animation */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      {/* Actual image */}
      {shouldLoad && (
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleLoad}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchpriority={priority ? 'high' : 'auto'}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            objectFit,
            width: '100%',
            height: '100%' 
          }}
          {...props}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
