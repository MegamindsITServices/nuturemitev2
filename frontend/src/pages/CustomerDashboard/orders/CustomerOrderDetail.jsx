import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { backendURL } from "../../../lib/api-client";
import jsPDF from "jspdf";
import {
  ChevronLeft,
  Package,
  Truck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Phone,
  CreditCard,
  CalendarClock,
  Shield,
  ChevronRight,
  Download,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

const CustomerOrderDetail = () => {
  const { orderId } = useParams();
  const [auth] = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [productTotal, setProductTotal] = useState(0);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        `${backendURL}/api/order/get-order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.data.success) {
        if (JSON.stringify(response.data.order) !== JSON.stringify(order)) {
          setOrder(response.data.order);
          setProductTotal(
            response.data.order.products.reduce(
              (total, item) => total + item.product.price * item.quantity,
              0
            )
          );
        }
      } else {
        setError("Failed to load order details.");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Unable to load order details. Please try again later.");
    }
  }, [orderId, auth, navigate, order]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchOrderDetails();
      setLoading(false);
    };

    loadInitialData();

    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 10000000);

    setPollingInterval(interval);

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [fetchOrderDetails]);

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Invoice generation function
  const generateInvoice = () => {
    if (!order) return;

    setGeneratingInvoice(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Colors and styling
      const primaryColor = [37, 99, 235]; // Blue
      const lightGray = [243, 244, 246];

      // Company Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 35, "F");

      // Company Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      // Add logo before the company name
      const logoUrl = "/images/logo.png";
      // Try to load the logo image and add it to the PDF
      // jsPDF supports base64 or URL (if CORS allows)
      // We'll use an Image object to load and convert to DataURL
      const addLogoAndText = (callback) => {
        const img = new window.Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
          // Draw the logo at (20, 6), width 24, height 24
          doc.addImage(img, "PNG", 20, 6, 24, 24);
          // Draw the company name next to the logo
          doc.text("Nuturemite", 50, 22);
          callback();
        };
        img.onerror = function () {
          // If logo fails to load, just draw the text
          doc.text("Nuturemite", 20, 22);
          callback();
        };
        img.src = logoUrl;
      };

    
      addLogoAndText(() => {
        // Invoice Title
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Tax Invoice", pageWidth - 20, 22, { align: "right" });

        // ... rest of the PDF generation code ...
        // (Copy everything after $SELECTION_PLACEHOLDER$ here, or refactor as needed)
        // For brevity, you should move the rest of the code inside this callback.
        // See https://github.com/parallax/jsPDF/issues/1939 for async image loading.

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Tax Invoice", pageWidth - 20, 22, { align: "right" });

        // Reset text color
        doc.setTextColor(0, 0, 0);

        // Invoice Details Box
        const invoiceBoxY = 50;
        doc.setFillColor(...lightGray);
        doc.rect(120, invoiceBoxY, pageWidth - 140, 35, "F");
        doc.setDrawColor(200, 200, 200);
        doc.rect(120, invoiceBoxY, pageWidth - 140, 35, "S");

        // Invoice Info
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Invoice No:", 125, invoiceBoxY + 8);
        doc.text("Order Date:", 125, invoiceBoxY + 18);
        doc.text("Payment Status:", 125, invoiceBoxY + 28);

        doc.setFont("helvetica", "normal");
        doc.text(`INV-${order._id.slice(-8)}`, 155, invoiceBoxY + 8);
        doc.text(formatDate(order.createdAt), 155, invoiceBoxY + 18);
        doc.text(order.payment?.status || "Pending", 155, invoiceBoxY + 28);

        // Company Address
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("From:", 20, invoiceBoxY + 8);
        doc.setFont("helvetica", "normal");
        const companyAddress = [
          "Nuturemite",
          "H.No:6-264/13/A/15A, Raghavaendra Colony",
          "Quthbullapur Road,Suchitra 500055",
          "GSTIN: 36AAUFN0688F1ZS",
          "Email: sales@nuturemite.info",
        ];

        companyAddress.forEach((line, index) => {
          doc.text(line, 20, invoiceBoxY + 18 + index * 5);
        });

        // Customer Details
        const customerY = invoiceBoxY + 50;
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", 20, customerY);
        doc.setFont("helvetica", "normal");

        const customerInfo = [
          order?.shippingAddress?.fullName || "Customer",
          order.address,
          `Phone: ${order.phone}`,
          `Email: ${order?.buyer?.shippingAddress.emailAddress}`,
        ];

        customerInfo.forEach((line, index) => {
          doc.text(line, 20, customerY + 10 + index * 5);
        });

        // Order Details
        const orderDetailsY = customerY + 35;
        doc.setFont("helvetica", "bold");
        doc.text("Order Details:", 120, orderDetailsY);
        doc.setFont("helvetica", "normal");
        doc.text(`Order ID: ${order._id}`, 120, orderDetailsY + 10);
        doc.text(
          `Payment Method: ${order.payment?.method || "COD"}`,
          120,
          orderDetailsY + 20
        );
        if (order.trackingId) {
          doc.text(`Tracking ID: ${order.trackingId}`, 120, orderDetailsY + 30);
        }

        // Products Table Header
        const tableStartY = orderDetailsY + 45;
        const tableHeaders = ["S.No", "Product Name", "Qty", "Rate", "Amount"];
        // Adjusted column widths for better alignment
        const colWidths = [15, 80, 15, 30, 30];
        // Calculate X positions based on colWidths
        const colXPositions = [];
        let xPos = 20;
        colWidths.forEach((w, i) => {
          colXPositions.push(xPos);
          xPos += w;
        });

        // Draw table header
        doc.setFillColor(...primaryColor);
        doc.rect(
          colXPositions[0],
          tableStartY,
          colWidths.reduce((a, b) => a + b, 0),
          8,
          "F"
        );
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);

        tableHeaders.forEach((header, index) => {
          let align = "left";
          if (index >= 2) align = "right";
          const x =
            align === "right"
              ? colXPositions[index] + colWidths[index] - 2
              : colXPositions[index] + 2;
          doc.text(header, x, tableStartY + 6, { align });
        });

        // Reset text color for table content
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");

        // Draw table rows
        let currentY = tableStartY + 8;
        let rowIndex = 1;

        if (Array.isArray(order.products) && order.products.length > 0) {
          order.products.forEach((item) => {
            const product = item.product;
            const subtotal = (product.price * item.quantity).toFixed(2);

            // Draw row background (alternate colors)
            if (rowIndex % 2 === 0) {
              doc.setFillColor(248, 249, 250);
              doc.rect(
                colXPositions[0],
                currentY,
                colWidths.reduce((a, b) => a + b, 0),
                10,
                "F"
              );
            }

            // Draw row borders
            doc.setDrawColor(220, 220, 220);
            doc.rect(
              colXPositions[0],
              currentY,
              colWidths.reduce((a, b) => a + b, 0),
              10,
              "S"
            );

            // Add row data
            const rowData = [
              rowIndex.toString(),
              product.name || "Product",
              item.quantity.toString(),
              `Rs. ${product.price?.toFixed(2) || "0.00"}`,
              `Rs. ${subtotal}`,
            ];

            let rowHeight = 10;
            rowData.forEach((data, colIndex) => {
              let align = "left";
              if (colIndex >= 2) align = "right";
              const x =
                align === "right"
                  ? colXPositions[colIndex] + colWidths[colIndex] - 2
                  : colXPositions[colIndex] + 2;
              const maxWidth = colWidths[colIndex] - 4;

              // Handle text wrapping for long product names
              if (colIndex === 1 && data.length > 25) {
                const splitText = doc.splitTextToSize(data, maxWidth);
                doc.text(splitText[0], x, currentY + 7, { align });
                if (splitText[1]) {
                  doc.text(splitText[1], x, currentY + 11, { align });
                  rowHeight = 14;
                }
              } else {
                doc.text(data, x, currentY + 7, { align });
              }
            });

            currentY += rowHeight;
            rowIndex++;
          });
        } else {
          // Handle single product case
          const rowData = [
            "1",
            order.productName || "Order Item",
            "1",
            `Rs. ${productTotal.toFixed(2)}`,
            `Rs. ${productTotal.toFixed(2)}`,
          ];

          doc.setFillColor(248, 249, 250);
          doc.rect(
            colXPositions[0],
            currentY,
            colWidths.reduce((a, b) => a + b, 0),
            10,
            "F"
          );
          doc.setDrawColor(220, 220, 220);
          doc.rect(
            colXPositions[0],
            currentY,
            colWidths.reduce((a, b) => a + b, 0),
            10,
            "S"
          );

          rowData.forEach((data, colIndex) => {
            let align = "left";
            if (colIndex >= 2) align = "right";
            const x =
              align === "right"
                ? colXPositions[colIndex] + colWidths[colIndex] - 2
                : colXPositions[colIndex] + 2;
            doc.text(data, x, currentY + 7, { align });
          });

          currentY += 10;
        }

        // Totals Section
        const totalsY = currentY + 10;
        const totalsX = pageWidth - 20;

        // Subtotal
        doc.setFont("helvetica", "normal");
        doc.text("Subtotal:", totalsX - 50, totalsY);
        doc.text(`Rs. ${productTotal.toFixed(2)}`, totalsX, totalsY, {
          align: "right",
        });

        // Shipping
        const shippingCharges = order.totalPrice - productTotal;
        doc.text("Shipping:", totalsX - 50, totalsY + 8);
        doc.text(`Rs. ${shippingCharges.toFixed(2)}`, totalsX, totalsY + 8, {
          align: "right",
        });

        // Draw line above total
        doc.setDrawColor(0, 0, 0);
        doc.line(totalsX - 50, totalsY + 12, totalsX, totalsY + 12);

        // Total
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("Total (Including GST): ", totalsX - 55, totalsY + 20);
        doc.text(`Rs. ${order.totalPrice?.toFixed(2)}`, totalsX, totalsY + 20, {
          align: "right",
        });

        // Footer
        const footerY = pageHeight - 40;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(75, 85, 99);

        // Terms and conditions
        doc.text("Terms & Conditions:", 20, footerY);
        const terms = [
          "1. This is a system generated invoice.",
          "2. Please visit https://nuturemite.info for more details.",
        ];

        terms.forEach((term, index) => {
          doc.text(term, 20, footerY + 8 + index * 4);
        });

        // Company footer
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(
          "Thank you for shopping with Nuturemite!",
          pageWidth / 2,
          footerY + 25,
          { align: "center" }
        );

        // Save the PDF
        doc.save(`Invoice-${order._id}.pdf`);
      });

      // Return here to prevent the rest of the code from running before image loads
      return;

      // Invoice Title
    
    } catch (error) {
      console.error("Error generating invoice:", error);
      alert("Failed to generate invoice. Please try again.");
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Out for Delivery":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle size={16} className="text-green-600" />;
      case "Processing":
        return <Clock size={16} className="text-blue-600" />;
      case "Shipped":
        return <Truck size={16} className="text-purple-600" />;
      case "Out for Delivery":
        return <Truck size={16} className="text-orange-600" />;
      case "Cancelled":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return <AlertTriangle size={16} className="text-gray-600" />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "Refunded":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "PhonePe":
        return (
          <img
            src="/images/phonepe-logo.png"
            alt="PhonePe"
            className="h-4 w-4"
          />
        );
      case "Credit Card":
        return <CreditCard size={16} />;
      case "Cash on Delivery":
        return <CreditCard size={16} />;
      default:
        return <CreditCard size={16} />;
    }
  };

  const getProductImageUrl = (image) => {
    return `https://api.nuturemite.info/image/${image}`;
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const response = await axios.post(
        `${backendURL}/api/order/get-cancel-orders`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      if (response.data.success) {
        setOrder(response.data.order);
        setCancelDialogOpen(false);
      } else {
        setError("Failed to cancel order. Please try again.");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      setError("Unable to cancel order. Please try again later.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
          <XCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => navigate("/customer/orders")}
            className="bg-primary hover:bg-primary/90"
          >
            <ChevronLeft size={16} className="mr-2" /> Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6 text-center">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button
            onClick={() => navigate("/customer/orders")}
            className="bg-primary hover:bg-primary/90"
          >
            <ChevronLeft size={16} className="mr-2" /> Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/customer/orders")}
            className="flex items-center gap-1"
          >
            <ChevronLeft size={16} /> Back to Orders
          </Button>
        </div>

        {/* Order Header Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-5 w-5 text-primary" />
                  Order #{order._id.slice(-8)}
                </CardTitle>
                <CardDescription>
                  Placed on {formatDate(order.createdAt)} at{" "}
                  {formatTime(order.createdAt)}
                </CardDescription>
              </div>

              <div className="flex gap-2">
                <Badge className={getStatusColor(order.status)}>
                  <span className="flex items-center gap-1">
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </Badge>
                <Badge
                  className={getPaymentStatusColor(
                    order.payment?.status || "Pending"
                  )}
                >
                  Payment {order.payment?.status || "Pending"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Order Date
                </h3>
                <p className="flex items-center gap-1.5">
                  <CalendarClock size={16} className="text-gray-400" />
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Payment Method
                </h3>
                <p className="flex items-center gap-1.5">
                  {getPaymentMethodIcon(
                    order.payment?.method || "Cash on Delivery"
                  )}
                  {order.payment?.method || "Cash on Delivery"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Total Amount
                </h3>
                <p className="font-semibold">₹{order.totalPrice?.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 bg-gray-50/50 flex justify-between items-center">
            <div className="flex gap-2">
              {order.status !== "Delivered" && order.status !== "Cancelled" && (
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setCancelDialogOpen(true)}
                >
                  <XCircle size={16} className="mr-1.5" /> Cancel Order
                </Button>
              )}

              <Button
                variant="outline"
                onClick={generateInvoice}
                disabled={generatingInvoice}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Download size={16} className="mr-1.5" />
                {generatingInvoice ? "Generating..." : "Download Invoice"}
              </Button>
            </div>

            <a
              target="_blank"
              href={`https://www.xpressbees.com/shipment/tracking?awbNo=${order.trackingId}`}
              className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-600"
            >
              Track Order
              <ChevronRight size={16} className="ml-1" />
            </a>
          </CardFooter>
        </Card>

        {/* Product Details Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {Array.isArray(order.products) &&
                order.products.map(({ product, quantity }, index) => (
                  <div
                    key={product._id || index}
                    className="p-4 flex flex-col sm:flex-row gap-4"
                  >
                    {/* Product Image */}
                    {product.images && product.images.length > 0 && (
                      <div className="w-full sm:w-24 h-24">
                        <img
                          src={getProductImageUrl(product.images[0])}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                    )}

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-base">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-2 grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium">
                            ₹{product.price?.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-medium">{quantity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="font-medium">
                            ₹{product.price?.toFixed(2) * quantity}
                          </p>
                        </div>
                        {product.discount > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Discount</p>
                            <p className="font-medium text-green-600">
                              {product.discount}% off
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {/* If products array is empty or just contains IDs */}
              {(!Array.isArray(order.products) ||
                order.products.length === 0 ||
                typeof order.products[0] === "string") && (
                <div className="p-4">
                  <p className="text-gray-500">
                    {order.productName || "Order items"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t py-4 bg-gray-50/50">
            {/* shipping charges */}
            <div className="w-full flex justify-between">
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500">Shipping Charges: </p>
                <p className="font-medium">
                  ₹{order.totalPrice - productTotal || "0"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Total: </span>
                <span className="font-bold">
                  ₹{order.totalPrice?.toFixed(2)}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Shipping Information Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Delivery Address
                </h3>
                <p className="flex items-start gap-1.5 mt-1">
                  <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <span>{order.address}</span>
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Contact Number
                </h3>
                <p className="flex items-center gap-1.5 mt-1">
                  <Phone size={16} className="text-gray-400" />
                  {order.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Payment Method
                </h3>
                <p className="flex items-center gap-1.5 mt-1">
                  {getPaymentMethodIcon(
                    order.payment?.method || "Cash on Delivery"
                  )}
                  {order.payment?.method || "Cash on Delivery"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Payment Status
                </h3>
                <Badge
                  className={getPaymentStatusColor(
                    order.payment?.status || "Pending"
                  )}
                >
                  {order.payment?.status || "Pending"}
                </Badge>
              </div>
            </div>

            {order.payment?.method === "Cash on Delivery" && (
              <div className="mt-4 bg-yellow-50 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Shield
                    className="text-yellow-500 shrink-0 mt-0.5"
                    size={16}
                  />
                  <div>
                    <p className="text-sm font-medium text-yellow-700">
                      Cash on Delivery Information
                    </p>
                    <ul className="text-xs text-yellow-700 mt-1 list-inside list-disc">
                      <li>
                        Please keep the exact amount ready at the time of
                        delivery
                      </li>
                      <li>Our delivery partner will collect the payment</li>
                      <li>Please collect your receipt after payment</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {order.payment?.method === "PhonePe" && (
              <div className="mt-4 bg-blue-50 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <Shield className="text-blue-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Online Payment Information
                    </p>
                    <ul className="text-xs text-blue-700 mt-1 list-inside list-disc">
                      <li>
                        Transaction ID: {order.payment?.transactionId || "N/A"}
                      </li>
                      <li>Secure payment processed through PhonePe</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel Order Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className={"bg-white"}>
            <DialogHeader>
              <DialogTitle>Cancel Order</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                disabled={cancelling}
              >
                Keep Order
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelOrder}
                disabled={cancelling}
                className={
                  "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                }
              >
                {cancelling ? "Cancelling..." : "Yes, Cancel Order"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerOrderDetail;
