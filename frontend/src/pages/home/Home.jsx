import React, { useEffect, useState, lazy, Suspense } from "react";
import Carousel from "../../components/ui/carousel";
import ProductCarousel from "../../components/ui/product-carousel";
import ProductCard from "../../components/ui/product-card";
import BlogCarousel from "../../components/ui/blog-carousel";
import BlogCard from "../../components/ui/blog-card";
import { Atom, Cookie, Droplet, Heart, Leaf } from "lucide-react";
import { products } from "../../data/products";
import { blogPosts } from "../../data/blogs"; // Kept for fallback
import { GET_COLLECTION, GET_PRODUCTS, GET_BLOGS, backendURL } from "../../lib/api-client";
import { axiosInstance } from "../../utils/request";

// Lazy load the Collections component for better initial load performance
const Collections = lazy(() => import("../collections/Collections"));

const Home = () => {
  const [rotation, setRotation] = useState(45);
  const [isVisible, setIsVisible] = useState({
    features: false,
    products: false,
    combos: false,
    blogs: false,
  });
  const [carouselImages, setCarouselImages] = useState([]);
  const [getProducts, setGetProducts] = useState([]);  const [allCollections, setAllCollections] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const getAllProducts = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(GET_PRODUCTS);
      console.log("Products data:", response.data);
      setGetProducts(response.data.products || response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
  const getAllCollections = async () => {
    try {
      const response = await axiosInstance.get(GET_COLLECTION);
      console.log("Collection data:", response.data);
      if (response.data && response.data.success) {
        setAllCollections(response.data.collections);
      } else if (response.data && Array.isArray(response.data.collections)) {
        setAllCollections(response.data.collections);
      } else if (Array.isArray(response.data)) {
        setAllCollections(response.data);
      } else {
        setAllCollections([]);
        console.log("No collections found or invalid response format");
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      setAllCollections([]);
      throw error; // Re-throw to be caught by the main try-catch
    }
  };
  const fetchBanners = async () => {
    try {
      const response = await axiosInstance.get('/api/banner/get-banner');
      
      if (response.data.success && response.data.banners && response.data.banners.length > 0) {
        // Map banners to the format expected by the carousel component
        const bannerImages = response.data.banners.map((banner, index) => ({
          id: banner._id,
          image: `${backendURL}/banner/${banner.bannerImage}`,
          alt: `Banner slide ${index + 1}`
        }));
        
        setCarouselImages(bannerImages);
      } else {
        // Fallback to default banner images if no banners are found
        setCarouselImages([
          {
            id: 1,
            image:
              "https://eatanytime.in/cdn/shop/files/Desktop_View_28b67e87-641c-43ca-816b-5657b0b3eeba.png?v=1741242822&width=2000",
            alt: "Premium organic snacks",
          },
          {
            id: 2,
            image:
              "https://eatanytime.in/cdn/shop/files/Desktop_View_6.png?v=1744192109&width=2000",
            alt: "Healthy snack options",
          },
          {
            id: 3,
            image:
              "https://eatanytime.in/cdn/shop/files/Desktop_View_2.png?v=1741610304&width=2000",
            alt: "Premium trail mix collection",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching banner images:", error);
      // Fallback to default images in case of error
      setCarouselImages([
        {
          id: 1,
          image:
            "https://eatanytime.in/cdn/shop/files/Desktop_View_28b67e87-641c-43ca-816b-5657b0b3eeba.png?v=1741242822&width=2000",
          alt: "Premium organic snacks",
        },
        {
          id: 2,
          image:
            "https://eatanytime.in/cdn/shop/files/Desktop_View_6.png?v=1744192109&width=2000",
          alt: "Healthy snack options",
        },
      ]);    }
  };
  // Function to fetch blogs from backend
  const getBlogs = async () => {
    setBlogsLoading(true);
    try {
      const response = await axiosInstance.get(GET_BLOGS);
      console.log("Blogs data:", response.data);
      if (response.data && response.data.success && response.data.blogs) {
        setBlogs(response.data.blogs);
      } else {
        // Fallback to static data if no blogs or error
        setBlogs(blogPosts);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      // Fallback to static data
      setBlogs(blogPosts);
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
    getAllCollections();
    fetchBanners();
    getBlogs();
  }, []);


const features = [
   {
      id: 1,
      title: "Gluten Free",
      icon: <Leaf className="h-8 w-8 text-white" />,
    },
    {
      id: 2,
      title: "No Added Sugar",
      icon: <Cookie className="h-8 w-8 text-white" />,
    },
    {
      id: 3,
      title: "Anti Oxidant",
      icon: <Atom className="h-8 w-8 text-white" />,
    },
    {
      id: 4,
      title: "No Transfat",
      icon: <Droplet className="h-8 w-8 text-white" />,
    },
    {
      id: 5,
      title: "No Cholesterol",
      icon: <Heart className="h-8 w-8 text-white" />,
    },
]

// Animation effect for the watch hand
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for revealing animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -100px 0px",
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible((prev) => ({
            ...prev,
            [entry.target.dataset.section]: true,
          }));
          sectionObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll(".reveal-section");
    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        sectionObserver.unobserve(section);
      });
    };
  }, []);
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <section className="relative w-full">
          {/* Carousel component with proper height on different devices */}
          <Carousel
            images={carouselImages}
            interval={5000}
            className="h-[60vh] sm:h-[70vh] md:h-[80vh] w-full object-cover"
            priority={true}
          />
        </section>
        {/* Collections Section with suspense for code splitting */}
        <section className="container mx-auto py-12 md:py-16 px-4">
          <div className="text-center mb-12">
            <span className="text-orange-500 font-medium mb-2 block">
              CATEGORIES
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Shop By Collection
            </h2>
            <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full"></div>
          </div>
            {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-pulse flex flex-wrap justify-center gap-8">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex flex-col items-center gap-2">
                    <div className="rounded-full bg-gray-200 h-24 w-24 md:h-32 md:w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-20 md:w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full py-8 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-wrap justify-center items-center gap-10">
                  {allCollections && allCollections.length > 0 ? (
                    allCollections.map((collection) => (
                      <div
                        key={collection._id}
                        className="flex flex-col items-center transition-all duration-300 relative cursor-pointer"
                        onClick={() => handleCollectionClick(collection)}
                      >
                        <div className="rounded-full w-32 h-32 bg-orange-100 flex items-center justify-center relative overflow-hidden transition-transform duration-300 hover:scale-110">
                          {collection.image ? (
                            <img 
                              src={`${backendURL}/image/${collection.image}`} 
                              alt={collection.name} 
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`text-2xl font-bold text-orange-500 absolute inset-0 flex items-center justify-center ${collection.image ? 'hidden' : ''}`}
                          >
                            {collection.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-800">
                          {collection.name}
                        </h3>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-10">No collections available yet. Check back soon!</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="reveal-section" data-section="features">
          <div className="w-full py-16 md:py-20 bg-gradient-to-b from-orange-50 to-white">
            <div className="max-w-5xl mx-auto px-4 text-center">
              <h2
                className={`text-3xl md:text-4xl font-bold mb-3 text-gray-900 transition-all duration-700 ${
                  isVisible.features
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                Why Choose <span className="text-orange-500">Nuturemite</span>
              </h2>
              <p
                className={`text-base text-gray-700 mb-12 max-w-2xl mx-auto transition-all duration-700 delay-300 ${
                  isVisible.features
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                We're committed to bringing you wholesome, healthy snacks that
                are nutritious, delicious and good for your body.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                {features.map((feature, index) => (
                  <div
                    key={feature.id}
                    className={`flex flex-col items-center hover:transform hover:scale-105 transition-all duration-500 ${
                      isVisible.features
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10"
                    }`}
                    style={{ transitionDelay: `${300 + index * 150}ms` }}
                  >
                    <div className="bg-orange-500 rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
                      {feature.icon}
                    </div>
                    <span className="font-medium text-gray-800">
                      {feature.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Products Section */}
        <section
          className="container mx-auto py-12 md:py-16 px-4 reveal-section"
          data-section="products"
        >
          <div
            className={`transition-all duration-700 ${
              isVisible.products
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <ProductCarousel
              title="Our Popular Products"
              subtitle="Discover our best-selling snacks and combos"
              slidesToShow={4}
              autoScroll={true}
              scrollInterval={5000}
            >
              {getProducts.length > 0 ? (
                getProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <>
                  <p>
                    No products available at the moment. Please check back
                    later.
                  </p>
                </>
              )}
            </ProductCarousel>
          </div>
        </section>

        {/* Eat Anytime Section */}
        <section className="w-full bg-[#e9bd0c] py-12 md:py-16">
          <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
            {/* Text Content - Always on the left */}
            <div className="md:w-1/2 mb-8 md:mb-0 text-left">
              <h3 className="text-gray-800 text-lg font-medium mb-2 animate-in slide-in-from-left-5 duration-500">
                YOU HAVE OUR PERMISSION TO
              </h3>
              <h2 className="text-brown-800 text-4xl md:text-5xl font-bold mb-4 animate-in slide-in-from-left-5 duration-700 delay-100">
                Eat Anytime!
              </h2>
              <p className="text-gray-800 max-w-md animate-in slide-in-from-left-5 duration-700 delay-200">
                Its about being mindful and take a balanced approach. We create
                foods which are healthy and full of taste. Which will make you
                forget the taste of junk!
              </p>
            </div>

            {/* Clock Visualization - Always on the right */}
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative w-56 h-56 md:w-64 md:h-64 animate-in fade-in-0 zoom-in-95 duration-1000">
                {/* Clock Face */}
                <div className="absolute inset-0 bg-amber-100 rounded-full shadow-xl"></div>
                <div className="absolute inset-4 border-4 border-amber-200 rounded-full"></div>

                {/* Clock Hands - Animated */}
                <div
                  className="absolute w-1 h-24 bg-amber-600 top-8 left-1/2 -ml-0.5 origin-bottom transform transition-transform"
                  style={{
                    transformOrigin: "bottom center",
                    transform: `translateX(-50%) rotate(${rotation}deg)`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* Combo Products Carousel */}
        <section
          className="container mx-auto py-12 md:py-16 px-4 reveal-section"
          data-section="combos"
        >
          <div
            className={`transition-all duration-700 ${
              isVisible.combos
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <ProductCarousel
              title="Healthy Combos"
              subtitle="Special bundles crafted for your wellness"
              slidesToShow={4}
              autoScroll={true}
              scrollInterval={6000}
            >
              {products
                .filter((p) => p.category.includes("Combo"))
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </ProductCarousel>
          </div>
        </section>

        {/* Blog Carousel */}
        <section
          className="bg-gray-50 py-12 md:py-16 reveal-section"
          data-section="blogs"
        >
          <div
            className={`container mx-auto px-4 transition-all duration-700 ${
              isVisible.blogs
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >            <BlogCarousel
              title="Munch Time Blogs"
              subtitle="Read our latest articles on health, nutrition, and wellness"
              slidesToShow={4}
              autoScroll={true}
              scrollInterval={7000}
            >              {blogsLoading ? (
                // Show loading placeholders
                [...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm h-80">
                    <div className="animate-pulse">
                      <div className="bg-gray-200 dark:bg-gray-700 h-40 rounded-md mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))
              ) : blogs.length > 0 ? (
                // Show fetched blogs
                blogs.map((blog) => (
                  <BlogCard 
                    key={blog._id || blog.id} 
                    blog={{
                      ...blog,
                      // Transform the blog object to match the expected format
                      image: blog.images ? `${backendURL}/blog/${blog.images.split('/').pop()}` : 'https://placehold.co/600x400/orange/white?text=No+Image',
                      date: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      }) : 'Recent',
                      category: blog.tag || 'Article',
                      excerpt: blog.description ? blog.description.substring(0, 100) + '...' : '',
                      slug: blog.slug || `blog-${blog._id}`
                    }} 
                  />
                ))
              ) : (
                // Fallback to static data if no blogs available
                blogPosts.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))
              )}
            </BlogCarousel>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
