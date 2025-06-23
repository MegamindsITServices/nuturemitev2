import express from 'express';
import { login, googleAuthSuccess, getCurrentUser, signup, addAdmin, GetAdmins, UpdateAdmin ,userData,updateProfile} from '../controller/authController.js';
import { verifyGoogleToken } from '../controller/googleAuthController.js';
import passport from '../config/passport.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { isAdmin, isCustomer, requireSignIn } from '../middleware/authMiddleware.js';
// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, "../profile");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up storage engine for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  
const upload = multer({ storage: storage });
const authRoute = express.Router();

// Email & password login
authRoute.post('/login', login);
authRoute.post('/signup', upload.single('image'), signup);
authRoute.post("/add-admin", requireSignIn, isAdmin, addAdmin)
authRoute.post("/get-admins", requireSignIn, isAdmin, GetAdmins)
authRoute.put("/update-admin/:id", requireSignIn, isAdmin, UpdateAdmin)
authRoute.post("/userData",userData);
authRoute.post("/updateProfile",updateProfile)
// Google OAuth routes
authRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

authRoute.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false
  }),
  googleAuthSuccess
);

// Google token verification for direct frontend OAuth flow
authRoute.post('/google/verify', verifyGoogleToken);

authRoute.get('/admin-auth', requireSignIn, isAdmin, (req,res)=>{
  res.status(200).json({ok: true, message: "You are an admin"});
})
authRoute.get('/customer-auth', requireSignIn, isCustomer, (req,res)=>{
  res.status(200).json({ok: true, message: "You are a customer"});
})
// Get current user
authRoute.get('/me', getCurrentUser);

export default authRoute;