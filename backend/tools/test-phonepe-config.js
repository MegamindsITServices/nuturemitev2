// Test PhonePe configuration
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log('PhonePe Configuration Test');
console.log('=========================');
console.log(`PHONEPE_ENVIRONMENT: ${process.env.PHONEPE_ENVIRONMENT || 'Not set (defaults to test)'}`);
console.log(`PHONEPE_MERCHANT_ID: ${process.env.PHONEPE_MERCHANT_ID || 'Not set'}`);
console.log(`PHONEPE_API_KEY: ${process.env.PHONEPE_API_KEY ? '******' : 'Not set'}`);
console.log(`PHONEPE_CLIENT_ID: ${process.env.PHONEPE_CLIENT_ID || 'Not set'}`);
console.log(`PHONEPE_CLIENT_SECRET: ${process.env.PHONEPE_CLIENT_SECRET ? '******' : 'Not set'}`);

// Determine which API URL will be used based on environment
const testUrl = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const productionUrl = "https://api.phonepe.com/apis/hermes";
const isProduction = process.env.PHONEPE_ENVIRONMENT === "production";
const apiUrl = isProduction ? productionUrl : testUrl;

console.log('\nAPI Configuration');
console.log('=========================');
console.log(`Environment: ${isProduction ? 'PRODUCTION' : 'TEST'}`);
console.log(`API URL: ${apiUrl}`);
console.log(`Payment Endpoint: ${apiUrl}/pg/v1/pay`);
console.log(`Status Endpoint: ${apiUrl}/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/ORDER_ID`);
