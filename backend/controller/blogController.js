import Blog from '../models/blogModel.js';
import slugify from 'slugify';
import fs from 'fs';
import path from 'path';

// Add a new blog
export const addBlog = async (req, res) => {
    try {
        const { title, description, tag, readTime, video } = req.body;
        
        // Validation
        if (!title || !description || !tag || !readTime) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }        // Handle file uploads with multer
        let images = "";
        let videos = [];
        
        if (req.files) {
            // Handle image upload
            if (req.files.images && req.files.images.length > 0) {
                images = req.files.images[0].path.replace(/\\/g, '/');
            }
            
            // Handle video uploads (up to 2)
            if (req.files.videos && req.files.videos.length > 0) {
                videos = req.files.videos.map(file => file.path.replace(/\\/g, '/'));
            }
        }

        // Create slug from the title
        const slug = slugify(title, {
            lower: true,
            strict: true
        });        // Create new blog
        const newBlog = await Blog.create({
            title,
            slug,
            description,
            tag,
            readTime,
            images: images || "",
            videos: videos.length > 0 ? videos : []
        });

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            blog: newBlog
        });
        
    } catch (error) {
        console.error("Error in addBlog:", error);
        res.status(500).json({
            success: false,
            message: "Error adding blog",
            error: error.message
        });
    }
}

// Get all blogs with optional filtering
export const getBlog = async (req, res) => {
    try {
        const { tag, limit } = req.query;
        let query = {};

        // Apply tag filter if provided
        if (tag) {
            query.tag = tag;
        }

        // Apply pagination
        const limitValue = parseInt(limit) || 10;
        
        const blogs = await Blog.find(query)
            .limit(limitValue)
            .sort({ _id: -1 }); // Most recent first
        
        res.status(200).json({
            success: true,
            count: blogs.length,
            blogs
        });
        
    } catch (error) {
        console.error("Error in getBlog:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving blogs",
            error: error.message
        });
    }
}

// Get a specific blog by slug
export const getBlogBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        const blog = await Blog.findOne({ slug });
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        res.status(200).json({
            success: true,
            blog
        });
        
    } catch (error) {
        console.error("Error in getBlogBySlug:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving blog",
            error: error.message
        });
    }
}

// Update an existing blog
export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tag, readTime, removeVideos } = req.body;
        
        // Find the blog to update
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
        
        // Update the blog fields
        blog.title = title || blog.title;
        blog.description = description || blog.description;
        blog.tag = tag || blog.tag;
        blog.readTime = readTime || blog.readTime;
        
        // Update slug if title changed
        if (title) {
            blog.slug = slugify(title, {
                lower: true,
                strict: true
            });
        }
        
        // Handle file update if there's a new image
        if (req.files && req.files.images && req.files.images.length > 0) {
            // Delete old image if it exists
            if (blog.images) {
                try {
                    fs.unlinkSync(blog.images);
                } catch (err) {
                    console.log("Error deleting old image:", err);
                }
            }
            blog.images = req.files.images[0].path.replace(/\\/g, '/');
        }
        
        // Handle video updates
        if (req.files && req.files.videos && req.files.videos.length > 0) {
            const newVideoPaths = req.files.videos.map(file => file.path.replace(/\\/g, '/'));
            
            // Check if we're at the limit (2 videos)
            const currentVideos = blog.videos || [];
            const totalVideos = currentVideos.length + newVideoPaths.length;
            
            if (totalVideos > 2) {
                return res.status(400).json({
                    success: false,
                    message: "Cannot exceed 2 videos per blog. Please remove existing videos first."
                });
            }
            
            // Append new videos
            blog.videos = [...currentVideos, ...newVideoPaths];
        }
        
        // Handle video removal if specified
        if (removeVideos && Array.isArray(removeVideos) && removeVideos.length > 0) {
            // Remove specified videos
            if (blog.videos && blog.videos.length > 0) {
                for (const videoPath of removeVideos) {
                    if (blog.videos.includes(videoPath)) {
                        try {
                            fs.unlinkSync(videoPath);
                        } catch (err) {
                            console.log("Error deleting video:", err);
                        }
                        
                        blog.videos = blog.videos.filter(v => v !== videoPath);
                    }
                }
            }
        }
        
        // Save updated blog
        const updatedBlog = await blog.save();
        
        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            blog: updatedBlog
        });
        
    } catch (error) {
        console.error("Error in updateBlog:", error);
        res.status(500).json({ 
            success: false,
            message: "Error updating blog", 
            error: error.message 
        });
    }
}

// Delete a blog
export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the blog to delete
        const blog = await Blog.findById(id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }
          // Delete associated image if it exists
        if (blog.images) {
            try {
                fs.unlinkSync(blog.images);
            } catch (err) {
                console.log("Error deleting image:", err);
            }
        }
        
        // Delete associated videos if they exist
        if (blog.videos && blog.videos.length > 0) {
            for (const videoPath of blog.videos) {
                try {
                    fs.unlinkSync(videoPath);
                } catch (err) {
                    console.log("Error deleting video:", err);
                }
            }
        }
        
        // Delete the blog
        await Blog.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: "Blog deleted successfully"
        });
        
    } catch (error) {
        console.error("Error in deleteBlog:", error);
        res.status(500).json({ 
            success: false,
            message: "Error deleting blog", 
            error: error.message 
        });
    }
}