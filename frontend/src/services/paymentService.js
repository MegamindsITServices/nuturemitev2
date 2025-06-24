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
    // Create a Cash on Delivery order
  createCodOrder: async (orderData) => {
    try {
      // Ensure totalPrice is properly set and is a number
      if (!orderData.totalPrice || isNaN(orderData.totalPrice)) {
        console.error('Invalid totalPrice:', orderData.totalPrice);
        throw new Error('Total price is required and must be a number');
      }
      
      // Log the request for debugging
      console.log('Creating COD order with data:', {
        ...orderData,
        buyer: orderData.buyer ? 'VALID_BUYER_ID' : 'MISSING_BUYER', // Don't log actual ID
        totalPrice: Number(orderData.totalPrice).toFixed(2)
      });
      
      // Make the request with authorization if token exists
      const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).token : null;
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await apiClient.post('/api/order/create-order', orderData, { headers });
      return response.data;
    } catch (error) {
      console.error('Error creating COD order:', error);
      // Add more helpful error message
      if (error.response?.status === 500) {
        console.error('Server error details:', error.response.data);
      }
      throw error;
    }
  },
  
  // Clear the cart after order placement
  clearCart: async (userId) => {
    try {
      const response = await apiClient.post('/api/cart/clear', { userId });
      return response.data;
    } catch (error) {
      console.error('Error clearing cart:', error);
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
  },



  // ------------------------------------------>

  
};

// Export the paymentService by default as well for compatibility
export default paymentService;
