import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { backendURL } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Delivered':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Processing':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Shipped':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'Cancelled':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Out for Delivery':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'Completed':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'Pending':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'Failed':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getPaymentStatusIcon = (status) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle2 size={16} className="text-green-600" />;
    case 'Pending':
      return <Clock size={16} className="text-yellow-600" />;
    case 'Failed':
      return <XCircle size={16} className="text-red-600" />;
    default:
      return <AlertTriangle size={16} className="text-gray-600" />;
  }
};

const Orders = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth?.token) {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`${backendURL}/api/order/user-orders`, {
          headers: {
            Authorization: auth.token
          }
        });
        
        setOrders(response.data.orders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again.');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [auth, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 size={48} className="animate-spin text-orange-500 mb-4" />
        <p className="text-gray-600">Loading your orders...</p>
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
          <button 
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-md font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Breadcrumb 
          items={[
            { label: 'Home', href: '/' },
            { label: 'My Orders' }
          ]} 
        />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>
        
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order._id} 
                className="bg-white rounded-lg shadow-sm border p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
                  <div className="flex items-center">
                    <Package size={20} className="text-orange-500 mr-2" />
                    <div>
                      <h3 className="font-medium">Order #{order._id.slice(-8)}</h3>
                      <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 sm:mt-0 flex flex-wrap gap-2">
                    <span className={`text-xs px-3 py-1.5 rounded-full border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1 ${getPaymentStatusColor(order.payment?.status || 'Pending')}`}>
                      {getPaymentStatusIcon(order.payment?.status || 'Pending')}
                      <span>Payment {order.payment?.status || 'Pending'}</span>
                    </span>
                  </div>
                </div>
                
                <div className="py-4 border-b">
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center text-sm">
                    <div>
                      <p className="text-gray-600">Items: {order.productName}</p>
                      <p className="text-gray-600">Payment Method: {order.payment?.method || 'Cash on Delivery'}</p>
                    </div>
                    <div className="mt-2 sm:mt-0">
                      <p className="font-semibold">Total Amount: ₹{order.totalPrice?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex flex-wrap gap-3">
                  <button 
                    onClick={() => navigate(`/order-success/${order.payment?.transactionId || order._id}`)} 
                    className="flex items-center text-sm font-medium text-orange-500 hover:text-orange-600"
                  >
                    View Details
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                  
                  { (
                    <button 
                      onClick={() => console.log('Track order')} 
                      className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-600"
                    >
                      Track Order
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  )}
                  
                  {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <button 
                      onClick={() => console.log('Cancel order')} 
                      className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      Cancel Order
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Package size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-md font-medium"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
