import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    // Transaction Identification
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    // User and Order Information
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // Transaction Details
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment Method
    paymentMethod: {
      type: String,
      required: true,
      enum: [
        "Cash on Delivery",
        "PhonePe",
        "Credit Card",
        "Debit Card",
        "UPI",
        "Net Banking",
      ],
    },

    // Transaction Status
    status: {
      type: String,
      required: true,
      enum: ["Success", "Failed", "Pending"],
      default: "Pending",
    },

    // Gateway Response (if online payment)
    gatewayTransactionId: {
      type: String, // Transaction ID from payment gateway
    },

    // Failure reason (if failed)
    failureReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ orderId: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });

// Static method to find transactions by user
transactionSchema.statics.findByUser = function (userId) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate("orderId", "products totalPrice status");
};

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
