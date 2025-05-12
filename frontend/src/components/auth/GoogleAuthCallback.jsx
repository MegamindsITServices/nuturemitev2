import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { handleGoogleAuthCallback } from '../../utils/auth';

const GoogleAuthCallback = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const processGoogleAuth = async () => {
      try {
        // Get token from URL query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userDataParam = params.get('userData');
        
        if (!token) {
          setError('Authentication failed - no token received');
          setLoading(false);
          return;
        }

        let userData;
        if (userDataParam) {
          try {
            userData = JSON.parse(decodeURIComponent(userDataParam));
          } catch (e) {
            console.error('Failed to parse user data:', e);
          }
        }

        // Process the token and user data
        await handleGoogleAuthCallback(token, userData);
        
        // Redirect to home or dashboard page
        navigate('/');
      } catch (err) {
        console.error('Error processing Google authentication:', err);
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    processGoogleAuth();
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      {loading ? (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-red-400 border-r-red-400 border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Completing your sign in...</p>
        </div>
      ) : (
        <div className="text-center">
          {error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-4">
              <p>{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
                onClick={() => navigate('/login')}
              >
                Return to Login
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default GoogleAuthCallback;
