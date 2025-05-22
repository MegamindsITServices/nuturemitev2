import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance, getConfig } from '../../../utils/request';
import { useAuth } from '../../../context/AuthContext';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auth] = useAuth();
  const navigate = useNavigate();

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color based on order status
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
      case 'Pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Fetch orders when component mounts  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!auth?.user?.userId && !auth?.user?._id) {
        setLoading(false);
        return;
      }

      // Use userId if available, otherwise fall back to _id
      const userId = auth?.user?.userId || auth?.user?._id;
      
      setLoading(true);
      try {
        await getConfig();
        console.log("Fetching orders for user ID:", userId);
        const response = await axiosInstance.get(`/api/order/get-order-by-user/${userId}`);
          if (response.data.success) {
          console.log("Orders fetched successfully:", response.data.orders);
          setOrders(response.data.orders);
        } else {
          console.error("API returned error:", response.data);
          setError("Failed to load orders");
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        console.error("Error details:", err.response?.data || err.message);
        setError(err.response?.data?.message || "An error occurred while fetching your orders");} finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [auth?.user?.userId, auth?.user?._id]);
  // Handle navigation to order details
  const viewOrderDetails = (orderId) => {
    console.log("Navigating to order details with ID:", orderId);
    navigate(`${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          You haven't placed any orders yet. Browse our products and place your first order!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Your Orders</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (          <div 
            key={order._id} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:border-primary transition-colors"
            onClick={() => viewOrderDetails(order._id)}
          >
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order._id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
                </div>
                
                <div className="mt-2 md:mt-0">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                    {order.status || 'Processing'}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">₹{order.totalPrice?.toFixed(2) || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{order.products?.length || 0} {order.products?.length === 1 ? 'item' : 'items'}</p>
                  </div>
                    <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      viewOrderDetails(order._id);
                    }}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
                  >
                    View Details <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerOrders;