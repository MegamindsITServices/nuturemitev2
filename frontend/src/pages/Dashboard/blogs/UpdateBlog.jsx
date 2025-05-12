import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { blogService } from '../../../services/blogService';
import { backendURL } from '../../../lib/api-client';

const UpdateBlog = ({ blog, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: '',
    readTime: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videoFilenames, setVideoFilenames] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [videosToRemove, setVideosToRemove] = useState([]);

  // Initialize form data when blog prop changes
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        description: blog.description || '',
        tag: blog.tag || '',
        readTime: blog.readTime || ''
      });
      
      // Set image preview if exists
      if (blog.images) {
        setImagePreview(`${backendURL}/blog/${blog.images.split('/').pop()}`);
      }
      
      // Set existing videos if any
      if (blog.videos && blog.videos.length > 0) {
        // Ensure video paths are properly formatted
        const formattedVideos = blog.videos.map(videoPath => {
          // If the path doesn't start with backendURL, prepend it for proper display
          if (videoPath.startsWith('http')) {
            return videoPath;
          } else {
            return `${backendURL}/blogVideos/${videoPath.split('/').pop()}`;
          }
        });
        setExistingVideos(formattedVideos);
      }
    }
  }, [blog]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle video selection
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const currentTotal = existingVideos.length - videosToRemove.length + selectedVideos.length;
      
      if (files.length + currentTotal > 2) {
        toast.error("You can only have up to 2 videos per blog");
        return;
      }
      
      // Check file types
      const invalidFiles = files.filter(file => !file.type.includes('video/mp4'));
      if (invalidFiles.length > 0) {
        toast.error("Only MP4 videos are allowed");
        return;
      }

      setSelectedVideos([...selectedVideos, ...files]);
      setVideoFilenames(prev => [...prev, ...files.map(f => f.name)]);
    }
  };

  // Remove new video
  const removeNewVideo = (index) => {
    const newVideos = [...selectedVideos];
    newVideos.splice(index, 1);
    setSelectedVideos(newVideos);
    
    const newFilenames = [...videoFilenames];
    newFilenames.splice(index, 1);
    setVideoFilenames(newFilenames);
  };

  // Toggle removal of existing video
  const toggleRemoveExistingVideo = (videoPath) => {
    if (videosToRemove.includes(videoPath)) {
      // If already marked for removal, unmark it
      setVideosToRemove(videosToRemove.filter(path => path !== videoPath));
    } else {
      // Mark for removal
      setVideosToRemove([...videosToRemove, videoPath]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.tag || !formData.readTime) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);
      
      // Create form data for multipart upload
      const blogFormData = new FormData();
      blogFormData.append('title', formData.title);
      blogFormData.append('description', formData.description);
      blogFormData.append('tag', formData.tag);
      blogFormData.append('readTime', formData.readTime);
      
      // Add selected image if any
      if (selectedImage) {
        blogFormData.append('images', selectedImage);
      }
      
      // Add videos to remove if any
      if (videosToRemove.length > 0) {
        videosToRemove.forEach(path => {
          blogFormData.append('removeVideos', path);
        });
      }
      
      // Add new videos if any
      selectedVideos.forEach(video => {
        blogFormData.append('videos', video);
      });
      
      // Send update request
      const response = await blogService.updateBlog(blog._id, blogFormData);
      
      toast.success("Blog updated successfully!");
      onSuccess(); // Notify parent component
      
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error(error.message || "Error updating blog");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 py-4"
    >
      {/* Title */}
      <motion.div variants={itemVariants}>
        <Label htmlFor="update-title" className="mb-2 block">Blog Title</Label>
        <Input
          id="update-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter blog title"
        />
      </motion.div>

      {/* Description */}
      <motion.div variants={itemVariants}>
        <Label htmlFor="update-description" className="mb-2 block">Blog Content</Label>
        <Textarea
          id="update-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Write your blog content here..."
          className="min-h-[150px]"
        />
      </motion.div>

      {/* Tag */}
      <motion.div variants={itemVariants}>
        <Label htmlFor="update-tag" className="mb-2 block">Blog Category/Tag</Label>
        <Input
          id="update-tag"
          name="tag"
          value={formData.tag}
          onChange={handleChange}
          placeholder="e.g., Nutrition, Health, Recipes"
        />
      </motion.div>

      {/* Read Time */}
      <motion.div variants={itemVariants}>
        <Label htmlFor="update-readTime" className="mb-2 block">Read Time (in minutes)</Label>
        <Input
          id="update-readTime"
          name="readTime"
          value={formData.readTime}
          onChange={handleChange}
          placeholder="e.g., 5 min"
        />
      </motion.div>

      {/* Image Upload */}
      <motion.div variants={itemVariants}>
        <Label htmlFor="update-blogImage" className="mb-2 block">Blog Image</Label>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="space-y-2 w-full md:w-1/2">
            <Input
              id="update-blogImage"
              type="file"
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleImageChange}
            />
            <p className="text-sm text-gray-500">Leave empty to keep current image</p>
          </div>
          {imagePreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full md:w-1/2"
            >
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-40 object-cover rounded-md border border-gray-300"
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Existing Videos */}
      {existingVideos.length > 0 && (
        <motion.div variants={itemVariants}>
          <Label className="mb-2 block">Current Videos</Label>
          <div className="space-y-2">
            {existingVideos.map((videoPath, idx) => (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-2 rounded-md ${
                  videosToRemove.includes(videoPath) 
                    ? 'bg-red-100 dark:bg-red-900/30' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                <div className="truncate max-w-[70%]">
                  <p className="font-medium truncate">Video {idx + 1}</p>
                  <p className="text-xs truncate text-gray-500">{videoPath.split('/').pop()}</p>
                </div>
                <Button
                  type="button"
                  variant={videosToRemove.includes(videoPath) ? "outline" : "destructive"}
                  size="sm"
                  onClick={() => toggleRemoveExistingVideo(videoPath)}
                >
                  {videosToRemove.includes(videoPath) ? "Keep" : "Remove"}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* New Video Upload */}
      <motion.div variants={itemVariants}>
        <Label htmlFor="update-blogVideo" className="mb-2 block">
          Add New Videos (Optional, MP4 only)
        </Label>
        <div className="space-y-3">
          <Input
            id="update-blogVideo"
            type="file"
            accept="video/mp4"
            onChange={handleVideoChange}
            disabled={existingVideos.length - videosToRemove.length + selectedVideos.length >= 2}
          />
          
          {/* New video previews */}
          {videoFilenames.length > 0 && (
            <div className="space-y-2">
              {videoFilenames.map((filename, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-2 rounded-md bg-gray-100 dark:bg-gray-700"
                >
                  <span className="truncate max-w-[80%]">
                    {filename}
                  </span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeNewVideo(index)}
                  >
                    Remove
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            {2 - (existingVideos.length - videosToRemove.length + selectedVideos.length) <= 0 
              ? "Maximum number of videos reached (2)" 
              : `You can add ${2 - (existingVideos.length - videosToRemove.length + selectedVideos.length)} more video${2 - (existingVideos.length - videosToRemove.length + selectedVideos.length) !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        className="pt-2"
      >
        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Updating...
            </div>
          ) : "Update Blog"}
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default UpdateBlog;
