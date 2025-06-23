import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useInputValidation } from '../forms/RenderInput';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { axiosInstance, getConfig } from '../../utils/request';
import { LOGIN_ROUTE } from '../../lib/api-client';
import { toast } from 'sonner';
import GoogleLoginButton from './GoogleLoginButton';

const LoginForm = () => {
  // State management
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [auth, setAuth] = useAuth();  const handleSubmit = async (e) =>{
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await getConfig();
      const res = await axiosInstance.post(LOGIN_ROUTE, {email, password});
      
      if(res && res.data.success){
        // Store auth data
        setAuth({
          user: res.data.user,
          token: res.data.token,
        });
        localStorage.setItem("auth", JSON.stringify(res.data));
          // Check user role and redirect accordingly
        if (res.data.user.isAdmin) {
          toast.success("Welcome back, Admin!");
          navigate("/admin/dashboard");
        } else if (res.data.user.isUser) {
          toast.success("Welcome to your customer dashboard!");
          navigate("/customer/dashboard");
        } else {
          toast.success("Login successful");
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError(error.response?.data?.message || "Invalid email or password");
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  // Get login function from Auth context
  // const { login } = useAuth();
  
  // Input validation - separate concerns
  // const { validateEmail } = useInputValidation();
  
  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   setError('');
  //   // Validate inputs
  //   if (!validateEmail(email)) {
  //     setError('Please enter a valid email address');
  //     return;
  //   }
  //   if (password.length < 6) {
  //     setError('Password must be at least 6 characters');
  //     return;
  //   }
  //   // Show loading state
  //   setIsLoading(true);
  //   try {
  //     // Call the login API through auth context
  //     const result = await login(email, password);
      
  //     if (result.success) {
  //       // On successful login, navigate to home page
  //       navigate('/');
  //     } else {
  //       setError(result.error || 'Login failed. Please check your credentials.');
  //     }
  //   } catch (err) {
  //     console.error('Login error:', err);
  //     setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
    // Google login is now handled by the GoogleLoginButton component
  return (
    <GoogleOAuthProvider clientId="494051209749-6auaqgfprfpih8gas5mfs9he15a9qj7r.apps.googleusercontent.com">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Login to Your Account</h1>
          <p className="text-gray-500">
            Enter your email and password to log in
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <a href="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          
          <Button 
            type="submit"
            className="w-full bg-red-400 hover:bg-red-500 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"} <span className="ml-1">→</span>
          </Button>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or Login With</span>
          </div>
        </div>
          <GoogleLoginButton />
        
        <div className="text-center space-y-2">
          <p className="text-sm">
            Don't have an account?{' '}
            <a href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </a>
          </p>
          
          <p className="text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-black font-medium hover:underline">Terms & Conditions</a>
            {' '}and{' '}
            <a href="/privacy-policy" className="text-black font-medium hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginForm;
