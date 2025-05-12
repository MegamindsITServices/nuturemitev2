import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { axiosInstance } from '../../utils/request';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

const ReviewDialog = ({ isOpen, onClose, productId, productName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userName, setUserName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRatingClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleRatingHover = (hoveredRating) => {
    setHoverRating(hoveredRating);
  };
  const resetForm = () => {
    setRating(0);
    setHoverRating(0);
    setReviewText('');
    setUserName('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!userName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await axiosInstance.post('/api/reviews/add-review', {
        reviewStars: rating,
        reviewText,
        productId,
        userName: userName.trim()
      });
      
      if (response.data.success) {
        toast.success("Review submitted successfully!");
        resetForm();
        onClose();
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.review);
        }
      } else {
        toast.error(response.data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Rate this Product</DialogTitle>
          <DialogDescription className="text-center">
            {productName}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="mb-2 text-lg font-medium">Your Rating</div>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none transition-transform hover:scale-110"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => handleRatingHover(star)}
                  onMouseLeave={() => handleRatingHover(0)}
                >
                  <Star 
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm mt-2 font-medium text-gray-600">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good"}
              {rating === 5 && "Excellent"}
              {rating === 0 && "Select your rating"}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-name" className="text-base">
                Your Name
              </Label>
              <Input
                id="user-name"
                placeholder="Enter your name"
                className="mt-1"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="review-text" className="text-base">
                Your Review
              </Label>
              <textarea
                id="review-text"
                rows="4"
                placeholder="Share your experience with this product..."
                className="w-full mt-1 rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-primary"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
            <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={submitting}
              className="mt-2 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 mt-2 w-full sm:w-auto"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
