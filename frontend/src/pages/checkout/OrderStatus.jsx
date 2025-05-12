import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { useCart } from '../../context/CartContext';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        
        // This orderId should be the one returned from Cashfree
        const paymentOrderId = orderId || searchParams.get('order_id');          if (!paymentOrderId) {
          setError('No order ID found');
          setLoading(false);
          return;
        }
        
        // Check if there's a payment result from PhonePe in the URL parameters
        const phonepeCode = searchParams.get('code');
        const phonepeStatus = searchParams.get('status');
          // If phonepeStatus is present, we can use it directly, otherwise verify payment status with API
        if (phonepeStatus === 'SUCCESS' || phonepeStatus === 'COMPLETED') {
          const response = await paymentService.verifyPayment(paymentOrderId);
          
          // Check if payment was successful and if an order was created
          if (response.success && response.order) {
            setOrderDetails(response.order);
            setPaymentStatus('PAID');
            clearCart(); // Clear cart only on successful payment
          } else {
            // PhonePe reported success but we need to verify from our server
            setPaymentStatus('PENDING');
            setError('Payment verification in process. Please wait or check your orders section.');
          }
        } else if (phonepeStatus === 'FAILED' || phonepeStatus === 'CANCELLED') {
          // Payment failed according to PhonePe
          setPaymentStatus('FAILED');
          setError('Payment was not successful. Please try again.');
        } else {
          // No phonepeStatus, use the regular verification
          const response = await paymentService.verifyPayment(paymentOrderId);
          
          // Check if payment was successful and if an order was created
          if (response.success && response.order) {
            setOrderDetails(response.order);
            setPaymentStatus('PAID');
            clearCart(); // Clear cart only on successful payment
          } else {
            // Payment failed or order not created
            setPaymentStatus(response.paymentData?.order_status || 'FAILED');
            setError('Payment was not successful. No order was created.');
          }
        }
        
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment status. Please contact customer support.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyPayment();
  }, [orderId, searchParams, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <Loader2 size={48} className="animate-spin text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <XCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const isSuccess = paymentStatus === 'PAID';
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        ) : (
          <XCircle size={64} className="text-red-500 mx-auto mb-6" />
        )}
        
        <h1 className="text-3xl font-bold mb-2">
          {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {isSuccess 
            ? 'Your order has been placed successfully.' 
            : 'We could not process your payment. Please try again.'}
        </p>
        
        {orderId && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium">{orderId}</p>
          </div>
        )}
        
        <div className="space-y-3">
          {isSuccess ? (
            <>
              <button 
                onClick={() => navigate('/orders')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium"
              >
                View Orders
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium"
              >
                Try Again
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50"
              >
                Go to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
