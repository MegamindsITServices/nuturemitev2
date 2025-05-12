import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../utils/request';
import { GET_COLLECTION } from '../../lib/api-client';
import Breadcrumb from '../../components/common/Breadcrumb';
import { Skeleton } from '../../components/ui/skeleton';

const CombosPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(GET_COLLECTION);
        if (response.data.success && response.data.collections) {
          setCollections(response.data.collections);
        }
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load collections. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Combos' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded-md w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Special Combos</h1>

        {collections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No combos are available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map(collection => (
              <Link 
                key={collection._id} 
                to={`/combos/${collection._id}`}
                className="block group"
              >
                <div className="border rounded-lg overflow-hidden transition-shadow hover:shadow-lg">
                  {collection.image ? (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={`https://nuturemite-server.onrender.com/collection/${collection.image}`} 
                        alt={collection.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image available</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-xl mb-1 group-hover:text-orange-500 transition-colors">
                      {collection.name}
                    </h3>
                    {collection.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">{collection.description}</p>
                    )}
                    <p className="mt-3 text-sm font-medium text-orange-500">
                      View Products →
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CombosPage;
