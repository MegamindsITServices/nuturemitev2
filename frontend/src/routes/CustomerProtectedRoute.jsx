import { axiosInstance, getConfig } from "../utils/request";
import { useAuth } from "../context/AuthContext";
import React, { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const CustomerProtectedRoute = () => {
  const [ok, setOk] = useState(true);
  const [loading, setLoading] = useState(true);
  const [auth] = useAuth();
 
  useEffect(() => {
    const customerCheck = async () => {
      setLoading(true);
      try {
        const config = await getConfig();
        const res = await axiosInstance.get("/api/auth/customer-auth", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            ...config?.headers,
          },
        });

        if (res.data.ok) {
          setOk(true);
        } else {
          setOk(false);
        }
      } catch (error) {
        console.error("Error checking customer status:", error);
        setOk(false);
      } finally {
        setLoading(false);
      }
    };

    if (auth && auth.token && auth.user) {
      customerCheck();
    } else {
      setLoading(false);
      setOk(false);
    }
  }, [auth, auth.token, auth.user]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verifying customer access...</span>
      </div>
    );
  }
  
  // If user is not authenticated or not a customer, redirect to login
  return !loading && (ok ? <Outlet /> : <Navigate to="/login" replace />);
};

export default CustomerProtectedRoute;
