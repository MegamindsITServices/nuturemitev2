// Debug PhonePe Test Endpoint
import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import crypto from 'crypto';
import { testPhonePeV1Api, testPhonePeV2UiCheckout, getDirectCheckoutUrl } from '../helpers/phonepeDebug.js';

dotenv.config();

const router = express.Router();

// PhonePe URLs
const testUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const productionUrl = "https://api.phonepe.com/apis/hermes";

// Generate PhonePe hash
const generatePhonePeHash = (payload, salt, endpoint) => {
  const stringToHash = payload + endpoint + salt;
  const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
  return sha256 + "###1";
};

// Test PhonePe Connection endpoint
router.get('/test-phonepe', async (req, res) => {
  try {
    const isProduction = process.env.PHONEPE_ENVIRONMENT === "production";
    const merchantId = process.env.PHONEPE_MERCHANT_ID || "M228EY1054QWH";
    const salt = process.env.PHONEPE_API_KEY || "6867369a-26d1-4748-94de-bdc7a1013bf8";
    const baseUrl = isProduction ? productionUrl : testUrl;
    
    // Create a test order ID
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
    const orderId = `TEST_${timestamp}_${random}`;
    
    // Create a minimal request
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: orderId,
      amount: 100, // 1 rupee in paise
      redirectUrl: `${req.protocol}://${req.get('host')}/api/debug/phonepe-callback`,
      redirectMode: "REDIRECT",
      callbackUrl: `${req.protocol}://${req.get('host')}/api/debug/phonepe-webhook`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    
    // Convert payload to base64
    const jsonPayload = JSON.stringify(payload);
    const base64Payload = Buffer.from(jsonPayload).toString("base64");
    
    // Generate checksum
    const endpoint = "/pg/v1/pay";
    const checksum = generatePhonePeHash(base64Payload, salt, endpoint);
    
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
    
    // Log all details for debugging
    console.log('PhonePe Test Request:', {
      environment: isProduction ? "PRODUCTION" : "TEST",
      baseUrl,
      endpoint,
      payload,
      headers: {
        "X-VERIFY": checksum,
      }
    });
    
    console.log('PhonePe Test Response:', response.data);
    
    // Return detailed information
    return res.json({
      success: true,
      environment: isProduction ? "PRODUCTION" : "TEST",
      request: {
        url: `${baseUrl}${endpoint}`,
        payload,
        headers: {
          "X-VERIFY": checksum,
        },
      },
      response: response.data
    });
  } catch (error) {
    console.error('PhonePe Test Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'PhonePe test failed',
      error: error.response?.data || error.message
    });
  }
});

// Mock callback endpoint
router.get('/phonepe-callback', (req, res) => {
  res.send(`<html>
    <body>
      <h1>PhonePe Test Callback</h1>
      <h2>Payment details received:</h2>
      <pre>${JSON.stringify(req.query, null, 2)}</pre>
    </body>
  </html>`);
});

// Mock webhook endpoint
router.post('/phonepe-webhook', (req, res) => {
  console.log('PhonePe webhook received:', req.body);
  res.status(200).json({ success: true });
});

// Test PhonePe V1 API (Direct API)
router.get('/test-v1-api', async (req, res) => {
  try {
    const result = await testPhonePeV1Api();
    res.json(result);
  } catch (error) {
    console.error('PhonePe V1 API test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing PhonePe V1 API', 
      error: error.message 
    });
  }
});

// Test PhonePe V2 UI Checkout
router.get('/test-v2-checkout', async (req, res) => {
  try {
    const result = await testPhonePeV2UiCheckout();
    
    if (result.success && result.checkoutUrl) {
      // Return HTML page with a redirect button
      res.send(`<html>
        <head>
          <title>PhonePe V2 UI Checkout Test</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .btn { background: #6739B7; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>PhonePe V2 UI Checkout Test</h1>
          <p>URL: ${result.checkoutUrl}</p>
          <button class="btn" onclick="window.location.href='${result.checkoutUrl}'">Proceed to Checkout</button>
        </body>
      </html>`);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error('PhonePe V2 UI Checkout test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing PhonePe V2 UI Checkout', 
      error: error.message 
    });
  }
});

// Direct checkout URL test
router.get('/direct-checkout', (req, res) => {
  const orderId = `TEST_${Date.now()}_${Math.floor(Math.random() * 100000).toString().padStart(5, "0")}`;
  const amount = 100; // 1 rupee
  
  const checkoutUrl = getDirectCheckoutUrl(orderId, amount);
  
  res.send(`<html>
    <head>
      <title>PhonePe Direct Checkout Test</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .btn { background: #6739B7; color: white; padding: 10px 15px; border: none; border-radius: 4px; cursor: pointer; }
      </style>
    </head>
    <body>
      <h1>PhonePe Direct Checkout Test</h1>
      <p>Using checkout URL format: https://pay.phonepe.com/checkout/v4</p>
      <p>Order ID: ${orderId}</p>
      <p>Amount: ₹1.00</p>
      <p>URL: ${checkoutUrl}</p>
      <button class="btn" onclick="window.location.href='${checkoutUrl}'">Proceed to Checkout</button>
    </body>
  </html>`);
});

export default router;
