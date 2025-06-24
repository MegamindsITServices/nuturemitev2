import { createXpressBeesOrder } from "../helpers/xpressbees.js";
import Order from "../models/orderModel.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("products.product")
      .populate("buyer")
      .limit(10)
      .sort({ createdAt: -1 }); // Changed to sort by newest first
    if (!orders) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.status(200).send({
      success: true,
      countTotal: orders.length,
      message: "All orders",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("products.product")
      .populate("buyer");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getOrderByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("Fetching orders for user:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const orders = await Order.find({ buyer: userId })
      .populate("products.product")
      .populate("buyer")
      .sort({ createdAt: -1 });

    res.status(200).send({
      success: true,
      countTotal: orders.length,
      message: "User orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all orders for the authenticated user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    const orders = await Order.find({ buyer: userId })
      .populate("products.product")
      .populate("buyer")
      .sort({ createdAt: -1 }); // Sort by newest first

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found",
        orders: [],
      });
    }

    res.status(200).json({
      success: true,
      countTotal: orders.length,
      message: "User orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};
export const getOrderByDate = async (req, res) => {
  try {
  } catch (error) {}
};
export const createOrder = async (req, res) => {
  try {
    // Added for debugging on May 13, 2025
    // Additional validation to ensure totalPrice is always a number
    if (req.body.totalPrice === undefined || isNaN(req.body.totalPrice)) {
      console.warn("Invalid totalPrice received:", req.body.totalPrice);
      console.warn("Request body:", JSON.stringify(req.body, null, 2));
      return res.status(400).json({
        success: false,
        message: "Invalid total price provided. Must be a number.",
        receivedValue: req.body.totalPrice,
        valueType: typeof req.body.totalPrice,
      });
    }
console.log("Creating order with totalPrice:", req.body.totalPrice);

    const { products, buyer, address, phone, payment, totalPrice } = req.body;
    console.log(products);
    const newOrder = new Order({
      products,
      buyer,
      address,
      phone,
      payment,
      totalPrice: parseFloat(totalPrice), // Ensure totalPrice is a number
    });
    await newOrder.save();
    const orderData = await Order.findById(newOrder._id)
      .populate("products.product")
      .populate("buyer");
    const response = await createXpressBeesOrder(orderData);
    // console.log(response);
    newOrder.trackingId = response?.awb_number || "N/A";
    await newOrder.save();
    res.status(201).send({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status, products, buyer, address, phone, payment } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order fields
    if (status) order.status = status;
    if (products) order.products = products;
    if (buyer) order.buyer = buyer;
    if (address) order.address = address;
    if (phone) order.phone = phone;
    if (payment) order.payment = payment;

    // Save the updated order
    const updatedOrder = await order.save();

    // Return the updated order with populated fields
    const populatedOrder = await Order.findById(updatedOrder._id)
      .populate("products.product")
      .populate("buyer");

    res.status(200).send({
      success: true,
      message: "Order updated successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find and delete the order
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};

export const getCancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order can be cancelled
    const nonCancellableStatuses = ["Delivered", "Cancelled"];
    if (nonCancellableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already ${order.status}`,
      });
    }

    // Update the order status to Cancelled
    order.status = "Cancelled";
    await order.save();

    // Return the updated order
    const updatedOrder = await Order.findById(orderId)
      .populate("products.product")
      .populate("buyer");

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};
