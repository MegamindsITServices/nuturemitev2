import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../../utils/request';
import { backendURL } from '../../../lib/api-client';
import { toast } from 'sonner';
import { Edit2, Trash2, Upload, X, AlertCircle, Check } from 'lucide-react';

const AllBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newImagePreview, setNewImagePreview] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch all banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/banner/get-banner');
      if (response.data.success) {
        setBanners(response.data.banners);
      } else {
        toast.error('Failed to fetch banners');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle image selection for update
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setNewImagePreview(URL.createObjectURL(file));
    }
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditingBanner(null);
    setNewImage(null);
    setNewImagePreview(null);
  };

  // Save updated banner
  const handleUpdate = async (bannerId) => {
    if (!newImage) {
      toast.error('Please select a new image');
      return;
    }

    try {
      setActionLoading(true);
      const formData = new FormData();
      formData.append('banner', newImage);

      const response = await axiosInstance.put(
        `/api/banner/update-banner/${bannerId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        toast.success('Banner updated successfully');
        setEditingBanner(null);
        setNewImage(null);
        setNewImagePreview(null);
        fetchBanners();
      } else {
        toast.error(response.data.message || 'Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle banner deletion
  const handleDelete = async (bannerId) => {
    try {
      setActionLoading(true);
      const response = await axiosInstance.delete(`/api/banner/delete-banner/${bannerId}`);
      
      if (response.data.success) {
        toast.success('Banner deleted successfully');
        setDeleteConfirm(null);
        fetchBanners();
      } else {
        toast.error(response.data.message || 'Failed to delete banner');
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };
  return (
    <><div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Banners</h1>
        </div>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-orange-500"></div>
            <p className="text-gray-500 mt-3">Loading banners...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No Banners Found</h3>
            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
              You haven't added any banners yet. Add one to display on the home page carousel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div 
                key={banner._id} 
                className={`relative border rounded-lg overflow-hidden ${
                  editingBanner === banner._id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
                }`}
              >
                {editingBanner === banner._id ? (
                  // Edit mode
                  <div className="p-4">
                    <h3 className="font-medium mb-3">Edit Banner</h3>
                    
                    {newImagePreview ? (
                      <div className="relative mb-3">
                        <img 
                          src={newImagePreview} 
                          alt="New banner" 
                          className="w-full h-48 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewImage(null);
                            setNewImagePreview(null);
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                        >
                          <X className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <input
                            type="file"
                            id={`edit-banner-${banner._id}`}
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                          <label htmlFor={`edit-banner-${banner._id}`} className="cursor-pointer text-center">
                            <div className="flex flex-col items-center justify-center">
                              <Upload className="h-8 w-8 text-gray-400 mb-2" />
                              <span className="text-sm font-medium">Upload new image</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdate(banner._id)}
                        className="px-3 py-1.5 bg-orange-500 text-white rounded hover:bg-orange-600"
                        disabled={actionLoading || !newImage}
                      >
                        {actionLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                ) : deleteConfirm === banner._id ? (
                  // Delete confirmation
                  <div className="p-4">
                    <div className="text-center py-4">
                      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900 mb-1">Delete this banner?</h3>
                      <p className="text-gray-500 text-sm mb-4">This action cannot be undone.</p>
                      
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                          disabled={actionLoading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Regular display mode
                  <>
                    <img 
                      src={`${backendURL}/banner/${banner.bannerImage}`} 
                      alt="Banner" 
                      className="w-full h-48 object-cover"
                    />
                    
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={() => setEditingBanner(banner._id)}
                        className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                        title="Edit banner"
                      >
                        <Edit2 className="h-4 w-4 text-gray-700" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(banner._id)}
                        className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                        title="Delete banner"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                    
                    <div className="p-3 bg-gray-50 border-t">
                      <p className="text-sm text-gray-500">
                        Added: {new Date(banner.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AllBanners;