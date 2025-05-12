import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { addBlog, deleteBlog, getBlog, getBlogBySlug, updateBlog } from '../controller/blogController.js';

const blogRouter = express.Router();

// Create blogs directory if it doesn't exist
const blogUploadsDir = './blogs';
const blogVideosDir = './blogs/videos';
if (!fs.existsSync(blogUploadsDir)) {
    fs.mkdirSync(blogUploadsDir, { recursive: true });
}
if (!fs.existsSync(blogVideosDir)) {
    fs.mkdirSync(blogVideosDir, { recursive: true });
}

// Configure multer storage for blog images and videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Store videos in a separate directory
        if (file.fieldname === 'videos') {
            cb(null, blogVideosDir);
        } else {
            cb(null, blogUploadsDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// File filter to allow specific image and video types
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const allowedVideoTypes = ['video/mp4'];
    
    if (file.fieldname === 'images' && allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
    } else if (file.fieldname === 'videos' && allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Images must be JPEG, JPG, PNG, or WEBP. Videos must be MP4.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // Increased to 50MB to accommodate videos
});

// Blog routes with file upload middleware
// Allow one image and up to 2 videos
const uploadFields = upload.fields([
    { name: 'images', maxCount: 1 },
    { name: 'videos', maxCount: 2 }
]);

blogRouter.post("/add-blog", uploadFields, addBlog);
blogRouter.get("/get-blog", getBlog);
blogRouter.get("/get-blog/:slug", getBlogBySlug);
blogRouter.put("/update-blog/:id", uploadFields, updateBlog);
blogRouter.delete("/delete-blog/:id", deleteBlog);

export default blogRouter;