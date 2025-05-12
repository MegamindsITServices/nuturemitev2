import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    reviewStars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    reviewText: {
        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
