import { products } from "../../data/products";
import ProductCard from "../../components/ui/product-card";
import React, { useState, useEffect } from "react";
import { ChevronDown, Filter, SlidersHorizontal, X } from "lucide-react";
import { axiosInstance, getConfig } from "../../utils/request";
import { GET_PRODUCTS, PRODUCT_ROUTE } from "../../lib/api-client";

const Products = () => {
  const [sort, setSort] = useState("Featured");
  const [filter, setFilter] = useState({
    availability: "All",
    price: "All",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [productsList, setProductsList] = useState([]);

  // Apply filters and sorting to products
  useEffect(() => {
    setIsLoading(true);

    // Simulate network delay (remove in production)
    const timer = setTimeout(() => {
      let result = [...products];

      // Apply availability filter
      if (filter.availability === "In Stock") {
        result = result.filter((product) => !product.isSoldOut);
      } else if (filter.availability === "Out of Stock") {
        result = result.filter((product) => product.isSoldOut);
      }

      // Apply price filter
      if (filter.price === "Low to High") {
        result.sort((a, b) => a.price - b.price);
      } else if (filter.price === "High to Low") {
        result.sort((a, b) => b.price - a.price);
      }

      // Apply sorting
      if (sort === "Price: Low to High") {
        result.sort((a, b) => a.price - b.price);
      } else if (sort === "Price: High to Low") {
        result.sort((a, b) => b.price - a.price);
      } else if (sort === "Best Selling") {
        result.sort((a, b) => b.reviewCount - a.reviewCount);
      }

      setFilteredProducts(result);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filter, sort]);

  const getProducts = async () => {
    try {
      await getConfig()
      const res = await axiosInstance.get(GET_PRODUCTS);
      if (res.status === 200) {
        setFilteredProducts(res.data.products);
        setProductsList(res.data.products);
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
  return (
    <>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Our Products</h1>
          <p className="text-gray-600">
            Browse our selection of premium organic snacks and healthy food
            products
          </p>
        </div>
        <div className="md:hidden mb-4">
          <button
            className="flex items-center justify-center w-full py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            <span>Filters & Sort</span>
            <span className="ml-auto">
              {mobileFiltersOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </span>
          </button>
        </div>
        <div
          className={`fixed inset-0 z-40 transform transition-transform duration-300 ease-in-out ${
            mobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          } md:static md:transform-none md:z-auto bg-white md:bg-transparent md:mb-6 flex flex-col md:flex-row md:justify-end`}
        >
          <div className="bg-white p-4 md:p-0 w-full md:w-auto flex flex-col md:flex-row md:items-center md:space-x-4 md:ml-auto h-full md:h-auto">
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

            {/* <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mt-4 md:mt-0">
              <span className="text-sm font-medium mb-2 md:mb-0">Filter</span>
              <div className="relative mb-3 md:mb-0">
                <select
                  className="appearance-none border border-gray-300 rounded px-3 py-1 pr-8 text-sm w-full md:w-auto bg-white"
                  value={filter.availability}
                  onChange={(e) =>
                    setFilter({ ...filter, availability: e.target.value })
                  }
                >
                  <option>Availability</option>
                  <option>In Stock</option>
                  <option>Out of Stock</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <div className="relative mb-3 md:mb-0">
                <select
                  className="appearance-none border border-gray-300 rounded px-3 py-1 pr-8 text-sm w-full md:w-auto bg-white"
                  value={filter.price}
                  onChange={(e) =>
                    setFilter({ ...filter, price: e.target.value })
                  }
                >
                  <option>Price</option>
                  <option>Low to High</option>
                  <option>High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div> */}

            {/* <div className="flex flex-col md:flex-row md:items-center mt-4 md:mt-0">
              <span className="text-sm mb-2 md:mb-0 md:mr-2">Sort by:</span>
              <div className="relative">
                <select
                  className="appearance-none border border-gray-300 rounded px-3 py-1 pr-8 text-sm w-full md:w-auto bg-white"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option>Featured</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Best Selling</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
              <span className="mt-4 md:mt-0 md:ml-4 text-sm text-gray-500">
                {filteredProducts.length} products
              </span>
            </div> */}

            {/* Apply filters button - Mobile only */}
            {/* <div className="mt-auto md:hidden pt-4 border-t border-gray-200">
              <button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply Filters
              </button>
            </div> */}
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
                    Try changing your filters or check back later
                  </p>
                  <button
                    onClick={() => {
                      setFilter({
                        availability: "All",
                        price: "All",
                      });
                      setSort("Featured");
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productsList.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
