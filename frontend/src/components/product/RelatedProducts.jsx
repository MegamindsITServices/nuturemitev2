import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../../utils/request';
import { GET_PRODUCTS_BY_COLLECTION } from '../../lib/api-client';
import ProductCard from '../ui/product-card';
import { Skeleton } from '../ui/skeleton';

const RelatedProducts = ({ collectionId, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!collectionId) return;
      
      setLoading(true);
      try {
        const response = await axiosInstance.get(`${GET_PRODUCTS_BY_COLLECTION}/${collectionId}`);
        if (response.data.success) {
          // Filter out the current product from related products
          const filteredProducts = response.data.products.filter(
            product => product._id !== currentProductId
          );
          setProducts(filteredProducts);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [collectionId, currentProductId]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="p-4 border rounded-md">
              <Skeleton className="h-40 w-full rounded-md mb-3" />
              <Skeleton className="h-5 w-3/4 rounded mb-2" />
              <Skeleton className="h-4 w-1/2 rounded mb-2" />
              <Skeleton className="h-6 w-1/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="mt-12 text-red-500">{error}</div>;
  }

  if (!products.length) {
    return null; // Don't show section if no related products
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.slice(0, 4).map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
