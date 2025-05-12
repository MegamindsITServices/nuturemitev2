import path from "path";
import Banner from "../models/bannerModel.js";
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const addBanner = async (req, res) => {
  try {
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.filename;
    }
    const uploadBanner = await new Banner({
      bannerImage: imagePath, 
    }).save();
    return res.status(201).send({
      success: true,
      message: "Banner added successfully",
      uploadBanner,
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    return res.status(500).send({
      success: false,
      message: "Error adding banner",
    });
  }
};

export const getBanner = async (req, res) => {
  try {
    const banners = await Banner.find();
    return res.status(200).send({
      success: true,
      message: "All banners fetched successfully",
      banners,
    });
  } catch (error) {
    console.error("Error getting banners:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching banners",
    });
  }
};
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).send({ success: false, message: "Banner not found" });
    }

    // Delete image from file system
    const imagePath = path.join(__dirname, "../banner", banner.bannerImage);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Banner.findByIdAndDelete(id);
    return res.status(200).send({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return res.status(500).send({
      success: false,
      message: "Error deleting banner",
    });
  }
};


export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).send({ success: false, message: "Banner not found" });
    }
    
    // Create update data object
    const updateData = {};
    
    // If a new banner image was uploaded
    if (req.file) {
      // Delete the old image if it exists
      const oldImagePath = path.join(__dirname, "../banner", banner.bannerImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      // Update with new image path
      updateData.bannerImage = req.file.filename;
    }
    
    // Update the banner
    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Return the updated document
    );

    return res.status(200).send({
      success: true,
      message: "Banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    return res.status(500).send({
      success: false,
      message: "Error updating banner",
    });
  }
};