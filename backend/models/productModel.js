import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug:{
    type: String,
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    required: false
  },
  feature: {
    type: String,
    required: false
  },  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Collection",
    required: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review"
  }],
  images: [String],
},{timestamps:true});

const Product = mongoose.model("Product", productSchema);

export default Product;