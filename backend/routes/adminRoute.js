import express from "express";
import { requireSignIn, isAdmin } from "../middleware/authMiddleware.js";
import { 
  getAllOrdersAdmin, 
  getOrderDetailsAdmin, 
  updateOrderStatusAdmin,
  getOrderStatistics
} from "../controller/adminOrderController.js";

const router = express.Router();

// Order management routes
router.get("/orders", requireSignIn, isAdmin, getAllOrdersAdmin);
router.get("/order/:orderId", requireSignIn, isAdmin, getOrderDetailsAdmin);
router.put("/order/status/:orderId", requireSignIn, isAdmin, updateOrderStatusAdmin);
router.get("/order-statistics", requireSignIn, isAdmin, getOrderStatistics);

export default router;