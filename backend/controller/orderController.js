import Order from "../models/orderModel.js";

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("collection")
      .limit(10)
      .sort({ createdAt: 1 });
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
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getOrderByUser = async (req, res) => {
  try {
    const { userId } = await req.params;
    console.log(userId);
    const orders = await Order.find({ buyer: userId });

    res.status(200).send({
      success: true,
      countTotal: orders.length,
      message: "Single orders",
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    return res.status(500).json({ message: "Internal server error" });
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

    const orders = await Order.find({ buyer: userId }).sort({ createdAt: -1 }); // Sort by newest first

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
    const { products, buyer, address, phone, payment } = req.body;
    const newOrder = new Order({
      products,
      buyer,
      address,
      phone,
      payment,
    });
    await newOrder.save();
    res.status(201).send({
      success: true,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const { products, buyer, address, phone, payment } = req.body;
    order.products = products;
    order.buyer = buyer;
    order.address = address;
    order.phone = phone;
    order.payment = payment;
    await order.save();
    res.status(200).send({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteOrder = async (req, res) => {
  try {
  } catch (error) {}
};
export const getCancelOrder = async (req, res) => {
  try {
  } catch (error) {}
};
