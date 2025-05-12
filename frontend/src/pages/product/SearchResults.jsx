import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance, getConfig } from "../../utils/request";
import { backendURL, GET_PRODUCT_BY_SEARCH } from "../../lib/api-client";
import { ChevronLeft, ChevronRight, Filter, SlidersHorizontal } from "lucide-react";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get search query from URL
  const query = new URLSearchParams(location.search).get('q') || '';
  
  // Filter states
  const [filter, setFilter] = useState({
    priceRange: [0, 10000], // Default price range
    sort: "newest" // Default sort
  });
  
  const fetchSearchResults = async () => {
    try {
      setIsLoading(true);
      await getConfig();
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('keyword', query);
      params.append('page', currentPage);
      params.append('limit', 12);
      
      // Add sort parameter if it's not the default
      if (filter.sort === "price_asc") {
        params.append('sort', 'price');
      } else if (filter.sort === "price_desc") {
        params.append('sort', '-price');
      }
      
      const response = await axiosInstance.get(`${GET_PRODUCT_BY_SEARCH}?${params.toString()}`);
      
      if (response.data.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError("Failed to fetch search results");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setError("An error occurred while fetching search results");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSearchResults();
    // Reset to first page when query changes
    setCurrentPage(1);
  }, [query, filter.sort, currentPage]);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };
  
  const handleSortChange = (e) => {
    setFilter({
      ...filter,
      sort: e.target.value
    });
    setCurrentPage(1); // Reset to first page on sort change
  };
    return (
    <div className="container mx-auto px-4 py-8"><div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Search Results for "{query}"
        </h1>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <select
              value={filter.sort}
              onChange={handleSortChange}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 md:hidden border rounded-md px-3 py-2 text-sm"
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>
      
      {/* Mobile filters */}
      {showFilters && (
        <div className="md:hidden bg-white p-4 rounded-md shadow-md mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={filter.sort}
              onChange={handleSortChange}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-6 py-12 rounded-md text-center">
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-gray-500 mb-6">
            We couldn't find any products matching your search for "{query}"
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div 
                  className="cursor-pointer"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  <div className="aspect-square overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img
                        src={`${backendURL}/image/${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-sm md:text-base font-medium mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="font-semibold text-sm md:text-base">₹{product.price}</p>
                        {product.originalPrice > product.price && (
                          <div className="flex items-center gap-2">
                            <p className="text-xs md:text-sm text-gray-500 line-through">
                              ₹{product.originalPrice}
                            </p>
                            <p className="text-xs md:text-sm text-green-600">
                              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border rounded-md p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-3 py-2">...</span>
                      )}
                      <button
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentPage === page
                            ? "bg-orange-500 text-white"
                            : "border hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border rounded-md p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
