import express from 'express';
import User from '../models/userModel.js';
import { comparePassword } from '../helpers/authHelper.js';

const debugRoute = express.Router();

// Debug route to test password comparison
debugRoute.post('/debug-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    console.log("Raw password from request:", password);
    console.log("Hashed password from DB:", user.password);
    
    const result = await comparePassword(password, user.password);
    console.log("Password comparison result:", result);
    
    return res.json({
      success: true,
      isMatch: result,
      hashLength: user.password.length,
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default debugRoute;
