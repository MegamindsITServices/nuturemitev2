import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/auth/Login";
import GoogleCallback from "./pages/auth/GoogleCallback";
import Navbar from "./components/fixed/Navbar";
import Home from "./pages/home/Home";
import Footer from "./components/fixed/Footer";
import Blogs from "./pages/blog/Blogs";
import About from "./pages/about/About";
import OurStory from "./pages/about/OurStory";
import CartSidebar from "./components/fixed/CartSidebar";
import { CartProvider } from "./context/CartContext";
import Checkout from "./pages/checkout/Checkout";
import OrderStatus from "./pages/checkout/OrderStatus";
import Products from "./pages/product/Products";
import Dashboard from "./pages/Dashboard/Dashboard";
import DashboardLayout from "./components/layouts/dashboard/dashboard.layout";
import TestPayment from "./pages/test/TestPayment";
import CombosPage from "./pages/product/CombosPage";
import ComboProducts from "./pages/product/ComboProducts";

import ViewCollections from "./pages/Dashboard/collections/ViewCollections";
import { getConfig } from "./utils/request";
import AddProduct from "./pages/Dashboard/products/AddProduct";
import EditProduct from "./pages/Dashboard/products/EditProduct";
import AllProducts from "./pages/Dashboard/products/AllProducts";
import SearchResults from "./pages/product/SearchResults";
import PriceSearchResults from "./pages/product/PriceSearchResults";
import ProductDetail from "./pages/product/ProductDetail";

import AdminProtectedRoute from "./routes/AdminProtectedRoute";
import Profile from "./pages/user/Profile";
import Orders from "./pages/user/Orders";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Signup from "./components/auth/Signup";
import AddBanner from "./pages/Dashboard/banner/AddBanner";
import AllBanners from "./pages/Dashboard/banner/AllBanners";
import AddAdmin from "./pages/Dashboard/admins/AddAdmin";
import ViewAllAdmins from "./pages/Dashboard/admins/ViewAllAdmins";
import AllOrders from "./pages/Dashboard/orders/AllOrders";
import OrderDetail from "./pages/Dashboard/orders/OrderDetail";
import AddBlog from "./pages/Dashboard/blogs/AddBlog";
import ViewBlog from "./pages/Dashboard/blogs/ViewBlog";
import BlogDetails from "./pages/blog/BlogDetails";
import ContactUs from "./pages/about/ContactUs";
import CustomerProtectedRoute from "./routes/CustomerProtectedRoute";
import CustomerDashboardLayout from "./components/layouts/customerDashboardLayout/dashboard.layout";
import CustomerDashboard from "./pages/CustomerDashboard/Dashboard";
import CustomerOrderDetail from "./pages/CustomerDashboard/orders/CustomerOrderDetail";
import Faqs from "./pages/company/Faqs";
import ReturnAndRefund from "./pages/company/ReturnAndRefund";
import CustomerOrders from "./pages/CustomerDashboard/orders/CustomerOrders";
import EditProfile from "./components/ui/EditProfile";
import AllEnquiry from "./pages/Dashboard/enquiry/AllEnquiry";
const App = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isNotFound = location.pathname.startsWith("*");
  const isUserRoute = location.pathname.startsWith("/customer")

  // Initialize the API configuration on app mount
  React.useEffect(() => {
    getConfig().catch((error) => {
      console.error("Failed to load API config:", error);
    });
  }, []);

  return (
    <CartProvider>
      {!isAdminRoute && !isNotFound && !isUserRoute && <Navbar />}
      <CartSidebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/products" element={<Products />} />
        <Route path="/faqs" element={<Faqs/>} />
        <Route path="/return-refund-policy" element={<ReturnAndRefund />} />
        <Route
          path="/products/collections/:collectionId"
          element={<Products />}
        />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/combos" element={<CombosPage />} />
        <Route path="/combos/:id" element={<ComboProducts />} />
        <Route path="/our-story" element={<OurStory />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog/:slug" element={<BlogDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderStatus />} />
        <Route path="/order-failure/:orderId" element={<OrderStatus />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Search Routes */}
        <Route path="/search" element={<SearchResults />} />
        <Route path="/search/price" element={<PriceSearchResults />} />
        {/* Test route - remove in production */}
        <Route path="/test-payment" element={<TestPayment />} />
        {/* User Profile Route */}
        <Route path="/user/profile" element={<Profile />} />
        <Route path="/user/edit-profile" element={<EditProfile/>}/>
        <Route path="/orders" element={<Orders />} />
        {/* Admin Dashboard Routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="collections" element={<ViewCollections />} />
            <Route path="add-product" element={<AddProduct />} />
            <Route path="edit-product/:id" element={<EditProduct />} />
            <Route path="products" element={<AllProducts />} />
            <Route path="add-banner" element={<AddBanner />} />
            <Route path="banners" element={<AllBanners />} />            <Route path="add-admin" element={<AddAdmin />} />
            <Route path="admins" element={<ViewAllAdmins />} />
            <Route path="orders" element={<AllOrders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="add-blog" element={<AddBlog />} />
            <Route path="blogs" element={<ViewBlog />} />
            <Route path="allEnquiry" element={<AllEnquiry/>}/>
          </Route>
        </Route>        {/* Customer Dashboard */}
        <Route element={<CustomerProtectedRoute/>}>
          <Route path="/customer" element={<CustomerDashboardLayout/>}>            <Route index element={<CustomerDashboard/>} />
            <Route path="dashboard" element={<CustomerDashboard/>} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="orders/:orderId" element={<CustomerOrderDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && !isNotFound && !isUserRoute && <Footer />}
    </CartProvider>
  );
};

export default App;
