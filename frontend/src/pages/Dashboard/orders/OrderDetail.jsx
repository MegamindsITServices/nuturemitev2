import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
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
import jsPDF from "jspdf";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
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
  Loader2,
  Download,
} from "lucide-react";
import { axiosInstance } from "../../../utils/request";
import { GET_ORDER_BY_ID, UPDATE_ORDER } from "../../../lib/api-client";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [productTotal, setProductTotal] = useState(0);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);

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

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        GET_ORDER_BY_ID.replace(":id", orderId),
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );
      if (data.success) {
        console.log("Order details loaded:", data.order);
        setOrder(data.order);
        setProductTotal(
          data.order.products.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0
          )
        );
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
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  // Handle order status update
  const handleStatusUpdate = async () => {
    try {
      const { data } = await axiosInstance.put(
        UPDATE_ORDER.replace(":id", orderId),
        {
          ...order,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${auth?.token}`,
          },
        }
      );

      if (data.success) {
        // Update order status
        setOrder({
          ...order,
          status: newStatus,
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
    navigate("/admin/orders");
  };

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
          <AlertDescription>{error || "Order not found"}</AlertDescription>
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
        <h1 className="text-2xl font-bold">Order Details</h1>
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
                <Button
                  variant="outline"
                  onClick={generateInvoice}
                  disabled={generatingInvoice}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Download size={16} className="mr-1.5" />
                  {generatingInvoice ? "Generating..." : "Download Invoice"}
                </Button>
                <a
                  variant="outline"
                  href={order.label || "#"}
                  target="_blank"
                  rel="noopener noreferrer"

                  className="text-blue-600 border flex gap-2 items-center p-1.5 px-4 border-blue-500 rounded-md hover:bg-blue-50"
                >
                  <Download size={16} className="mr-1.5" />
                  Label
                </a>
              </div>

              <Separator className="my-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Shipping Information</h3>
                  <p className="text-sm">{order.address}</p>
                  <p className="text-sm">Phone: {order.phone}</p>
                </div>

                <div>
                  {" "}
                  <h3 className="font-semibold mb-2">Payment Information</h3>
                  <div className="flex flex-col gap-2">
                    {" "}
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Payment Method:</p>
                      <Badge
                        className={`${
                          paymentMethodColor[
                            order.payment.method || "Cash on Delivery"
                          ]
                        }`}
                      >
                        {order.payment.method || "Cash on Delivery"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">Payment Status:</p>
                      <Badge
                        className={`${
                          paymentStatusColor[order.payment.status]
                        }`}
                      >
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
                  <p className="text-muted-foreground">
                    No products in this order
                  </p>
                ) : (
                  order.products.map(({ product, quantity }, index) => {
                    const isPopulated =
                      typeof product !== "string" &&
                      product !== null &&
                      product._id;

                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row gap-3 py-3 border-b border-border"
                      >
                        {/* Product Image */}
                        {isPopulated &&
                          product.images &&
                          product.images.length > 0 && (
                            <div className="w-20 h-20 flex-shrink-0">
                              <img
                                src={
                                  product.images[0].startsWith("http")
                                    ? product.images[0]
                                    : `https://api.nuturemite.info/image/${product.images[0]}`
                                }
                                alt={product.name}
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://placehold.co/100x100?text=No+Image";
                                }}
                              />
                            </div>
                          )}

                        {/* Product Details */}
                        <div className="flex-grow">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <p className="font-medium">
                                {isPopulated
                                  ? product.name
                                  : `Product ID: ${product}`}
                              </p>
                              {isPopulated && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {product.description?.substring(0, 100)}
                                  {product.description?.length > 100
                                    ? "..."
                                    : ""}
                                </p>
                              )}
                            </div>
                            <div className="mt-2 sm:mt-0 sm:text-right">
                              <p className="text-bold whitespace-nowrap">
                                Quantity : {quantity}
                              </p>
                              {isPopulated && product.price && (
                                <p className="font-medium">
                                  ₹{product.price.toFixed(2)}
                                </p>
                              )}
                              <div>
                                <p className="text-sm text-gray-500">
                                  Subtotal
                                </p>
                                <p className="font-medium">
                                  ₹{product.price?.toFixed(2) * quantity}
                                </p>
                              </div>
                              {/* {isPopulated && product.collection && (
                                <p className="text-xs text-muted-foreground">
                                  {typeof product.collection === "object"
                                    ? product.collection.name
                                    : "Unknown Collection"}
                                </p>
                              )} */}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-800">
                    Shipping Charges:{" "}
                  </p>
                  <p className="font-medium">
                    ₹{order.totalPrice - productTotal || "0"}
                  </p>
                </div>
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
              <Button onClick={openStatusDialog}>Update Status</Button>
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
                  <p className="text-sm text-muted-foreground">
                    {order.buyer.email}
                  </p>
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

                {order.status !== "Cancelled" ? (
                  <>
                    {/* Processing */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Processing</p>
                        <p className="text-sm text-muted-foreground">
                          {order.status === "Processing"
                            ? "Current Status"
                            : order.status === "Confirmed"
                            ? "Pending"
                            : "Completed"}
                        </p>
                      </div>
                      {order.status !== "Confirmed" ? (
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
                          {order.status === "Shipped"
                            ? "Current Status"
                            : order.status === "Out for Delivery" ||
                              order.status === "Delivered"
                            ? "Completed"
                            : "Pending"}
                        </p>
                      </div>
                      {order.status === "Shipped" ||
                      order.status === "Out for Delivery" ||
                      order.status === "Delivered" ? (
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
                          {order.status === "Out for Delivery"
                            ? "Current Status"
                            : order.status === "Delivered"
                            ? "Completed"
                            : "Pending"}
                        </p>
                      </div>
                      {order.status === "Out for Delivery" ||
                      order.status === "Delivered" ? (
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
                          {order.status === "Delivered"
                            ? "Completed"
                            : "Pending"}
                        </p>
                      </div>
                      {order.status === "Delivered" ? (
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
        <DialogContent className={"bg-white"}>
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
    </div>
  );
};

export default OrderDetail;
