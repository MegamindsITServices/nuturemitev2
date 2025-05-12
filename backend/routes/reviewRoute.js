import express from 'express';
import { addReview, getProductReviews, getAllReviews, updateReview, deleteReview } from '../controller/reviewController.js';
import { requireSignIn } from '../middleware/authMiddleware.js';

const reviewRouter = express.Router();

// Add a new review (public - no authentication required)
reviewRouter.post('/add-review', addReview);

// Get all reviews for a product (public)
reviewRouter.get('/product-reviews/:productId', getProductReviews);

// Get all reviews (admin)
reviewRouter.get('/all-reviews', requireSignIn, getAllReviews);

// Update a review (admin only)
reviewRouter.put('/update-review/:id', requireSignIn, updateReview);

// Delete a review (admin only)
reviewRouter.delete('/delete-review/:id', requireSignIn, deleteReview);

export default reviewRouter;
