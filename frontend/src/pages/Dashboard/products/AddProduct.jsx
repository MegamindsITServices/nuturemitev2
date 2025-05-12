import React, { useState, useEffect } from "react";
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
import { GET_COLLECTION, ADD_PRODUCT } from "../../../lib/api-client";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    feature: "none",
    collection: "",
  });
  const [images, setImages] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  // Fetch collections on component mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        await getConfig();
        const response = await axiosInstance.get(
          GET_COLLECTION
        );
        if (response.data && response.data.collections) {
          setCollections(response.data.collections);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        toast.error("Failed to load collections");
      }
    };

    fetchCollections();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle select change
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  // Handle multiple image files
  const handleImagesChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Store the selected files for upload
      setImages(Array.from(files));
      
      // Create previews for all selected images
      const previews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagesPreviews(previews);
    }
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
      
      // Append multiple images
      if (images.length > 0) {
        images.forEach((image) => {
          productFormData.append("images", image);
        });
      } else {
        toast.error("Please select at least one image");
        setLoading(false);
        return;
      }
      
      // Send the request
      await getConfig();
      const response = await axiosInstance.post(
        ADD_PRODUCT,
        productFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (response.status === 201) {
        toast.success("Product added successfully!");
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          originalPrice: "",
          discount: "",
          feature: "none",
          collection: "",
        });
        setImages([]);
        setImagesPreviews([]);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
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
              Fill in the details of your new product
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <motion.div variants={itemVariants}>
              <div className="mb-6">
                <Label htmlFor="name">
                  Product Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="mt-1.5"
                  required
                />
              </div>
              <div className="mb-6">
                <Label htmlFor="description">
                  Description<span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter product description"
                  className="mt-1.5 min-h-32"
                  required
                />
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            >
              <div>
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
                  placeholder="0.00"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              <div>
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
                  placeholder="0.00"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            >
              <div>
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
                  placeholder="0"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <Label
                  className="text-slate-700 font-medium mb-2 block"
                  htmlFor="feature"
                >
                  Feature
                </Label>
                <Select
                  value={formData.feature}
                  onValueChange={(value) =>
                    handleSelectChange("feature", value)
                  }
                >                <SelectTrigger
                    id="feature"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white"
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
            </motion.div>
            <motion.div variants={itemVariants} className="mb-6">
              <Label
                className="text-slate-700 font-medium mb-2 block"
                htmlFor="collection"
              >
                Collection<span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.collection}
                onValueChange={(value) =>
                  handleSelectChange("collection", value)
                }
                required
              >                <SelectTrigger
                  id="collection"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white"
                >
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
            </motion.div>            {/* Product Images */}
            <motion.div variants={itemVariants} className="mb-6">
              <Label
                className="text-slate-700 font-medium mb-2 block"
                htmlFor="productImages"
              >
                Product Images<span className="text-red-500">*</span> (Select up to 2 images)
              </Label>
              <div className="flex flex-col">
                <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer mb-3">
                  <input
                    type="file"
                    id="productImages"
                    name="productImages"
                    onChange={handleImagesChange}
                    accept="image/*"
                    className="hidden"
                    multiple
                    required={images.length === 0}
                    max="2"
                  />
                  <label
                    htmlFor="productImages"
                    className="cursor-pointer flex flex-col items-center justify-center h-32"
                  >
                    {imagesPreviews.length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {imagesPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Product image ${index + 1}`}
                              className="h-28 object-contain"
                            />
                            <span className="absolute bottom-0 right-0 bg-slate-800 text-white text-xs px-1 rounded">
                              {index === 0 ? 'Front' : 'Back'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-slate-400 mb-2"
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
                        <span className="text-slate-500">
                          Click to upload product images (up to 2)
                        </span>
                        <span className="text-slate-400 text-sm mt-1">
                          First image will be used as the front image
                        </span>
                      </>
                    )}
                  </label>
                </div>
                
                {imagesPreviews.length > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">
                      {images.length} {images.length === 1 ? 'image' : 'images'} selected
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImages([]);
                        setImagesPreviews([]);
                      }}
                      className="text-xs"
                    >
                      Clear images
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Submit button */}
        <motion.div variants={itemVariants} className="flex justify-end">
          <Button
            type="submit"
            className="bg-[#ed6663] hover:bg-[#ed6663] text-white px-6 py-2 rounded-md transition-all cursor-pointer duration-200 transform hover:scale-[1.02] hover:shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Adding Product...</span>
              </div>
            ) : (
              "Add Product"
            )}
          </Button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
};

export default AddProduct;
