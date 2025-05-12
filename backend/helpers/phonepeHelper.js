// Helper functions for PhonePe payment integration
import axios from "axios";
import crypto from "crypto";

// URLs based on environment
export const testUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox";
export const productionUrl = "https://api.phonepe.com/apis/hermes";

// Base URL for PhonePe API - determined by environment
export const phonepeApiUrl = process.env.PHONEPE_ENVIRONMENT === 'production' 
  ? productionUrl 
  : testUrl;

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
    const base64Payload = Buffer.from(jsonPayload).toString("base64");    // Use the correct salt key from environment variables
    const salt =
      process.env.PHONEPE_API_KEY || "6867369a-26d1-4748-94de-bdc7a1013bf8";
    
    // Use the environment that was determined earlier
    const endpoint = "/pg/v1/pay";
    const baseUrl = isProduction ? productionUrl : testUrl;

    // Generate checksum with the correct endpoint
    const checksum = generatePhonePeHash(base64Payload, salt, endpoint);    console.log("Sending request to PhonePe:", {
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

    console.log("PhonePe response:", response.data);    if (response.data && response.data.success) {
      // Get the payment URL from the response
      // The structure might be different between production and test environments
      let paymentUrl;
      
      if (response.data.data.instrumentResponse && response.data.data.instrumentResponse.redirectInfo) {
        // Test environment structure
        paymentUrl = response.data.data.instrumentResponse.redirectInfo.url;
      } else if (response.data.data.paymentInstrumentDetails && response.data.data.paymentInstrumentDetails.payPageInstrument) {
        // Production environment structure might use this format
        paymentUrl = response.data.data.paymentInstrumentDetails.payPageInstrument.redirectInfo.url;
      } else {
        // Fallback for any other structure - use the URL directly from the response if available
        paymentUrl = response.data.data.redirectUrl || response.data.data.url || null;
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
export const getPhonePeOrderStatus = async (orderId) => {
  try {
    // Use the correct merchant ID
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "M228EY1054QWH";    const salt =
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
    const checksum = sha256 + "###1";    console.log("Checking PhonePe payment status:", {
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
      // Transform PhonePe response to match our expected format
      return {
        order_id: response.data.data.merchantTransactionId,
        order_status:
          response.data.data.state === "COMPLETED"
            ? "PAID"
            : response.data.data.state,
        order_amount: response.data.data.amount / 100, // Convert from paise to rupees
        customer_details: {
          customer_id: response.data.data.merchantUserId || "customer",
          customer_phone: response.data.data.customerMobile || "",
          customer_email: response.data.data.customerEmail || "",
        },
        order_meta: {
          product_ids: orderId, // Use orderId as fallback
          product_names: "Order Items",
        },
      };
    } else {
      console.error("PhonePe status error response:", response.data);
      return {
        success: false,
        message: response.data.message || "Failed to get PhonePe order status",
        code: response.data.code || "UNKNOWN_ERROR",
      };
    }
  } catch (error) {
    console.error(
      "PhonePe order status error:",
      error.response?.data || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code || error.code || "REQUEST_ERROR",
    };
  }
};
