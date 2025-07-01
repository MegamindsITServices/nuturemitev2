// Helper functions for PhonePe payment integration
import axios from "axios";
import crypto from "crypto";
import { sendEmail } from "./sendEmail.js";
import Order from "../models/orderModel.js";
import { create } from "domain";

// URLs based on environment
export const testUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox";
export const productionUrl = "https://api.phonepe.com/apis/hermes";

// Base URL for PhonePe API - determined by environment
export const phonepeApiUrl =
  process.env.PHONEPE_ENVIRONMENT === "production" ? productionUrl : testUrl;

// Generate a unique order ID
export const generateOrderId = async () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0");
  return `ORDER_${timestamp}_${random}`;
};

// Generate SHA-256 hash for request data
export const generatePhonePeHash = (payload, salt, endpoint) => {
  // The endpoint should be "/pg/v1/pay" for payment creation
  const stringToHash = payload + endpoint + salt;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  return sha256 + "###1";
};

// Create payment order with PhonePe
export const createPhonePeOrder = async (orderData) => {
  try {
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "M228EY1054QWH";
    // Ensure the phone number is valid (10 digits)
    const phone = orderData.customer_details.customer_phone || "";
    const validatedPhone = phone.replace(/\D/g, "").slice(-10);

    // Determine environment-specific settings
    const isProduction = process.env.PHONEPE_ENVIRONMENT === "production";

    // Prepare the payload for PhonePe
    // Note: In production, the structure might need specific formats
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: orderData.order_id,
      amount: Math.round(orderData.order_amount * 100),
      redirectUrl: orderData.order_meta.return_url,
      redirectMode: "REDIRECT",
      callbackUrl: orderData.order_meta.notify_url,
      mobileNumber: validatedPhone.length === 10 ? validatedPhone : undefined,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    // Remove undefined fields
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });
    // Convert payload to JSON string and then to base64
    const jsonPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(jsonPayload).toString("base64"); // Use the correct salt key from environment variables
    const salt =
      process.env.PHONEPE_API_KEY || "6867369a-26d1-4748-94de-bdc7a1013bf8";

    // Use the environment that was determined earlier
    const endpoint = "/pg/v1/pay";
    const baseUrl = isProduction ? productionUrl : testUrl;

    // Generate checksum with the correct endpoint
    const checksum = generatePhonePeHash(base64Payload, salt, endpoint);
    console.log("Sending request to PhonePe:", {
      environment: isProduction ? "PRODUCTION" : "TEST",
      url: `${baseUrl}${endpoint}`,
      payload: payload,
      salt: salt.substring(0, 5) + "...",
      checksum: checksum,
    });

    // Make API request to PhonePe
    const response = await axios.post(
      `${baseUrl}${endpoint}`,
      {
        request: base64Payload,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
        },
      }
    );

    console.log("PhonePe response:", response.data);
    if (response.data && response.data.success) {
      // Get the payment URL from the response
      // The structure might be different between production and test environments
      let paymentUrl;

      if (
        response.data.data.instrumentResponse &&
        response.data.data.instrumentResponse.redirectInfo
      ) {
        // Test environment structure
        paymentUrl = response.data.data.instrumentResponse.redirectInfo.url;
      } else if (
        response.data.data.paymentInstrumentDetails &&
        response.data.data.paymentInstrumentDetails.payPageInstrument
      ) {
        // Production environment structure might use this format
        paymentUrl =
          response.data.data.paymentInstrumentDetails.payPageInstrument
            .redirectInfo.url;
      } else {
        // Fallback for any other structure - use the URL directly from the response if available
        paymentUrl =
          response.data.data.redirectUrl || response.data.data.url || null;
      }
      // If no URL is found, use the generic PhonePe checkout URL with transaction ID
      if (!paymentUrl && response.data.data.merchantTransactionId) {
        const isProduction = process.env.PHONEPE_ENVIRONMENT === "production";
        const merchantId = process.env.PHONEPE_MERCHANT_ID || "M228EY1054QWH";
        const amount = Math.round(orderData.order_amount * 100); // Amount in paise

        // Use the v4 checkout URL which works better in production
        paymentUrl = `https://pay.phonepe.com/checkout/v4?merchId=${merchantId}&transactionId=${response.data.data.merchantTransactionId}&amt=${amount}`;
        console.log("Using direct checkout URL format:", paymentUrl);
      }

      console.log("Payment URL determined:", paymentUrl);

      return {
        success: true,
        payment_session_id: response.data.data.merchantTransactionId,
        payment_url: paymentUrl,
        merchant_transaction_id: response.data.data.merchantTransactionId,
        order_id: orderData.order_id,
      };
    } else {
      console.error("PhonePe error response:", response.data);
      return {
        success: false,
        message: response.data.message || "Failed to create PhonePe order",
        code: response.data.code || "UNKNOWN_ERROR",
      };
    }
  } catch (error) {
    console.error(
      "PhonePe order creation error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code || "REQUEST_ERROR",
    };
  }
};

// Get payment status from PhonePe
export const getPhonePeOrderStatus = async (orderId, orderData) => {
  const createdOrder = await createOrder(orderData);
  if (!createdOrder) {
    console.error("Order creation failed, cannot proceed with payment status update.");
    return {
      success: false,
      message: "Order creation failed",
      code: "ORDER_CREATION_FAILED",
    };
  }
  try {
    // Use the correct merchant ID
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "M228EY1054QWH";
    const salt =
      process.env.PHONEPE_API_KEY || "6867369a-26d1-4748-94de-bdc7a1013bf8";

    // Use environment setting to determine API URL
    const isProduction = process.env.PHONEPE_ENVIRONMENT === "production";
    const endpoint = `/pg/v1/status/${merchantId}/${orderId}`;
    const baseUrl = isProduction ? productionUrl : testUrl;

    // Generate checksum for status API
    const stringToHash = `${endpoint}${salt}`;
    const sha256 = crypto
      .createHash("sha256")
      .update(stringToHash)
      .digest("hex");
    const checksum = sha256 + "###1";
    console.log("Checking PhonePe payment status:", {
      environment: isProduction ? "PRODUCTION" : "TEST",
      url: `${baseUrl}${endpoint}`,
      orderId: orderId,
      merchantId: merchantId,
      checksum: checksum,
    });
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    });
    console.log("PhonePe status response:", response.data);

    if (response.data && response.data.success) {
      // will create the order here
      // transactin seccessful
      createdOrder.payment.responseData = response.data;
      createdOrder.payment.transactionId = response.data.data.transactionId;
      await createdOrder.save();
      if(response.data.data.state === "COMPLETED") {
        createdOrder.payment.status = "Completed";
        createdOrder.status = "Processing";
        createdOrder.payment.method = "PhonePe";
        await createdOrder.save();
      } else{
        const state = response.data.data.state
        createdOrder.payment.status =  state == "PENDING" ? "Pending" : "Failed";
        await createdOrder.save();
      }
      // Transform PhonePe response to match our expected format
      return {
        order_id: response.data.data.merchantTransactionId,
        order_status:
          response.data.data.state === "COMPLETED"
            ? "PAID"
            : response.data.data.state,
        order_amount: response.data.data.amount / 100, 
        customer_details: {
          customer_id: response.data.data.merchantUserId || "customer",
          customer_phone: response.data.data.customerMobile || "",
          customer_email: response.data.data.customerEmail || "",
        },
        order_meta: {
          product_ids: orderId, // Use orderId as fallback
          product_names: "Order Items",
        },
        createdOrder
      };
    } else {
      console.error("PhonePe status error response:", response.data);
      await createdOrder.save();
      return {
        success: false,
        message: response.data.message || "Failed to get PhonePe order status",
        code: response.data.code || "UNKNOWN_ERROR",
        createdOrder
      };
    }
  } catch (error) {
    // set the payment status to Failed
    createdOrder.payment.status = "Failed";
    await createdOrder.save();
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code || "REQUEST_ERROR",
    };
  }
};

export const createOrder = async (orderData) => {
  try {
    const { products, buyer, address, phone, payment, totalPrice } = orderData;
    console.log(products);
    console.log("Creating order: \n\n", orderData);
    const newOrder = new Order({
      products,
      buyer,
      address,
      phone,
      payment,
      totalPrice: parseFloat(totalPrice), // Ensure totalPrice is a number
    });
    await newOrder.save();
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("products.product")
      .populate("buyer");
    // const response = await createXpressBeesOrder(orderData); // not needed for now: Manual
    // console.log(response);
    // newOrder.trackingId = response?.awb_number || "N/A";
    // newOrder.label = response?.label || "N/A";
    await newOrder.save();

    if (populatedOrder.buyer && populatedOrder.buyer.email) {
      console.log(
        "Sending order confirmation email to:",
        populatedOrder.buyer.email
      );

      const orderLink = `${process.env.FRONTEND_URL}/customer/orders/${populatedOrder._id}`;
      const adminOrderLink = `${process.env.FRONTEND_URL}/admin/orders/${populatedOrder._id}`;
      const invoiceLink = `${process.env.FRONTEND_URL}/customer/orders/${populatedOrder._id}`;
      // Generate products HTML
      const productsHtml = populatedOrder.products
        .map(
          (item) => `
        <tr>
          <td>${item.product?.name || "Product"}</td>
          <td>${item.quantity}</td>
          <td>₹${item.product?.price?.toFixed(2) || "N/A"}</td>
          <td>₹${(item.product?.price * item.quantity).toFixed(2) || "N/A"}</td>
        </tr>
          `
        )
        .join("");

      // Send email to the buyer
      sendEmail({
        to: populatedOrder.buyer.email,
        subject: "Your Order Has Been Placed!",
        html: `
          <h2>Thank you for your order!</h2>
          <p>Your order <b>#${populatedOrder._id}</b> has been placed successfully.</p>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin:16px 0;">
        <thead>
          <tr>
        <th>Product</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
          </table>
          <p><b>Total Price: ₹${populatedOrder.totalPrice?.toFixed(2) || "N/A"}</b></p>
          <p>
        <a href="${orderLink}">View your order</a> | 
        <a href="${invoiceLink}">Download Invoice</a>
          </p>
          <p>We appreciate your business.</p>
        `,
      });

      // Send email to admin about new order
      sendEmail({
        to: process.env.ADMIN_MAIL,
        subject: `New Order Placed by ${populatedOrder.buyer.name || populatedOrder.buyer.email}`,
        html: `
          <h2>New Order Received</h2>
          <p>User <b>${populatedOrder.buyer.name || populatedOrder.buyer.email}</b> has placed a new order.</p>
          <p>Order ID: <b>#${populatedOrder._id}</b></p>
          <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse; margin:16px 0;">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
          </table>
          <p><b>Total Price: ₹${populatedOrder.totalPrice?.toFixed(2) || "N/A"}</b></p>
          <p>
        <a href="${adminOrderLink}">View Order in Dashboard</a>
          </p>
        `,
      });
    }
    return newOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    return;
  }
};
