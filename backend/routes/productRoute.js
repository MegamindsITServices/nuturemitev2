import express from "express";
import {
  addProduct,
  deleteProduct,
  getProducts,
  getProductsByCollectionId,
  updateProduct,
  getProductsBySearch,
  getProductsByCollection,
  getProductsByPrice,
  getProductBySlug,
  getProductById,
} from "../controller/productController.js";
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import fs from "fs";
// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

// Configure multer for both images and videos
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Check if file is an image or video
    if (file.fieldname === 'images' || file.fieldname === 'productDescImages') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed for image fields'), false);
      }
    } else if (file.fieldname === 'videos' || file.fieldname === 'productDescVideos') {
      if (file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only video files are allowed for video fields'), false);
      }
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 50 // 50MB max file size
  }
});

const productRoute = express.Router();

// Create fields configuration for multiple file types
const uploadFields = [
  { name: 'images', maxCount: 10 },               // Max 10 main product images
  { name: 'videos', maxCount: 3 },                // Max 3 main product videos
  { name: 'productDescImages', maxCount: 10 },    // Max 10 product description images
  { name: 'productDescVideos', maxCount: 3 }      // Max 3 product description videos
];

// Routes with multer middleware for image uploads
productRoute.post("/add-product", upload.fields(uploadFields), addProduct);
productRoute.get("/get-products", getProducts);
productRoute.get("/get-product/:slug", getProductBySlug);
productRoute.get("/get-product-by-id/:id", getProductById);
productRoute.put("/update-product/:id", upload.fields(uploadFields), updateProduct);
productRoute.delete("/delete-product/:id", deleteProduct);
productRoute.get("/get-products-by-collection/:collectionId", getProductsByCollectionId);

// Search routes
productRoute.get("/get-product-by-search", getProductsBySearch);
productRoute.get("/get-product-by-collection/:collectionId", getProductsByCollection);
productRoute.get("/get-product-by-price", getProductsByPrice);


export default productRoute;
