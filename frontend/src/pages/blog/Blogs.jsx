import React, { useState, useEffect } from "react";
import BlogCard from "../../components/ui/blog-card";
import BlogCarousel from "../../components/ui/blog-carousel";
import { blogPosts } from "../../data/blogs";
import { axiosInstance } from "../../utils/request";
import { GET_BLOGS, backendURL } from "../../lib/api-client";
import { Skeleton } from "../../components/ui/skeleton";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(GET_BLOGS);

        if (response.data && response.data.success) {
          setBlogs(response.data.blogs);
        } else {
          // Fallback to static data if API doesn't return success
          console.warn("API didn't return blogs, falling back to static data");
          setBlogs(blogPosts);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setError("Failed to load blogs");
        // Fallback to static data on error
        setBlogs(blogPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <>
      <h1 className="h-full w-full flex justify-center items-center font-bold text-4xl mt-10">
        Blogs
      </h1>
      <section className="py-16">
        <div className="container mx-auto">
          {loading ? (
            // Loading skeleton
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <Skeleton className="h-8 w-64 mx-auto" />
                <Skeleton className="h-4 w-96 mx-auto" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            // Error state
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                {error}
              </h2>
              <p className="mb-6">
                We're showing you some of our featured blogs instead.
              </p>
              <BlogCarousel
                title="Munch Time Blogs"
                subtitle="Read our latest articles on health, nutrition, and wellness"
                slidesToShow={4}
                autoScroll={true}
                scrollInterval={7000}
              >
                {blogPosts.map((blog) => (
                  <BlogCard key={blog.id} blog={blog} />
                ))}
              </BlogCarousel>
            </div>
          ) : blogs.length > 0 ? (
            // Successfully fetched blogs
            <BlogCarousel
              title="Munch Time Blogs"
              subtitle="Read our latest articles on health, nutrition, and wellness"
              slidesToShow={4}
              autoScroll={true}
              scrollInterval={7000}
            >
              {blogs.map((blog) => (
                <BlogCard
                  key={blog._id || blog.id}
                  blog={{
                    ...blog,
                    // Transform backend blog format to match BlogCard component format
                    image: blog.images
                      ? `${backendURL}/blog/${blog.images.split("/").pop()}`
                      : "https://placehold.co/600x400/orange/white?text=No+Image",
                    date:
                      blog.createdAt &&
                      new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }),
                    category: blog.tag || "Article",
                    excerpt:
                      blog.description &&
                      (blog.description.substring(0, 100) + "..."),
                    slug: blog.slug || `blog-${blog._id}`,
                  }}
                />
              ))}
            </BlogCarousel>
          ) : (
            // No blogs found, show static content as fallback
            <BlogCarousel
              title="Munch Time Blogs"
              subtitle="Read our latest articles on health, nutrition, and wellness"
              slidesToShow={4}
              autoScroll={true}
              scrollInterval={7000}
            >
              {blogPosts.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </BlogCarousel>
          )}
        </div>
      </section>
    </>
  );
};

export default Blogs;
