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
    const { name, description, price, originalPrice, discount, feature, collection } = req.body;
    if (!name || !description || !price || !originalPrice || !collection) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (feature && !['sold out', 'new', 'hot'].includes(feature)) {
      return res.status(400).json({ message: "Feature must be one of: 'sold out', 'new', 'hot'" });
    }
    
    // Process uploaded images and videos
    const images = req.files?.images?.map(file => file.filename) || [];
    const videos = req.files?.videos?.map(file => file.filename) || [];
    
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
        return res.status(404).json({ message: "Collection not found with the provided ID" });
      }
    } else {
      // If not a valid ObjectId, try to find by name
      const collectionDoc = await Collection.findOne({ name: collection });
      if (!collectionDoc) {
        return res.status(404).json({ message: "Collection not found with the provided name" });
      }
      collectionId = collectionDoc._id;
    }    // Create new product with image and video paths
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
      videos
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
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Create sort object
    let sortOptions = {};
    if (sort) {
      // Example: sort=price,-name (ascending price, descending name)
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
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
      .populate('collection', 'name slug');

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    
    res.status(200).json({
      products,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({slug: req.params.slug})
      .populate('collection', 'name slug')
      .populate('reviews');
      
    // If product has reviews, calculate average rating
    let avgRating = 0;
    let reviewsCount = 0;
    
    if (product && product.reviews && product.reviews.length > 0) {
      reviewsCount = product.reviews.length;
      const totalRating = product.reviews.reduce((sum, review) => sum + review.reviewStars, 0);
      avgRating = totalRating / reviewsCount;
    }
    
    // Add rating data to response
    const productWithRatings = {
      ...product._doc,
      avgRating,
      reviewsCount
    };
      
    res.status(200).send({
      success: true,
      message: "Product fetched successfully",
      product: productWithRatings,
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid product ID"
      });
    }
    
    const product = await Product.findById(productId)
      .populate('collection', 'name slug')
      .populate('reviews');
      
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    // If product has reviews, calculate average rating
    let avgRating = 0;
    let reviewsCount = 0;
    
    if (product.reviews && product.reviews.length > 0) {
      reviewsCount = product.reviews.length;
      const totalRating = product.reviews.reduce((sum, review) => sum + review.reviewStars, 0);
      avgRating = totalRating / reviewsCount;
    }
    
    // Add rating data to response
    const productWithRatings = product.toObject();
    productWithRatings.avgRating = avgRating;
    productWithRatings.reviewsCount = reviewsCount;
      
    res.status(200).json({
      success: true,
      message: "Product fetched successfully by ID",
      product: productWithRatings,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching product by ID",
      error: error.message
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Find product to update
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Extract data from request body
    const { name, description, price, originalPrice, discount, feature, collection } = req.body;
    
    // Update basic fields
    const updateData = {
      name: name || product.name,
      description: description || product.description,
      price: price || product.price,
      originalPrice: originalPrice || product.originalPrice,
      discount: discount !== undefined ? discount : product.discount
    };
    
    // Update slug if name changes
    if (name) {
      updateData.slug = slugify(name, { lower: true });
    }
    
    // Validate feature if provided
    if (feature) {
      if (!['sold out', 'new', 'hot'].includes(feature)) {
        return res.status(400).json({ message: "Feature must be one of: 'sold out', 'new', 'hot'" });
      }
      updateData.feature = feature;
    }
    
    // Handle collection update
    if (collection) {
      // Find collection by name or ID
      let collectionId;
      
      // Check if the collection is a valid ObjectId
      if (mongoose.Types.ObjectId.isValid(collection)) {
        // If it's a valid ObjectId, use it directly
        collectionId = collection;
        
        // Verify the collection exists
        const collectionExists = await Collection.findById(collectionId);
        if (!collectionExists) {
          return res.status(404).json({ message: "Collection not found with the provided ID" });
        }
      } else {
        // If not a valid ObjectId, try to find by name
        const collectionDoc = await Collection.findOne({ name: collection });
        if (!collectionDoc) {
          return res.status(404).json({ message: "Collection not found with the provided name" });
        }
        collectionId = collectionDoc._id;
      }
      
      updateData.collection = collectionId;
    }
    
    // Handle image updates if files are provided
    if (req.files) {
      // Update images if provided
      if (req.files.images && req.files.images.length > 0) {
        // Store new image filenames
        updateData.images = req.files.images.map(file => file.filename);
      }
      
      // Update videos if provided
      if (req.files.videos && req.files.videos.length > 0) {
        // Store new video filenames
        updateData.videos = req.files.videos.map(file => file.filename);
      }
    }
    
    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true }
    ).populate('collection', 'name slug');
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Find product to delete
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    // Delete associated images
    // Delete all associated images and videos
    if (product.images && product.images.length > 0) {
      product.images.forEach(image => {
        const imagePath = path.join(uploadsDir, image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }
    
    if (product.videos && product.videos.length > 0) {
      product.videos.forEach(video => {
        const videoPath = path.join(uploadsDir, video);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
        }
      });
    }
    
    // Delete the product
    await Product.findByIdAndDelete(productId);
    
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsByCollectionId = async (req, res) => {
  try {
    const { collectionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(collectionId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid collection ID" 
      });
    }
    
    // Get products by collection ID with a limit
    const products = await Product.find({ collection: collectionId })
      .limit(8) // Limit to 8 products for related products section
      .populate('collection', 'name slug')
      .sort({ createdAt: -1 }); // Show newest first
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Error in getProductsByCollectionId:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching products by collection ID", 
      error: error.message
    });
  }
};

export const getProductsBySearch = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword || keyword.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        message: "Search keyword must be at least 2 characters"
      });
    }
    
    // Search products by name or description
    const products = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ]
    })
    .limit(10) // Limit to 10 results for quick suggestion display
    .populate('collection', 'name slug');
    
    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error searching products",
      error: error.message
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
        message: "Invalid collection ID" 
      });
    }
    
    // Verify collection exists
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return res.status(404).json({ 
        success: false,
        message: "Collection not found" 
      });
    }
    
    // Create query for products with specified collection ID
    const query = { collection: collectionId };
    
    // Create sort object
    let sortOptions = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
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
      .populate('collection', 'name slug');
      
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      products,
      collection: collection.name,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching products by collection", 
      error: error.message
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
        message: "Min and max price must be numbers"
      });
    }
    
    // Create query for price range
    const query = {
      price: { $gte: minPrice, $lte: maxPrice }
    };
    
    // Create sort object
    let sortOptions = {};
    if (sort) {
      const sortFields = sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
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
      .populate('collection', 'name slug');
      
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      products,
      priceRange: { min: minPrice, max: maxPrice },
      currentPage: pageNumber,
      totalPages: Math.ceil(totalProducts / limitNumber),
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching products by price range", 
      error: error.message
    });
  }
};
