import Review from '../models/reviewModel.js';
import Product from '../models/productModel.js';

// Add a new review
export const addReview = async (req, res) => {
  try {
    const { reviewStars, reviewText, productId, userName } = req.body;

    // Validate required fields
    if (!reviewStars || !reviewText || !productId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Review stars, text, product ID and user name are required'
      });
    }

    // Check if product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Create and save new review
    const newReview = new Review({
      reviewStars,
      reviewText,
      userName,
      productId
    });    const savedReview = await newReview.save();

    // Update product with review reference
    await Product.findByIdAndUpdate(productId, {
      $push: { reviews: savedReview._id }
    });    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: savedReview
    });
  } catch (error) {
    console.error('Error adding review:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all reviews for a product
export const getProductReviews = async (req, res) => {  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error getting product reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all reviews (admin)
export const getAllReviews = async (req, res) => {  try {
    const reviews = await Review.find({})
      .populate('productId', 'name')
      .sort({ createdAt: -1 })
      .exec();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('Error getting all reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update a review (admin only)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewStars, reviewText, userName } = req.body;
    
    // Find the review
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only admins can update reviews now
    // Update the review
    review.reviewStars = reviewStars || review.reviewStars;
    review.reviewText = reviewText || review.reviewText;
    if (userName) {
      review.userName = userName;
    }

    const updatedReview = await review.save();

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete a review (admin only)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the review
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only admins can delete reviews

    // Remove review reference from product
    await Product.findByIdAndUpdate(review.productId, {
      $pull: { reviews: review._id }
    });

    // Delete the review
    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
