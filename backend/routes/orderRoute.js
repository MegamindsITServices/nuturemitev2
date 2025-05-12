import express from "express";
import {
  createOrder,
  deleteOrder,
  getAllOrders,
  getCancelOrder,
  getOrderByDate,
  getOrderById,
  getOrderByUser,
  getUserOrders,
  updateOrder,
} from "../controller/orderController.js";
import { requireSignIn } from "../middleware/authMiddleware.js";

const orderRouter = express.Router();

orderRouter.get("/get-all-orders", getAllOrders);
orderRouter.get("/get-order/:id", getOrderById);
orderRouter.get("/get-order-by-user/:userId", getOrderByUser);
orderRouter.get("/user-orders", requireSignIn, getUserOrders);
orderRouter.get("/get-order-by-date/:date", getOrderByDate);
orderRouter.post("/create-order", createOrder);
orderRouter.put("/update-order/:id", updateOrder);
orderRouter.delete("/delete-order/:id", deleteOrder);
orderRouter.post("/get-cancel-orders", getCancelOrder);

export default orderRouter;
