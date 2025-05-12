import React, { useState, useEffect, useCallback } from 'react';
import { Star } from 'lucide-react';
import { axiosInstance } from '../../utils/request';

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  useEffect(() => {
    const fetchReviews = async () => {
      if (!productId) return;
      
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/reviews/product-reviews/${productId}`);
        if (response.data.success) {
          setReviews(response.data.reviews);
        }
      } catch (err) {
        console.error('Error fetching product reviews:', err);
        setError('Failed to load product reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);
  
  // Calculate average rating
  useEffect(() => {
    if (reviews.length > 0) {
      const totalStars = reviews.reduce((sum, review) => sum + review.reviewStars, 0);
      const average = totalStars / reviews.length;
      setAverageRating(parseFloat(average.toFixed(1)));
    } else {
      setAverageRating(0);
    }
  }, [reviews]);
  
  // Function to add a new review to the reviews list
  // Will be used if we implement real-time updates without page refresh
  const handleReviewUpdate = (newReview) => {
    setReviews(prevReviews => [...prevReviews, newReview]);
  };

  if (loading) {
    return (
      <div className="my-8">
        <h3 className="text-xl font-bold mb-4">Product Reviews</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="my-8 text-red-500">{error}</div>;
  }
  if (!reviews || reviews.length === 0) {
    return (
      <div className="my-8 border-t pt-8">
        <h3 className="text-xl font-bold mb-4">Product Reviews</h3>
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="my-8 border-t pt-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h3 className="text-xl font-bold">Product Reviews ({reviews.length})</h3>
        
        <div className="flex items-center mt-2 md:mt-0">
          <div className="flex mr-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className={i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="text-gray-700 font-medium">{averageRating > 0 ? `${averageRating}/5` : 'No ratings yet'}</span>
        </div>
      </div>
      
      {reviews.length > 0 && (
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-lg mb-4">Ratings Summary</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const count = reviews.filter(review => review.reviewStars === star).length;
              const percentage = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
              
              return (
                <div key={star} className="flex items-center">
                  <span className="w-12 text-sm">{star} stars</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-400 h-2.5 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12">{count} ({percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>      )}

      <div className="grid gap-6 md:grid-cols-2">
        {reviews.map((review) => (
          <div key={review._id} className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <div className="flex items-center mb-3 justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold mr-3">
                  {review.userName?.[0]?.toUpperCase() || 'A'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {review.userName || 'Anonymous'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              <div className="flex ml-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < review.reviewStars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 mt-2">{review.reviewText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviews;
