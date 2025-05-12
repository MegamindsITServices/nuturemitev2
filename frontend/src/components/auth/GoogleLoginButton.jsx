import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '../ui/button';
import { axiosInstance } from '../../utils/request';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const GoogleLoginButton = () => {
  const [auth, setAuth] = useAuth();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send the access token to your backend
        const response = await axiosInstance.post('/api/auth/google/verify', {
          token: tokenResponse.access_token
        });

        if (response.data && response.data.success) {
          // Update auth context with user data
          setAuth({
            user: response.data.user,
            token: response.data.token,
          });
              // Store in localStorage
          localStorage.setItem('auth', JSON.stringify({
            user: response.data.user,
            token: response.data.token,
          }));
          
          toast.success('Logged in with Google successfully!');
          navigate('/');
        }
      } catch (error) {
        console.error('Google login error:', error);
        toast.error('Google login failed. Please try again.');
      }
    },
    onError: () => {
      toast.error('Google login failed. Please try again.');
    }
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2"
      onClick={() => login()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512" className="h-4 w-4">
        <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
      </svg>
      Continue with Google
    </Button>
  );
};

export default GoogleLoginButton;
