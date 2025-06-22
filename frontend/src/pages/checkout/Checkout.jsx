import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
  Truck, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle,
  Minus,
  Plus,
  X,
  Loader2
} from 'lucide-react';
import Breadcrumb from '../../components/common/Breadcrumb';
import { getProductImageUrl } from '../../utils/imageUtils';
import { paymentService } from '../../services/paymentService';
import { axiosInstance } from '../../utils/request';
import axios from 'axios';

const Checkout = () => {
  const [auth] = useAuth();
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  // Form state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: auth?.user?.firstName || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [contactInfo, setContactInfo] = useState({
    email: auth?.user?.email || '',
    phone: '',
  });

  useEffect(()=>{
    const call=async()=>{
      const {data}=await axiosInstance.post('/api/user/getShippingAddress',{
      _id:auth.user.userId
    });
      console.log(data);
      if(data.shippingAddress.shippingAddress){
        setShippingAddress({
          fullName:data.shippingAddress.shippingAddress.fullName,
          address:data.shippingAddress.shippingAddress.streetAddress,
          city:data.shippingAddress.shippingAddress.city,
          state:data.shippingAddress.shippingAddress.state,
          postalCode:data.shippingAddress.shippingAddress.pincode,
          country:data.shippingAddress.shippingAddress.country
        })
        setContactInfo({
          email:data.shippingAddress.shippingAddress.emailAddress,
          phone:data.shippingAddress.shippingAddress.phoneNumber
        })
      }
    }
   if(auth.user){
    call();
   }
  },[auth ])
  // Payment state
  const [paymentSessionId, setPaymentSessionId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [response, setResponse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('online');

  
  // Calculate subtotal, shipping, and taxes
  const subtotal = cartTotal;
  // Apply shipping fee for orders below Rs. 600
  // const shipping = subtotal > 0 ? (subtotal >= 600 ? 0 : 50) : 0;
  const shipping = 0
  // const tax = subtotal * 0.18; // 18% GST
  const tax = 0
  const totalAmount = subtotal + shipping + tax;
  
  // Form validation
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    // Validate shipping address
    if (!shippingAddress.fullName) newErrors.fullName = 'Full name is required';
    if (!shippingAddress.address) newErrors.address = 'Address is required';
    if (!shippingAddress.city) newErrors.city = 'City is required';
    if (!shippingAddress.state) newErrors.state = 'State is required';
    if (!shippingAddress.postalCode) newErrors.postalCode = 'Postal code is required';
    
    // Validate contact info
    if (!contactInfo.email) newErrors.email = 'Email is required';
    if (!contactInfo.phone) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form field change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is filled
    if (errors[name] && value.trim()) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is filled
    if (errors[name] && value.trim()) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  // Initialize payment
  const initializePayment = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!auth?.user) {
      toast.error('Please login to proceed with payment');
      navigate('/login');
      return;
    }
    
    try {
      setIsProcessing(true);
      setPaymentError('');
      
      // Prepare cart items for the API
      const cartItems = cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        image: item.images && item.images.length > 0 ? item.images[0] : ''
      }));
      
      // Prepare customer info
      const customerInfo = {
        userId: auth.user.userId,
        name: shippingAddress.fullName,
        email: contactInfo.email,
        phone: contactInfo.phone
      };      // Handle Cash on Delivery orders
      if (paymentMethod === 'cod') {
        try {
          // Create a direct order without payment processing
          const orderData = {
            products: cartItems.map(item => item.productId),
            buyer: auth.user.userId,
            address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}`,
            phone: contactInfo.phone,
            totalPrice: parseFloat(totalAmount), // Ensure totalPrice is a number
            payment: {
              method: 'Cash on Delivery',
              status: 'Pending'
            }
          };
            console.log('Sending COD order data:', orderData);
          const response = await paymentService.createCodOrder(orderData);
          
          if (response.success) {
           const shippingAddressinfo={
    fullName:shippingAddress.fullName,
    emailAddress:contactInfo.email,
    phoneNumber:contactInfo.phone,
    streetAddress:shippingAddress.address,
    city:shippingAddress.city,
    state:shippingAddress.state,
    pincode:shippingAddress.postalCode,
    country:shippingAddress.country 
  }
   await axiosInstance.post('/api/user/saveShippingAddress',{
     shippingAddress:shippingAddressinfo,
     _id:auth.user.userId
   });
            // Clear cart and redirect to success page
            await paymentService.clearCart(auth.user.userId);
            toast.success('Order placed successfully!');
            navigate(`/order-success/${response.order._id}`);
          } else {
            throw new Error(response.message || 'Failed to create order');
          }
          return;        } catch (error) {          console.error('COD Order error:', error);
          
          // Better error handling with detailed logging
          const errorResponse = error.response?.data;
          console.log('Error details:', errorResponse);
          
          // If error response has details from backend
          const errorMsg = errorResponse?.error || error.message || 'Failed to process order';
          const detailsMsg = errorResponse?.details ? 
            errorResponse.details.map(d => `${d.field}: ${d.message}`).join(', ') : '';
          
          // Show more specific error message for totalPrice validation
          if (error.message?.includes('totalPrice') || errorMsg?.includes('totalPrice')) {
            toast.error('Error with order total: Please try again');
            setPaymentError('There was an issue with the order amount. Please try again or contact support.');
          } else {
            toast.error(`${errorMsg} ${detailsMsg ? `- ${detailsMsg}` : ''}`);
            setPaymentError(`Order creation failed: ${errorMsg} ${detailsMsg ? `- ${detailsMsg}` : ''}`);
          }
          return;
        }finally {
          setIsProcessing(false);
        }
      }

      // For online payment
      const paymentResponse = await paymentService.createPayment(
        cartItems,
        customerInfo,
        totalAmount,
        shippingAddress
      );
      
      if (paymentResponse.success) {
        console.log('Payment response:', paymentResponse);
        setPaymentSessionId(paymentResponse.payment_session_id);
        setOrderId(paymentResponse.order_id);
        setResponse(paymentResponse);
        
        // If payment URL is present, proceed to show payment form
        if (paymentResponse.payment_url) {
          setShowPaymentForm(true);
        } else {
          console.error('Payment URL missing from response:', paymentResponse);
          throw new Error('Payment URL missing from response');
        }
      } else {
        throw new Error(paymentResponse.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
      setPaymentError('Payment initialization failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Initialize payment when paymentSessionId and payment URL is available
  useEffect(() => {
    if (showPaymentForm && paymentSessionId && response) {
      // Add a small delay to ensure the payment URL is processed
      const timer = setTimeout(() => {
        try {
          if (!response.payment_url) {
            console.error('Payment URL is missing from response:', response);
            setPaymentError('Payment URL is missing. Please try again.');
            return;
          }
          
          console.log('Initiating payment with URL:', response.payment_url);
          
          // Process PhonePe payment by redirecting to payment URL
          paymentService.processPhonePePayment(response.payment_url)
            .then((result) => {
              // This might not execute due to redirection
              console.log('Payment initiated:', result);
              // User will be redirected to PhonePe payment page
            })
            .catch((error) => {
              console.error('Payment redirect error:', error);
              toast.error('Failed to redirect to payment page. Please try again.');
              setPaymentError('Payment initialization failed. Please try again.');
              setShowPaymentForm(false);
            });
        } catch (err) {
          console.error('Error processing PhonePe payment:', err);
          setPaymentError('Failed to initialize payment. Please try again.');
          setShowPaymentForm(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [paymentSessionId, showPaymentForm, orderId, navigate]);
  
  // Cleanup Cashfree resources when component unmounts
  useEffect(() => {
    return () => {
      if (window.cashfreeInstance) {
        // Clean up if needed
      }
    };
  }, []);
  
  // Check if cart is empty (after all hooks have been defined)
  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-md font-medium"
        >
          Continue Shopping
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumb 
        items={[
          { label: 'Home', href: '/' },
          { label: 'Checkout' }
        ]} 
      />
      
      <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">Checkout</h1>
      
      {/* Payment processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <Loader2 size={48} className="animate-spin mx-auto text-orange-500 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Processing Payment</h2>
            <p className="text-gray-600 mb-4">
              Please wait while we initialize your payment...
            </p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Items in Cart</h2>
            
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">                      <img 
                        src={item.images && item.images.length > 0 ? getProductImageUrl(item.images[0]) : ''} 
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{item.description ? item.description.substring(0, 50) + '...' : ''}</p>
                      <p className="mt-1 text-sm font-semibold">₹{item.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 sm:mt-0 sm:ml-4">
                    <div className="flex items-center border rounded-md">
                      <button 
                        onClick={() => updateQuantity(item._id, Math.max(1, (item.quantity || 1) - 1))}
                        className="p-1 px-2"
                        disabled={(item.quantity || 1) <= 1}
                      >
                        <Minus size={16} className={`${(item.quantity || 1) <= 1 ? 'text-gray-300' : 'text-gray-600'}`} />
                      </button>
                      
                      <span className="w-8 text-center text-sm">{item.quantity || 1}</span>
                      
                      <button 
                        onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                        className="p-1 px-2"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="ml-4 text-sm font-medium text-red-500 hover:text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleAddressChange}
                  className={`w-full border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500`}
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleContactChange}
                  className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>
            
            <div className="mt-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={contactInfo.phone}
                onChange={handleContactChange}
                placeholder="10-digit mobile number"
                className={`w-full border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            
            <div className="mt-4">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={shippingAddress.address}
                onChange={handleAddressChange}
                className={`w-full border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500`}
              />
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleAddressChange}
                  className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500`}
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>
              
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleAddressChange}
                  className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500`}
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={shippingAddress.postalCode}
                  onChange={handleAddressChange}
                  className={`w-full border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500`}
                />
                {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleAddressChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="India">India</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Payment Options */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            
            <div className="space-y-3">
              <div className="border rounded-md p-4 flex items-start">
                <input 
                  type="radio" 
                  id="online" 
                  name="payment" 
                  className="mt-1" 
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                />                <label htmlFor="online" className="ml-3 flex-1 cursor-pointer" onClick={() => setPaymentMethod('online')}>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <CreditCard size={20} className="mr-2 text-gray-600" />
                      <span className="font-medium">Online Payment (PhonePe)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pay securely with UPI, Credit/Debit Card, or Wallet</p>
                </label>
              </div>
                <div className="border rounded-md p-4 flex items-start">
                <input 
                  type="radio" 
                  id="cod" 
                  name="payment" 
                  className="mt-1" 
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />                <label htmlFor="cod" className="ml-3 flex-1 cursor-pointer" onClick={() => setPaymentMethod('cod')}>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Truck size={20} className="mr-2 text-gray-600" />
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pay in cash when your order is delivered</p>
                </label>
              </div>
            </div>
            
            {paymentMethod === 'cod' && (
                <div className="mt-2 p-2 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                  <p>Note: Cash on Delivery orders require payment at the time of delivery.</p>
                </div>
              )}
              
              {/* Payment form container - redirection message for PhonePe */}
            {showPaymentForm && (
              <div id="payment-form" className="mt-6 border rounded-lg p-4">
                <div className="flex justify-center items-center h-24">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  <p className="ml-2">Redirecting to PhonePe payment page...</p>
                </div>
              </div>
            )}
            
            {paymentError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded border border-red-200">
                <p className="text-sm">{paymentError}</p>
              </div>
            )}
            
            <div className="mt-4 flex items-center">
              <ShieldCheck size={18} className="text-green-600 mr-2" />
              <span className="text-xs text-gray-600">All transactions are secure and encrypted.</span>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Price Details</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between pb-3">
                <span>Price ({cart.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
                <div className="flex justify-between pb-3">
                <span>Shipping Fee</span>
                {shipping > 0 ? (
                  <span>₹{shipping.toFixed(2)}</span>
                ) : (
                  <span className="text-green-600 font-medium">Free Shipping</span>
                )}
              </div>
              
              <div className="bg-green-50 border border-green-100 p-2 rounded-md mb-3">
                <div className="flex items-center text-xs text-green-700">
                  <Truck size={14} className="mr-1" />
                  <span className="font-medium">Shipping Policy</span>
                </div>
                <ul className="text-xs text-green-700 mt-1 pl-5 list-disc">
                  <li>Free shipping on all orders above ₹600</li>
                  <li>₹50 shipping fee for orders below ₹600</li>
                  <li>Delivery typically within 3-5 business days</li>
                </ul>
              </div>
              
              {subtotal < 600 && subtotal > 0 && (
                <div className="mt-2 mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress to free shipping</span>
                    <span>₹{subtotal.toFixed(2)} of ₹600</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (subtotal / 600) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Add ₹{(600 - subtotal).toFixed(2)} more to get free shipping
                  </p>
                </div>
              )}
              
              {subtotal >= 600 && (
                <div className="flex items-center bg-green-50 text-green-700 p-2 rounded-md mb-3 text-sm">
                  <CheckCircle size={16} className="mr-1" />
                  <span>You've qualified for free shipping!</span>
                </div>
              )}
              
              <div className="flex justify-between pb-3">
                <span>GST (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-dashed pt-3 flex justify-between font-semibold text-base">
                <span>Total Amount</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="pt-2 text-green-600 flex items-center gap-1 text-sm">
                <CheckCircle size={16} />
                <span>You'll save ₹{(subtotal * 0.05).toFixed(2)} with prepaid order</span>
              </div>
            </div>
              <div className="mt-6 space-y-3">              <button 
                onClick={initializePayment}
                disabled={isProcessing || showPaymentForm}
                className={`w-full py-3 rounded-md font-medium ${
                  isProcessing || showPaymentForm 
                    ? 'bg-orange-300 cursor-not-allowed' 
                    : paymentMethod === 'cod'
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
              >
                {isProcessing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Cash on Delivery Order' : 'Proceed to Online Payment'}
              </button>
              <button 
                onClick={() => navigate('/')}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50"
              >
                Continue Shopping
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              <p>By proceeding, you agree to our <a href="#" className="text-orange-600 hover:underline">Terms & Conditions</a></p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 border-t pt-4">
                <div className="flex items-center">
                  <ShieldCheck size={18} className="text-green-600 mr-2" />
                  <span className="text-xs text-gray-600">All transactions are secure and encrypted.</span>
                </div>
                
                {paymentMethod === 'online' ? (
                  <div className="text-xs text-gray-600 mt-2 bg-blue-50 p-2 rounded">
                    <p className="font-medium text-blue-700">Online Payment Benefits:</p>
                    <ul className="list-disc pl-4 mt-1 text-blue-700">
                      <li>Fast and secure transaction</li>
                      <li>Instant order confirmation</li>
                      <li>Save 5% on your order value</li>
                    </ul>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 mt-2 bg-yellow-50 p-2 rounded">
                    <p className="font-medium text-yellow-700">Cash on Delivery Information:</p>
                    <ul className="list-disc pl-4 mt-1 text-yellow-700">
                      <li>Pay when your order arrives</li>
                      <li>Please keep the exact amount ready</li>
                      <li>We accept cash only for COD orders</li>
                    </ul>
                  </div>
                )}
              </div>
    </div>
  );
};
export default Checkout;
