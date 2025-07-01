import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { paymentService } from "../../services/paymentService";
import { useCart } from "../../context/CartContext";

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);
        const paymentOrderId = searchParams.get("order_id");
        if (!paymentOrderId) {
          setError("No order ID found");
          setLoading(false);
          return;
        }
        const phonepeStatus = searchParams.get("status");
        let response = await paymentService.verifyPayment(paymentOrderId);
        // Always set order details if present
        if (response.paymentData?.createdOrder) {
          console.log("Order details from response:", response.paymentData.createdOrder);
          
          setOrderDetails(response.paymentData?.createdOrder);
        }
        setCreatedOrderId(response.paymentData?.createdOrder?._id || orderId);
        // Payment status logic
        if (response.success) {
          if (response.order?.payment?.method === "Cash on Delivery") {
            setPaymentStatus("COD_CONFIRMED");
            clearCart();
          } else {
            setPaymentStatus("PAID");
            clearCart();
          }
        } else if (
          response.paymentData?.order_status === "PENDING" ||
          phonepeStatus === "PENDING"
        ) {
          setPaymentStatus("PENDING");
          setError(
            "Payment is pending. Please wait or check your orders section."
          );
        } else {
          setPaymentStatus("FAILED");
          setError(
            "Payment failed. Your order has been placed and will be processed as Cash on Delivery or please contact support."
          );
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setError(
          "Failed to verify payment status. Please contact customer support."
        );
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <Loader2
            size={48}
            className="animate-spin text-orange-500 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold mb-2">Verifying Payment</h2>
          <p className="text-gray-600">
            Please wait while we confirm your payment...
          </p>
        </div>
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
          <div className="space-y-3">
            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/customer/orders/${createdOrderId}`)}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50"
            >
              Go to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }
  const isSuccess =
    paymentStatus === "PAID" || paymentStatus === "COD_CONFIRMED";
  const isCod = paymentStatus === "COD_CONFIRMED";
  const isPending = paymentStatus === "PENDING";
  const isFailed = paymentStatus === "FAILED";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        {isSuccess ? (
          <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        ) : isPending ? (
          <CheckCircle size={64} className="text-yellow-500 mx-auto mb-6" />
        ) : (
          <XCircle size={64} className="text-red-500 mx-auto mb-6" />
        )}
        <h1 className="text-3xl font-bold mb-2">
          {isSuccess
            ? "Order Confirmed!"
            : isPending
            ? "Payment Pending"
            : "Order Placed, Payment Failed"}
        </h1>
        <p className="text-gray-600 mb-6">
          {isSuccess
            ? isCod
              ? "Your Cash on Delivery order has been placed successfully."
              : "Your payment was successful and order has been placed."
            : isPending
            ? "Your payment is pending. Your order has been placed and will be processed once payment is confirmed."
            : "Payment failed. Your order has been placed and will be processed as Cash on Delivery or please contact support."}
        </p>
        {isCod && (
          <div className="mb-6 p-4 bg-yellow-50 rounded-md">
            <h3 className="font-semibold text-yellow-800 mb-1">
              Cash on Delivery Information
            </h3>
            <ul className="text-sm text-yellow-800">
              <li className="mb-1">
                • Keep the exact amount ready at the time of delivery
              </li>
              <li className="mb-1">
                • Our delivery partner will collect the payment
              </li>
              <li className="mb-1">
                • Please collect your receipt after payment
              </li>
            </ul>
          </div>
        )}
        {orderDetails && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium">{orderDetails._id || orderId}</p>
            <p className="text-sm text-gray-500 mt-2">
              Total: ₹{orderDetails.totalPrice?.toFixed(2)}
            </p>
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={() => navigate(`/customer/orders/${createdOrderId}`)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-medium"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-md font-medium hover:bg-gray-50"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
