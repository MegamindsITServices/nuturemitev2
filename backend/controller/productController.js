import slugify from "slugify";
import Product from "../models/productModel.js";
import Collection from "../models/collectionModel.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

// Get the uploads directory path
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      shippingPrice,
      originalPrice,
      discount,
      feature,
      collection,
      shortDescription,
      nutritionInfo,
      importantInformation,
      productDescription,
      measurements,
      manufacturer,
      marketedBy,
      keyFeatures,
    } = req.body;

    // Check required fields
    if (!name || !description || !price || !originalPrice || !collection) {
      return res.status(400).json({ message: "Missing required fields" });
    }


    // Process uploaded images and videos for the main product
    const images = req.files?.images?.map((file) => file.filename) || [];
    const videos = req.files?.videos?.map((file) => file.filename) || [];

    // Process additional media for product description section
    const productDescImages =
      req.files?.productDescImages?.map((file) => file.filename) || [];
    const productDescVideos =
      req.files?.productDescVideos?.map((file) => file.filename) || [];

    // Validate minimum required files
    if (images.length < 1) {
      return res.status(400).json({ message: "At least 1 image is required" });
    }

    const slug = slugify(name, { lower: true });

    // Find collection by name or ID
    let collectionId;

    // Check if the collection is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(collection)) {
      // If it's a valid ObjectId, use it directly
      collectionId = collection;

      // Verify the collection exists
      const collectionExists = await Collection.findById(collectionId);
      if (!collectionExists) {
        return res
          .status(404)
          .json({ message: "Collection not found with the provided ID" });
      }
    } else {
      // If not a valid ObjectId, try to find by name
      const collectionDoc = await Collection.findOne({ name: collection });
      if (!collectionDoc) {
        return res
          .status(404)
          .json({ message: "Collection not found with the provided name" });
      }
      collectionId = collectionDoc._id;
    }

    // Parse complex JSON fields if they were sent as strings
    let parsedShortDescription = shortDescription;
    let parsedNutritionInfo = nutritionInfo;
    let parsedImportantInformation = importantInformation;
    let parsedMeasurements = measurements;
    let parsedProductDescription = productDescription;

    try {
      if (typeof shortDescription === "string") {
        parsedShortDescription = JSON.parse(shortDescription);
      }
      if (typeof nutritionInfo === "string") {
        parsedNutritionInfo = JSON.parse(nutritionInfo);
      }
      if (typeof importantInformation === "string") {
        parsedImportantInformation = JSON.parse(importantInformation);
      }
      if (typeof measurements === "string") {
        parsedMeasurements = JSON.parse(measurements);
      }
      if (typeof productDescription === "string") {
        parsedProductDescription = JSON.parse(productDescription);
      }
    } catch (e) {
      console.error("Error parsing JSON fields:", e);
    }

    // Update product description with media files if they exist
    if (productDescImages.length > 0 || productDescVideos.length > 0) {
      // Initialize product description if it doesn't exist
      parsedProductDescription = parsedProductDescription || [{}];

      // Add the images and videos to the product description
      parsedProductDescription[0] = {
        ...parsedProductDescription[0],
        images: productDescImages,
        videos: productDescVideos,
      };
    }

    // Create new product with all fields from updated model
    const newProduct = new Product({
      name,
      slug,
      description,
      price,
      originalPrice,
      discount,
      feature,
      collection: collectionId,
      images,
      videos,
      // Add new fields from the updated model
      shortDescription: parsedShortDescription || [],
      nutritionInfo: parsedNutritionInfo || [],
      importantInformation: parsedImportantInformation || [],
      productDescription: parsedProductDescription || [
        {
          images: [],
          videos: [],
        },
      ],
      measurements: parsedMeasurements || [],
      manufacturer: manufacturer || "",
      marketedBy: marketedBy || "",
      keyFeatures: keyFeatures || "",
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, search } = req.query;

    // Create query object
    const query = {};

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Create sort object
    let sortOptions = {};
    if (sort) {
      // Example: sort=price,-name (ascending price, descending name)
      const sortFields = sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      // Default sort by creation date, newest first
      sortOptions = { _id: -1 };
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with pagination and populate collection
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .populate("collection", "name slug")
      .populate("reviews");

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("collection", "name slug")
      .populate("reviews");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // If product has reviews, calculate average rating
    let avgRating = 0;
    let reviewsCount = 0;

    if (product.reviews && product.reviews.length > 0) {
      reviewsCount = product.reviews.length;
      const totalRating = product.reviews.reduce(
        (sum, review) => sum + (review.reviewStars || 0),
        0
      );
      avgRating = reviewsCount > 0 ? totalRating / reviewsCount : 0;
    }

    // Add rating data to response
    const productWithRatings = {
      ...product._doc,
      avgRating,
      reviewsCount,
    };

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product: productWithRatings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product by slug",
      error: error.message,
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "collection",
      "name slug"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    // Check if product exists
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      feature,
      collection,
      shortDescription,
      nutritionInfo,
      importantInformation,
      productDescription,
      measurements,
      manufacturer,
      marketedBy,
      keyFeatures,
    } = req.body;
    const updatedProductData = {};
    if (name) {
      updatedProductData.name = name;
      updatedProductData.slug = slugify(name, { lower: true });
    }
    const simpleFields = [
      "description",
      "price",
      "originalPrice",
      "discount",
      "manufacturer",
      "marketedBy",
      "keyFeatures",
    ];
    simpleFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updatedProductData[field] = req.body[field];
      }
    });
    if (feature && !["sold out", "new", "hot"].includes(feature)) {
      return res.status(400).json({
        message: "Feature must be one of: 'sold out', 'new', 'hot'",
      });
    } else if (feature) {
      updatedProductData.feature = feature;
    }
    if (collection) {
      let collectionId;
      if (mongoose.Types.ObjectId.isValid(collection)) {
        collectionId = collection;
        const collectionExists = await Collection.findById(collectionId);
        if (!collectionExists) {
          return res.status(404).json({
            message: "Collection not found with the provided ID",
          });
        }
      } else {
        const collectionDoc = await Collection.findOne({ name: collection });
        if (!collectionDoc) {
          return res.status(404).json({
            message: "Collection not found with the provided name",
          });
        }
        collectionId = collectionDoc._id;
      }
      updatedProductData.collection = collectionId;
    }
    try {
      if (typeof shortDescription === "string") {
        updatedProductData.shortDescription = JSON.parse(shortDescription);
      } else if (shortDescription) {
        updatedProductData.shortDescription = shortDescription;
      }
      if (typeof nutritionInfo === "string") {
        updatedProductData.nutritionInfo = JSON.parse(nutritionInfo);
      } else if (nutritionInfo) {
        updatedProductData.nutritionInfo = nutritionInfo;
      }
      if (typeof importantInformation === "string") {
        updatedProductData.importantInformation =
          JSON.parse(importantInformation);
      } else if (importantInformation) {
        updatedProductData.importantInformation = importantInformation;
      }
      if (typeof measurements === "string") {
        updatedProductData.measurements = JSON.parse(measurements);
      } else if (measurements) {
        updatedProductData.measurements = measurements;
      }
      if (typeof productDescription === "string") {
        updatedProductData.productDescription = JSON.parse(productDescription);
      } else if (productDescription) {
        updatedProductData.productDescription = productDescription;
      }
    } catch (e) {
      console.error("Error parsing JSON fields:", e);
      return res
        .status(400)
        .json({ message: "Invalid JSON format in request body" });
    }
    // Merge images/videos logic
    // Main product images
    let mergedImages = existingProduct.images || [];
    if (req.body.existingImages) {
      try {
        mergedImages = JSON.parse(req.body.existingImages);
      } catch {}
    }
    if (req.files && req.files.images && req.files.images.length > 0) {
      mergedImages = [
        ...mergedImages,
        ...req.files.images.map((file) => file.filename),
      ];
    }
    updatedProductData.images = mergedImages;
    // Main product videos
    let mergedVideos = existingProduct.videos || [];
    if (req.body.existingVideos) {
      try {
        mergedVideos = JSON.parse(req.body.existingVideos);
      } catch {}
    }
    if (req.files && req.files.videos && req.files.videos.length > 0) {
      mergedVideos = [
        ...mergedVideos,
        ...req.files.videos.map((file) => file.filename),
      ];
    }
    updatedProductData.videos = mergedVideos;
    // Product description media
    let mergedProductDesc = updatedProductData.productDescription ||
      existingProduct.productDescription || [{}];
    // Images
    let mergedDescImages =
      (mergedProductDesc[0] && mergedProductDesc[0].images) || [];
    if (req.body.existingProductDescImages) {
      try {
        mergedDescImages = JSON.parse(req.body.existingProductDescImages);
      } catch {}
    }
    if (
      req.files &&
      req.files.productDescImages &&
      req.files.productDescImages.length > 0
    ) {
      mergedDescImages = [
        ...mergedDescImages,
        ...req.files.productDescImages.map((file) => file.filename),
      ];
    }
    // Videos
    let mergedDescVideos =
      (mergedProductDesc[0] && mergedProductDesc[0].videos) || [];
    if (req.body.existingProductDescVideos) {
      try {
        mergedDescVideos = JSON.parse(req.body.existingProductDescVideos);
      } catch {}
    }
    if (
      req.files &&
      req.files.productDescVideos &&
      req.files.productDescVideos.length > 0
    ) {
      mergedDescVideos = [
        ...mergedDescVideos,
        ...req.files.productDescVideos.map((file) => file.filename),
      ];
    }
    mergedProductDesc[0] = {
      ...mergedProductDesc[0],
      images: mergedDescImages,
      videos: mergedDescVideos,
    };
    updatedProductData.productDescription = mergedProductDesc;
    // Update the product in the database with all changes
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedProductData,
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete associated files
    const deleteImageFiles = (imageFiles) => {
      if (!imageFiles || !Array.isArray(imageFiles)) return;

      imageFiles.forEach((filename) => {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    };

    // Delete main product images and videos
    deleteImageFiles(product.images);
    deleteImageFiles(product.videos);

    // Delete product description images and videos
    if (product.productDescription && product.productDescription[0]) {
      deleteImageFiles(product.productDescription[0].images);
      deleteImageFiles(product.productDescription[0].videos);
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(productId);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getProductsByCollectionId = async (req, res) => {
  try {
    const { collectionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection ID",
      });
    }

    // Get products by collection ID with a limit
    const products = await Product.find({ collection: collectionId })
      .limit(8) // Limit to 8 products for related products section
      .populate("collection", "name slug")
      .populate("reviews")
      .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error in getProductsByCollectionId:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products by collection ID",
      error: error.message,
    });
  }
};

export const getProductsBySearch = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search keyword must be at least 2 characters",
      });
    }

    // Search products by name or description
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    })
      .limit(10) // Limit to 10 results for quick suggestion display
      .populate("collection", "name slug");

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message,
    });
  }
};

export const getProductsByCollection = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { page = 1, limit = 12, sort } = req.query;

    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid collection ID",
      });
    }

    // Verify collection exists
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found",
      });
    }

    // Create query for products with specified collection ID
    const query = { collection: collectionId };

    // Create sort object
    let sortOptions = {};
    if (sort) {
      const sortFields = sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      // Default sort
      sortOptions = { _id: -1 }; // Newest first
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .populate("collection", "name slug");

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      collection: collection.name,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products by collection",
      error: error.message,
    });
  }
};

export const getProductsByPrice = async (req, res) => {
  try {
    const { min = 0, max = Number.MAX_SAFE_INTEGER } = req.query;
    const { page = 1, limit = 12, sort } = req.query;

    // Validate min and max are numbers
    const minPrice = Number(min);
    const maxPrice = Number(max);

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      return res.status(400).json({
        success: false,
        message: "Min and max price must be numbers",
      });
    }

    // Create query for price range
    const query = {
      price: { $gte: minPrice, $lte: maxPrice },
    };

    // Create sort object
    let sortOptions = {};
    if (sort) {
      const sortFields = sort.split(",");
      sortFields.forEach((field) => {
        if (field.startsWith("-")) {
          sortOptions[field.substring(1)] = -1;
        } else {
          sortOptions[field] = 1;
        }
      });
    } else {
      // Default sort by price
      sortOptions = { price: 1 }; // Low to high
    }

    // Calculate pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Execute query with pagination
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber)
      .populate("collection", "name slug");

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      products,
      priceRange: { min: minPrice, max: maxPrice },
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products by price range",
      error: error.message,
    });
  }
};
