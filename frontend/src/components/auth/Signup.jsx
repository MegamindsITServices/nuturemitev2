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
  const [loading, setLoading] = useState(false);  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await getConfig();
      
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      formData.append("address", address);
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={firstName}
              onChange={(e)=> setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-gray-700 font-medium mb-2"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={lastName}
              onChange={(e)=> setLastName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Password field */}
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
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 6 characters"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-gray-700 font-medium mb-2"
            >
              Phone Number*
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 6 characters"
              required
            />
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
            cols={3}
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          {/* Profile Image upload */}
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

            {/* Image preview */}
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

          {/* Submit button */}
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

        {/* Login link */}
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
