import config from '../config/environment';

// Get backend URL for images
const imageBaseUrl = config.getImageUrl();

/**
 * Generate a complete image URL from a path segment
 * @param {string} imageType - The type of image (image, banner, profile, collection, blog)
 * @param {string} imagePath - The image filename or path segment
 * @returns {string} The complete URL to the image
 */
export const getImageUrl = (imageType, imagePath) => {
  if (!imagePath) return null;
  
  // Handle cases where the full URL might already be included
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Handle cases where the path already contains the image type
  if (imagePath.includes('/image/') || 
      imagePath.includes('/banner/') || 
      imagePath.includes('/profile/') || 
      imagePath.includes('/collection/') ||
      imagePath.includes('/blog/')) {
    return `${imageBaseUrl}/${imagePath}`;
  }
  
  // Otherwise, construct the URL with the appropriate type
  return `${imageBaseUrl}/${imageType}/${imagePath}`;
};

/**
 * Generate a proper product image URL
 * @param {string} imagePath - The product image path or filename
 * @returns {string} The complete URL to the product image
 */
export const getProductImageUrl = (imagePath) => {
  return getImageUrl('image', imagePath);
};

/**
 * Generate a proper banner image URL
 * @param {string} imagePath - The banner image path or filename
 * @returns {string} The complete URL to the banner image
 */
export const getBannerImageUrl = (imagePath) => {
  return getImageUrl('banner', imagePath);
};

/**
 * Generate a proper profile image URL
 * @param {string} imagePath - The profile image path or filename
 * @returns {string} The complete URL to the profile image
 */
export const getProfileImageUrl = (imagePath) => {
  return getImageUrl('profile', imagePath);
};

/**
 * Generate a proper collection image URL
 * @param {string} imagePath - The collection image path or filename
 * @returns {string} The complete URL to the collection image
 */
export const getCollectionImageUrl = (imagePath) => {
  return getImageUrl('collection', imagePath);
};

/**
 * Generate a proper blog image URL
 * @param {string} imagePath - The blog image path or filename
 * @returns {string} The complete URL to the blog image
 */
export const getBlogImageUrl = (imagePath) => {
  return getImageUrl('blog', imagePath);
};

/**
 * Generate a proper video URL
 * @param {string} videoPath - The video path or filename
 * @returns {string} The complete URL to the video
 */
export const getVideoUrl = (videoPath) => {
  return getImageUrl('video', videoPath);
};
