import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <Lock className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">
          You do not have permission to view this page. Please log in with the correct credentials.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-medium transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
