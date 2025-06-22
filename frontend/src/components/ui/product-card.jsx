import { Star, ShoppingCart, Heart, Loader2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import useIntersectionObserver from "../../hooks/useIntersectionObserver";
import { ADD_TO_CART } from "../../lib/api-client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { axiosInstance, getConfig } from "../../utils/request";
import { Link } from "react-router-dom";
import { getProductImageUrl } from "../../utils/imageUtils";

// Helper function to format price
const formatPrice = (price) => {
  return `₹${price.toLocaleString()}`;
};

const ProductCard = ({ product, priority = false }) => {
  // console.log(product)
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [avgRating,setAvgRating]=useState(0)
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cardRef, isInView] = useIntersectionObserver({
    threshold: 0.1,
    triggerOnce: true,
  });
  // Use the updated cart context
  const { cart, addToCart } = useCart();
  const [auth] = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  // Effect to automatically cycle through images every 3 seconds
  useEffect(()=>{
    let reviewsCount=0;
    if (product.reviews && product.reviews.length > 0) {
      reviewsCount = product.reviews.length;
      console.log(reviewsCount)
      const totalRating = product.reviews.reduce((sum, review) => sum + (review.reviewStars || 0), 0);
      
      setAvgRating(reviewsCount > 0 ? totalRating / reviewsCount : 0);
    }
  },[])
  useEffect(() => {
    let imageInterval;
    // Only start cycling if the product has multiple images and is in view
    if (product?.images && product.images.length > 1 && isInView) {
      imageInterval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % product.images.length
        );
      }, 3000);
    }

    // Clean up interval on unmount
    return () => {
      if (imageInterval) clearInterval(imageInterval);
    };
  }, [product?.images, isInView]);

  // Calculate discount percentage
  const discountPercentage = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  // Handle adding product to cart
  const handleAddToCart = async (product) => {
    try {
      setIsAdding(true);
      await addToCart(product);
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Error adding product to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      ref={cardRef}
      className={`group relative flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full transition-all duration-300 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      {/* Product Image with Auto-Cycling Effect */}
      <div className="relative">
        <Link to={`/product/${product.slug}`} className="block">
          <div className="aspect-square w-full overflow-hidden relative">
            {/* Main Image */}
            {product?.images && product.images.length > 0 && (
              <div className="relative w-full h-full">
                {product.images.map((image, index) => (                  <img
                    key={index}
                    src={getProductImageUrl(image)}
                    alt={`${product.name} ${
                      index === 0 ? "main" : "view " + index
                    }`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                      index === currentImageIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                    }`}
                    onLoad={index === 0 ? handleImageLoad : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Product badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 z-20">
          {product.feature && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.feature}
            </span>
          )}
          {product.discount > 0 && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount}% Off
            </span>
          )}
          {product.isSoldOut && (
            <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick action buttons - always visible now */}
        <div className="absolute right-2 top-2 flex flex-col gap-2 z-20">
          {/* <button
            className="bg-white text-gray-800 p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart className="h-4 w-4" />
          </button> */}
          <button
            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full shadow transition-colors"
            onClick={() => handleAddToCart(product)}
            disabled={product.isSoldOut || isAdding}
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4 fill-white" />
          </button>
        </div>

        {/* Image indicators for multi-image products */}
        {product?.images && product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
            {product.images.map((_, index) => (
              <span
                key={index}
                className={`w-1.5 h-1.5 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              ></span>
            ))}
          </div>
        )}
      </div>      {/* Product Info */}
      <div className="flex flex-col p-4">
        <span className="text-xs text-gray-500 mb-1">
          {/* Handle both object reference and string cases */}
          {product.collection && typeof product.collection === "object"
            ? product.collection.name
            : product.collection}
        </span>
        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < Math.floor(avgRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">
            ({Math.floor(avgRating)})
          </span>
        </div>
        <div className="flex items-center mt-auto">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Add to Cart Button (shown on mobile) */}
      <button
        className={`md:hidden py-2 px-4 w-full transition-colors  bg-orange-500 hover:bg-orange-600text-white`}
        onClick={() => handleAddToCart(product)}
        disabled={product.isSoldOut || isAdding}
      >
        {isAdding ? (
          <span className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Adding...
          </span>
        ) : product.isSoldOut ? (
          "Sold Out"
        ) :  (
          "Add to Cart"
        )}
      </button>
    </div>
  );
};

export default ProductCard;
