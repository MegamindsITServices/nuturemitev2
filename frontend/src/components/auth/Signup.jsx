import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, getConfig } from "../../utils/request";
import { SIGNUP_ROUTE } from "../../lib/api-client";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Validation states
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Indian phone number validation function
  const validatePhoneNumber = (phone) => {
    // Remove all spaces, hyphens, and parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (!cleanPhone) {
      return "Phone number is required";
    }
    
    // Indian phone number patterns:
    // 1. 10 digits starting with 6,7,8,9
    // 2. 11 digits starting with 0 followed by 6,7,8,9
    // 3. 12 digits starting with 91 followed by 6,7,8,9
    // 4. 13 digits starting with +91 followed by 6,7,8,9
    
    const patterns = [
      /^[6-9]\d{9}$/, // 10 digits starting with 6-9
      /^0[6-9]\d{9}$/, // 11 digits starting with 0 then 6-9
      /^91[6-9]\d{9}$/, // 12 digits starting with 91 then 6-9
      /^\+91[6-9]\d{9}$/ // 13 digits starting with +91 then 6-9
    ];
    
    const isValid = patterns.some(pattern => pattern.test(cleanPhone));
    
    if (!isValid) {
      return "Please enter a valid Indian phone number (10 digits starting with 6-9)";
    }
    
    return "";
  };

  // Password validation function
  const validatePassword = (password) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (password.length > 50) {
      return "Password must be less than 50 characters";
    }
    // Optional: Add more complex password requirements
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumbers = /\d/.test(password);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return "";
  };

  // Format phone number for display (optional)
  const formatPhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.length === 10) {
      return cleanPhone.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return phone;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    // Validate all fields before submission
    const emailValidation = validateEmail(email);
    const phoneValidation = validatePhoneNumber(phone);
    const passwordValidation = validatePassword(password);
    
    setEmailError(emailValidation);
    setPhoneError(phoneValidation);
    setPasswordError(passwordValidation);
    
    // If any validation fails, stop submission
    if (emailValidation || phoneValidation || passwordValidation) {
      setLoading(false);
      toast.error("Please fix the validation errors before submitting");
      return;
    }
    
    try {
      await getConfig();
      
      // Clean phone number before sending to backend
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append("firstName", firstName.trim());
      formData.append("lastName", lastName.trim());
      formData.append("email", email.trim().toLowerCase());
      formData.append("password", password);
      formData.append("phone", cleanPhone);
      formData.append("address", address.trim());
      if (profileImage) {
        formData.append("image", profileImage);
      }
        
      const res = await axiosInstance.post(SIGNUP_ROUTE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res && res.data.success) {
        toast.success("Account created successfully! You will be redirected to the login page in a moment. After logging in, you'll be able to access your customer dashboard.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setError(error.response?.data?.message || "An error occurred while signing up");
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle email change with real-time validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setEmailError(validateEmail(value));
    } else {
      setEmailError("");
    }
  };

  // Handle phone change with real-time validation
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (value) {
      setPhoneError(validatePhoneNumber(value));
    } else {
      setPhoneError("");
    }
  };

  // Handle password change with real-time validation
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      setPasswordError(validatePassword(value));
    } else {
      setPasswordError("");
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (optional - limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }
      
      setProfileImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center mb-8">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-gray-700 font-medium mb-2"
            >
              First Name*
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
              required
            />
          </div>
          
          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-gray-700 font-medium mb-2"
            >
              Last Name*
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
              required
            />
          </div>
          
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-medium mb-2"
            >
              Email Address*
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                emailError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="you@example.com"
              required
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-600">{emailError}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium mb-2"
            >
              Password*
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handlePasswordChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                passwordError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="Minimum 6 characters"
              required
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-600">{passwordError}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 font-medium mb-2"
            >
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={handlePhoneChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                phoneError 
                  ? 'border-red-500 focus:ring-red-500' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              placeholder="9876543210 or +91 9876543210"
              required
            />
            {phoneError && (
              <p className="mt-1 text-sm text-red-600">{phoneError}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Enter 10-digit Indian mobile number starting with 6, 7, 8, or 9
            </p>
          </div>
          
          <div className="mb-4">
            <label
              htmlFor="address"
              className="block text-gray-700 font-medium mb-2"
            >
              Address*
            </label>
            <textarea
              rows={3}
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your complete address"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="profileImage"
              className="block text-gray-700 font-medium mb-2"
            >
              Profile Image
            </label>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              Max size: 5MB. Supported formats: JPEG, PNG, GIF
            </p>

            {imagePreview && (
              <div className="mt-3 flex justify-center">
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="h-24 w-24 object-cover rounded-full border-2 border-gray-300"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;