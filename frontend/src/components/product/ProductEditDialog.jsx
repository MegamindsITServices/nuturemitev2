import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { axiosInstance, getConfig } from "../../utils/request";
import { GET_COLLECTION, UPDATE_PRODUCT, backendURL } from "../../lib/api-client";
import { X, Loader } from "lucide-react";

const ProductEditDialog = ({ isOpen, onClose, product, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    feature: "none",
    collection: "",
  });

  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videosPreviews, setVideosPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCollections, setFetchingCollections] = useState(true);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setFetchingCollections(true);
        await getConfig();
        const response = await axiosInstance.get(GET_COLLECTION);
        if (response.data && response.data.collections) {
          setCollections(response.data.collections);
        } else if (response.data && Array.isArray(response.data)) {
          setCollections(response.data);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast.error("Failed to load collections");
      } finally {
        setFetchingCollections(false);
      }
    };
    fetchCollections();
  }, []);
  // Set product data when product prop changes
  useEffect(() => {
    if (product) {
      // Make sure we have a valid product object with required fields
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        discount: product.discount || 0,
        feature: product.feature || "none",
        collection: (product.collection && product.collection._id) 
                  || (typeof product.collection === 'string' ? product.collection : ""),
      });

      // Set existing images and videos
      setExistingImages(Array.isArray(product.images) ? product.images : []);
      setExistingVideos(Array.isArray(product.videos) ? product.videos : []);
      
      // Reset new images and videos
      setNewImages([]);
      setNewVideos([]);
      setImagesPreviews([]);
      setVideosPreviews([]);
    }
  }, [product]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image files change
  const handleImagesChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Store the selected files for upload (max 10 images)
      const selectedFiles = Array.from(files).slice(0, 10 - existingImages.length);
      setNewImages(selectedFiles);
      
      // Create previews for all selected images
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagesPreviews(previews);
    }
  };

  // Handle video files change
  const handleVideosChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Store the selected files for upload (max 3 videos)
      const selectedFiles = Array.from(files).slice(0, 3 - existingVideos.length);
      setNewVideos(selectedFiles);
      
      // Create previews for all selected videos
      const previews = selectedFiles.map(file => URL.createObjectURL(file));
      setVideosPreviews(previews);
    }
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove existing video
  const removeExistingVideo = (index) => {
    setExistingVideos(prev => prev.filter((_, i) => i !== index));
  };

  // Remove new image preview
  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Remove new video preview
  const removeNewVideo = (index) => {
    setNewVideos(prev => prev.filter((_, i) => i !== index));
    setVideosPreviews(prev => prev.filter((_, i) => i !== index));
  };
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product || !product._id) {
      toast.error("Invalid product data");
      return;
    }
    
    setLoading(true);
    
    try {
      // Create a new FormData object
      const productFormData = new FormData();
      
      // Append basic form data
      Object.keys(formData).forEach((key) => {
        if (key === "feature" && formData[key] === "none") {
          return;
        }
        if (formData[key] !== null && formData[key] !== "") {
          productFormData.append(key, formData[key]);
        }
      });
      
      // Append existing images
      if (existingImages.length > 0) {
        productFormData.append("existingImages", JSON.stringify(existingImages));
      }

      // Append existing videos
      if (existingVideos.length > 0) {
        productFormData.append("existingVideos", JSON.stringify(existingVideos));
      }
        // Validate total images (existing + new)
      if (existingImages.length + newImages.length < 1) {
        toast.error("Please select at least one image");
        setLoading(false);
        return;
      }
      
      // Append new images
      if (newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          productFormData.append("images", newImages[i]);
        }
      }

      // Append new videos
      if (newVideos.length > 0) {
        for (let i = 0; i < newVideos.length; i++) {
          productFormData.append("videos", newVideos[i]);
        }
      }
        // Send the request
      await getConfig();
      const updateUrl = UPDATE_PRODUCT.replace(':id', product._id);
      const response = await axiosInstance.put(
        updateUrl,
        productFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (response.status === 200) {
        toast.success("Product updated successfully!");
        
        // Clean up
        setNewImages([]);
        setNewVideos([]);
        setImagesPreviews([]);
        setVideosPreviews([]);
        
        onClose();
        if (onUpdate) {
          onUpdate(); // Callback to refresh products list
        }
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };  // Check if product is available and dialog is open
  if (!product || !isOpen) return null;

  // Safely display images and videos
  const renderExistingImages = () => {
    if (!existingImages || existingImages.length === 0) return null;
    
    return (
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Current Images</p>
        <div className="flex flex-wrap gap-3">
          {existingImages.map((image, index) => (
            <div key={`existing-img-${index}`} className="relative">
              <img 
                src={`${backendURL}/image/${image}`} 
                alt={`Product image ${index+1}`}
                className="h-24 w-24 object-cover rounded"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/100?text=Error";
                }}
              />
              <button
                type="button"
                onClick={() => removeExistingImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                title="Remove Image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  const renderExistingVideos = () => {
    if (!existingVideos || existingVideos.length === 0) return null;
    
    return (
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Current Videos</p>
        <div className="flex flex-wrap gap-3">
          {existingVideos.map((video, index) => (
            <div key={`existing-video-${index}`} className="relative">
              <video 
                src={`${backendURL}/video/${video}`} 
                className="h-32 w-32 object-cover rounded"
                controls
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.parentNode.innerHTML = '<div class="h-32 w-32 bg-gray-200 flex items-center justify-center text-gray-500 text-xs text-center rounded">Video Error</div>';
                }}
              />
              <button
                type="button"
                onClick={() => removeExistingVideo(index)}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                title="Remove Video"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-lg shadow-lg">
        <DialogHeader className="pb-4 border-b mb-6">
          <DialogTitle className="text-xl font-semibold text-gray-800">Edit Product - {product.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="feature" className="text-sm font-medium text-gray-700 mb-1.5 block">
                Feature
              </Label>
              <Select
                value={formData.feature}
                onValueChange={(value) => handleSelectChange("feature", value)}
              >
                <SelectTrigger
                  id="feature"
                  className="w-full bg-white rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="hot">Hot</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="sold out">Sold Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            <div className="mt-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter product description"
              className="w-full min-h-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium">
                Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                className="mt-1"
                required
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="originalPrice" className="text-sm font-medium">
                Original Price (₹) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                id="originalPrice"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0.00"
                className="mt-1"
                required
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="discount" className="text-sm font-medium">
                Discount (%)
              </Label>
              <Input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="0"
                className="mt-1"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="collection" className="text-sm font-medium">
              Collection <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.collection}
              onValueChange={(value) => handleSelectChange("collection", value)}
              required
            >
              <SelectTrigger
                id="collection"
                className="bg-white mt-1"
              >
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent>
                {fetchingCollections ? (
                  <div className="p-2 text-center">Loading...</div>
                ) : collections.length > 0 ? (
                  collections.map((collection) => (
                    <SelectItem key={collection._id} value={collection._id}>
                      {collection.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center">No collections found</div>
                )}
              </SelectContent>
            </Select>
          </div>
            {/* Images Section */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block" htmlFor="productImages">
              Product Images <span className="text-red-500">*</span> (Select up to 10 images)
            </Label>
              
            {/* Existing Images */}
            {renderExistingImages()}
            
            {/* New Images Upload */}
            <div className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer mb-3">
              <input
                type="file"
                id="productImages"
                name="productImages"
                onChange={handleImagesChange}
                accept="image/*"
                className="hidden"
                multiple
                max="10"
              />
              <label
                htmlFor="productImages"
                className="cursor-pointer flex flex-col items-center justify-center h-24"
              >
                {imagesPreviews.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {imagesPreviews.map((preview, index) => (
                      <div key={`new-img-${index}`} className="relative">
                        <img
                          src={preview}
                          alt={`New product image ${index + 1}`}
                          className="h-20 w-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeNewImage(index);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                          title="Remove Image"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-500 mt-2 text-sm">Click to upload new product images</span>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          {/* Videos Section */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-2 block" htmlFor="productVideos">
              Product Videos (Optional, select up to 3 videos)
            </Label>
              
            {/* Existing Videos */}
            {renderExistingVideos()}
            
            {/* New Videos Upload */}
            <div className="w-full bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center hover:bg-gray-100 hover:border-gray-400 transition-colors cursor-pointer mb-3">
              <input
                type="file"
                id="productVideos"
                name="productVideos"
                onChange={handleVideosChange}
                accept="video/*"
                className="hidden"
                multiple
                max="3"
              />
              <label
                htmlFor="productVideos"
                className="cursor-pointer flex flex-col items-center justify-center h-24"
              >
                {videosPreviews.length > 0 ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {videosPreviews.map((preview, index) => (
                      <div key={`new-video-${index}`} className="relative">
                        <video
                          src={preview}
                          className="h-20 w-20 object-cover rounded"
                          controls
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeNewVideo(index);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                          title="Remove Video"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-gray-500 mt-2 text-sm">Click to upload product videos (optional)</span>
                  </div>
                )}
              </label>
            </div>
          </div>
            <DialogFooter className="border-t pt-4 mt-4">
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Product"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
