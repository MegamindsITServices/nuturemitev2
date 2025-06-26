import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { backendURL } from '../../lib/api-client';
import { Button } from '../../components/ui/button';

const Profile = ({isAdmin}) => {
  const [auth, setAuth, logout] = useAuth();
  const navigate = useNavigate();
  if (!auth.user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-red-400 to-red-600 py-6 px-8">
          <h1 className="text-2xl font-bold text-white">My Account</h1>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {" "}
            {/* Profile Image */}
            <div className="flex-shrink-0 mb-6 md:mb-0">
              {auth.user.image ? (
                <img
                  src={
                    auth.user.image.startsWith("http")
                      ? auth.user.image
                      : `${backendURL}/profile/${auth.user.image}`
                  }
                  alt={`${auth.user.firstName} ${auth.user.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {auth.user.firstName
                      ? auth.user.firstName[0].toUpperCase()
                      : "U"}
                  </span>
                </div>
              )}
            </div>
            {/* User Information */}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold mb-4">
                {auth.user.firstName} {auth.user.lastName} {auth.user._id}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm text-gray-500">Email</h3>
                  <p className="font-medium">{auth.user.email}</p>
                </div>

                {/* <div>
                  <h3 className="text-sm text-gray-500">Account Type</h3>
                  <p className="font-medium">
                    {auth.user.isAdmin }
                  </p>
                </div> */}

                {/* <div>
                  <h3 className="text-sm text-gray-500">Member Since</h3>
                  <p className="font-medium">
                    {new Date(auth.user.createdAt).toLocaleDateString()}
                  </p>
                </div> */}
              </div>

              <div className="space-x-4">
                <Button
                  onClick={() =>
                    navigate(`/user/edit-profile?userId=${auth.user.userId}`)
                  }
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </Button>
                <Button
                  onClick={() => {
                    if (isAdmin) {
                      navigate(`/admin/update-password`);
                      return;
                    }
                    navigate(`/customer/update-password`);
                  }}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Password
                </Button>
                <Button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
          {!isAdmin && (
            <>
              <hr className="my-8" />

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-bold mb-3 text-lg">Order History</h3>
                  <p className="text-gray-600">
                    View your recent orders and track deliveries.
                  </p>
                  <button
                    onClick={() => navigate("/customer/orders")}
                    className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Orders →
                  </button>
                </div>

                {/* <div className="bg-gray-50 p-6 rounded-lg">
    <h3 className="font-bold mb-3 text-lg">Saved Addresses</h3>
    <p className="text-gray-600">Manage your delivery and billing addresses.</p>
    <button
      onClick={() => navigate('/addresses')}
      className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
    >
      Manage Addresses →
    </button>
  </div> */}

                {/* {auth.user.isAdmin && (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="font-bold mb-3 text-lg">Admin Dashboard</h3>
      <p className="text-gray-600">Access your admin controls and management.</p>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
      >
        Go to Dashboard →
      </button>
    </div>
  )} */}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
