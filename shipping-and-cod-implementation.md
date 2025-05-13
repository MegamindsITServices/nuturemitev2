# Shipping Charges and Cash on Delivery Implementation

This document explains the implementation of shipping charges and Cash on Delivery (COD) payment option in the Nuturemite e-commerce platform.

## 1. Shipping Charges Implementation

### Business Rules
- Free shipping for orders above ₹600
- ₹50 shipping fee for orders below ₹600

### Implementation Details
- Shipping calculation logic added to the checkout page:
  ```javascript
  const shipping = subtotal > 0 ? (subtotal >= 600 ? 0 : 50) : 0;
  ```
- Added visual indicators:
  - Progress bar showing how close the user is to free shipping
  - Text showing the exact amount needed to qualify for free shipping
  - Success message when the user qualifies for free shipping

### User Experience Improvements
- Added shipping policy information in a prominent location
- Implemented visual progress indicator for free shipping threshold
- Added color coding for easy recognition (green for free shipping, etc.)

## 2. Cash on Delivery Implementation

### Features
- Added radio button selection for payment method (Online Payment or Cash on Delivery)
- Different button text and styling based on selected payment method
- Custom confirmation flow for COD orders
- Specific messaging for COD orders on the order success page

### Implementation Details
- New payment method state to track user selection:
  ```javascript
  const [paymentMethod, setPaymentMethod] = useState('online');
  ```
- New `createCodOrder` method in the payment service to create orders without online payment
  ```javascript
  createCodOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/api/order/create-order', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating COD order:', error);
      throw error;
    }
  }
  ```
- Order model already supports Cash on Delivery as a payment method
- Updated order status page to show appropriate messages for COD orders

### Payment Flow
1. For COD orders:
   - User selects "Cash on Delivery" option
   - Order is created directly with status "Pending"
   - User is shown COD-specific confirmation page
   - Cart is cleared after order placement

2. For Online Payment:
   - User selects "Online Payment" option
   - User is redirected to PhonePe payment gateway
   - Upon successful payment, user is redirected back to the order success page

## 3. Testing Instructions

### Testing Shipping Charges
1. Add items to cart with total value below ₹600
2. Verify that ₹50 shipping fee is applied
3. Add more items to exceed ₹600
4. Verify that shipping becomes free

### Testing Cash on Delivery
1. Add items to cart
2. Proceed to checkout
3. Select "Cash on Delivery" option
4. Complete the order form and place the order
5. Verify that the order is created with "Cash on Delivery" payment method
6. Verify that the success page shows COD-specific information

## 4. Future Enhancements
- Add ability to set different shipping thresholds in admin panel
- Implement location-based shipping charges
- Add COD fee option if business decides to charge extra for COD orders
- Implement order tracking for COD orders
