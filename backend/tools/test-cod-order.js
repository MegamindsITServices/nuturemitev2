// Test script for COD order creation
const testCodOrder = async () => {
  try {
    // Sample order data
    const orderData = {
      products: ['6123456789012345678901234'], // Replace with actual product ID
      buyer: '6123456789012345678901235', // Replace with actual user ID
      address: 'Test Address, Test City, Test State - 123456',
      phone: '1234567890',
      totalPrice: 1000, // Explicitly set total price
      payment: {
        method: 'Cash on Delivery',
        status: 'Pending'
      }
    };

    console.log('Test order data:', orderData);

    // Make API request
    const response = await fetch('http://localhost:8080/api/order/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    console.log('API Response:', result);

    if (result.success) {
      console.log('✅ Test passed: Order created successfully');
    } else {
      console.log('❌ Test failed: Order creation failed');
      console.error('Error:', result);
    }
  } catch (error) {
    console.error('❌ Test failed with exception:', error);
  }
};

// Run the test
testCodOrder();
