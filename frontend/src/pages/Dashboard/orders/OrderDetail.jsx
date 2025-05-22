import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  RefreshCcw, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { axiosInstance } from '../../../utils/request';
import { GET_ORDER_BY_ID, UPDATE_ORDER } from '../../../lib/api-client';

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  const [auth] = useAuth();
  const navigate = useNavigate();

  // Status configurations
  const statusConfig = {
    'Confirmed': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle className="h-4 w-4" /> },
    'Processing': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <RefreshCcw className="h-4 w-4" /> },
    'Shipped': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: <Truck className="h-4 w-4" /> },
    'Out for Delivery': { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Truck className="h-4 w-4" /> },
    'Delivered': { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="h-4 w-4" /> },
    'Cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle className="h-4 w-4" /> },
  };

  // Payment status colors
  const paymentStatusColor = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Failed': 'bg-red-100 text-red-800 border-red-200',
    'Refunded': 'bg-blue-100 text-blue-800 border-blue-200'
  };
  
  // Payment method colors
  const paymentMethodColor = {
    'Cash on Delivery': 'bg-gray-100 text-gray-800 border-gray-200',
    'PhonePe': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cashfree': 'bg-blue-100 text-blue-800 border-blue-200',
    'Credit Card': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'UPI': 'bg-orange-100 text-orange-800 border-orange-200',
  };

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        GET_ORDER_BY_ID.replace(':id', orderId),
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );
        if (data.success) {
        console.log("Order details loaded:", data.order);
        setOrder(data.order);
      } else {
        setError("Failed to load order details");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Failed to load order details. Please try again.");
      setLoading(false);
    }
  };

  // Load order details on component mount
  useEffect(() => {
    if (auth?.token && orderId) {
      fetchOrderDetails();
    }
  }, [auth?.token, orderId]);

  // Format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  // Handle order status update
  const handleStatusUpdate = async () => {
    try {
      const { data } = await axiosInstance.put(
        UPDATE_ORDER.replace(':id', orderId),
        { 
          ...order,
          status: newStatus 
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`
          }
        }
      );
      
      if (data.success) {
        // Update order status
        setOrder({
          ...order,
          status: newStatus
        });
        
        // Close dialog and show success message
        setDialogOpen(false);
        toast.success("Order status updated successfully");
      } else {
        toast.error("Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  };

  // Open status update dialog
  const openStatusDialog = () => {
    setNewStatus(order.status);
    setDialogOpen(true);
  };
  // Go back to orders list
  const handleGoBack = () => {
    navigate('/dashboard/orders');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Order not found"}
          </AlertDescription>
        </Alert>
        <Button 
          variant="ghost" 
          className="mt-4 flex items-center gap-2"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">
          Order Details
        </h1>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary Card - 2/3 width on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    Order #{order._id.substring(order._id.length - 8)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${statusConfig[order.status]?.color}`}>
                    <span className="flex items-center gap-1">
                      {statusConfig[order.status]?.icon}
                      {order.status}
                    </span>
                  </Badge>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Shipping Information</h3>
                  <p className="text-sm">{order.address}</p>
                  <p className="text-sm">Phone: {order.phone}</p>
                </div>
                
                <div>                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="flex flex-col gap-2">                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Payment Method:</p>
                      <Badge className={`${paymentMethodColor[order.payment.method || "Cash on Delivery"]}`}>
                        {order.payment.method || "Cash on Delivery"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Payment Status:</p>
                      <Badge className={`${paymentStatusColor[order.payment.status]}`}>
                        {order.payment.status}
                      </Badge>
                    </div>
                    
                    {order.payment.transactionId && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Transaction ID:</p>
                        <p className="text-sm">{order.payment.transactionId}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator className="my-4" />
                <h3 className="font-semibold mb-3">Order Items</h3>
              
              <div className="space-y-4">
                {order.products.length === 0 ? (
                  <p className="text-muted-foreground">No products in this order</p>
                ) : (
                  order.products.map((product, index) => {
                    const isPopulated = typeof product !== 'string' && product !== null && product._id;
                    
                    return (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 py-3 border-b border-border">
                        {/* Product Image */}
                        {isPopulated && product.images && product.images.length > 0 && (
                          <div className="w-20 h-20 flex-shrink-0">
                            <img 
                              src={product.images[0].startsWith('http') ? 
                                product.images[0] : 
                                `${process.env.REACT_APP_API}/${product.images[0]}`
                              } 
                              alt={product.name} 
                              className="w-full h-full object-cover rounded-md"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://placehold.co/100x100?text=No+Image';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <p className="font-medium">
                                {isPopulated ? product.name : `Product ID: ${product}`}
                              </p>
                              {isPopulated && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {product.description?.substring(0, 100)}
                                  {product.description?.length > 100 ? '...' : ''}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 sm:mt-0 sm:text-right">
                              {isPopulated && product.price && (
                                <p className="font-medium">₹{product.price.toFixed(2)}</p>
                              )}
                              {isPopulated && product.collection && (
                                <p className="text-xs text-muted-foreground">
                                  {typeof product.collection === 'object' ? 
                                    product.collection.name : 
                                    'Unknown Collection'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-end">
                <p className="text-lg font-semibold">
                  Total: ₹{order.totalPrice.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Admin Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={openStatusDialog}>
                Update Status
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Customer Info & Order Timeline - 1/3 width on large screens */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {order.buyer ? (
                <div className="space-y-1">
                  <p className="font-medium">{order.buyer.name}</p>
                  <p className="text-sm text-muted-foreground">{order.buyer.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {order.buyer.phone || order.phone}
                  </p>
                </div>
              ) : (
                <p>Guest Customer</p>
              )}
            </CardContent>
          </Card>
          
          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Order Placed */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Placed</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                
                {order.status !== 'Cancelled' ? (
                  <>
                    {/* Processing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Processing</p>
                        <p className="text-sm text-muted-foreground">
                          {order.status === 'Processing' ? 'Current Status' : 
                          (order.status === 'Confirmed' ? 'Pending' : 'Completed')}
                        </p>
                      </div>
                      {order.status !== 'Confirmed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Package className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    
                    {/* Shipped */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Shipped</p>
                        <p className="text-sm text-muted-foreground">
                          {order.status === 'Shipped' ? 'Current Status' : 
                          (order.status === 'Out for Delivery' || order.status === 'Delivered' ? 'Completed' : 'Pending')}
                        </p>
                      </div>
                      {order.status === 'Shipped' || order.status === 'Out for Delivery' || order.status === 'Delivered' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Truck className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    
                    {/* Out for Delivery */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Out for Delivery</p>
                        <p className="text-sm text-muted-foreground">
                          {order.status === 'Out for Delivery' ? 'Current Status' : 
                          (order.status === 'Delivered' ? 'Completed' : 'Pending')}
                        </p>
                      </div>
                      {order.status === 'Out for Delivery' || order.status === 'Delivered' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Truck className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    
                    {/* Delivered */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Delivered</p>
                        <p className="text-sm text-muted-foreground">
                          {order.status === 'Delivered' ? 'Completed' : 'Pending'}
                        </p>
                      </div>
                      {order.status === 'Delivered' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.updatedAt)}
                      </p>
                    </div>
                    <XCircle className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Select the new status for this order.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};



export default OrderDetail;
