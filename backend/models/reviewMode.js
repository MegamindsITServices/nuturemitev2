import mongoose from "mongoose";

const reviewModeSchema = new mongoose.Schema({
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
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: false
    },
})
