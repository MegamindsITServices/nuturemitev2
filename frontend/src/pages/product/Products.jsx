import { products } from "../../data/products";
import ProductCard from "../../components/ui/product-card";
import React, { useState, useEffect } from "react";
import { ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import { axiosInstance, getConfig } from "../../utils/request";
import { GET_PRODUCTS, PRODUCT_ROUTE } from "../../lib/api-client";

const Products = () => {
  const [sort, setSort] = useState("Featured");
  const [filter, setFilter] = useState({
    priceRange: "All",
    collection: "All",
    search: "",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productsList, setProductsList] = useState([]);
  const [collections, setCollections] = useState([]);

  // Get products from API
  const getProducts = async () => {
    try {
      setIsLoading(true);
      await getConfig();
      const res = await axiosInstance.get(GET_PRODUCTS);
      if (res.status === 200) {
        setProductsList(res.data.products);
        setFilteredProducts(res.data.products);
        
        // Extract unique collections for filter dropdown
        const uniqueCollections = [...new Set(
          res.data.products.map(product => product.collection?.name).filter(Boolean)
        )];
        setCollections(uniqueCollections);
        
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  // Apply filters and sorting to products
  useEffect(() => {
    let result = [...productsList];

    // Apply search filter
    if (filter.search.trim()) {
      result = result.filter(product =>
        product.name.toLowerCase().includes(filter.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filter.search.toLowerCase())
      );
    }

    // Apply price range filter
    if (filter.priceRange !== "All") {
      switch (filter.priceRange) {
        case "Under ₹100":
          result = result.filter(product => product.price < 100);
          break;
        case "₹100 - ₹500":
          result = result.filter(product => product.price >= 100 && product.price <= 500);
          break;
        case "₹500 - ₹1000":
          result = result.filter(product => product.price >= 500 && product.price <= 1000);
          break;
        case "Above ₹1000":
          result = result.filter(product => product.price > 1000);
          break;
      }
    }

    // Apply collection filter
    if (filter.collection !== "All") {
      result = result.filter(product => product.collection?.name === filter.collection);
    }

    // Apply sorting
    switch (sort) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Newest First":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "Name: A to Z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name: Z to A":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep original order for "Featured"
        break;
    }

    setFilteredProducts(result);
  }, [filter, sort, productsList]);

  const clearFilters = () => {
    setFilter({
      priceRange: "All",
      collection: "All",
      search: "",
    });
    setSort("Featured");
  };

  const hasActiveFilters = () => {
    return (
      filter.priceRange !== "All" ||
      filter.collection !== "All" ||
      filter.search.trim() !== "" ||
      sort !== "Featured"
    );
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-gray-600">
            Browse our selection of premium organic snacks and healthy food products
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search products..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-4">
          <button
            className="flex items-center justify-center w-full py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            <span>Filters & Sort</span>
            {hasActiveFilters() && (
              <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
            <span className="ml-auto">
              {mobileFiltersOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </span>
          </button>
        </div>

        {/* Filter Panel */}
        <div
          className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
            mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:inset-auto md:transform-none md:translate-x-0 md:z-auto bg-white md:bg-transparent md:mb-6 flex flex-col md:flex-row md:justify-between md:items-center`}
        >
          <div className="bg-white p-4 md:p-0 w-full md:w-auto flex flex-col md:flex-row md:items-center md:space-x-4 h-full md:h-auto">
            {/* Mobile header */}
            <div className="flex items-center justify-between md:hidden mb-6">
              <h2 className="text-lg font-medium">Filters & Sort</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <span className="text-sm font-medium">Filters:</span>

              {/* Price Range Filter */}
              <div className="relative">
                <select
                  className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm w-full md:w-auto bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={filter.priceRange}
                  onChange={(e) =>
                    setFilter({ ...filter, priceRange: e.target.value })
                  }
                >
                  <option value="All">All Prices</option>
                  <option value="Under ₹100">Under ₹100</option>
                  <option value="₹100 - ₹500">₹100 - ₹500</option>
                  <option value="₹500 - ₹1000">₹500 - ₹1000</option>
                  <option value="Above ₹1000">Above ₹1000</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Collection Filter */}
              <div className="relative">
                <select
                  className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm w-full md:w-auto bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  value={filter.collection}
                  onChange={(e) =>
                    setFilter({ ...filter, collection: e.target.value })
                  }
                >
                  <option value="All">All Collections</option>
                  {collections.map((collection) => (
                    <option key={collection} value={collection}>
                      {collection}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Sort and Results Info */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mt-4 md:mt-0 md:ml-auto">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    className="appearance-none border border-gray-300 rounded px-3 py-2 pr-8 text-sm w-full md:w-auto bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                  >
                    <option value="Featured">Featured</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Newest First">Newest First</option>
                    <option value="Name: A to Z">Name: A to Z</option>
                    <option value="Name: Z to A">Name: Z to A</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <span className="text-sm text-gray-500">
                {filteredProducts.length} products
              </span>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="mt-4 md:mt-0 text-sm text-orange-600 hover:text-orange-800 underline"
              >
                Clear all filters
              </button>
            )}

            {/* Apply filters button - Mobile only */}
            <div className="mt-auto md:hidden pt-4 border-t border-gray-200">
              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded transition-colors"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply Filters ({filteredProducts.length} products)
              </button>
            </div>
          </div>
        </div>

        {/* Product grid with loading state */}
        <div className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full animate-pulse"
                >
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded mb-4 w-3/4"></div>
                    <div className="flex space-x-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="h-4 w-4 bg-gray-200 rounded"
                        ></div>
                      ))}
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-3xl font-medium mb-4">
                    No products found
                  </div>
                  <p className="text-gray-500 mb-6">
                    Try changing your filters or search terms
                  </p>
                  <button
                    onClick={clearFilters}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Products;