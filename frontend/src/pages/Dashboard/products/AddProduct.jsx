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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";
import { Button } from "../../../components/ui/button";
import { axiosInstance, getConfig } from "../../../utils/request";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { GET_COLLECTION, ADD_PRODUCT } from "../../../lib/api-client";
import axios from "axios";

// Dropdown options
const FEATURE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "hot", label: "🔥 Hot" },
  { value: "new", label: "✨ New" },
  { value: "bestseller", label: "⭐ Bestseller" },
  { value: "limited", label: "⏰ Limited Edition" },
  { value: "sale", label: "💰 On Sale" },
  { value: "sold out", label: "❌ Sold Out" },
];

const DIET_TYPE_OPTIONS = [
  { value: "vegetarian", label: "🥬 Vegetarian" },
  { value: "non-vegetarian", label: "🥩 Non-Vegetarian" },
  { value: "vegan", label: "🌱 Vegan" },
  { value: "gluten-free", label: "🌾 Gluten-Free" },
  { value: "organic", label: "🌿 Organic" },
  { value: "keto", label: "🥑 Keto-Friendly" },
  { value: "diabetic", label: "💊 Diabetic-Friendly" },
];

const CATEGORY_OPTIONS = [
  { value: "snacks", label: "🍿 Snacks" },
  { value: "beverages", label: "🥤 Beverages" },
  { value: "dairy", label: "🥛 Dairy Products" },
  { value: "bakery", label: "🍞 Bakery Items" },
  { value: "frozen", label: "❄️ Frozen Foods" },
  { value: "canned", label: "🥫 Canned Goods" },
  { value: "spices", label: "🌶️ Spices & Herbs" },
  { value: "oils", label: "🫒 Oils & Vinegars" },
  { value: "grains", label: "🌾 Grains & Cereals" },
  { value: "sweets", label: "🍬 Sweets & Confectionery" },
];

const PACKAGING_TYPE_OPTIONS = [
  { value: "box", label: "📦 Box" },
  { value: "pouch", label: "👝 Pouch" },
  { value: "bottle", label: "🍼 Bottle" },
  { value: "can", label: "🥫 Can" },
  { value: "jar", label: "🫙 Jar" },
  { value: "packet", label: "📋 Packet" },
  { value: "bag", label: "👜 Bag" },
  { value: "container", label: "🥡 Container" },
  { value: "tube", label: "🧴 Tube" },
  { value: "wrap", label: "🎁 Wrapped" },
];

const FLAVOR_OPTIONS = [
  { value: "chocolate", label: "🍫 Chocolate" },
  { value: "vanilla", label: "🍦 Vanilla" },
  { value: "strawberry", label: "🍓 Strawberry" },
  { value: "mango", label: "🥭 Mango" },
  { value: "orange", label: "🍊 Orange" },
  { value: "mint", label: "🌿 Mint" },
  { value: "coconut", label: "🥥 Coconut" },
  { value: "banana", label: "🍌 Banana" },
  { value: "apple", label: "🍎 Apple" },
  { value: "mixed-fruit", label: "🍇 Mixed Fruit" },
  { value: "spicy", label: "🌶️ Spicy" },
  { value: "sweet", label: "🍯 Sweet" },
  { value: "salty", label: "🧂 Salty" },
  { value: "plain", label: "⚪ Plain" },
];

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    feature: "none",
    collection: "",
    // New fields from the updated product model
    shortDescription: [
      {
        brand: "",
        category: "",
        itemWeight: "",
        dietType: "",
        totalItems: "",
        flavor: "",
        packagingType: "",
      },
    ],
    nutritionInfo: [
      {
        protien: "",
        fat: "",
        carbohydrates: "",
        iron: "",
        calcium: "",
        vitamin: "",
        Energy: "",
      },
    ],
    importantInformation: [
      {
        ingredients: "",
        storageTips: "",
      },
    ],
    productDescription: [
      {
        images: [],
        videos: [],
      },
    ],
    measurements: [
      {
        withoutPackaging: [
          {
            height: "",
            weight: "",
            width: "",
            length: "",
          },
        ],
        withPackaging: [
          {
            height: "",
            weight: "",
            width: "",
            length: "",
          },
        ],
      },
    ],
    manufacturer: "",
    marketedBy: "",
    keyFeatures: "",
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({});

  // Main product images and videos
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videosPreviews, setVideosPreviews] = useState([]);

  // Product description extra media
  const [productDescImages, setProductDescImages] = useState([]);
  const [productDescVideos, setProductDescVideos] = useState([]);
  const [productDescImagesPreviews, setProductDescImagesPreviews] = useState(
    []
  );
  const [productDescVideosPreviews, setProductDescVideosPreviews] = useState(
    []
  );

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
        const response = await axiosInstance.get(GET_COLLECTION);
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

  // Automatically calculate discount percentage
  useEffect(() => {
    const price = parseFloat(formData.price);
    const originalPrice = parseFloat(formData.originalPrice);
    if (
      !isNaN(price) &&
      !isNaN(originalPrice) &&
      originalPrice > 0 &&
      price <= originalPrice
    ) {
      const discount = (
        ((originalPrice - price) / originalPrice) *
        100
      ).toFixed(2);
      setFormData((prev) => ({ ...prev, discount }));
    } else {
      setFormData((prev) => ({ ...prev, discount: "" }));
    }
  }, [formData.price, formData.originalPrice]);

  // Handle regular input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newFormData = {
      ...formData,
      [name]: value,
    };
    // Auto-calculate discount
    if (name === "price" || name === "originalPrice") {
      const price = name === "price" ? value : formData.price;
      const originalPrice =
        name === "originalPrice" ? value : formData.originalPrice;
      if (
        price &&
        originalPrice &&
        !isNaN(price) &&
        !isNaN(originalPrice) &&
        parseFloat(originalPrice) > 0 &&
        parseFloat(price) >= 0
      ) {
        const discount = Math.max(
          0,
          Math.round(
            ((parseFloat(originalPrice) - parseFloat(price)) /
              parseFloat(originalPrice)) *
              100
          )
        );
        newFormData.discount = discount;
      } else {
        newFormData.discount = "";
      }
    }
    setFormData(newFormData);
    // Clear the error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Handle select change
  const handleSelectChange = (name, value) => {
    // Clear the error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle nested object field changes
  const handleNestedChange = (section, field, value, index = 0) => {
    setFormData((prevData) => {
      const updatedSection = [...prevData[section]];
      updatedSection[index] = {
        ...updatedSection[index],
        [field]: value,
      };

      return {
        ...prevData,
        [section]: updatedSection,
      };
    });
  };

  // Handle deeply nested object field changes (for measurements)
  const handleMeasurementChange = (packageType, field, value) => {
    setFormData((prevData) => {
      const updatedMeasurements = [...prevData.measurements];

      if (packageType === "withoutPackaging") {
        updatedMeasurements[0] = {
          ...updatedMeasurements[0],
          withoutPackaging: [
            {
              ...(updatedMeasurements[0]?.withoutPackaging[0] || {}),
              [field]: value,
            },
          ],
        };
      } else if (packageType === "withPackaging") {
        updatedMeasurements[0] = {
          ...updatedMeasurements[0],
          withPackaging: [
            {
              ...(updatedMeasurements[0]?.withPackaging[0] || {}),
              [field]: value,
            },
          ],
        };
      }

      return {
        ...prevData,
        measurements: updatedMeasurements,
      };
    });
  };

  // Handle product description media
  const handleProductDescImagesChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Store the selected files for upload
      setProductDescImages(Array.from(files));

      // Create previews for all selected images
      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setProductDescImagesPreviews(previews);

      // Update formData with filenames (we'll replace this with actual URLs after upload)
      setFormData((prevData) => {
        const updatedProductDesc = [...prevData.productDescription];
        updatedProductDesc[0] = {
          ...updatedProductDesc[0],
          images: Array.from(files).map((file) => file.name),
        };
        return {
          ...prevData,
          productDescription: updatedProductDesc,
        };
      });
    }
  };

  const handleProductDescVideosChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Store the selected files for upload
      setProductDescVideos(Array.from(files));

      // Create previews for all selected videos
      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setProductDescVideosPreviews(previews);

      // Update formData with filenames (we'll replace this with actual URLs after upload)
      setFormData((prevData) => {
        const updatedProductDesc = [...prevData.productDescription];
        updatedProductDesc[0] = {
          ...updatedProductDesc[0],
          videos: Array.from(files).map((file) => file.name),
        };
        return {
          ...prevData,
          productDescription: updatedProductDesc,
        };
      });
    }
  }; // Handle multiple image files
  const handleImagesChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Clear any image validation errors
      if (formErrors.images) {
        setFormErrors({
          ...formErrors,
          images: "",
        });
      }

      // Store the selected files for upload
      setImages(Array.from(files));

      // Create previews for all selected images
      const previews = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setImagesPreviews(previews);
    }
  };

  // Handle video files change
  const handleVideosChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Store the selected files for upload (max 3 videos)
      const selectedFiles = Array.from(files).slice(0, 3);
      setVideos(selectedFiles);

      // Create previews for all selected videos
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setVideosPreviews(previews);
    }
  }; // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    const errors = {};

    // Required fields validation
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.price) errors.price = "Price is required";
    if (!formData.originalPrice)
      errors.originalPrice = "Original price is required";
    if (!formData.collection) errors.collection = "Collection is required";

    // Validate numeric fields
    if (
      formData.price &&
      (isNaN(formData.price) || parseFloat(formData.price) < 0)
    ) {
      errors.price = "Price must be a positive number";
    }
    if (
      formData.originalPrice &&
      (isNaN(formData.originalPrice) || parseFloat(formData.originalPrice) < 0)
    ) {
      errors.originalPrice = "Original price must be a positive number";
    }
    if (
      formData.discount &&
      (isNaN(formData.discount) ||
        parseFloat(formData.discount) < 0 ||
        parseFloat(formData.discount) > 100)
    ) {
      errors.discount = "Discount must be between 0 and 100";
    }

    // Validate images
    if (images.length === 0) {
      errors.images = "At least one product image is required";
    }

    // Set validation errors
    setFormErrors(errors);

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the form errors");
      setLoading(false);
      return;
    }

    try {
      // Create a new FormData object
      const productFormData = new FormData();

      // Append basic form data (string and number fields)
      const simpleFields = [
        "name",
        "description",
        "price",
        "originalPrice",
        "discount",
        "manufacturer",
        "marketedBy",
        "keyFeatures",
      ];
      simpleFields.forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          productFormData.append(key, formData[key]);
        }
      });

      // Handle feature field
      if (formData.feature && formData.feature !== "none") {
        productFormData.append("feature", formData.feature);
      }

      // Handle collection field
      if (formData.collection) {
        productFormData.append("collection", formData.collection);
      }

      // Append complex fields as JSON strings
      const complexFields = [
        "shortDescription",
        "nutritionInfo",
        "importantInformation",
        "measurements",
      ];
      complexFields.forEach((key) => {
        productFormData.append(key, JSON.stringify(formData[key]));
      });

      // Handle productDescription separately
      const productDescriptionData = [...formData.productDescription];
      // We'll upload the files separately, so just remove the references for now
      productDescriptionData[0].images = [];
      productDescriptionData[0].videos = [];
      productFormData.append(
        "productDescription",
        JSON.stringify(productDescriptionData)
      );

      // Append multiple product images
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          productFormData.append("images", images[i]);
        }
      }

      // Append product videos if available
      if (videos.length > 0) {
        for (let i = 0; i < videos.length; i++) {
          productFormData.append("videos", videos[i]);
        }
      }

      // Append product description media
      if (productDescImages.length > 0) {
        for (let i = 0; i < productDescImages.length; i++) {
          productFormData.append("productDescImages", productDescImages[i]);
        }
      }

      if (productDescVideos.length > 0) {
        for (let i = 0; i < productDescVideos.length; i++) {
          productFormData.append("productDescVideos", productDescVideos[i]);
        }
      }
      // Send the request
      await getConfig();
      console.log(
        "Sending request to:",
        axiosInstance.defaults.baseURL + "/" + ADD_PRODUCT
      );
      try {
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
          // Call the reset function
          setFormData({
            name: "",
            description: "",
            price: "",
            originalPrice: "",
            discount: "",
            feature: "none",
            collection: "",
            // New fields from the updated product model
            shortDescription: [
              {
                brand: "",
                category: "",
                itemWeight: "",
                dietType: "",
                totalItems: "",
                flavor: "",
                packagingType: "",
              },
            ],
            nutritionInfo: [
              {
                protien: "",
                fat: "",
                carbohydrates: "",
                iron: "",
                calcium: "",
                vitamin: "",
                Energy: "",
              },
            ],
            importantInformation: [
              {
                ingredients: "",
                storageTips: "",
              },
            ],
            productDescription: [
              {
                images: [],
                videos: [],
              },
            ],
            measurements: [
              {
                withoutPackaging: [
                  {
                    height: "",
                    weight: "",
                    width: "",
                    length: "",
                  },
                ],
                withPackaging: [
                  {
                    height: "",
                    weight: "",
                    width: "",
                    length: "",
                  },
                ],
              },
            ],
            manufacturer: "",
            marketedBy: "",
            keyFeatures: "",
          });
        }
      } catch (apiError) {
        console.error("API Error:", apiError);

        // Check if it's a network error
        if (apiError.message === "Network Error") {
          toast.error(
            "Network connection error. Please check your internet connection and try again."
          );
        } else {
          // Get the most informative error message possible
          const errorMessage =
            apiError.response?.data?.message ||
            apiError.message ||
            "Failed to add product";
          toast.error(errorMessage);
        }
        throw apiError; // Re-throw for the outer catch block
      }
    } catch (error) {
      console.error("Error adding product:", error);
      if (!error.message.includes("Network Error")) {
        // Avoid duplicate error messages
        toast.error(error.response?.data?.message || "Failed to add product");
      }
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
        {" "}
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
            {" "}
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
                  className={`mt-1.5 ${
                    formErrors.name ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
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
                  className={`mt-1.5 min-h-32 ${
                    formErrors.description
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  required
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            >
              {" "}
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
                  className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                    formErrors.price ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  required
                  min="0"
                  step="0.01"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.price}
                  </p>
                )}
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
                  className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                    formErrors.originalPrice
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  required
                  min="0"
                  step="0.01"
                />
                {formErrors.originalPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.originalPrice}
                  </p>
                )}
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
            >
              {" "}
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
                  className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                    formErrors.discount
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  min="0"
                  max="100"
                  step="0.01"
                  readOnly
                />
                {formErrors.discount && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.discount}
                  </p>
                )}
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
                >
                  <SelectTrigger
                    id="feature"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <SelectValue placeholder="Select feature" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
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
              </Label>{" "}
              <Select
                value={formData.collection}
                onValueChange={(value) =>
                  handleSelectChange("collection", value)
                }
                required
              >
                {" "}
                <SelectTrigger
                  id="collection"
                  className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 bg-white ${
                    formErrors.collection
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
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
              {formErrors.collection && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.collection}
                </p>
              )}
            </motion.div>
            {/* Manufacturer Info */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    className="text-slate-700 font-medium mb-2 block"
                    htmlFor="manufacturer"
                  >
                    Manufacturer
                  </Label>
                  <Input
                    type="text"
                    id="manufacturer"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="Enter manufacturer name"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label
                    className="text-slate-700 font-medium mb-2 block"
                    htmlFor="marketedBy"
                  >
                    Marketed By
                  </Label>
                  <Input
                    type="text"
                    id="marketedBy"
                    name="marketedBy"
                    value={formData.marketedBy}
                    onChange={handleChange}
                    placeholder="Enter marketing company"
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="mb-6">
              <Label
                className="text-slate-700 font-medium mb-2 block"
                htmlFor="keyFeatures"
              >
                Key Features
              </Label>
              <Textarea
                id="keyFeatures"
                name="keyFeatures"
                value={formData.keyFeatures}
                onChange={handleChange}
                placeholder="Enter key product features"
                className="mt-1.5 min-h-20"
              />
            </motion.div>
            {/* Accordion sections for detailed product information */}
            <motion.div variants={itemVariants}>
              <Accordion type="single" collapsible className="w-full">
                {/* Short Description Section */}
                <AccordionItem value="shortDescription">
                  <AccordionTrigger className="text-md font-semibold text-slate-800 hover:no-underline">
                    Short Description
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.shortDescription[0].brand}
                          onChange={(e) =>
                            handleNestedChange(
                              "shortDescription",
                              "brand",
                              e.target.value
                            )
                          }
                          placeholder="Enter brand name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.shortDescription[0].category}
                          onValueChange={(value) =>
                            handleNestedChange(
                              "shortDescription",
                              "category",
                              value
                            )
                          }
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORY_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="itemWeight">Item Weight</Label>
                        <Input
                          id="itemWeight"
                          value={formData.shortDescription[0].itemWeight}
                          onChange={(e) =>
                            handleNestedChange(
                              "shortDescription",
                              "itemWeight",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 250g"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dietType">Diet Type</Label>
                        <Select
                          value={formData.shortDescription[0].dietType}
                          onValueChange={(value) =>
                            handleNestedChange(
                              "shortDescription",
                              "dietType",
                              value
                            )
                          }
                        >
                          <SelectTrigger id="dietType">
                            <SelectValue placeholder="Select Diet Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {DIET_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="totalItems">Total Items</Label>
                        <Input
                          type="number"
                          id="totalItems"
                          value={formData.shortDescription[0].totalItems}
                          onChange={(e) =>
                            handleNestedChange(
                              "shortDescription",
                              "totalItems",
                              e.target.value
                            )
                          }
                          placeholder="Number of items in package"
                        />
                      </div>
                      <div>
                        <Label htmlFor="flavor">Flavor</Label>
                        <Select
                          value={formData.shortDescription[0].flavor}
                          onValueChange={(value) =>
                            handleNestedChange(
                              "shortDescription",
                              "flavor",
                              value
                            )
                          }
                        >
                          <SelectTrigger id="flavor">
                            <SelectValue placeholder="Select Flavor" />
                          </SelectTrigger>
                          <SelectContent>
                            {FLAVOR_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="packagingType">Packaging Type</Label>
                        <Select
                          value={formData.shortDescription[0].packagingType}
                          onValueChange={(value) =>
                            handleNestedChange(
                              "shortDescription",
                              "packagingType",
                              value
                            )
                          }
                        >
                          <SelectTrigger id="packagingType">
                            <SelectValue placeholder="Select Packaging Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {PACKAGING_TYPE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Nutrition Info Section */}
                <AccordionItem value="nutritionInfo">
                  <AccordionTrigger className="text-md font-semibold text-slate-800 hover:no-underline">
                    Nutrition Information
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="protien">Protein</Label>
                        <Input
                          id="protien"
                          value={formData.nutritionInfo[0].protien}
                          onChange={(e) =>
                            handleNestedChange(
                              "nutritionInfo",
                              "protien",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 5g"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fat">Fat</Label>
                        <Input
                          id="fat"
                          value={formData.nutritionInfo[0].fat}
                          onChange={(e) =>
                            handleNestedChange(
                              "nutritionInfo",
                              "fat",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 2g"
                        />
                      </div>
                      <div>
                        <Label htmlFor="carbohydrates">Carbohydrates</Label>
                        <Input
                          id="carbohydrates"
                          value={formData.nutritionInfo[0].carbohydrates}
                          onChange={(e) =>
                            handleNestedChange(
                              "nutritionInfo",
                              "carbohydrates",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 15g"
                        />
                      </div>
                      <div>
                        <Label htmlFor="iron">Iron</Label>
                        <Input
                          id="iron"
                          value={formData.nutritionInfo[0].iron}
                          onChange={(e) =>
                            handleNestedChange(
                              "nutritionInfo",
                              "iron",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 2mg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="calcium">Calcium</Label>
                        <Input
                          id="calcium"
                          value={formData.nutritionInfo[0].calcium}
                          onChange={(e) =>
                            handleNestedChange(
                              "nutritionInfo",
                              "calcium",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 50mg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="vitamin">Vitamin</Label>
                        <Input
                          id="vitamin"
                          value={formData.nutritionInfo[0].vitamin}
                          onChange={(e) =>
                            handleNestedChange(
                              "nutritionInfo",
                              "vitamin",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Vitamin A, B, C"
                        />
                      </div>
                      <div>
                        <Label htmlFor="Energy">Energy</Label>
                        <Input
                          id="Energy"
                          value={formData.nutritionInfo[0].Energy}
                          onChange={(e) =>
                            handleNestedChange(
                              "nutritionInfo",
                              "Energy",
                              e.target.value
                            )
                          }
                          placeholder="e.g., 120 kcal"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Important Information Section */}
                <AccordionItem value="importantInformation">
                  <AccordionTrigger className="text-md font-semibold text-slate-800 hover:no-underline">
                    Important Information
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label htmlFor="ingredients">Ingredients</Label>
                        <Textarea
                          id="ingredients"
                          value={formData.importantInformation[0].ingredients}
                          onChange={(e) =>
                            handleNestedChange(
                              "importantInformation",
                              "ingredients",
                              e.target.value
                            )
                          }
                          placeholder="List all ingredients"
                          className="min-h-20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="storageTips">Storage Tips</Label>
                        <Textarea
                          id="storageTips"
                          value={formData.importantInformation[0].storageTips}
                          onChange={(e) =>
                            handleNestedChange(
                              "importantInformation",
                              "storageTips",
                              e.target.value
                            )
                          }
                          placeholder="Storage and handling instructions"
                          className="min-h-20"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Product Description Media Section */}
                <AccordionItem value="productDescription">
                  <AccordionTrigger className="text-md font-semibold text-slate-800 hover:no-underline">
                    Product Description Media
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 mt-2">
                      {/* Product Description Images */}
                      <div>
                        <Label
                          className="text-slate-700 font-medium mb-2 block"
                          htmlFor="productDescImages"
                        >
                          Additional Images for Product Description
                        </Label>
                        <div className="flex flex-col">
                          <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer mb-3">
                            <input
                              type="file"
                              id="productDescImages"
                              name="productDescImages"
                              onChange={handleProductDescImagesChange}
                              accept="image/*"
                              className="hidden"
                              multiple
                            />
                            <label
                              htmlFor="productDescImages"
                              className="cursor-pointer flex flex-col items-center justify-center h-32"
                            >
                              {productDescImagesPreviews.length > 0 ? (
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {productDescImagesPreviews.map(
                                    (preview, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={preview}
                                          alt={`Description image ${index + 1}`}
                                          className="h-28 object-contain"
                                        />
                                        <span className="absolute bottom-0 right-0 bg-slate-800 text-white text-xs px-1 rounded">
                                          Image {index + 1}
                                        </span>
                                      </div>
                                    )
                                  )}
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
                                    Click to upload additional product
                                    description images
                                  </span>
                                </>
                              )}
                            </label>
                          </div>

                          {productDescImagesPreviews.length > 0 && (
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-slate-600">
                                {productDescImages.length}{" "}
                                {productDescImages.length === 1
                                  ? "image"
                                  : "images"}{" "}
                                selected
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setProductDescImages([]);
                                  setProductDescImagesPreviews([]);

                                  // Update formData
                                  setFormData((prevData) => {
                                    const updatedProductDesc = [
                                      ...prevData.productDescription,
                                    ];
                                    updatedProductDesc[0] = {
                                      ...updatedProductDesc[0],
                                      images: [],
                                    };
                                    return {
                                      ...prevData,
                                      productDescription: updatedProductDesc,
                                    };
                                  });
                                }}
                                className="text-xs"
                              >
                                Clear images
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Description Videos */}
                      <div>
                        <Label
                          className="text-slate-700 font-medium mb-2 block"
                          htmlFor="productDescVideos"
                        >
                          Additional Videos for Product Description
                        </Label>
                        <div className="flex flex-col">
                          <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer mb-3">
                            <input
                              type="file"
                              id="productDescVideos"
                              name="productDescVideos"
                              onChange={handleProductDescVideosChange}
                              accept="video/*"
                              className="hidden"
                              multiple
                            />
                            <label
                              htmlFor="productDescVideos"
                              className="cursor-pointer flex flex-col items-center justify-center h-32"
                            >
                              {productDescVideosPreviews.length > 0 ? (
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {productDescVideosPreviews.map(
                                    (preview, index) => (
                                      <div key={index} className="relative">
                                        <video
                                          src={preview}
                                          className="h-28 object-contain"
                                          controls
                                        />
                                        <span className="absolute bottom-0 right-0 bg-slate-800 text-white text-xs px-1 rounded">
                                          Video {index + 1}
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <>
                                  <svg
                                    className="mx-auto h-12 w-12"
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
                                  <span className="text-slate-500">
                                    Click to upload additional product
                                    description videos
                                  </span>
                                </>
                              )}
                            </label>
                          </div>

                          {productDescVideosPreviews.length > 0 && (
                            <div className="flex justify-between items-center">
                              <p className="text-sm text-slate-600">
                                {productDescVideos.length}{" "}
                                {productDescVideos.length === 1
                                  ? "video"
                                  : "videos"}{" "}
                                selected
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setProductDescVideos([]);
                                  setProductDescVideosPreviews([]);

                                  // Update formData
                                  setFormData((prevData) => {
                                    const updatedProductDesc = [
                                      ...prevData.productDescription,
                                    ];
                                    updatedProductDesc[0] = {
                                      ...updatedProductDesc[0],
                                      videos: [],
                                    };
                                    return {
                                      ...prevData,
                                      productDescription: updatedProductDesc,
                                    };
                                  });
                                }}
                                className="text-xs"
                              >
                                Clear videos
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Measurements Section */}
                <AccordionItem value="measurements">
                  <AccordionTrigger className="text-md font-semibold text-slate-800 hover:no-underline">
                    Measurements
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6 mt-2">
                      {/* Without Packaging */}
                      <div>
                        <h3 className="text-md font-medium text-slate-800 mb-3">
                          Without Packaging
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="withoutHeight">Height</Label>
                            <Input
                              id="withoutHeight"
                              value={
                                formData.measurements[0]?.withoutPackaging[0]
                                  ?.height || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  "withoutPackaging",
                                  "height",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 10cm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="withoutWeight">Weight</Label>
                            <Input
                              id="withoutWeight"
                              value={
                                formData.measurements[0]?.withoutPackaging[0]
                                  ?.weight || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  "withoutPackaging",
                                  "weight",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 200g"
                            />
                          </div>
                          <div>
                            <Label htmlFor="withoutWidth">Width</Label>
                            <Input
                              id="withoutWidth"
                              value={
                                formData.measurements[0]?.withoutPackaging[0]
                                  ?.width || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  "withoutPackaging",
                                  "width",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 5cm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="withoutLength">Length</Label>
                            <Input
                              id="withoutLength"
                              value={
                                formData.measurements[0]?.withoutPackaging[0]
                                  ?.length || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  "withoutPackaging",
                                  "length",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 15cm"
                            />
                          </div>
                        </div>
                      </div>

                      {/* With Packaging */}
                      <div>
                        <h3 className="text-md font-medium text-slate-800 mb-3">
                          With Packaging
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="withHeight">Height</Label>
                            <Input
                              id="withHeight"
                              value={
                                formData.measurements[0]?.withPackaging[0]
                                  ?.height || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  "withPackaging",
                                  "height",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 12cm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="withWeight">Weight</Label>
                            <Input
                              id="withWeight"
                              value={
                                formData.measurements[0]?.withPackaging[0]
                                  ?.weight || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  "withPackaging",
                                  "weight",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 250g"
                            />
                          </div>
                          <div>
                            <Label htmlFor="withWidth">Width</Label>
                            <Input
                              id="withWidth"
                              value={
                                formData.measurements[0]?.withPackaging[0]
                                  ?.width || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  "withPackaging",
                                  "width",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 7cm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="withLength">Length</Label>
                            <Input
                              id="withLength"
                              value={
                                formData.measurements[0]?.withPackaging[0]
                                  ?.length || ""
                              }
                              onChange={(e) =>
                                handleMeasurementChange(
                                  "withPackaging",
                                  "length",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 17cm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
            {/* Product Images */}{" "}
            <motion.div variants={itemVariants} className="mb-6">
              {" "}
              <Label
                className="text-slate-700 font-medium mb-2 block"
                htmlFor="productImages"
              >
                Product Images<span className="text-red-500">*</span> (Select up
                to 10 images)
              </Label>
              <div className="flex flex-col">
                <div
                  className={`w-full bg-slate-50 border-2 border-dashed ${
                    formErrors.images ? "border-red-400" : "border-slate-300"
                  } rounded-lg p-4 text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer mb-3`}
                >
                  <input
                    type="file"
                    id="productImages"
                    name="productImages"
                    onChange={handleImagesChange}
                    accept="image/*"
                    className="hidden"
                    multiple
                    required
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
                            />{" "}
                            <span className="absolute bottom-0 right-0 bg-slate-800 text-white text-xs px-1 rounded">
                              Image {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-10 w-10 ${
                            formErrors.images
                              ? "text-red-400"
                              : "text-slate-400"
                          } mb-2`}
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
                        </svg>{" "}
                        <span
                          className={`${
                            formErrors.images
                              ? "text-red-500"
                              : "text-slate-500"
                          }`}
                        >
                          Click to upload product images (up to 10)
                        </span>
                        <span className="text-slate-400 text-sm mt-1">
                          First image will be used as the front image
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {formErrors.images && (
                  <p className="text-red-500 text-sm mt-1 mb-2">
                    {formErrors.images}
                  </p>
                )}

                {imagesPreviews.length > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">
                      {images.length} {images.length === 1 ? "image" : "images"}{" "}
                      selected
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
            {/* Video Upload Section */}
            <motion.div variants={itemVariants} className="mb-6">
              <Label
                className="text-slate-700 font-medium mb-2 block"
                htmlFor="productVideos"
              >
                Product Videos (Select up to 3 videos)
              </Label>
              <div className="flex flex-col">
                <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer mb-3">
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
                    className="cursor-pointer flex flex-col items-center justify-center h-32"
                  >
                    {videosPreviews.length > 0 ? (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {videosPreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <video
                              src={preview}
                              className="h-28 object-contain"
                              controls
                            />
                            <span className="absolute bottom-0 right-0 bg-slate-800 text-white text-xs px-1 rounded">
                              Video {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12"
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
                        <span className="text-slate-500">
                          Click to upload product videos (up to 3)
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {videosPreviews.length > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600">
                      {videos.length} {videos.length === 1 ? "video" : "videos"}{" "}
                      selected
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setVideos([]);
                        setVideosPreviews([]);
                      }}
                      className="text-xs"
                    >
                      Clear videos
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
