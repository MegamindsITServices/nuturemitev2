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
  Clock,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FilterIcon,
  RefreshCcw,
  DollarSign,
  Smartphone,
  Building,
  Banknote,
  IndianRupee,
} from "lucide-react";
import { axiosInstance, getConfig } from "../../../utils/request";
import { GET_ORDER, UPDATE_ORDER } from "../../../lib/api-client";

const PaymentManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("all");
  const [sortOption, setSortOption] = useState("-createdAt");
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [auth] = useAuth();
  const navigate = useNavigate();

  // Payment status configurations
  const paymentStatusConfig = {
    Pending: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <Clock className="h-4 w-4" />,
    },
    Completed: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    Failed: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <XCircle className="h-4 w-4" />,
    },
    Refunded: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <RefreshCcw className="h-4 w-4" />,
    },
    Processing: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: <Clock className="h-4 w-4" />,
    },
  };

  // Payment method configurations
  const paymentMethodConfig = {
    "Cash on Delivery": {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <Banknote className="h-4 w-4" />,
    },
    PhonePe: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: <Smartphone className="h-4 w-4" />,
    },
    Cashfree: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <CreditCard className="h-4 w-4" />,
    },
    "Credit Card": {
      color: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: <CreditCard className="h-4 w-4" />,
    },
    UPI: {
      color: "bg-orange-100 text-orange-800 border-orange-200",
      icon: <Smartphone className="h-4 w-4" />,
    },
    "Debit Card": {
      color: "bg-cyan-100 text-cyan-800 border-cyan-200",
      icon: <CreditCard className="h-4 w-4" />,
    },
    "Net Banking": {
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: <Building className="h-4 w-4" />,
    },
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

      console.log("Fetched orders for payment management:", data.orders);
      setOrders(data.orders);
      setTotalPages(1);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load payment data. Please try again.");
      setLoading(false);
    }
  };

  // Calculate payment statistics
  const calculatePaymentStatistics = (ordersData) => {
    try {
      setLoadingStats(true);

      // Calculate total revenue by payment status
      const revenueByStatus = {};
      const countByStatus = {};
      const revenueByMethod = {};
      const countByMethod = {};

      ordersData.forEach((order) => {
        const status = order.payment?.status || "Pending";
        const method = order.payment?.method || "Cash on Delivery";
        const amount = order.totalPrice || 0;

        // By status
        revenueByStatus[status] = (revenueByStatus[status] || 0) + amount;
        countByStatus[status] = (countByStatus[status] || 0) + 1;

        // By method
        revenueByMethod[method] = (revenueByMethod[method] || 0) + amount;
        countByMethod[method] = (countByMethod[method] || 0) + 1;
      });

      // Calculate total revenue
      const totalRevenue = ordersData.reduce(
        (total, order) => total + (order.totalPrice || 0),
        0
      );

      // Calculate completed payments revenue
      const completedRevenue = ordersData
        .filter((order) => order.payment?.status === "Completed")
        .reduce((total, order) => total + (order.totalPrice || 0), 0);

      // Calculate pending payments
      const pendingPayments = ordersData.filter(
        (order) => order.payment?.status === "Pending"
      );

      const pendingRevenue = pendingPayments.reduce(
        (total, order) => total + (order.totalPrice || 0),
        0
      );

      setStatistics({
        totalRevenue,
        completedRevenue,
        pendingPayments: {
          count: pendingPayments.length,
          revenue: pendingRevenue,
        },
        revenueByStatus,
        countByStatus,
        revenueByMethod,
        countByMethod,
      });

      setLoadingStats(false);
    } catch (err) {
      console.error("Error calculating payment statistics:", err);
      setLoadingStats(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    if (auth?.token) {
      const loadOrders = async () => {
        await fetchOrders();
      };
      loadOrders();
    }
  }, [auth?.token, page]);

  // Calculate statistics when orders change
  useEffect(() => {
    if (orders.length > 0) {
      calculatePaymentStatistics(orders);
    }
  }, [orders]);

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

  // Handle payment update
  const handlePaymentUpdate = async () => {
    try {
      const updatedPayment = {
        ...selectedOrder.payment,
        status: newPaymentStatus,
        method: newPaymentMethod,
      };

      const { data } = await axiosInstance.put(
        UPDATE_ORDER.replace(":id", selectedOrder._id),
        {
          ...selectedOrder,
          payment: updatedPayment,
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
          ? { ...order, payment: updatedPayment }
          : order
      );

      setOrders(updatedOrders);

      // Recalculate statistics
      calculatePaymentStatistics(updatedOrders);

      // Close dialog and show success message
      setDialogOpen(false);
      toast.success("Payment details updated successfully");
    } catch (err) {
      console.error("Error updating payment details:", err);
      toast.error("Failed to update payment details");
    }
  };

  // Open payment update dialog
  const openPaymentDialog = (order) => {
    setSelectedOrder(order);
    setNewPaymentStatus(order.payment?.status || "Pending");
    setNewPaymentMethod(order.payment?.method || "Cash on Delivery");
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

  // Handle filter changes
  const handlePaymentStatusFilterChange = (value) => {
    setFilterPaymentStatus(value);
    setPage(1);
  };

  const handlePaymentMethodFilterChange = (value) => {
    setFilterPaymentMethod(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
  };

  // Helper function to filter and sort orders
  const getFilteredSortedOrders = () => {
    let filtered = [...orders];

    // Filter by payment status
    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter(
        (order) => (order.payment?.status || "Pending") === filterPaymentStatus
      );
    }

    // Filter by payment method
    if (filterPaymentMethod !== "all") {
      filtered = filtered.filter(
        (order) =>
          (order.payment?.method || "Cash on Delivery") === filterPaymentMethod
      );
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

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Payment Management</h1>

      {/* Payment Statistics Cards */}
      {!loadingStats && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
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
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{statistics.completedRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics.countByStatus["Completed"] || 0} orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.pendingPayments.count}
              </div>
              <p className="text-xs text-muted-foreground">
                ₹{statistics.pendingPayments.revenue.toFixed(2)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Failed/Refunded
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(statistics.countByStatus["Failed"] || 0) +
                  (statistics.countByStatus["Refunded"] || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                ₹
                {(
                  (statistics.revenueByStatus["Failed"] || 0) +
                  (statistics.revenueByStatus["Refunded"] || 0)
                ).toFixed(2)}{" "}
                value
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-1/4">
          <Select
            value={filterPaymentStatus}
            onValueChange={handlePaymentStatusFilterChange}
          >
            <SelectTrigger>
              <FilterIcon className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Refunded">Refunded</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/4">
          <Select
            value={filterPaymentMethod}
            onValueChange={handlePaymentMethodFilterChange}
          >
            <SelectTrigger>
              <CreditCard className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment Methods</SelectItem>
              <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
              <SelectItem value="PhonePe">PhonePe</SelectItem>
              <SelectItem value="Cashfree">Cashfree</SelectItem>
              <SelectItem value="Credit Card">Credit Card</SelectItem>
              <SelectItem value="Debit Card">Debit Card</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="Net Banking">Net Banking</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-1/4">
          <Select value={sortOption} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="-createdAt">Newest First</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
              <SelectItem value="-totalPrice">Amount: High to Low</SelectItem>
              <SelectItem value="totalPrice">Amount: Low to High</SelectItem>
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

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Payment Method</TableHead>
              
                <TableHead>Transaction ID</TableHead>
                <TableHead>Order Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : getFilteredSortedOrders().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    No payment records found
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
                        ? order.buyer._id?.substring(0, 8)
                        : "Guest User"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{order.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          paymentStatusConfig[
                            order.payment?.status || "Pending"
                          ]?.color
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {
                            paymentStatusConfig[
                              order.payment?.status || "Pending"
                            ]?.icon
                          }
                          {order.payment?.status || "Pending"}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          paymentMethodConfig[
                            order.payment?.method || "Cash on Delivery"
                          ]?.color
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {
                            paymentMethodConfig[
                              order.payment?.method || "Cash on Delivery"
                            ]?.icon
                          }
                          {order.payment?.method || "Cash on Delivery"}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">
                        {order.payment.method == "Cash on Delivery"? "COD Order" :order.payment?.transactionId || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => openPaymentDialog(order)}
                      >
                        Update Payment
                      </Button>
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

      {/* Payment Update Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Update Payment Details</DialogTitle>
            <DialogDescription>
              Update the payment status and method for this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Order Info */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <p className="text-sm">
                <strong>Order ID:</strong>{" "}
                {selectedOrder?._id.substring(selectedOrder._id.length - 8)}
              </p>
              <p className="text-sm">
                <strong>Amount:</strong> ₹{selectedOrder?.totalPrice.toFixed(2)}
              </p>
              <p className="text-sm">
                <strong>Customer:</strong>{" "}
                {selectedOrder?.buyer?.name ||
                  selectedOrder?.buyer?._id?.substring(0, 8) ||
                  "Guest User"}
              </p>
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-sm font-medium">Payment Status</label>
              <Select
                value={newPaymentStatus}
                onValueChange={setNewPaymentStatus}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <Select
                value={newPaymentMethod}
                onValueChange={setNewPaymentMethod}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash on Delivery">
                    Cash on Delivery
                  </SelectItem>
                  <SelectItem value="PhonePe">PhonePe</SelectItem>
                  <SelectItem value="Cashfree">Cashfree</SelectItem>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Debit Card">Debit Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentUpdate}>Update Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;
