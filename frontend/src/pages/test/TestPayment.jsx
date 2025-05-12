import React from 'react';
import paymentService from '../../services/paymentService';

// This is a simple test component to verify Cashfree integration
// You can open this in your application by navigating to /test-payment
// It's intended for development use only

const TestPayment = () => {
  const [paymentId, setPaymentId] = React.useState('');
  const [paymentStatus, setPaymentStatus] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [paymentUrl, setPaymentUrl] = React.useState('');

  // Mock data for testing
  const mockCartItems = [
    {
      _id: 'test-product-1',
      name: 'Test Product',
      price: 100,
      quantity: 1,
      images: []
    }
  ];

  const mockCustomer = {
    userId: 'test-user',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '9999999999'
  };

  const mockAddress = {
    fullName: 'Test Customer',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    postalCode: '123456',
    country: 'India'
  };

  const handleCreatePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentService.createPayment(
        mockCartItems,
        mockCustomer,
        100, // Total amount
        mockAddress
      );
        if (response.success) {
        setPaymentId(response.payment_session_id);
        setPaymentUrl(response.payment_url);
        console.log('Payment session created:', response);
      } else {
        setError('Failed to create payment session: ' + (response.message || ''));
      }
    } catch (err) {
      setError('Error: ' + (err.message || 'Unknown error'));
      console.error('Payment creation error:', err);
    } finally {
      setLoading(false);
    }
  };  const handleProcessPayment = async () => {
    if (!paymentId || !paymentUrl) {
      setError('No payment URL available');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentStatus('Redirecting to PhonePe...');
    
    // Debug information
    console.log('Redirecting to PhonePe payment URL:', paymentUrl);
    
    // Process the payment by redirecting to PhonePe
    paymentService.processPhonePePayment(paymentUrl);
  };
  
  // For PhonePe, we don't need to handle payment processing in a useEffect
  // since it's handled by redirecting to the PhonePe payment page
  React.useEffect(() => {
    if (paymentStatus === 'Processing' && paymentUrl) {
      const processPayment = async () => {
        try {
          console.log('Processing payment with URL:', paymentUrl);
          
          // Redirect to PhonePe payment page
          const result = await paymentService.processPhonePePayment(paymentUrl);
          setPaymentStatus('Redirected to PhonePe');
        } catch (err) {
          console.error('Full error object:', err);
          
          if (err.status === 'closed') {
            setError('Payment window closed by user');
            setPaymentStatus('Closed');
          } else {
            setError('Error: ' + (err.message || 'Unknown error'));
            console.error('Payment processing error:', err);
            setPaymentStatus('Failed');
          }
        } finally {
          setLoading(false);
        }
      };
      
      processPayment();
    }
  }, [paymentId, paymentStatus]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Cashfree Payment Test</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-700">
          This is a test page for PhonePe integration. PhonePe will handle the payment process on their platform.
        </p>
        <ul className="mt-2 space-y-1 text-sm text-yellow-700 list-disc pl-5">
          <li>You'll be redirected to PhonePe payment page</li>
          <li>Use PhonePe test credentials provided by PhonePe</li>
          <li>After payment, you'll be redirected back to this site</li>
        </ul>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Step 1: Create Payment Session</h2>
          <button
            onClick={handleCreatePayment}
            disabled={loading}
            className={`w-full py-2 rounded-md ${
              loading 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {loading ? 'Processing...' : 'Create Payment Session'}
          </button>
            {paymentId && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
              <p className="text-sm font-medium">Payment Session Created!</p>
              <p className="text-xs mt-1 break-all">Session ID: {paymentId}</p>
              {paymentUrl && (
                <p className="text-xs mt-1">Payment URL: <a href={paymentUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Click to open</a></p>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Step 2: Process Payment</h2>
          <button
            onClick={handleProcessPayment}
            disabled={!paymentId || loading}
            className={`w-full py-2 rounded-md ${
              !paymentId || loading
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {loading ? 'Processing...' : 'Process Payment'}
          </button>
          
          {/* This div will be used by the Cashfree SDK to render the payment form */}
          <div id="payment-form" className="mt-6 border rounded-lg min-h-[200px] p-4">
            {!paymentId && <p className="text-gray-400 text-center mt-8">Payment form will appear here</p>}
          </div>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {paymentStatus && (
          <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
            <p className="font-medium">Payment Status</p>
            <p className="text-sm">{paymentStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestPayment;
