import slugify from "slugify";
import Collection from "../models/collectionModel.js";

export const collectionController = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Collection name is required",
      });
    }
    const existingCollection = await Collection.findOne({ name });
    if (existingCollection) {
      return res.status(409).json({
        success: false,
        message: "Collection with this name already exists",
      });
    }
    const slug = slugify(name, {
      lower: true,
      strict: true,
    });

    const collection = new Collection({
      name,
      slug,
    });

    await collection.save();

    res.status(201).json({
      success: true,
      message: "Collection created successfully",
      collection,
    });
  } catch (error) {
    console.error("Error in createCollection controller:", error);
    res.status(500).json({
      success: false,
      message: "Error creating collection",
      error: error.message,
    });
  }
};

export const getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find({});
    res.status(200).json({
      success: true,
      count: collections.length,
      collections,
    });
  } catch (error) {
    console.error("Error in getAllCollections controller:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching collections",
      error: error.message,
    });
  }
};

export const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const collection = await Collection.findById(id);
    
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found"
      });
    }
    
    res.status(200).json({
      success: true,
      collection
    });
    
  } catch (error) {
    console.error("Error in getCollectionById controller:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching collection",
      error: error.message
    });
  }
};

export const updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Collection name is required"
      });
    }
    
    // Generate updated slug
    const slug = slugify(name, {
      lower: true,
      strict: true
    });
    
    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      { name, slug },
      { new: true, runValidators: true }
    );
    
    if (!updatedCollection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Collection updated successfully",
      collection: updatedCollection
    });
    
  } catch (error) {
    console.error("Error in updateCollection controller:", error);
    res.status(500).json({
      success: false,
      message: "Error updating collection",
      error: error.message
    });
  }
};

// Delete a collection
export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCollection = await Collection.findByIdAndDelete(id);
    
    if (!deletedCollection) {
      return res.status(404).json({
        success: false,
        message: "Collection not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Collection deleted successfully"
    });
    
  } catch (error) {
    console.error("Error in deleteCollection controller:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting collection",
      error: error.message
    });
  }
};

