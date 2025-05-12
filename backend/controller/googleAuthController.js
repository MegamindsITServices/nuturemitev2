import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import axios from "axios";

// Verify token from Google and create/login user
export const verifyGoogleToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: "No token provided" 
      });
    }
    
    // Get user info from Google
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    );
    
    const { 
      email, 
      given_name: firstName, 
      family_name: lastName, 
      picture: profileImage 
    } = googleResponse.data;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: "Google authentication failed" 
      });
    }
    
    // Check if user exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user if doesn't exist
      const password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = await new User({
        email,
        firstName: firstName || "",
        lastName: lastName || "",
        password, // Random password
        image: profileImage || "",
        isAdmin: false,
        isUser: true,
        cart: [],
      }).save();
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    // Return user info and token
    return res.status(200).json({
      success: true,
      message: "Google authentication successful",
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
      token: jwtToken,
    });
    
  } catch (error) {
    console.error("Google verification error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during Google authentication" 
    });
  }
};
