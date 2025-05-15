import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { axiosInstance, getConfig } from "../../../utils/request";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GET_COLLECTION, GET_PRODUCT_BY_ID, UPDATE_PRODUCT } from "../../../lib/api-client";
import { getProductImageUrl, getVideoUrl } from "../../../utils/imageUtils";
import { Loader } from "lucide-react";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
  const [fetchingProduct, setFetchingProduct] = useState(true);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axiosInstance.get(GET_COLLECTION);
        if (response.data && Array.isArray(response.data)) {
          setCollections(response.data);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast.error("Failed to load collections");
      }
    };
    fetchCollections();
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setFetchingProduct(true);
      try {
        await getConfig();
        const productUrl = GET_PRODUCT_BY_ID.replace(':id', id);
        const response = await axiosInstance.get(productUrl);
        
        const productData = response.data.product || response.data;
        
        // Set form data
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price || "",
          originalPrice: productData.originalPrice || "",
          discount: productData.discount || "",
          feature: productData.feature || "none",
          collection: productData.collection?._id || "",
        });

        // Set existing images and videos
        if (productData.images && productData.images.length > 0) {
          setExistingImages(productData.images);
        }
        
        if (productData.videos && productData.videos.length > 0) {
          setExistingVideos(productData.videos);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
        navigate('/dashboard/products'); // Redirect back to product list on error
      } finally {
        setFetchingProduct(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

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
        // Validate total images (existing + new) - at least one is required
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
      const updateUrl = UPDATE_PRODUCT.replace(':id', id);
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
        navigate('/dashboard/products');
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProduct) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2">Loading product details...</span>
      </div>
    );
  }

  return (
    <motion.div
      className="w-full p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard/products')}
        >
          Back to Products
        </Button>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        variants={containerVariants}
      >
        <Card className="overflow-hidden border-slate-200 shadow-md">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-xl text-slate-800">
              Product Information
            </CardTitle>
            <CardDescription>
              Update the details of your product
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <Label
                  className="text-slate-700 font-medium mb-2 block"
                  htmlFor="name"
                >
                  Product Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                  className="w-full"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <Label
                  className="text-slate-700 font-medium mb-2 block"
                  htmlFor="description"
                >
                  Description<span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  required
                  className="w-full h-32"
                />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <div className="mb-6">
                  <Label
                    className="text-slate-700 font-medium mb-2 block"
                    htmlFor="price"
                  >
                    Price (₹)<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter selling price"
                    required
                    min="0"
                    step="0.01"
                    className="w-full"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="mb-6">
                  <Label
                    className="text-slate-700 font-medium mb-2 block"
                    htmlFor="originalPrice"
                  >
                    Original Price (₹)<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="Enter original price"
                    required
                    min="0"
                    step="0.01"
                    className="w-full"
                  />
                </div>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <div className="mb-6">
                  <Label
                    className="text-slate-700 font-medium mb-2 block"
                    htmlFor="discount"
                  >
                    Discount (%)
                  </Label>
                  <Input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="Enter discount percentage"
                    min="0"
                    max="99"
                    className="w-full"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="mb-6">
                  <Label
                    className="text-slate-700 font-medium mb-2 block"
                    htmlFor="feature"
                  >
                    Product Feature
                  </Label>
                  <Select
                    value={formData.feature}
                    onValueChange={(value) => handleSelectChange("feature", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select feature" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="hot">Hot</SelectItem>
                      <SelectItem value="sold out">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <Label
                  className="text-slate-700 font-medium mb-2 block"
                  htmlFor="collection"
                >
                  Collection<span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.collection}
                  onValueChange={(value) => handleSelectChange("collection", value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {collections.map((collection) => (
                      <SelectItem key={collection._id} value={collection._id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Image Upload Section */}
            <motion.div variants={itemVariants} className="mb-6">
              <Label
                className="text-slate-700 font-medium mb-2 block"
                htmlFor="productImages"
              >
                Product Images<span className="text-red-500">*</span> (Max 10 images)
              </Label>
              
              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Current Images:</h4>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative">                        <img
                          src={getProductImageUrl(image)}
                          alt={`Product image ${index + 1}`}
                          className="h-24 w-24 object-cover border rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New image upload */}
              {existingImages.length < 10 && (
                <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer mb-3">
                  <input
                    type="file"
                    id="productImages"
                    name="productImages"
                    onChange={handleImagesChange}
                    accept="image/*"
                    className="hidden"
                    multiple
                    max={10 - existingImages.length}
                  />
                  <label
                    htmlFor="productImages"
                    className="cursor-pointer flex flex-col items-center justify-center h-32"
                  >
                    <div className="text-slate-500 mb-2">
                      <svg
                        className="mx-auto h-12 w-12"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-slate-500">
                      Click to add new images ({10 - existingImages.length} remaining)
                    </div>
                  </label>
                </div>
              )}
              
              {/* New image previews */}
              {imagesPreviews.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">New Images:</h4>
                  <div className="flex flex-wrap gap-3">
                    {imagesPreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={preview}
                          alt={`New product image ${index + 1}`}
                          className="h-24 w-24 object-cover border rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Video Upload Section */}
            <motion.div variants={itemVariants} className="mb-6">
              <Label
                className="text-slate-700 font-medium mb-2 block"
                htmlFor="productVideos"
              >
                Product Videos (Max 3 videos)
              </Label>
              
              {/* Existing videos */}
              {existingVideos.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Current Videos:</h4>
                  <div className="flex flex-wrap gap-3">
                    {existingVideos.map((video, index) => (
                      <div key={`existing-video-${index}`} className="relative">                        <video
                          src={getVideoUrl(video)}
                          className="h-24 w-24 object-cover border rounded"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingVideo(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New video upload */}
              {existingVideos.length < 3 && (
                <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer mb-3">
                  <input
                    type="file"
                    id="productVideos"
                    name="productVideos"
                    onChange={handleVideosChange}
                    accept="video/*"
                    className="hidden"
                    multiple
                    max={3 - existingVideos.length}
                  />
                  <label
                    htmlFor="productVideos"
                    className="cursor-pointer flex flex-col items-center justify-center h-32"
                  >
                    <div className="text-slate-500 mb-2">
                      <svg
                        className="mx-auto h-12 w-12"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-slate-500">
                      Click to add new videos ({3 - existingVideos.length} remaining)
                    </div>
                  </label>
                </div>
              )}
              
              {/* New video previews */}
              {videosPreviews.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">New Videos:</h4>
                  <div className="flex flex-wrap gap-3">
                    {videosPreviews.map((preview, index) => (
                      <div key={`new-video-${index}`} className="relative">
                        <video
                          src={preview}
                          className="h-24 w-24 object-cover border rounded"
                          controls
                        />
                        <button
                          type="button"
                          onClick={() => removeNewVideo(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader className="animate-spin mr-2 h-4 w-4" />
                    <span>Updating Product...</span>
                  </div>
                ) : (
                  "Update Product"
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.form>
    </motion.div>
  );
};

export default EditProduct;
