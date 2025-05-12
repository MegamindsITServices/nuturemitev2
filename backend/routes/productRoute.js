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
  
const upload = multer({ storage: storage });
const productRoute = express.Router();


// Routes with multer middleware for image uploads
productRoute.post("/add-product", upload.array("images", 2), addProduct);
productRoute.get("/get-products", getProducts);
productRoute.get("/get-product/:slug", getProductBySlug);
productRoute.put("/update-product/:id", upload.array("images", 2), updateProduct);
productRoute.delete("/delete-product/:id", deleteProduct);
productRoute.get("/get-products-by-collection/:collectionId", getProductsByCollectionId);

// Search routes
productRoute.get("/get-product-by-search", getProductsBySearch);
productRoute.get("/get-product-by-collection/:collectionId", getProductsByCollection);
productRoute.get("/get-product-by-price", getProductsByPrice);


export default productRoute;
