# PhonePe Integration Documentation

## Overview
This document provides information about the PhonePe payment gateway integration in the Nuturemite e-commerce application.

## Environment Configuration
PhonePe integration uses the following environment variables:

- `PHONEPE_ENVIRONMENT`: Set to 'production' for live payments, or any other value (or omit) for sandbox/test mode
- `PHONEPE_API_KEY`: The Salt Key from your PhonePe dashboard
- `PHONEPE_MERCHANT_ID`: Your merchant ID (e.g., M228EY1054QWH)
- `PHONEPE_CLIENT_ID`: Your PhonePe client ID
- `PHONEPE_CLIENT_SECRET`: Your PhonePe client secret
- `PHONEPE_WEBHOOK_SECRET`: Secret key for webhook verification

## API Endpoints

- **Test Environment**: https://api-preprod.phonepe.com/apis/pg-sandbox
- **Production Environment**: https://api.phonepe.com/apis/hermes

## Payment Flow

1. **Create Payment Order**: 
   - Backend creates a payment request with PhonePe
   - PhonePe returns a payment URL
   - Frontend redirects user to the payment URL

2. **Payment Processing**:
   - User completes payment on PhonePe platform
   - PhonePe redirects user back to return URL

3. **Payment Verification**:
   - Backend verifies payment status with PhonePe
   - Order status is updated accordingly

## Implementation Files

- Backend:
  - `e:\nuturemite\backend\helpers\phonepeHelper.js`: Core PhonePe integration functions
  - `e:\nuturemite\backend\index.js`: API routes for payment processing

- Frontend:
  - `e:\nuturemite\frontend\src\services\paymentService.js`: Payment service functions
  - `e:\nuturemite\frontend\src\pages\checkout\Checkout.jsx`: Checkout flow
  - `e:\nuturemite\frontend\src\pages\checkout\OrderStatus.jsx`: Order status page

## Testing

To test the PhonePe configuration, run:

```
node tools/test-phonepe-config.js
```

## Production vs Test Mode

To switch between test and production modes:

1. Update the `PHONEPE_ENVIRONMENT` in `.env`:
   - For test mode: Remove or set to any value other than 'production'
   - For production mode: Set to 'production'

2. Ensure you're using the correct credentials for the chosen environment.
