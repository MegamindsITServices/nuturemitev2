import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosInstance } from '../../utils/request';
import { GET_COLLECTION_BY_ID, GET_PRODUCTS_BY_COLLECTION } from '../../lib/api-client';
import ProductCard from '../../components/ui/product-card';
import Breadcrumb from '../../components/common/Breadcrumb';
import { Skeleton } from '../../components/ui/skeleton';

const ComboProducts = () => {
  const [collection, setCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch collection details
        const collectionResponse = await axiosInstance.get(`${GET_COLLECTION_BY_ID.replace(':id', id)}`);
        if (collectionResponse.data.success) {
          setCollection(collectionResponse.data.collection);
        }

        // Fetch products in the collection
        const productsResponse = await axiosInstance.get(`${GET_PRODUCTS_BY_COLLECTION}/${id}`);
        if (productsResponse.data.success) {
          setProducts(productsResponse.data.products);
        }
      } catch (err) {
        console.error('Error fetching combo products:', err);
        setError('Failed to load combo products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Combos', href: '/combos' },
    { label: collection?.name || 'Collection Details' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="animate-pulse space-y-8 max-w-6xl mx-auto">
          <div className="h-12 bg-gray-200 rounded-md w-3/4 mb-8"></div>
          <div className="h-24 bg-gray-200 rounded-md w-full mb-12"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="h-48 bg-gray-200 rounded-md mb-3"></div>
                <div className="h-6 bg-gray-200 rounded-md w-3/4 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
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
          <p className="mb-6">{error}</p>
          <Link 
            to="/" 
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Collection Not Found</h2>
          <p className="mb-6">The collection you're looking for doesn't exist or has been removed.</p>
          <Link 
            to="/combos" 
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            View All Combos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={breadcrumbItems} />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{collection.name}</h1>
          {collection.description && (
            <p className="text-gray-600 max-w-3xl mx-auto">{collection.description}</p>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-medium mb-2">No Products Found</h2>
            <p className="text-gray-500">There are no products available in this collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboProducts;
