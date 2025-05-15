import React, { useEffect, useState } from 'react';
import { backendURL } from '../../lib/api-client';

const BackendUrlTest = () => {
  const [isLocalhost, setIsLocalhost] = useState(false);
  const [hostname, setHostname] = useState('');
  
  useEffect(() => {
    setIsLocalhost(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    setHostname(window.location.hostname);
  }, []);

  return (
    <div className="p-4 bg-orange-100 rounded-lg mt-4">
      <h3 className="font-bold text-lg">Backend URL Configuration</h3>
      <p className="mb-2">Current backend URL: <code className="bg-gray-100 px-2 py-1 rounded">{backendURL}</code></p>
      <p>Detected hostname: <code className="bg-gray-100 px-2 py-1 rounded">{hostname}</code></p>
      <p>Environment: <span className="font-semibold">{isLocalhost ? 'Development' : 'Production'}</span></p>
    </div>
  );
};

export default BackendUrlTest;
