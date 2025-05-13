import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Mail, User, Phone, MapPin, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { axiosInstance, getConfig } from '../../../utils/request';
import { ADD_ADMIN } from '../../../lib/api-client';
import { toast } from 'sonner';

const AddAdmin = () => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    isAdmin: true
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone || !formData.address) {
      setError('All fields are required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await getConfig();
      const response = await axiosInstance.post(ADD_ADMIN, formData);
      
      if (response.data.success) {
        setSuccess('Admin added successfully');
        toast.success('New admin has been added successfully');
        
        // Reset the form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          address: '',
          isAdmin: true
        });
      } else {
        setError(response.data.message || 'Failed to add admin');
        toast.error('Failed to add admin');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      setError(error.response?.data?.message || 'An error occurred while adding admin');
      toast.error(error.response?.data?.message || 'Failed to add admin');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Add New Admin</h1>
        <p className="text-gray-600">Create a new administrator account</p>
      </div>
      
      {error && (
        <div className="p-3 mb-4 rounded-md bg-red-50 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-3 mb-4 rounded-md bg-green-50 flex items-start gap-2">
          <div className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5">✓</div>
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="pl-10"
                placeholder="John"
                required
              />
            </div>
          </div>
          
          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="pl-10"
                placeholder="Doe"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="pl-10"
              placeholder="admin@example.com"
              required
            />
          </div>
        </div>
        
        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className="pl-10"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              tabIndex="-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium">
            Phone Number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              className="pl-10"
              placeholder="1234567890"
              required
            />
          </div>
        </div>
        
        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="address"
              name="address"
              type="text"
              value={formData.address}
              onChange={handleChange}
              className="pl-10"
              placeholder="123 Admin Street, City"
              required
            />
          </div>
        </div>
        
        <Button 
          type="submit"
          className="w-full bg-red-400 hover:bg-red-500 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Adding Admin..." : "Add Admin"}
        </Button>
      </form>
    </div>
  );
};

export default AddAdmin;