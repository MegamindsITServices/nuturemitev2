import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { Toaster } from "./components/ui/sonner.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Add web vitals monitoring
const reportWebVitals = (metric) => {
  // Analytics callback function to send metrics to your preferred analytics service
  console.log(metric);

  // In a production environment, send to your analytics service
  // Example: if (window.gtag) window.gtag('event', name, metric);
};

// Lazy-load polyfills for older browsers only when needed
const loadPolyfills = async () => {
  if (!("IntersectionObserver" in window)) {
    await import("intersection-observer");
  }
};

// Initialize the app with progressive enhancement
const initApp = async () => {
  // Load any required polyfills
  await loadPolyfills();

  // Mount the React app
  const rootElement = document.getElementById("root");

  if (rootElement) {
    const root = createRoot(rootElement);

    root.render(
        <BrowserRouter>
          <AuthProvider>
            <GoogleOAuthProvider clientId="494051209749-6auaqgfprfpih8gas5mfs9he15a9qj7r.apps.googleusercontent.com">
            <App />
            </GoogleOAuthProvider>
          </AuthProvider>
          <Toaster />
        </BrowserRouter>
    );

    // Send web vitals metrics after initial render
    if (process.env.NODE_ENV !== "production") {
      import("web-vitals").then((webVitals) => {
        webVitals.onCLS(reportWebVitals);
        webVitals.onFID(reportWebVitals);
        webVitals.onFCP(reportWebVitals);
        webVitals.onLCP(reportWebVitals);
        webVitals.onTTFB(reportWebVitals);
      });
    }
  }
};

// Start the app
initApp();
