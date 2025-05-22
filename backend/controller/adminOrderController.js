import Order from "../models/orderModel.js";

// Get all orders for admin dashboard with pagination and sorting
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt", status } = req.query;
    
    // Build query conditions
    const queryConditions = {};
    if (status && status !== 'all') {
      queryConditions.status = status;
    }
    
    // Count total orders matching the query
    const totalOrders = await Order.countDocuments(queryConditions);
    
    // Fetch orders with pagination and sorting
    const orders = await Order.find(queryConditions)
      .populate("buyer", "name email")
      .populate("products", "name price")
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    res.status(200).json({
      success: true,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
      orders,
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get order details by ID for admin
export const getOrderDetailsAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate("buyer", "name email phone")
      .populate("products", "name price images category");
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

// Update order status
export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = [
      "Confirmed",
      "Processing",
      "Out for Delivery",
      "Shipped",
      "Delivered",
      "Cancelled"
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    
    // Update order status
    order.status = status;
    
    // If order is cancelled, handle payment status update
    if (status === "Cancelled" && order.payment.status === "Completed") {
      order.payment.status = "Refunded";
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Get order statistics for admin dashboard
export const getOrderStatistics = async (req, res) => {
  try {
    // Count orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      }
    ]);
    
    // Count orders by payment status
    const ordersByPaymentStatus = await Order.aggregate([
      {
        $group: {
          _id: "$payment.status",
          count: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      }
    ]);
    
    // Get total revenue
    const totalRevenue = await Order.aggregate([
      {
        $match: { status: { $ne: "Cancelled" } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }
    ]);
    
    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrdersCount = await Order.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    const recentOrdersRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      statistics: {
        ordersByStatus,
        ordersByPaymentStatus,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        recentOrders: {
          count: recentOrdersCount,
          revenue: recentOrdersRevenue.length > 0 ? recentOrdersRevenue[0].total : 0
        }
      }
    });
  } catch (error) {
    console.error("Error fetching order statistics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order statistics",
      error: error.message,
    });
  }
};