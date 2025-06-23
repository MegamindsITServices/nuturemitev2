import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../utils/request';
import { toast } from 'sonner';

const EditProfile = () => {
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (!auth?.user) {
      console.log('not authorized');
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        setInitialLoading(true);
        const res = await axiosInstance.post('/api/auth/userData', {
          _id: auth.user.userId,
        });
        
        if (res.status === 200) {
          setEmail(res.data.data.email);
          setFirstName(res.data.data.firstName);
          setLastName(res.data.data.lastName);
        } else {
          toast.error(res.data.message || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error(error);
        toast.error('An error occurred while fetching user data');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, [auth, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(firstName.trim())) {
      newErrors.firstName = 'First name can only contain letters and spaces';
    }

    // Last Name validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(lastName.trim())) {
      newErrors.lastName = 'Last name can only contain letters and spaces';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (email.trim().length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);
    try {
      const data = await axiosInstance.post('/api/auth/updateProfile', {
        _id: auth.user.userId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
      });
      console.log(data)
      if (data.data.status) {
        toast.success('Profile updated successfully');
let user = JSON.parse(localStorage.getItem('auth'));

user.user.firstName = data.data.response.firstName;
user.user.lastName = data.data.response.lastName;
user.user.email = data.data.response.email;
localStorage.setItem('auth', JSON.stringify(user));

        navigate("/user/profile");
        // Optionally navigate back or update auth context
      } else {
        toast.error(data.data.message || 'Cannot update profile at this moment. Try again later!');
      }
    } catch (err) {
      console.error('Update profile error:', err);
      toast.error(err.response?.data?.message || err.message || 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    switch (field) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      default:
        break;
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Edit Profile</h2>
            <p className="mt-2 text-sm text-gray-600">
              Update your personal information
            </p>
          </div>

          <div className="space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.firstName 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.lastName 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleUpdateProfile}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </div>
                ) : (
                  'Update Profile'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;