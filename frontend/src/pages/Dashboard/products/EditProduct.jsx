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
import {
  GET_COLLECTION,
  GET_PRODUCT_BY_ID,
  UPDATE_PRODUCT,
} from "../../../lib/api-client";
import { getProductImageUrl, getVideoUrl } from "../../../utils/imageUtils";
import { Loader } from "lucide-react";

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
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [videosPreviews, setVideosPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingVideos, setExistingVideos] = useState([]);

  // Product description media states
  const [productDescImages, setProductDescImages] = useState([]);
  const [productDescVideos, setProductDescVideos] = useState([]);
  const [productDescImagesPreviews, setProductDescImagesPreviews] = useState(
    []
  );
  const [productDescVideosPreviews, setProductDescVideosPreviews] = useState(
    []
  );
  const [existingProductDescImages, setExistingProductDescImages] = useState(
    []
  );
  const [existingProductDescVideos, setExistingProductDescVideos] = useState(
    []
  );

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

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setFetchingProduct(true);
      try {
        await getConfig();
        const productUrl = GET_PRODUCT_BY_ID.replace(":id", id);
        const response = await axiosInstance.get(productUrl);

        const productData = response.data.product || response.data;

        // Prepare default values for complex nested objects
        const defaultShortDesc = [
          {
            brand: "",
            category: "",
            itemWeight: "",
            dietType: "",
            totalItems: "",
            flavor: "",
            packagingType: "",
          },
        ];

        const defaultNutritionInfo = [
          {
            protien: "",
            fat: "",
            carbohydrates: "",
            iron: "",
            calcium: "",
            vitamin: "",
            Energy: "",
          },
        ];

        const defaultImportantInfo = [
          {
            ingredients: "",
            storageTips: "",
          },
        ];

        const defaultProductDesc = [
          {
            images: [],
            videos: [],
          },
        ];

        const defaultMeasurements = [
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
        ];

        // Set form data with all fields
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price || "",
          originalPrice: productData.originalPrice || "",
          discount: productData.discount || "",
          feature: productData.feature || "none",
          collection: productData.collection?._id || "",
          // New fields from the updated model
          shortDescription: productData.shortDescription || defaultShortDesc,
          nutritionInfo: productData.nutritionInfo || defaultNutritionInfo,
          importantInformation:
            productData.importantInformation || defaultImportantInfo,
          productDescription:
            productData.productDescription || defaultProductDesc,
          measurements: productData.measurements || defaultMeasurements,
          manufacturer: productData.manufacturer || "",
          marketedBy: productData.marketedBy || "",
          keyFeatures: productData.keyFeatures || "",
        });

        // Set existing images and videos
        if (productData.images && productData.images.length > 0) {
          setExistingImages(productData.images);
        }

        if (productData.videos && productData.videos.length > 0) {
          setExistingVideos(productData.videos);
        }

        // Set existing product description images and videos
        if (
          productData.productDescription &&
          productData.productDescription[0] &&
          productData.productDescription[0].images &&
          productData.productDescription[0].images.length > 0
        ) {
          setExistingProductDescImages(
            productData.productDescription[0].images
          );
        }

        if (
          productData.productDescription &&
          productData.productDescription[0] &&
          productData.productDescription[0].videos &&
          productData.productDescription[0].videos.length > 0
        ) {
          setExistingProductDescVideos(
            productData.productDescription[0].videos
          );
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
        navigate("/admin/products"); // Redirect back to product list on error
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

  // Handle select changes
  const handleSelectChange = (name, value) => {
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
  };

  // Handle image files change
  const handleImagesChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Store the selected files for upload (max 10 images)
      const selectedFiles = Array.from(files).slice(
        0,
        10 - existingImages.length
      );
      setNewImages(selectedFiles);

      // Create previews for all selected images
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setImagesPreviews(previews);
    }
  };

  // Handle video files change
  const handleVideosChange = (e) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      // Store the selected files for upload (max 3 videos)
      const selectedFiles = Array.from(files).slice(
        0,
        3 - existingVideos.length
      );
      setNewVideos(selectedFiles);

      // Create previews for all selected videos
      const previews = selectedFiles.map((file) => URL.createObjectURL(file));
      setVideosPreviews(previews);
    }
  };

  // Remove existing image
  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove existing video
  const removeExistingVideo = (index) => {
    setExistingVideos((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove new image preview
  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove new video preview
  const removeNewVideo = (index) => {
    setNewVideos((prev) => prev.filter((_, i) => i !== index));
    setVideosPreviews((prev) => prev.filter((_, i) => i !== index));
  };
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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

      // Remove image and video references if new ones will be uploaded
      if (
        productDescImages.length > 0 ||
        existingProductDescImages.length > 0
      ) {
        productDescriptionData[0].images = [];
      }

      if (
        productDescVideos.length > 0 ||
        existingProductDescVideos.length > 0
      ) {
        productDescriptionData[0].videos = [];
      }

      productFormData.append(
        "productDescription",
        JSON.stringify(productDescriptionData)
      );

      // Append existing images
      if (existingImages.length > 0) {
        productFormData.append(
          "existingImages",
          JSON.stringify(existingImages)
        );
      }

      // Append existing videos
      if (existingVideos.length > 0) {
        productFormData.append(
          "existingVideos",
          JSON.stringify(existingVideos)
        );
      }

      // Append existing product description media
      if (existingProductDescImages.length > 0) {
        productFormData.append(
          "existingProductDescImages",
          JSON.stringify(existingProductDescImages)
        );
      }

      if (existingProductDescVideos.length > 0) {
        productFormData.append(
          "existingProductDescVideos",
          JSON.stringify(existingProductDescVideos)
        );
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
      const updateUrl = UPDATE_PRODUCT.replace(":id", id);
      const response = await axiosInstance.put(updateUrl, productFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Product updated successfully!");
        navigate("/admin/products");
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
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
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
                    onValueChange={(value) =>
                      handleSelectChange("feature", value)
                    }
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
                  onValueChange={(value) =>
                    handleSelectChange("collection", value)
                  }
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
                </Select>{" "}
              </div>
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
                    className="w-full"
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
                    className="w-full"
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
                className="min-h-20"
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
                          value={formData.shortDescription[0]?.brand || ""}
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
                          value={formData.shortDescription[0]?.itemWeight || ""}
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
                          value={formData.shortDescription[0]?.totalItems || ""}
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
                          value={formData.nutritionInfo[0]?.protien || ""}
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
                          value={formData.nutritionInfo[0]?.fat || ""}
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
                          value={formData.nutritionInfo[0]?.carbohydrates || ""}
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
                          value={formData.nutritionInfo[0]?.iron || ""}
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
                          value={formData.nutritionInfo[0]?.calcium || ""}
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
                          value={formData.nutritionInfo[0]?.vitamin || ""}
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
                          value={formData.nutritionInfo[0]?.Energy || ""}
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
                          value={
                            formData.importantInformation[0]?.ingredients || ""
                          }
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
                          value={
                            formData.importantInformation[0]?.storageTips || ""
                          }
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

                        {/* Existing product description images */}
                        {existingProductDescImages.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-slate-600 mb-2">
                              Current Description Images:
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {existingProductDescImages.map((image, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={getProductImageUrl(image)}
                                    alt={`Product description ${index + 1}`}
                                    className="h-20 w-20 object-contain border rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExistingProductDescImages(
                                        existingProductDescImages.filter(
                                          (_, i) => i !== index
                                        )
                                      );
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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

                        {/* Existing product description videos */}
                        {existingProductDescVideos.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-slate-600 mb-2">
                              Current Description Videos:
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              {existingProductDescVideos.map((video, index) => (
                                <div key={index} className="relative group">
                                  <video
                                    src={getVideoUrl(video)}
                                    className="h-20 w-20 object-contain border rounded"
                                    controls
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExistingProductDescVideos(
                                        existingProductDescVideos.filter(
                                          (_, i) => i !== index
                                        )
                                      );
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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

            {/* Image Upload Section */}
            <motion.div variants={itemVariants} className="mb-6">
              <Label
                className="text-slate-700 font-medium mb-2 block"
                htmlFor="productImages"
              >
                Product Images<span className="text-red-500">*</span> (Max 10
                images)
              </Label>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">
                    Current Images:
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {existingImages.map((image, index) => (
                      <div key={`existing-${index}`} className="relative">
                        {" "}
                        <img
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
                      Click to add new images ({10 - existingImages.length}{" "}
                      remaining)
                    </div>
                  </label>
                </div>
              )}

              {/* New image previews */}
              {imagesPreviews.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">
                    New Images:
                  </h4>
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
                  <h4 className="text-sm font-medium text-slate-600 mb-2">
                    Current Videos:
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {existingVideos.map((video, index) => (
                      <div key={`existing-video-${index}`} className="relative">
                        {" "}
                        <video
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
                      Click to add new videos ({3 - existingVideos.length}{" "}
                      remaining)
                    </div>
                  </label>
                </div>
              )}

              {/* New video previews */}
              {videosPreviews.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">
                    New Videos:
                  </h4>
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
