import React, { useState, useEffect } from 'react';
import { getProductImageUrl, getBannerImageUrl, getCollectionImageUrl } from '../../utils/imageUtils';
import config from '../../config/environment';

const ImageUrlTester = () => {
  const [testImageName] = useState('test-image.png');
  const [environment, setEnvironment] = useState('');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setEnvironment(config.isProduction() ? 'Production' : 'Development');
    setApiUrl(config.getApiUrl());
  }, []);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Image URL Configuration Tester</h2>
      
      <div className="grid gap-6">
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Environment Info</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-600">Environment:</div>
            <div className="font-medium">{environment}</div>
            
            <div className="text-gray-600">API URL:</div>
            <div className="font-medium">{apiUrl}</div>
            
            <div className="text-gray-600">Hostname:</div>
            <div className="font-medium">{window.location.hostname}</div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Generated Image URLs</h3>
          <div className="grid gap-4">
            <div>
              <p className="text-gray-600 mb-1">Product image URL:</p>
              <code className="bg-gray-100 p-2 block rounded">{getProductImageUrl(testImageName)}</code>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">Banner image URL:</p>
              <code className="bg-gray-100 p-2 block rounded">{getBannerImageUrl(testImageName)}</code>
            </div>
            
            <div>
              <p className="text-gray-600 mb-1">Collection image URL:</p>
              <code className="bg-gray-100 p-2 block rounded">{getCollectionImageUrl(testImageName)}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUrlTester;
