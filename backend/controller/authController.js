import User from "../models/userModel.js";

import jwt from "jsonwebtoken";

import { comparePassword, hashPassword } from "../helpers/authHelper.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }    const auth = await comparePassword(password, user.password);
    if (!auth) {
      return res.status(400).send("Password is incorrect");
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "login Successfully",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userId: user._id,
        isAdmin: user.isAdmin,
        isUser: user.isUser,
        phone: user.phone,
        address: user.address,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Modified signup controller
export const signup = async (req, res) => {
  try {
    const { email, password, firstName, lastName, address, phone } = req.body;
    if (!email || !password || !firstName || !lastName || !address || !phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Handle image upload if present
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.filename;
    }

    const hashedPassword = await hashPassword(password)
    // Rest of your code remains the same
    const newUser = await new User({
      email,
      password: hashedPassword,
      address,
      phone,
      firstName,
      lastName,
      image: imagePath,
      isAdmin: false, 
      isUser: true,
      cart: [],
    }).save()

    return res.status(201).send({
      success: true,
      message: "User registered successfully",
      newUser,
  
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error during signup",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Handle Google authentication success
export const googleAuthSuccess = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    const user = req.user;
    // Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    // Prepare user data
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userId: user._id,
      isAdmin: user.isAdmin,
      isUser: user.isUser,
      phone: user.phone,
      address: user.address,
      image: user.image, // Include the image URL
    };

    // Redirect to frontend with token in query params
    // The frontend will extract this and store it
    res.redirect(
      `${
        process.env.CLIENT_URL || "https://nuturemite.info"
      }/auth/google/callback?token=${token}&userData=${encodeURIComponent(JSON.stringify(userData))}`
    );
  } catch (error) {
    console.error("Error in Google authentication:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// For frontend API call to get user data after Google auth
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error getting current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const addAdmin = async (req,res) => {
   
  try{
    const { email, password, firstName, lastName, address, phone, isAdmin } = req.body;
    if (!email || !password || !firstName || !lastName || !address || !phone || !isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Handle image upload if present
    let imagePath = null;
    if (req.file) {
      imagePath = req.file.filename;
    }

    const hashedPassword = await hashPassword(password)
    // Rest of your code remains the same
    const newUser = await new User({
      email,
      password: hashedPassword,
      address,
      phone,
      firstName,
      lastName,
      image: imagePath,
      isAdmin: true, 
      isUser: false,
      cart: [],
    }).save()

    return res.status(201).send({
      success: true,
      message: "Admin registered successfully",
      newUser,
  
    });
  } catch (error) {
    console.error("Signup error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }
    if (error.code === 11000) {
      // Duplicate key error
      return res.status(409).json({
        success: false,
        message: "Email already in use",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error during signup",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
  
export const GetAdmins = async (req, res) => {
  try {
    // Find all users who are admins
    const admins = await User.find({ isAdmin: true }).select("-password");
    
    if (!admins || admins.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No admin users found",
        admins: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin users retrieved successfully",
      admins
    });
  } catch (error) {
    console.error("Error retrieving admin users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while retrieving admin users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

export const UpdateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, isBlocked } = req.body;
    
    // Find the admin user by ID
    const admin = await User.findById(id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }
    
    // Check if the user is an admin
    if (!admin.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "User is not an admin"
      });
    }
    
    // If updating email, check if it's already in use by another user
    if (email && email !== admin.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another user"
        });
      }
    }
    
    // Update admin fields if provided
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (email) admin.email = email;
    if (phone) admin.phone = phone;
    if (address) admin.address = address;
    
    // Handle isBlocked flag if provided (meant for blocking/unblocking admins)
    if (isBlocked !== undefined) {
      admin.isBlocked = isBlocked;
    }
    
    // Save the updated admin
    const updatedAdmin = await admin.save();
    
    return res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: {
        _id: updatedAdmin._id,
        firstName: updatedAdmin.firstName,
        lastName: updatedAdmin.lastName,
        email: updatedAdmin.email,
        phone: updatedAdmin.phone,
        address: updatedAdmin.address,
        isAdmin: updatedAdmin.isAdmin,
        isBlocked: updatedAdmin.isBlocked
      }
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Server error while updating admin",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}

