// PhonePe Debug Helper
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// URLs based on environment
const testUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const productionUrl = "https://api.phonepe.com/apis/hermes";
const uiCheckoutTestUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/checkout/ui/v2/pay";
const uiCheckoutProductionUrl = "https://api.phonepe.com/apis/pg/checkout/ui/v2/pay";

// Generate SHA-256 hash for request data
const generatePhonePeHash = (payload, salt, endpoint) => {
  // The endpoint should be "/pg/v1/pay" for payment creation
  const stringToHash = payload + endpoint + salt;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  return sha256 + "###1";
};

// Test PhonePe V1 API (Direct API)
export const testPhonePeV1Api = async () => {
  try {
    const isProduction = process.env.PHONEPE_ENVIRONMENT === "production";
    console.log("Testing PhonePe V1 API in", isProduction ? "PRODUCTION" : "TEST", "environment");
    
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "M228EY1054QWH";
    const salt = process.env.PHONEPE_API_KEY || "6867369a-26d1-4748-94de-bdc7a1013bf8";
    
    // Create a test order ID
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const orderId = `TEST_${timestamp}_${random}`;
    
    // Prepare the payload for PhonePe
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: orderId,
      amount: 100, // 1 rupee in paise
      redirectUrl: "https://nuturemite-server.onrender.com/api/payment/return", 
      redirectMode: "REDIRECT",
      callbackUrl: "https://nuturemite-server.onrender.com/api/payment/webhook",
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    
    // Convert payload to JSON string and then to base64
    const jsonPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(jsonPayload).toString("base64");
    
    const baseUrl = isProduction ? productionUrl : testUrl;
    const endpoint = "/pg/v1/pay";
    
    // Generate checksum
    const checksum = generatePhonePeHash(base64Payload, salt, endpoint);
    
    console.log("Sending PhonePe V1 API request:", {
      url: `${baseUrl}${endpoint}`,
      payload: payload,
      merchantId: merchantId,
      saltKey: salt.substring(0, 5) + "...",
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
    
    console.log("PhonePe V1 API response:", response.data);
    
    return {
      success: true,
      response: response.data
    };
  } catch (error) {
    console.error("PhonePe V1 API test error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
};

// Test PhonePe V2 UI Checkout API
export const testPhonePeV2UiCheckout = async () => {
  try {
    const isProduction = process.env.PHONEPE_ENVIRONMENT === "production";
    console.log("Testing PhonePe V2 UI Checkout in", isProduction ? "PRODUCTION" : "TEST", "environment");
    
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "M228EY1054QWH";
    
    // Create a test order ID
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const orderId = `TEST_${timestamp}_${random}`;
    
    const checkoutUrl = isProduction ? uiCheckoutProductionUrl : uiCheckoutTestUrl;
    
    // Construct the URL with query parameters
    const fullUrl = `${checkoutUrl}?merchId=${merchantId}&transactionId=${orderId}&amt=100&redirectUrl=https://nuturemite-server.onrender.com/api/payment/return`;
    
    console.log("PhonePe V2 UI Checkout URL:", fullUrl);
    
    return {
      success: true,
      checkoutUrl: fullUrl
    };
  } catch (error) {
    console.error("PhonePe V2 UI Checkout error:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// For direct checkout redirect using v4 URL format
export const getDirectCheckoutUrl = (orderId, amount) => {
  const isProduction = process.env.PHONEPE_ENVIRONMENT === "production";
  const merchantId = process.env.PHONEPE_MERCHANT_ID || "M228EY1054QWH";
  
  // Convert amount from rupees to paise if needed
  const amountInPaise = typeof amount === 'number' ? Math.round(amount * 100) : amount;
  
  // For v4 checkout, we can use a direct URL format
  return `https://pay.phonepe.com/checkout/v4?merchId=${merchantId}&transactionId=${orderId}&amt=${amountInPaise}`;
};

// Export the helper functions
export default {
  testPhonePeV1Api,
  testPhonePeV2UiCheckout,
  getDirectCheckoutUrl
};
