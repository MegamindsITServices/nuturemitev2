// Helper function to generate unique order IDs for Cashfree
import axios from 'axios';

export const generateOrderId = async () => {
    // Generate a timestamp-based prefix
    const timestamp = new Date().getTime();
    
    // Generate a random component (5 digits)
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    
    // Combine for a unique ID
    return `ORDER_${timestamp}_${random}`;
};

// Cashfree APIs helper functions
export const cashfreeApiUrl = process.env.CASHFREE_API_URL || 'https://sandbox.cashfree.com/pg';

// Create headers with authentication
export const getCashfreeHeaders = () => {
    return {
        'x-client-id': process.env.CASHFREE_CLIENT_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': '2022-09-01',
        'Content-Type': 'application/json'
    };
};

// Create payment order
export const createCashfreeOrder = async (orderData) => {
    try {
        const response = await axios.post(
            `${cashfreeApiUrl}/orders`, 
            orderData,
            { headers: getCashfreeHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Cashfree order creation error:', error.response?.data || error.message);
        throw error;
    }
};

// Get payment details by order ID
export const getCashfreeOrderStatus = async (orderId) => {
    try {
        const response = await axios.get(
            `${cashfreeApiUrl}/orders/${orderId}`,
            { headers: getCashfreeHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error('Cashfree order status error:', error.response?.data || error.message);
        throw error;
    }
};
