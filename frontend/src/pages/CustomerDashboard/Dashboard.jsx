import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { axiosInstance } from '../../utils/request';
import { Loader2, User, ShoppingBag, Calendar, Settings } from 'lucide-react';

const CustomerDashboard = () => {
  const [auth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get('/api/order/get-order-by-user/' + auth.user._id, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });
        
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token && auth?.user?._id) {
      fetchUserOrders();
    } else {
      setLoading(false);
    }
  }, [auth.token, auth.user]);

  // Get first name from full name
  const firstName = auth?.user?.firstName || auth?.user?.name?.split(' ')[0] || 'Customer';

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {firstName}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your account and recent activities
          </p>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <User className="mr-2 h-4 w-4" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="font-medium">{auth?.user?.firstName} {auth?.user?.lastName}</p>
                <p className="text-sm text-muted-foreground">{auth?.user?.email}</p>
                {auth?.user?.phone && (
                  <p className="text-sm text-muted-foreground">Phone: {auth?.user?.phone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Orders Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <div>
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Total orders placed</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">Customer since</p>
            <p className="text-lg font-medium">
              {new Date(auth?.user?.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) || 'N/A'}
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* Recent Orders Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">            {orders.slice(0, 3).map(order => (
              <Card key={order._id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => navigate(`/customer/orders/${order._id}`)}>
                <div className="bg-muted/50 p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">Order #{order._id.substring(order._id.length - 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <div className={`px-3 py-1 text-xs font-medium rounded-full 
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">
                        {Array.isArray(order.products) ? 
                          `${order.products.length} ${order.products.length === 1 ? 'item' : 'items'}` : 
                          'Items'
                        }
                      </p>
                      <p className="text-sm text-muted-foreground">{order.address}</p>
                    </div>
                    <div>
                      <p className="font-medium">₹{order.totalPrice.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground text-right">
                        {order.payment.method || "Cash on Delivery"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
              {orders.length > 3 && (
              <div className="text-center">
                <a href="/customer/orders" className="text-sm font-medium text-primary hover:underline">
                  View all orders
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;