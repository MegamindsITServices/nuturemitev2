import express from "express";
import {
  createTransaction,
  updateTransactionStatus,
  getTransaction,
  getUserTransactions,
} from "../controller/transactionController.js";
import { requireSignIn as requireAuth } from "../middleware/authMiddleware.js"; // Assuming you have auth middleware

const router = express.Router();

// Create a new transaction
router.post("/create", requireAuth, createTransaction);

// Update transaction status (for webhooks or payment confirmation)
router.put("/update/:transactionId", updateTransactionStatus);

// Get transaction by ID
router.get("/:transactionId", getTransaction);

// Get user's transaction history
router.get("/user/:userId", requireAuth, getUserTransactions);

// Get current user's transaction history
router.get("/user/me/history", requireAuth, getUserTransactions);

export default router;
