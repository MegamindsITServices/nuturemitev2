import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import session from "express-session";
import passport from "./config/passport.js";
import collectionRouter from "./routes/collectionRoute.js";
import authRoute from "./routes/authRoute.js";
import productRoute from "./routes/productRoute.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cartRouter from "./routes/cartRoute.js";
import debugRoute from "./routes/debugRoute.js";
import debugPhonepeRoute from "./routes/debugPhonepeRoute.js";
import bannerRoute from "./routes/bannerRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRoute from "./routes/reviewRoute.js";
import adminRouter from "./routes/adminRoute.js";
import Order from "./models/orderModel.js";
import User from "./models/userModel.js";
import EnquiryMessageRoute from "./routes/EnquiryMessageRoute.js";
import transactionRoutes from "./routes/transactionRoutes.js";
// PhonePe integration is handled through our custom helper
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const databaseUrl = process.env.DATABASE_URL;

// PhonePe Integration Information - PRODUCTION MODE
// HOST_URL = "https://api.phonepe.com/apis/hermes"
// MERCHANT_ID = "M228EY1054QWH"
// SALT_INDEX = 1
// API_KEY = "6867369a-26d1-4748-94de-bdc7a1013bf8"

// CORS configuration
// app.use(
//   cors({
//     origin: process.env.ORIGIN || "https://nuturemite.info || https://nuturemite.info",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
const allowedOrigins = [
  "https://nuturemite.info",
  "https://nuturemite.info",
  "https://nuturemite.info/",
  "http://nuturemite.info",
  "https://api.nuturemite.info",
  "http://api.nuturemite.info",
  "https://api.nuturemite.info",
  "https://api.nuturemite.info/",
  "https://nuturemite.info",
  undefined,
];
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS from origin : ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "muntasirul",
    "Accept",
    "Origin",
    "Cache-Control",
    "X-Auth-Token",
    "Access-Control-Allow-Origin",
  ],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
};
// Middleware
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, muntasirul, Cache-Control, X-Auth-Token, Access-Control-Allow-Origin"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
  }
  next();
});

// We'll use helper functions to interact with PhonePe APIs directly
// Set up __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files - make sure this path is correct and accessible
app.use("/image", express.static(path.join(__dirname, "uploads")));
app.use("/profile", express.static(path.join(__dirname, "profile")));
app.use("/banner", express.static(path.join(__dirname, "banner")));
app.use("/test", express.static(path.join(__dirname, "public")));
app.use("/blog", express.static(path.join(__dirname, "blogs"))); // Fixed path for blog images
app.use("/blogs", express.static(path.join(__dirname, "blogs"))); // Keep for backward compatibility
app.use("/blogVideos", express.static(path.join(__dirname, "blogs/videos"))); // Path for blog videos
app.use("/videos", express.static(path.join(__dirname, "uploads"))); // Direct access to videos in uploads folder

// Import video route for video streaming
import videoRoute from "./routes/videoRoute.js";
app.use("/video", videoRoute); // Route for video streaming with advanced features
// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/collections", collectionRouter);
app.use("/api/product", productRoute);
app.use("/api/cart", cartRouter);
app.use("/api/debug", debugRoute);
app.use("/api/debug-phonepe", debugPhonepeRoute);
app.use("/api/banner", bannerRoute);
app.use("/api/order", orderRouter);
app.use("/api/blog", blogRouter);
app.use("/api/reviews", reviewRoute);
app.use("/api/admin", adminRouter);
app.use("/api/user/enquiry", EnquiryMessageRoute);
app.use("/api/transaction", transactionRoutes);
app.post("/api/user/saveShippingAddress", async (req, res) => {
  const { shippingAddress, _id } = req.body;
  const data = await User.findByIdAndUpdate({ _id }, { shippingAddress });
  console.log(data);
  return res.status(200).json({
    success: true,
    message: "Shipping address saved successfully",
  });
});

app.post("/api/user/getShippingAddress", async (req, res) => {
  const { _id } = req.body;
  const shippingAddress = await User.findById(_id);
  console.log(shippingAddress);
  return res.json({ shippingAddress });
});
app.get("/", (req, res) => {
  res.send("Welcome to Nuturemite Backend.");
});

import { generateOrderId } from "./helpers/paymentHelper.js";
import blogRouter from "./routes/blogRoute.js";

// In-memory store for temporary orders (keyed by orderId)
const tempOrderStore = new Map();

app.post("/api/payment/create", async (req, res) => {
  try {
    const { cartItems, customerInfo, totalAmount, shippingAddress } = req.body;
    const order = req.body.orderData;
    if (!customerInfo || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required information",
      });
    }
    const orderId = await generateOrderId();

    // Store the order in the in-memory map for later retrieval (expires on server restart)
    if (order) {
      tempOrderStore.set(orderId, order);
      // Optionally, you can add a timestamp and periodically clean up old entries
    }

    // Import the helper function
    const { createPhonePeOrder } = await import("./helpers/phonepeHelper.js");

    // Prepare order data for PhonePe
    // Include additional metadata in order_meta to help with order creation later
    const orderData = {
      order_id: orderId,
      order_amount: totalAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: customerInfo.userId || "guest_user",
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
      },
      order_meta: {
        return_url: `${
          process.env.FRONTEND_URL || "https://nuturemite.info"
        }/order-success/${orderId}?order_id=${orderId}`,
        notify_url: `${
          process.env.BACKEND_URL || "https://api.nuturemite.info"
        }/api/payment/webhook`,
        // Add necessary order data as metadata
        product_ids: cartItems
          .map((item) => item.productId || item._id)
          .join(","),
        product_names: cartItems.map((item) => item.name).join(", "),
        shipping_address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}`,
      },
    };
    // Create order with PhonePe
    const phonePeResponse = await createPhonePeOrder(orderData);
    if (phonePeResponse && phonePeResponse.success) {
      console.log("Payment session created successfully:", phonePeResponse);

      // Return the payment session details to the frontend
      res.status(200).json({
        success: true,
        payment_session_id: phonePeResponse.payment_session_id,
        payment_url: phonePeResponse.payment_url,
        order_id: orderId,
        // Save these details temporarily - we'll save them properly after payment succeeds
        orderData: {
          products: cartItems.map(
            (item) =>
              ({ product: item.productId, quantity: item.quantity } || {
                productId: item._id,
                quantity: item.quantity,
              })
          ),
          productName: cartItems.map((item) => item.name).join(", "),
          buyer: customerInfo.userId,
          address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}`,
          phone: customerInfo.phone,
          totalPrice: totalAmount,
        },
      });
    } else {
      console.error("Payment creation failed:", phonePeResponse);
      res.status(400).json({
        success: false,
        message: phonePeResponse.message || "Failed to create payment session",
        code: phonePeResponse.code || "ERROR",
      });
    }
  } catch (error) {
    console.log(
      "Payment creation error:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.response ? error.response.data : error.message,
    });
  }
});

app.post("/api/payment/verify", async (req, res) => {
  try {
    const { orderId } = req.body;
    // const orderData = await Order.findById(orderId);
    // check if order payment type is cod
    // if (orderData && orderData.payment.method === "Cash on Delivery") {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Order is Cash on Delivery, no payment verification needed",
    //     order: orderData,
    //   });
    // }
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // Import the helper function
    const { getPhonePeOrderStatus } = await import(
      "./helpers/phonepeHelper.js"
    );

    // Check if we have a temporary order stored
    if (!tempOrderStore.has(orderId)) {
      return res.status(404).json({
        success: false,
        message: "Order not found or has expired",
        orderId,
      });
    }

    // Retrieve the order data from the temporary store
    const orderData2 = tempOrderStore.get(orderId);
    tempOrderStore.delete(orderId);
    try {
      // Get payment status from PhonePe
      const paymentData = await getPhonePeOrderStatus(orderId, orderData2);

      // Check payment status
      if (paymentData && paymentData.order_status === "PAID") {
        res.json({
          success: true,
          message: "Payment verified successfully",
          paymentData,
          orderData2,
        });
      } else {
        // No order was created, which is what we want for failed payments
        res.json({
          success: false,
          message: "Payment verification failed",
          paymentData,
        });
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({
        success: false,
        message: "Error verifying payment with PhonePe",
        error: error.response?.data || error.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error in payment verification",
      error: error.message,
    });
  }
});

// Webhook endpoint for PhonePe payment notifications
app.post("/api/payment/webhook", async (req, res) => {
  try {
    const event = req.body;
    console.log("Received webhook from PhonePe:", event);

    // Validate the webhook signature (recommended in production)
    // const signature = req.headers["x-verify"];
    // if (!validateWebhookSignature(event, signature, process.env.PHONEPE_WEBHOOK_SECRET)) {
    //   return res.status(401).json({ success: false, message: "Invalid signature" });
    // }

    if (event && event.data && event.data.order_id) {
      const orderId = event.data.order_id;
      const orderStatus = event.data.order_status;

      // For successful payments, create or update the order
      if (orderStatus === "PAID") {
        // Check if order already exists
        let order = await Order.findOne({ "payment.transactionId": orderId });

        if (!order) {
          // Create a new order for successful payments
          const productIdsArray = event.data.order_meta?.product_ids
            ? event.data.order_meta.product_ids.split(",")
            : [];

          const structuredProducts = productIdsArray.map((productId) => ({
            product: productId.trim(), // ensure clean ID
            quantity: 1, // default quantity
          }));
          const newOrder = new Order({
            products: structuredProducts,
            productName: event.data.order_meta?.product_names || "Order Items",
            buyer: event.data.customer_details.customer_id,
            address:
              event.data.order_meta?.shipping_address ||
              "Address from webhook data",
            phone: event.data.customer_details.customer_phone,
            totalPrice: event.data.order_amount,
            payment: {
              method: "PhonePe",
              transactionId: orderId,
              status: "Completed",
              responseData: event.data,
            },
            status: "Processing",
          });

          await newOrder.save();
          console.log(`New order created for payment ${orderId}`);
        } else {
          // Update existing order
          order.payment = {
            ...order.payment,
            status: "Completed",
            responseData: event.data,
          };
          order.status = "Processing";

          await order.save();
          console.log(`Order ${orderId} updated to ${orderStatus}`);
        }
      } else if (orderStatus === "FAILED" || orderStatus === "CANCELLED") {
        // For failed payments, check if we already have an order
        const order = await Order.findOne({ "payment.transactionId": orderId });

        if (order) {
          // If order exists, mark it as failed
          order.payment = {
            ...order.payment,
            status: "Failed",
            responseData: event.data,
          };

          await order.save();
          console.log(`Order ${orderId} marked as failed or cancelled`);
        } else {
          // No order to update, which is what we want for failed payments
          console.log(
            `No order found for failed payment ${orderId}, which is expected`
          );
        }
      }
    }

    // Always return 200 for webhooks
    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Still return 200 so Cashfree doesn't retry
    res
      .status(200)
      .json({ success: false, message: "Error processing webhook" });
  }
});

// Connect to MongoDB
mongoose
  .connect(databaseUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
