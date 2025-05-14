import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, Heart, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { axiosInstance } from "../../utils/request";
import { GET_PRODUCT_BY_SLUG } from "../../lib/api-client";
import ProductImageGallery from "../../components/ui/product-image-gallery";
import { useCart } from "../../context/CartContext";
import { Badge } from "../../components/ui/badge";
import RelatedProducts from "../../components/product/RelatedProducts";
import ReviewDialog from "../../components/product/ReviewDialog";
import ProductReviews from "../../components/product/ProductReviews";
import { toast } from "sonner";

const ProductDetail = () => {  const [product, setProduct] = useState();
  const [loading, setLoading] = useState(true);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const params = useParams();
  const { addToCart } = useCart();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Replace :slug in the URL with the actual slug from params
        const url = GET_PRODUCT_BY_SLUG.replace(":slug", params.slug);
        const { data } = await axiosInstance.get(url);

        if (data?.product) {
          setProduct(data.product);
          
          // Set the reviews count and average rating from the API response
          if (data.product.reviewsCount !== undefined) {
            setReviewsCount(data.product.reviewsCount);
          }
          
          if (data.product.avgRating !== undefined) {
            setAverageRating(parseFloat(data.product.avgRating.toFixed(1)));
          }
          
          console.log("Product data:", data.product);
          setLoading(false);
        } else {
          console.error("No product data found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  // Fetch reviews for the product and calculate metrics
  const fetchReviews = async (productId) => {
    try {
      const response = await axiosInstance.get(`/api/reviews/product-reviews/${productId}`);
      if (response.data.success) {
        const reviews = response.data.reviews;
        setReviewsCount(reviews.length);
        
        // Calculate average rating
        if (reviews.length > 0) {
          const totalStars = reviews.reduce((sum, review) => sum + review.reviewStars, 0);
          const average = totalStars / reviews.length;
          setAverageRating(parseFloat(average.toFixed(1)));
        }
      }
    } catch (err) {
      console.error('Error fetching product reviews:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 flex justify-center items-center">
        <div className="animate-pulse flex flex-col gap-8 w-full max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2">
              <div className="bg-gray-200 rounded-lg h-96"></div>
              <div className="flex mt-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-200 rounded-lg h-20 w-20"
                  ></div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-20 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-16 px-4">
        <p className="text-center text-lg">Product not found.</p>
      </div>
    );
  }

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

  const handleOpenReviewDialog = () => {
    setIsReviewDialogOpen(true);
  };  const handleReviewSubmitted = async () => {
    setReviewSubmitted((prev) => !prev);
    
    // Refresh the entire product data to get updated review stats
    if (params.slug) {
      try {
        const url = GET_PRODUCT_BY_SLUG.replace(":slug", params.slug);
        const { data } = await axiosInstance.get(url);
        
        if (data?.product) {
          setProduct(data.product);
          
          // Update review stats
          if (data.product.reviewsCount !== undefined) {
            setReviewsCount(data.product.reviewsCount);
          }
          
          if (data.product.avgRating !== undefined) {
            setAverageRating(parseFloat(data.product.avgRating.toFixed(1)));
          }
        }
      } catch (error) {
        console.error("Error refreshing product data:", error);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 text-sm breadcrumbs">
        <ul className="flex space-x-2">
          <li>
            <Link to="/" className="text-gray-500 hover:text-primary">
              HOME
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li>
            <Link
              to={
                product.collection
                  ? `/products/collections/${product.collection.slug}`
                  : "/products"
              }
              className="text-gray-500 hover:text-primary"
            >
              {product.collection
                ? product.collection.name.toUpperCase()
                : "PRODUCTS"}
            </Link>
          </li>
        </ul>
      </div>{" "}
      <div className="flex flex-col lg:flex-row gap-8">        <div className="w-full lg:w-1/2">
          <ProductImageGallery
            images={product.images || []}
            videos={product.videos || []}
            productName={product.name || "Product"}
          />
        </div>

        {/* Product Info Section */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Product Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            {product.name || "Millet"}
          </h1>
          {product.subtitle && (
            <h2 className="text-2xl text-gray-700">{product.subtitle}</h2>
          )}{" "}          {/* Rating */}
          <div className="flex items-center gap-2">            <div className="flex cursor-pointer" onClick={handleOpenReviewDialog} title="Click to rate this product">
              {[...Array(5)].map((_, i) => {
                // Handle partial stars for more accurate representation
                if (i < Math.floor(averageRating)) {
                  // Full star
                  return (
                    <span key={i} className="text-xl text-yellow-400 transition-transform hover:scale-110">★</span>
                  );
                } else if (i === Math.floor(averageRating) && averageRating % 1 >= 0.5) {
                  // Half star (using CSS to display a half-filled star would be better, but this is a simple approach)
                  return (
                    <span key={i} className="text-xl text-yellow-400 transition-transform hover:scale-110 relative">
                      <span className="absolute">★</span>
                      <span className="text-gray-300 opacity-40">☆</span>
                    </span>
                  );
                } else {
                  // Empty star
                  return (
                    <span key={i} className="text-xl text-gray-300 transition-transform hover:scale-110">☆</span>
                  );
                }
              })}
            </div>

            <span className="text-gray-600">
              {averageRating}/5 • {reviewsCount} {reviewsCount === 1 ? 'Rating' : 'Ratings'} •
            </span>
            <button 
              className="text-primary font-medium hover:underline"
              onClick={handleOpenReviewDialog}
            >
              Rate this product
            </button>
          </div>
          <div className="pt-2">
            <div className="flex items-baseline">
              <Badge className="bg-green-600 text-white">{product.feature || "new"}</Badge>
            </div>
          </div>
          {/* Price */}
          <div className="pt-2">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">
                ₹{(product.price || 0).toLocaleString()}
              </span>
            </div>
            {product.originalPrice > product.price && (
              <div className="flex items-center mt-1">
                <span className="text-base text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
                <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  {Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  )}
                  % Off
                </span>
              </div>
            )}
          </div>
          {product.offers && product.offers.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">
                  {product.offers.length} Offers
                </span>
                <button className="ml-auto text-primary hover:underline text-sm">
                  View All &gt;
                </button>
              </div>
              {product.offers.map((offer, index) => (
                <div key={index} className="flex items-start gap-2 mt-2">
                  <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium">{offer.title}:</span>{" "}
                    {offer.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">Free Shipping</span>
              </div>
            </div>
          )}
          {/* Add to Cart Section */}
          <div className="pt-6 flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-gray-900 hover:bg-black text-white py-6 rounded-md"
            >
              <ShoppingBag className="mr-2 h-5 w-5" /> Add to Bag
            </Button>
            <Button
              variant="outline"
              className="py-6 px-4 border-gray-300 hover:bg-gray-50"
            >
              <Heart className="h-5 w-5" /> Save to Wishlist
            </Button>
          </div>{" "}
          {/* Product Description */}
          {product.description && (
            <div className="pt-8 border-t border-gray-200">
              <h3 className="font-medium text-lg mb-4">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
          
          {/* Add a Review Button */}
          <div className="mt-8">
            <Button 
              onClick={handleOpenReviewDialog}
              className="bg-primary hover:bg-primary/90"
            >
              Write a Review
            </Button>
          </div>
        </div>
      </div>
        {/* Product Reviews Section */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        {product?._id && (
          <ProductReviews 
            productId={product._id} 
            key={reviewSubmitted ? 'refreshed' : 'initial'} 
          />
        )}
      </div>
      
      {/* Related Products Section */}
      {product?.collection && (
        <RelatedProducts 
          collectionId={product.collection._id || product.collection} 
          currentProductId={product._id} 
        />
      )}
      
      {/* Review Dialog */}
      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => setIsReviewDialogOpen(false)}
        productId={product?._id}
        productName={product?.name}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default ProductDetail;
