import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import {
  ChevronDown,
  Search,
  ShoppingCart,
  User,
  X,
  Menu,
  Home,
  Package,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import {
  GET_COLLECTION,
  GET_PRODUCT_BY_SEARCH,
} from "../../lib/api-client";
import { getProductImageUrl, getProfileImageUrl } from "../../utils/imageUtils";
import { axiosInstance, getConfig } from "../../utils/request";

// Main hover dropdown component
const HoverDropdown = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="flex items-center gap-1 cursor-pointer">{trigger}</div>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg py-2 px-2 min-w-[180px] z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [show, setShow] = useState(true);
  const [auth, setAuth, logout] = useAuth();
  const { cart, openCart } = useCart();
  const navigate = useNavigate();
  const [getCollections, setGetCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);

  // Fetch collections for dropdown
  const fetchCollections = async () => {
    try {
      await getConfig();
      const response = await axiosInstance.get(GET_COLLECTION);
      if (response.data.success) {
        setGetCollections(response.data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };
  // Handle search by collection
  const searchByCollections = (collectionId, collectionName) => {
    navigate(`/products/collections/${collectionId}`, {
      state: { collectionName },
    });
    setShowSearchResults(false);
  };
  // Handle search input change with debounce
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      await getConfig();
      const response = await axiosInstance.get(
        `${GET_PRODUCT_BY_SEARCH}?keyword=${query}`
      );
      if (response.data.success) {
        setSearchResults(response.data.products || []);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
    }
  };
  // Handle search by price
  const searchByPrice = (minPrice, maxPrice) => {
    navigate(`/search/price?min=${minPrice}&max=${maxPrice}`);
    setShowSearchResults(false);
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Click outside to close search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Determine if scrolled past threshold
      setScrolled(currentScrollY > 50);

      // Hide navbar on scroll down, show on scroll up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShow(false);
      } else {
        setShow(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={clsx(
        "w-full z-50 sticky top-0 transition-transform duration-300",
        !show && "transform -translate-y-full"
      )}
    >
      {/* <div className="bg-orange-500 text-white text-center text-xs py-0.5 transition-all duration-300">
        5% off on prepaid orders
      </div>{" "} */}
      <div className="bg-white shadow-md transition-all duration-300">
        <div className="container mx-auto">
          <div
            className={clsx(
              "flex items-center justify-between py-2 px-4 transition-all duration-300",
              scrolled ? "py-1" : "py-1.5"
            )}
          >
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center p-2 text-gray-700 hover:text-orange-500 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <img
                  src="/images/logo.png"
                  alt="Nuturemite"
                  className="h-[8vh] md:h-[10vh] object-contain"
                />
              </Link>
            </div>

            {/* Search - Desktop (when scrolled) & Tablet */}
            {scrolled ? (
              <div
                className="relative hidden md:block flex-grow max-w-xl mx-4"
                ref={searchRef}
              >
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex border rounded-full overflow-hidden w-full"
                >
                  <input
                    placeholder="Search products..."
                    className="px-3 py-1.5 w-full focus:outline-none text-sm"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() =>
                      searchQuery.trim().length >= 2 &&
                      setShowSearchResults(true)
                    }
                  />
                  <button
                    type="submit"
                    className="px-3 text-gray-500 hover:text-black"
                  >
                    <Search size={14} />{" "}
                  </button>
                </form>

                {/* Search results dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-[60vh] overflow-y-auto">
                    <div className="flex justify-between items-center px-3 py-2 border-b">
                      <p className="text-sm font-medium">Search Results</p>
                      <button
                        className="p-1 hover:bg-gray-100 rounded-full"
                        onClick={() => setShowSearchResults(false)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <Link
                          key={product._id}
                          to={`/products/${product._id}`}
                          className="flex items-center px-3 py-2 hover:bg-gray-50"
                          onClick={() => setShowSearchResults(false)}
                        >
                          {product.images && product.images[0] ? (
                            <img
                              src={getProductImageUrl(product.images[0])}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                No img
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ₹{product.price}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t px-3 py-2">
                      <button
                        onClick={() => {
                          navigate(
                            `/search?q=${encodeURIComponent(
                              searchQuery.trim()
                            )}`
                          );
                          setShowSearchResults(false);
                        }}
                        className="text-sm text-orange-500 hover:underline w-full text-center"
                      >
                        View all results
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:block"></div>
            )}

            {/* Right Icons */}
            <div className="flex gap-5 items-center justify-end px-4">
              {!scrolled && (
                <div className="relative" ref={searchRef}>
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      placeholder="Search..."
                      className="border rounded-lg px-3 py-1.5 text-sm w-40 focus:w-60 transition-all focus:outline-none"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() =>
                        searchQuery.trim().length >= 2 &&
                        setShowSearchResults(true)
                      }
                    />
                    <button
                      type="submit"
                      className="px-2 text-gray-500 hover:text-black"
                    >
                      <Search size={16} />
                    </button>
                  </form>

                  {/* Search results dropdown for non-scrolled state */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full right-0 mt-1 bg-white rounded-md shadow-lg z-50 max-h-[60vh] overflow-y-auto w-72">
                      <div className="flex justify-between items-center px-3 py-2 border-b">
                        <p className="text-sm font-medium">Search Results</p>
                        <button
                          className="p-1 hover:bg-gray-100 rounded-full"
                          onClick={() => setShowSearchResults(false)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="py-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            className="flex items-center px-3 py-2 hover:bg-gray-50"
                            onClick={() => setShowSearchResults(false)}
                          >
                            {product.images && product.images[0] ? (
                              <img
                                src={getProductImageUrl(product.images[0])}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                <span className="text-xs text-gray-500">
                                  No img
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ₹{product.price}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <div className="border-t px-3 py-2">
                        <button
                          onClick={() => {
                            navigate(
                              `/search?q=${encodeURIComponent(
                                searchQuery.trim()
                              )}`
                            );
                            setShowSearchResults(false);
                          }}
                          className="text-sm text-orange-500 hover:underline w-full text-center"
                        >
                          View all results
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User dropdown with admin link */}
              <HoverDropdown
                trigger={
                  <div className="cursor-pointer hover:text-[#ed6663] transition-colors flex items-center gap-1">
                    {" "}
                    {auth?.user ? (
                      <>
                        {auth.user.image ? (
                          <img
                            src={
                              auth.user.image.startsWith("http")
                                ? auth.user.image
                                : `${backendURL}/profile/${auth.user.image}`
                            }
                            alt={auth.user.firstName}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                            {auth.user.firstName
                              ? auth.user.firstName.charAt(0).toUpperCase()
                              : "U"}
                          </div>
                        )}
                        <span className="text-sm font-medium hidden md:inline">
                          {auth.user.firstName || auth.user.email.split("@")[0]}
                        </span>
                      </>
                    ) : (
                      <>
                        <User size={18} />
                        <span className="text-sm font-medium">Account</span>
                      </>
                    )}
                  </div>
                }
              >
                <div className="flex flex-col space-y-1 min-w-[150px]">
                  {auth?.user ? (
                    <>
                      <Link
                        to="/user/profile"
                        className="block text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
                      >
                        My Profile
                      </Link>
                      {auth.user.isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="block text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => logout()}
                        className="w-full text-left text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="block text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </HoverDropdown>
              <button
                onClick={openCart}
                className="cursor-pointer hover:text-[#ed6663] transition-colors relative"
              >
                <ShoppingCart size={18} />
                {cart?.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#ed6663] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Links */}
        <div
          className={clsx(
            "hidden lg:flex justify-center gap-8 py-2 text-sm font-semibold w-full transition-all duration-300",
            scrolled ? "bg-[#ed6663] text-white" : "bg-white text-gray-800"
          )}
        >
          <Link to="/" className="hover:text-opacity-80 transition-opacity">
            HOME
          </Link>
          <Link
            to="/products"
            className="hover:text-opacity-80 transition-opacity"
          >
            PRODUCTS
          </Link>
          <Link
            to="/deals"
            className="hover:text-opacity-80 transition-opacity"
          >
            DEALS
          </Link>
          <Link
            to="/for-business"
            className="hover:text-opacity-80 transition-opacity"
          >
            FOR BUSINESS
          </Link>
          <Link
            to="/about"
            className="hover:text-opacity-80 transition-opacity"
          >
            ABOUT US
          </Link>
          <Link
            to="/contact"
            className="hover:text-opacity-80 transition-opacity"
          >
            CONTACT US
          </Link>
          <Link
            to="/blogs"
            className="hover:text-opacity-80 transition-opacity"
          >
            BLOGS
          </Link>
          <Link
            to="/Competitions"
            className="hover:text-opacity-80 transition-opacity"
          >
            COMPETITIONS
          </Link>
          {/* <HoverDropdown
            trigger={
              <div className="flex items-center gap-1 hover:text-opacity-80 transition-opacity">
                Category <ChevronDown size={12} />
              </div>
            }
          >
            <div className="flex flex-col space-y-1">
              {getCollections.length > 0 ? (
                getCollections.map((collection) => (
                  <button
                    key={collection._id}
                    onClick={() => searchByCollections(collection._id, collection.name)}
                    className="text-left text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
                  >
                    {collection.name}
                  </button>
                ))
              ) : (
                <div className="text-gray-500 px-3 py-2 text-sm">No categories found</div>
              )}
            </div>
          </HoverDropdown> */}

          {/* <HoverDropdown
            trigger={
              <div className="flex items-center gap-1 hover:text-opacity-80 transition-opacity">
                SEARCH BY <ChevronDown size={12} />
              </div>
            }
          >
            <div className="flex flex-col space-y-1">
              <div className="px-3 py-1.5 text-sm font-medium text-gray-900">By Price</div>
              <button
                onClick={() => searchByPrice(0, 500)}
                className="w-full text-left text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
              >
                Under ₹500
              </button>
              <button
                onClick={() => searchByPrice(500, 1000)}
                className="w-full text-left text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
              >
                ₹500 - ₹1000
              </button>
              <button
                onClick={() => searchByPrice(1000, 999999)}
                className="w-full text-left text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
              >
                Above ₹1000
              </button>
              
              <div className="border-t my-1"></div>
              
              <div className="px-3 py-1.5 text-sm font-medium text-gray-900">By Category</div>
              {getCollections.length > 0 ? (
                getCollections.slice(0, 5).map((collection) => (
                  <button
                    key={collection._id}
                    onClick={() => searchByCollections(collection._id, collection.name)}
                    className="w-full text-left text-gray-800 hover:bg-gray-100 hover:text-[#ed6663] px-3 py-1.5 rounded-md transition-colors duration-200 text-sm"
                  >
                    {collection.name}
                  </button>
                ))
              ) : null}
              
              {getCollections.length > 5 && (
                <Link
                  to="/categories"
                  className="text-orange-500 hover:underline px-3 py-1.5 text-sm text-center"
                >
                  View all categories
                </Link>
              )}
            </div>
          </HoverDropdown> */}

          {/* <Link
            to="/combos"
            className="hover:text-opacity-80 transition-opacity"
          >
            COMBOS
          </Link> */}
          {/* <div className="flex items-center gap-1">
            <Link
              to="/blogs"
              className="hover:text-opacity-80 transition-opacity"
            >
              BLOGS
            </Link>
            <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full">
              NEW
            </span>
          </div> */}
        </div>

        {/* Mobile Menu - Slide down when open */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-md">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col space-y-3">
                <Link
                  to="/"
                  className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home size={18} />
                  <span>Home</span>
                </Link>

                <div className="border-b"></div>

                <div className="py-2 px-3">
                  <div className="font-medium mb-2">Categories</div>
                  <div className="pl-2 flex flex-col space-y-2">
                    {getCollections.slice(0, 5).map((collection) => (
                      <button
                        key={collection._id}
                        onClick={() => {
                          searchByCollections(collection._id, collection.name);
                          setMobileMenuOpen(false);
                        }}
                        className="text-left text-gray-700 hover:text-orange-500 text-sm"
                      >
                        {collection.name}
                      </button>
                    ))}
                    {getCollections.length > 5 && (
                      <Link
                        to="/categories"
                        className="text-orange-500 hover:underline text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        View all categories
                      </Link>
                    )}
                  </div>
                </div>

                <div className="border-b"></div>

                <Link
                  to="/combos"
                  className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package size={18} />
                  <span>Combos</span>
                </Link>

                <Link
                  to="/blogs"
                  className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen size={18} />
                  <span>Blogs</span>
                </Link>

                <div className="border-b"></div>

                {!auth?.user ? (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      <span>Login / Register</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/user/profile"
                      className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      <span>My Profile</span>
                    </Link>

                    {auth.user.isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md text-left w-full"
                    >
                      <span>Logout</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    openCart();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 rounded-md"
                >
                  <ShoppingBag size={18} />
                  <span>My Cart</span>
                  {cart?.length > 0 && (
                    <span className="bg-[#ed6663] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1">
                      {cart.length}
                    </span>
                  )}
                </button>

                <div className="border-b"></div>

                {/* Mobile search */}
                <form onSubmit={handleSearchSubmit} className="py-2 px-3">
                  <div className="flex border rounded-md overflow-hidden">
                    <input
                      placeholder="Search products..."
                      className="px-3 py-2 w-full focus:outline-none text-sm"
                      value={searchQuery}
                      onChange={handleSearchChange}
                    />
                    <button
                      type="submit"
                      className="px-3 bg-orange-500 text-white"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
