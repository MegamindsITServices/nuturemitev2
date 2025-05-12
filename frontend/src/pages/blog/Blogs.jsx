import BlogCard from "../../components/ui/blog-card";
import BlogCarousel from "../../components/ui/blog-carousel";
import { blogPosts } from "../../data/blogs";
import React from "react";

const Blogs = () => {
  return (
    <>
   <h1 className="h-full w-full flex justify-center items-center font-bold text-4xl  mt-10">
        Blogs
      </h1>
      <section className="py-16">
        <div className="container mx-auto">
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
      </section>
    </>
  );
};

export default Blogs;
