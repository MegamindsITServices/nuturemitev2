import { axiosInstance } from './request';
import { LOGIN_ROUTE, USER_INFO } from '../lib/api-client';
import { toast } from 'sonner';

// Regular login with email and password
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const response = await axiosInstance.post(LOGIN_ROUTE, { email, password });
    
    if (response.data && response.data.token) {
      // Store auth data in localStorage
      const authData = {
        token: response.data.token,
        user: response.data.user
      };
      localStorage.setItem('authData', JSON.stringify(authData));
      toast.success('Login successful!');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Process Google authentication
export const handleGoogleAuthCallback = async (token, userData = null) => {
  try {
    // Store the token in localStorage
    const authData = {
      token,
      user: userData // Use provided user data if available
    };
    
    // If we don't have user data already, fetch it
    if (!userData) {
      // Fetch user data using the token
      const userResponse = await axiosInstance.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (userResponse.data && userResponse.data.user) {
        // Update the auth data with user info
        authData.user = userResponse.data.user;
      }
    }
    
    // Save auth data to localStorage
    localStorage.setItem('auth', JSON.stringify(authData));
    
    return authData;
  } catch (error) {
    console.error('Google auth callback error:', error);
    throw error;
  }
};

// Get the current authenticated user
export const getCurrentUser = () => {
  try {
    const authData = localStorage.getItem('authData');
    
    if (!authData) {
      return null;
    }
    
    return JSON.parse(authData);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('authData');
  // Optionally call a backend endpoint to invalidate the token
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const authData = getCurrentUser();
  return !!authData?.token;
};
