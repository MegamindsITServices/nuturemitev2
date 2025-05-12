/**
 * Helper utilities for optimizing images and improving Core Web Vitals
 */

/**
 * Creates an image srcset for responsive images
 * @param {string} baseUrl - The base URL of the image
 * @param {Array} sizes - Array of width sizes to generate
 * @param {string} format - Image format extension (jpg, png, webp, avif)
 * @returns {string} The srcset attribute value
 */
export const generateSrcSet = (baseUrl, sizes = [640, 768, 1024, 1280], format = 'webp') => {
  if (!baseUrl) return '';
  
  // If the URL contains the backend API path, just return the original URL
  // This prevents creating invalid URLs for images from our backend
  if (baseUrl.includes('/image/') || baseUrl.includes('/uploads/')) {
    return baseUrl;
  }
  
  // If the URL is already using a CDN with size parameters, extract the base
  const cloudinaryMatch = baseUrl.match(/\/upload\/(.*)\/v\d+\/(.*)/);
  if (cloudinaryMatch) {
    const [, transformations, filename] = cloudinaryMatch;
    
    return sizes
      .map(size => {
        const transformedUrl = baseUrl.replace(
          /\/upload\/(.*)\/v\d+\/(.*)/,
          `/upload/w_${size},c_limit,q_auto,f_${format}/$2`
        );
        return `${transformedUrl} ${size}w`;
      })
      .join(', ');
  }
  
  // Handle regular URLs
  const urlWithoutExtension = baseUrl.replace(/\.(jpg|jpeg|png|webp|avif|gif)$/i, '');
  
  return sizes
    .map(size => `${urlWithoutExtension}-${size}.${format} ${size}w`)
    .join(', ');
};

/**
 * Determines appropriate sizes attribute for responsive images
 * @param {Object} options - Options for size calculation
 * @param {number} options.defaultSize - Default size as a percentage of viewport width
 * @param {Array} options.breakpoints - Array of breakpoint objects with size and width properties
 * @returns {string} The sizes attribute value
 */
export const imageSizes = ({ 
  defaultSize = 100,  
  breakpoints = [
    { size: 50, width: 640 },
    { size: 33, width: 768 },
    { size: 25, width: 1024 }
  ] 
} = {}) => {
  return breakpoints
    .map(({ size, width }) => `(min-width: ${width}px) ${size}vw`)
    .concat([`${defaultSize}vw`])
    .join(', ');
};

/**
 * Returns the most optimized format the browser supports
 * @returns {string} The most optimized format (webp, avif, or original)
 */
export const getOptimalFormat = () => {
  if (typeof document === 'undefined') return 'webp'; // Default for SSR
  
  // Check for AVIF support
  const avifSupport = document.createElement('canvas')
    .toDataURL('image/avif').indexOf('data:image/avif') === 0;
    
  if (avifSupport) return 'avif';
  
  // Check for WebP support
  const webpSupport = document.createElement('canvas')
    .toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
  if (webpSupport) return 'webp';
  
  return 'original';
};

/**
 * Adds a blur-up effect for images
 * @param {string} imageUrl - The URL of the image
 * @param {number} width - Tiny thumbnail width
 * @returns {Promise<string>} Base64 encoded tiny thumbnail
 */
export const generateBlurPlaceholder = async (imageUrl, width = 20) => {
  if (typeof window === 'undefined') return '';
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = img.naturalHeight / img.naturalWidth;
      canvas.width = width;
      canvas.height = Math.round(width * ratio);
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const blurredBase64 = canvas.toDataURL('image/jpeg', 0.1);
      resolve(blurredBase64);
    };
    
    img.onerror = () => {
      resolve('');
    };
  });
};
