import express from 'express';
import { addBanner, deleteBanner, getBanner, updateBanner } from '../controller/bannerController.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "../banner");
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
const bannerRoute = express.Router();

bannerRoute.post("/add-banner", upload.single("banner"), addBanner)
bannerRoute.get("/get-banner", getBanner)
bannerRoute.delete("/delete-banner/:id", deleteBanner)
bannerRoute.put("/update-banner/:id", upload.single("banner"), updateBanner)

export default bannerRoute;