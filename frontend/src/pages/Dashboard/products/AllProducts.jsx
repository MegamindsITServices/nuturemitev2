import React, { useEffect, useState } from "react";
import ProductCard from "../../../components/ui/product-card";
import { axiosInstance, getConfig } from "../../../utils/request";
import { GET_PRODUCTS, backendURL } from "../../../lib/api-client";

const AllProducts = () => {
  const [getProducts, setGetProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const getAllProducts = async () => {
    setLoading(true);
    try {
      await getConfig();
      const response = await axiosInstance.get(GET_PRODUCTS);
      setGetProducts(response.data.products || response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mt-6">
        <h1 className="text-2xl font-semibold mb-6">All Products</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getProducts.length > 0 ? (
              getProducts.map((product) => (
                <ProductCard 
                  key={product._id || product.id} 
                  product={product}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-8">No products found</p>
            )}
          </div>
        )}
      </div>

      {/* Debug section (can be removed in production) */}
      {!loading && getProducts.length > 0 && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <p className="font-semibold mb-2">First product data:</p>
          <pre className="overflow-auto max-h-40">
            {JSON.stringify(getProducts[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AllProducts;
