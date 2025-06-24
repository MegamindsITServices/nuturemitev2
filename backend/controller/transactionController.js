import Transaction from "../models/transactionModel.js";
import Order from "../models/orderModel.js";
import { v4 as uuidv4 } from "uuid";

// Create a new transaction record
export const createTransaction = async (req, res) => {
  try {
    const { orderId, amount, paymentMethod, gatewayTransactionId } = req.body;

    const userId = req.user?.userId || req.body.userId;

    // Validate required fields
    if (!orderId || !amount || !paymentMethod || !userId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: orderId, amount, paymentMethod, userId",
      });
    }

    // Verify order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, buyer: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or doesn't belong to user",
      });
    }

    // Generate unique transaction ID
    const transactionId = `TXN_${Date.now()}_${uuidv4()
      .substring(0, 8)
      .toUpperCase()}`;

    // Create transaction record
    const transaction = new Transaction({
      transactionId,
      user: userId,
      orderId,
      amount,
      paymentMethod,
      gatewayTransactionId,
      status: paymentMethod === "Cash on Delivery" ? "Pending" : "Pending",
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: "Transaction record created successfully",
      transaction: {
        transactionId: transaction.transactionId,
        status: transaction.status,
        amount: transaction.amount,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create transaction record",
      error: error.message,
    });
  }
};

// Update transaction status
export const updateTransactionStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { status, gatewayTransactionId, failureReason } = req.body;

    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Update transaction
    transaction.status = status;
    if (gatewayTransactionId) {
      transaction.gatewayTransactionId = gatewayTransactionId;
    }
    if (status === "Failed" && failureReason) {
      transaction.failureReason = failureReason;
    }

    await transaction.save();

    // Update order payment status
    if (status === "Success") {
      await Order.findByIdAndUpdate(transaction.orderId, {
        "payment.status": "Completed",
        "payment.transactionId": transactionId,
      });
    } else if (status === "Failed") {
      await Order.findByIdAndUpdate(transaction.orderId, {
        "payment.status": "Failed",
      });
    }

    res.json({
      success: true,
      message: "Transaction status updated successfully",
      transaction: {
        transactionId: transaction.transactionId,
        status: transaction.status,
      },
    });
  } catch (error) {
    console.error("Update transaction status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update transaction status",
      error: error.message,
    });
  }
};

// Get transaction by ID
export const getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({ transactionId })
      .populate("orderId", "products totalPrice status")
      .populate("user", "firstName lastName email");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transaction",
      error: error.message,
    });
  }
};

// Get user's transaction history
export const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user?.userId || req.params.userId;
    const { page = 1, limit = 10, status } = req.query;

    let query = { user: userId };
    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("orderId", "products totalPrice status");

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve transaction history",
      error: error.message,
    });
  }
};
