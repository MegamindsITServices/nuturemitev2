import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken';

export const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains the user ID in decoded.id based on your token creation
    next();
  } catch (err) {
    console.error("JWT error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id);
        if (!user || user.isAdmin !== true) {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }
        next();
    } catch (error) {
        console.error("Error checking admin status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}