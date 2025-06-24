import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Loader2,
  IndianRupee,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Calendar,
  FileText,
  DollarSign,
  ShoppingBag,
  ShipIcon,
  Currency,
  IndianRupeeIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { axiosInstance, getConfig } from "../..//utils/request";
import { GET_ORDER } from "../..//lib/api-client";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    deliveredRevenue: 0,
    monthlyGrowth: {
      orders: 0,
      revenue: 0,
    },
  });
  const [totalUsers, setTotalUsers] = useState(0);
  const [auth] = useAuth();

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      await getConfig();
      const { data } = await axiosInstance.get(GET_ORDER, {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      console.log("Fetched orders for dashboard:", data.orders);
      setOrders(data.orders);
      calculateStatistics(data.orders);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load dashboard data. Please try again.");
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/api/auth/get-users", {
        headers: {
          Authorization: `Bearer ${auth?.token}`,
        },
      });

      setTotalUsers(data.users.length);
      console.log("Fetched users for dashboard:", data.users);
      // Process users if needed
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load user data. Please try again.");
      setLoading(false);
    }
  };
  // Calculate dashboard statistics
  const calculateStatistics = (ordersData) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Current month orders
    const currentMonthOrders = ordersData.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    });

    // Last month orders
    const lastMonthOrders = ordersData.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === lastMonth &&
        orderDate.getFullYear() === lastMonthYear
      );
    });

    // Calculate totals
    const totalOrders = ordersData.length;
    // Calculate total revenue (all orders)
    const totalRevenue = ordersData.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    // Calculate revenue for delivered orders only
    const deliveredRevenue = ordersData
      .filter(order => order.status === "Delivered")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Get unique customers
    const uniqueCustomers = new Set();
    ordersData.forEach((order) => {
      if (order.buyer && order.buyer._id) {
        uniqueCustomers.add(order.buyer._id);
      } else if (order.buyer) {
        uniqueCustomers.add(order.buyer);
      }
    });

    // Calculate unique products
    const uniqueProducts = new Set();
    ordersData.forEach((order) => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach((product) => {
          if (product._id) {
            uniqueProducts.add(product._id);
          }
        });
      }
    });

    // Calculate monthly growth
    const currentMonthRevenue = currentMonthOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );
    const lastMonthRevenue = lastMonthOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    const orderGrowth =
      lastMonthOrders.length > 0
        ? ((currentMonthOrders.length - lastMonthOrders.length) /
            lastMonthOrders.length) *
          100
        : 0;

    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    setStatistics({
      totalOrders,
      totalRevenue,
      deliveredRevenue,
      totalProducts: uniqueProducts.size,
      totalCustomers: uniqueCustomers.size,
      monthlyGrowth: {
        orders: Math.round(orderGrowth),
        revenue: Math.round(revenueGrowth),
      },
    });
  };

  // Load orders on component mount
  useEffect(() => {
    if (auth?.token) {
      fetchOrders();
      fetchUsers();
    }
  }, [auth?.token]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get recent orders (last 5)
  const getRecentOrders = () => {
    return orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  // Get top selling products
  const getTopProducts = () => {
    const productCounts = {};

    orders.forEach((order) => {
      if (order.products && Array.isArray(order.products)) {
        order.products.forEach((product) => {
          const key = product.name || product._id;
          if (key) {
            productCounts[key] =
              (productCounts[key] || 0) + (product.quantity || 1);
          }
        });
      }
    });

    return Object.entries(productCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  // Get status badge style
  const getStatusBadge = (status) => {
    const statusStyles = {
      "Not Process":
        "px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs",
      Processing: "px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs",
      Shipped: "px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs",
      Delivered: "px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs",
      Cancelled: "px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs",
    };

    return statusStyles[status] || statusStyles["Not Process"];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h2 className="text-2xl font-bold">{statistics.totalOrders}</h2>
            </div>
            <div className="bg-blue-100 p-2 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <p
            className={`text-sm mt-2 ${
              statistics.monthlyGrowth.orders >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {statistics.monthlyGrowth.orders >= 0 ? "↑" : "↓"}{" "}
            {Math.abs(statistics.monthlyGrowth.orders)}% from last month
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Revenue</p>
              <h2 className="text-2xl font-bold">
                ₹{statistics.deliveredRevenue}{" "}
              </h2>
            </div>
            <div className="bg-green-100 p-2 rounded-full">
              <IndianRupee className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <p className={`text-sm mt-2 ${"text-green-500"}`}>
            Pending Revenue:{" "}
            <span className="font-medium text-red-500">
              ₹{statistics.totalRevenue - statistics.deliveredRevenue}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Products</p>
              <h2 className="text-2xl font-bold">{statistics.totalProducts}</h2>
            </div>
            <div className="bg-purple-100 p-2 rounded-full">
              <Package className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <p className="text-purple-500 text-sm mt-2">Unique products sold</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Customers</p>
              <h2 className="text-2xl font-bold">
                {totalUsers || statistics.totalCustomers}
              </h2>
            </div>
            <div className="bg-orange-100 p-2 rounded-full">
              <Users className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <p className="text-orange-500 text-sm mt-2">Total customers</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Order ID</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {getRecentOrders().length > 0 ? (
                getRecentOrders().map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="px-4 py-2">
                      #{order._id.substring(order._id.length - 8)}
                    </td>
                    <td className="px-4 py-2">
                      {order.buyer && order.buyer.name
                        ? order.buyer.name
                        : order.buyer
                        ? `User ${
                            order.buyer._id?.substring(0, 8) ||
                            order.buyer.substring(0, 8)
                          }`
                        : "Guest User"}
                    </td>
                    <td className="px-4 py-2">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-2">
                      ₹{order.totalPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={getStatusBadge(order.status)}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions and Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to={"/admin/add-product"}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
            >
              <Plus className="h-6 w-6 text-blue-500 mb-1" />
              <span className="text-sm">Add Product</span>
            </Link>
            <Link
              to={"/admin/products"}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
            >
              <ShoppingBag className="h-6 w-6 text-blue-500 mb-1" />
              <span className="text-sm">View Products</span>
            </Link>
            <Link
              to={"/admin/orders"}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
            >
              <ShipIcon className="h-6 w-6 text-blue-500 mb-1" />
              <span className="text-sm">View Orders</span>
            </Link>
            <Link
              to={"/admin/payments"}
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center"
            >
              <IndianRupeeIcon className="h-6 w-6 text-blue-500 mb-1" />
              <span className="text-sm">Payments</span>
            </Link>
          
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Top Selling Products</h2>
          <ul className="space-y-3">
            {getTopProducts().length > 0 ? (
              getTopProducts().map((product, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded bg-gray-200 mr-3 flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-500" />
                    </div>
                    <span className="truncate max-w-[200px]">
                      {product.name}
                    </span>
                  </div>
                  <span className="font-medium">{product.count} units</span>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-4">
                No product data available
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
