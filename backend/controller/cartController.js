import Product from "../models/productModel.js";
import User from "../models/userModel.js";

export const addToCart = async (req, res) => {
  try {
    const { productId, userId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Product ID are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Initialize cart if it doesn't exist
    if (!user.cart) {
      user.cart = [];
    }

    // Check if product is already in the cart to prevent duplicates
    const alreadyInCart = user.cart.some(
      (item) => item.toString() === productId
    );

    if (!alreadyInCart) {
      // Add the product ID to the cart (not the full product)
      user.cart.push(productId);
      
      const updatedUser = await user.save();
      
      // Populate the cart to return full product details
      const populatedUser = await User.findById(userId).populate("cart");
      
      res.status(200).json({
        success: true,
        message: "Product added to cart",
        cart: populatedUser.cart
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Product is already in cart",
        cart: (await User.findById(userId).populate("cart")).cart
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};


export const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId).populate("cart");
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    res.status(200).send({ success: true, cart: user.cart });
  } catch (error) {
    console.error("Error getting cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User ID and Product ID are required",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // Filter out the product using its ID
    user.cart = user.cart.filter(item => 
      item.toString() !== productId.toString()
    );

    await user.save();

    // Populate the cart to return full product details
    const populatedUser = await User.findById(userId).populate("cart");

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: populatedUser.cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User ID is required",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Clear the cart
    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: []
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
