import React from "react";
import Breadcrumb from "../../components/common/Breadcrumb";
import LoginForm from "../../components/auth/LoginForm";

const Login = () => {
  // Breadcrumb items for navigation
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Account" }];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        {/* Login illustration - placed at the top */}
        <div className="w-full flex justify-center mb-6">
          {" "}
          <img
            src="https://cdn.shopify.com/s/files/1/0310/9729/0885/files/5243321.jpg?v=1704261797"
            alt="Login illustration"
            className="max-w-full h-auto max-h-60"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/400x300?text=Login+Illustration";
            }}
          />
        </div>

        {/* Login form */}
        <div className="w-full">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
