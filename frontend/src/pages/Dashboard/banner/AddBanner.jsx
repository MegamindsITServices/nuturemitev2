import React, { useState } from 'react';
import { axiosInstance } from '../../../utils/request';
import { toast } from 'sonner';
import { backendURL } from '../../../lib/api-client';
import { Image as ImageIcon, Upload, X } from 'lucide-react';

const AddBanner = () => {
  const [bannerImage, setBannerImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerImage(file);
      // Create preview URL
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleRemoveImage = () => {
    setBannerImage(null);
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!bannerImage) {
      toast.error('Please select a banner image');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('banner', bannerImage);
      
      const response = await axiosInstance.post('/api/banner/add-banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success('Banner added successfully');
        setBannerImage(null);
        setPreviewImage(null);
      } else {
        toast.error(response.data.message || 'Failed to add banner');
      }
    } catch (error) {
      console.error('Error adding banner:', error);
      toast.error('Failed to add banner. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold mb-6">Add New Banner</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Banner Image <span className="text-red-500">*</span>
            </label>
            
            <div className="mt-2">
              {!previewImage ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    type="file"
                    id="banner-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="banner-image" className="cursor-pointer text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-3" />
                      <span className="text-sm font-medium text-gray-900">Click to upload</span>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Banner preview"
                    className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading || !bannerImage}
              className={`w-full py-3 px-4 bg-orange-500 text-white rounded-md font-medium ${
                loading || !bannerImage
                  ? 'opacity-60 cursor-not-allowed'
                  : 'hover:bg-orange-600'
              } transition-colors`}
            >
              {loading ? 'Adding Banner...' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddBanner;