import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Truck,
  Package,
  RefreshCcw,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FilterIcon,
  Info,
  ShoppingBag,
} from "lucide-react";
import { axiosInstance, getConfig } from "../../../utils/request";
import { GET_ORDER, UPDATE_ORDER } from "../../../lib/api-client";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOption, setSortOption] = useState("-createdAt");
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [auth] = useAuth();
  const navigate = useNavigate();

  // Status configurations
  const statusConfig = {
    Confirmed: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    Processing: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: <RefreshCcw className="h-4 w-4" />,
    },
    Shipped: {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <Truck className="h-4 w-4" />,
    },
    "Out for Delivery": {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: <Truck className="h-4 w-4" />,
    },
    Delivered: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    Cancelled: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <XCircle className="h-4 w-4" />,
    },
  };

  // Payment status colors
  const paymentStatusColor = {
    Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Completed: "bg-green-100 text-green-800 border-green-200",
    Failed: "bg-red-100 text-red-800 border-red-200",
    Refunded: "bg-blue-100 text-blue-800 border-blue-200",
  };

  // Payment method colors
  const paymentMethodColor = {
    "Cash on Delivery": "bg-gray-100 text-gray-800 border-gray-200",
    PhonePe: "bg-purple-100 text-purple-800 border-purple-200",
    Cashfree: "bg-blue-100 text-blue-800 border-blue-200",
    "Credit Card": "bg-emerald-100 text-emerald-800 border-emerald-200",
    UPI: "bg-orange-100 text-orange-800 border-orange-200",
  };

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

      console.log("Fetched orders:", data.orders);
      setOrders(data.orders);
      // Since the API doesn't return pagination info, set a default value
      setTotalPages(1);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again.");
      setLoading(false);
    }
  };
  // Calculate order statistics directly from the orders data
  const calculateOrderStatistics = (ordersData) => {
    try {
      setLoadingStats(true);

      // Calculate total revenue
      const totalRevenue = ordersData.reduce(
        (total, order) => total + (order.totalPrice || 0),
        0
      );

      // Count orders by status
      const statusCounts = {};
      ordersData.forEach((order) => {
        const status = order.status || "Confirmed";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      // Convert to array format that the UI expects
      const ordersByStatus = Object.keys(statusCounts).map((status) => ({
        status,
        count: statusCounts[status],
      }));

      // Calculate recent orders (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentOrders = ordersData.filter(
        (order) => new Date(order.createdAt) >= thirtyDaysAgo
      );

      const recentRevenue = recentOrders.reduce(
        (total, order) => total + (order.totalPrice || 0),
        0
      );

      // Set statistics
      setStatistics({
        totalRevenue,
        ordersByStatus,
        recentOrders: {
          count: recentOrders.length,
          revenue: recentRevenue,
        },
      });

      setLoadingStats(false);
    } catch (err) {
      console.error("Error calculating order statistics:", err);
      setLoadingStats(false);
    }
  };
  // Load orders on component mount and when filters/pagination change
  useEffect(() => {
    if (auth?.token) {
      const loadOrders = async () => {
        await fetchOrders();
        // Calculate statistics from the orders data
        if (orders.length > 0) {
          calculateOrderStatistics(orders);
        }
      };

      loadOrders();
    }
  }, [auth?.token, page]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Open product details dialog
  const openProductDetails = (products) => {
    setSelectedProducts(products);
    setProductDetailsOpen(true);
  };

  // Handle order status update
  const handleStatusUpdate = async () => {
    try {
      const { data } = await axiosInstance.put(
        UPDATE_ORDER.replace(":id", selectedOrder._id),
        {
          ...selectedOrder,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      // Update order in the list
      const updatedOrders = orders.map((order) =>
        order._id === selectedOrder._id
          ? { ...order, status: newStatus }
          : order
      );

      setOrders(updatedOrders);

      // Recalculate statistics with updated orders
      calculateOrderStatistics(updatedOrders);

      // Close dialog and show success message
      setDialogOpen(false);
      toast.success("Order status updated successfully");
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  };

  // Open status update dialog
  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setDialogOpen(true);
  };

  // Handle page change
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Handle status filter change
  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setPage(1); // Reset to first page on filter change
  };

  // Handle sort option change
  const handleSortChange = (value) => {
    setSortOption(value);
  };
  // View order details
  const viewOrderDetails = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Helper function to display product summary
  const formatProductSummary = (products) => {
    if (!products || products.length === 0) {
      return "No products";
    }

    // Check if products are populated objects or just IDs
    const isPopulated = typeof products[0] !== "string";

    if (isPopulated) {
      // If we have 1 product, show its name
      if (products.length === 1) {
        return products[0]?.product?.name || "Unknown Product";
      }
      // If we have multiple products, show the first one and "+X more"
      return `${products[0]?.product?.name || "Unknown Product"} +${
        products.length - 1
      } more`;
    } else {
      // If products aren't populated objects, just show the count
      return `${products.length} product(s)`;
    }
  };

  // Helper function to filter and sort orders
  const getFilteredSortedOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    // Sort
    switch (sortOption) {
      case "-createdAt":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "createdAt":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "-totalPrice":
        filtered.sort((a, b) => b.totalPrice - a.totalPrice);
        break;
      case "totalPrice":
        filtered.sort((a, b) => a.totalPrice - b.totalPrice);
        break;
      default:
        break;
    }

    return filtered;
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Order Management</h1>

      {/* Statistics Cards */}
      {!loadingStats && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{statistics.totalRevenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.ordersByStatus.reduce(
                  (acc, curr) => acc + curr.count,
                  0
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Orders (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.recentOrders.count}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recent Revenue (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{statistics.recentOrders.revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-1/3">
          <Select value={filterStatus} onValueChange={handleFilterChange}>
            <SelectTrigger>
              <FilterIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/3">
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest First</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
              <SelectItem value="-totalPrice">Price: High to Low</SelectItem>
              <SelectItem value="totalPrice">Price: Low to High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {" "}
              <TableRow className="bg-muted/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone No</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : getFilteredSortedOrders().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredSortedOrders().map((order) => (
                  <TableRow key={order._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {order._id.substring(order._id.length - 8)}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      {order.buyer && order.buyer.name
                        ? order.buyer.name
                        : order.buyer
                        ? order.buyer._id.substring(0, 8)
                        : "Guest User"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="truncate max-w-[150px]">
                          {formatProductSummary(order.products)}
                        </span>
                        {order.products && order.products.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openProductDetails(order.products)}
                            className="ml-1"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="truncate max-w-[150px] block">
                        {order.address}
                      </span>
                    </TableCell>
                    <TableCell>{order.phone}</TableCell>
                    <TableCell>₹{order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusConfig[order.status]?.color}`}>
                        <span className="flex items-center gap-1">
                          {statusConfig[order.status]?.icon}
                          {order.status}
                        </span>
                      </Badge>
                    </TableCell>{" "}
                    <TableCell>
                      <Badge
                        className={`${
                          paymentStatusColor[order.payment.status]
                        }`}
                      >
                        {order.payment.status}
                      </Badge>
                    </TableCell>{" "}
                    <TableCell>
                      <Badge
                        className={`${
                          paymentMethodColor[
                            order.payment.method || "Cash on Delivery"
                          ]
                        }`}
                      >
                        {order.payment.method || "Cash on Delivery"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewOrderDetails(order._id)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openStatusDialog(order)}
                        >
                          Update
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <CardFooter className="flex justify-between p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page === 1}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="flex items-center gap-1"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Select the new status for this order.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 mb-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Out for Delivery">
                  Out for Delivery
                </SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={productDetailsOpen} onOpenChange={setProductDetailsOpen}>
        <DialogContent className="max-w-xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Order Products
            </DialogTitle>
            <DialogDescription>
              Detailed information about the ordered products
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 max-h-[70vh] overflow-y-auto">
            {selectedProducts.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No product details available
              </p>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map(({ product, quantity }, index) => {
                  // Check if product is a populated object or just an ID
                  const isPopulated = typeof product !== "string";
                  // If your schema is { product, quantity }, adjust accordingly:
                  // const prod = isPopulated ? product.product : product;
                  // const quantity = isPopulated ? product.quantity : 1;

                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        {isPopulated ? (
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* Product Image */}

                            {product.images && product.images.length > 0 && (
                              <div className="md:w-1/4">
                                <img
                                  src={
                                    product.images[0].startsWith("http")
                                      ? product.images[0]
                                      : `https://api.nuturemite.info/image/${product.images[0]}`
                                  }
                                  alt={product.name}
                                  className="w-full h-auto rounded-md object-cover aspect-square"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://placehold.co/100x100?text=No+Image";
                                  }}
                                />
                              </div>
                            )}

                            {/* Product Details */}
                            <div
                              className={`${
                                product.images && product.images.length > 0
                                  ? "md:w-3/4"
                                  : "w-full"
                              }`}
                            >
                              <h3 className="font-semibold text-lg mb-1">
                                {product.name}
                              </h3>
                              <h3 className="font-semibold text-lg mb-1">
                                Quantity : {quantity}
                              </h3>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <div>
                                  <p className="text-sm font-medium">Price:</p>
                                  <p className="text-sm">
                                    ₹{product.price?.toFixed(2) ?? "N/A"}
                                  </p>
                                </div>

                                {product.collection && (
                                  <div>
                                    <p className="text-sm font-medium">
                                      Collection:
                                    </p>
                                    <p className="text-sm">
                                      {typeof product.collection === "object"
                                        ? product.collection.name
                                        : "All"}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {product.description && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium">
                                    Description:
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                              Product ID: {product}
                            </p>
                            <Badge variant="outline">
                              No details available
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrders;
