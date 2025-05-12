import axios from 'axios';
import { backendURL } from '../lib/api-client';

// Create API client instance
const apiClient = axios.create({
  baseURL: backendURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const paymentService = {
  // Create a new payment for the cart items
  createPayment: async (cartItems, customerInfo, totalAmount, shippingAddress) => {
    try {
      const response = await apiClient.post('/api/payment/create', {
        cartItems,
        customerInfo,
        totalAmount,
        shippingAddress
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
  
  // Verify payment status
  verifyPayment: async (orderId) => {
    try {
      const response = await apiClient.post('/api/payment/verify', {
        orderId
      });
      
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  },
    // Process PhonePe payment by redirecting to the PhonePe payment page
  processPhonePePayment: (paymentUrl) => {
    if (typeof window !== 'undefined') {
      return new Promise((resolve, reject) => {
        try {
          console.log("Redirecting to payment URL:", paymentUrl);
          
          // Validate the payment URL
          if (!paymentUrl) {
            const error = new Error('Invalid payment URL received');
            console.error(error);
            reject(error);
            return;
          }
          
          // Check if the URL has the expected PhonePe domain
          const isValidPhonePeUrl = paymentUrl.includes('phonepe.com') || 
                                   paymentUrl.includes('pay.phonepe.com');
          
          if (!isValidPhonePeUrl) {
            console.warn('Warning: Payment URL does not contain phonepe.com domain:', paymentUrl);
          }
          
          // Simply redirect to the PhonePe payment URL
          window.location.href = paymentUrl;
          
          // Note: Since this is a redirect, the promise won't actually resolve here
          // The user will be redirected to PhonePe and then back to our success/failure page
          // The actual payment verification happens when user returns to our site
          
          // We'll resolve immediately, but the flow will be interrupted by the redirect
          resolve({ redirected: true });
        } catch (error) {
          console.error('Error redirecting to PhonePe:', error);
          reject(new Error('Failed to redirect to PhonePe payment page'));
        }
      });
    } else {
      return Promise.reject(new Error('Cannot process payment in non-browser environment'));
    }
  }
};

// Export the paymentService by default as well for compatibility
export default paymentService;
