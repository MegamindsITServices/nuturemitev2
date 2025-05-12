import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { blogService } from '../../../services/blogService';

const AddBlog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tag: '',
    readTime: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [videoCount, setVideoCount] = useState(0);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [videoFilenames, setVideoFilenames] = useState([]);

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

  // Handle video selection (up to 2 videos)
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (files.length + videoCount > 2) {
        toast.error("You can only upload up to 2 videos per blog");
        return;
      }
      
      // Check file types
      const invalidFiles = files.filter(file => !file.type.includes('video/mp4'));
      if (invalidFiles.length > 0) {
        toast.error("Only MP4 videos are allowed");
        return;
      }

      setSelectedVideos([...selectedVideos, ...files]);
      setVideoCount(prev => prev + files.length);
      setVideoFilenames(prev => [...prev, ...files.map(f => f.name)]);
    }
  };

  // Remove video
  const removeVideo = (index) => {
    const newVideos = [...selectedVideos];
    newVideos.splice(index, 1);
    setSelectedVideos(newVideos);
    
    const newFilenames = [...videoFilenames];
    newFilenames.splice(index, 1);
    setVideoFilenames(newFilenames);
    
    setVideoCount(prev => prev - 1);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.tag || !formData.readTime) {
      toast.error("All fields are required");
      return;
    }

    if (!selectedImage) {
      toast.error("Please select an image for the blog");
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
      
      // Append image file
      blogFormData.append('images', selectedImage);
      
      // Append video files if any
      selectedVideos.forEach(video => {
        blogFormData.append('videos', video);
      });
      
      // Send request
      const response = await blogService.addBlog(blogFormData);
      
      toast.success("Blog created successfully!");
      // Reset form
      setFormData({
        title: '',
        description: '',
        tag: '',
        readTime: ''
      });
      setImagePreview(null);
      setSelectedImage(null);
      setSelectedVideos([]);
      setVideoFilenames([]);
      setVideoCount(0);
      
      // Navigate to view blogs
      navigate('/admin/blogs');
    } catch (error) {
      console.error("Error creating blog:", error);
      toast.error(error.message || "Error creating blog");
    } finally {
      setLoading(false);
    }
  };

  // Animation variants for form elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Create New Blog</h1>
        <p className="text-gray-500">Share your knowledge with the world</p>
      </motion.div>
      
      <motion.form 
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-8"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="mb-4">
          <Label htmlFor="title" className="mb-2 block">Blog Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter blog title"
            className="w-full"
          />
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="mb-4">
          <Label htmlFor="description" className="mb-2 block">Blog Content</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write your blog content here..."
            className="w-full min-h-[200px]"
          />
        </motion.div>

        {/* Tag */}
        <motion.div variants={itemVariants} className="mb-4">
          <Label htmlFor="tag" className="mb-2 block">Blog Category/Tag</Label>
          <Input
            id="tag"
            name="tag"
            value={formData.tag}
            onChange={handleChange}
            placeholder="e.g., Nutrition, Health, Recipes"
            className="w-full"
          />
        </motion.div>

        {/* Read Time */}
        <motion.div variants={itemVariants} className="mb-4">
          <Label htmlFor="readTime" className="mb-2 block">Read Time (in minutes)</Label>
          <Input
            id="readTime"
            name="readTime"
            value={formData.readTime}
            onChange={handleChange}
            placeholder="e.g., 5 min"
            className="w-full"
          />
        </motion.div>

        {/* Image Upload */}
        <motion.div variants={itemVariants} className="mb-4">
          <Label htmlFor="blogImage" className="mb-2 block">Blog Image</Label>
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <Input
              id="blogImage"
              type="file"
              accept="image/jpeg, image/jpg, image/png, image/webp"
              onChange={handleImageChange}
              className="w-full md:w-1/2"
            />
            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full md:w-1/2 mt-2 md:mt-0"
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

        {/* Video Upload */}
        <motion.div variants={itemVariants} className="mb-6">
          <Label htmlFor="blogVideo" className="mb-2 block">
            Blog Videos (Optional, MP4 only, max 2 videos)
          </Label>
          <div className="flex flex-col gap-4">
            <Input
              id="blogVideo"
              type="file"
              accept="video/mp4"
              onChange={handleVideoChange}
              disabled={videoCount >= 2}
              className="w-full"
            />
            
            {/* Video previews */}
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
                      onClick={() => removeVideo(index)}
                    >
                      Remove
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
            
            {videoCount < 2 && (
              <p className="text-sm text-gray-500">
                You can add {2 - videoCount} more video{2 - videoCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Publishing...
              </div>
            ) : "Publish Blog"}
          </Button>
        </motion.div>
      </motion.form>
    </div>
  );
};

export default AddBlog;