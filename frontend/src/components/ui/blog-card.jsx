import React from 'react';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { backendURL } from '../../lib/api-client';

const BlogCard = ({ blog }) => {
  return (
    <div className="group w-[20vw] flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden h-full hover:shadow-lg transition-all duration-300">
      {/* Blog Image with Hover Effect */}
      <Link to={`/blog/${blog.slug}`} className="block overflow-hidden">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      
      {/* Blog Category Badge */}
      <div className="px-4 pt-4">
        <div className="inline-block bg-orange-100 text-orange-700 text-xs font-medium px-2.5 py-1 rounded">
          {blog.category}
        </div>
      </div>
      
      {/* Blog Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title */}
        <Link 
          to={`/blog/${blog.slug}`}
          className="text-gray-900 font-semibold text-lg mb-2 line-clamp-2 hover:text-orange-600 transition-colors"
        >
          {blog.title}
        </Link>
        
        {/* Excerpt */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {blog.excerpt}
        </p>
        
        {/* Meta Information */}
        <div className="flex items-center text-xs text-gray-500 mt-auto space-x-4">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{blog.date}</span>
          </div>
          <div className="flex items-center">
            <Clock size={14} className="mr-1" />
            <span>{blog.readTime}</span>
          </div>
        </div>
      </div>
      
      {/* Read More Link */}
      <div className="px-4 pb-4 mt-auto">
        <Link 
          to={`/blog/${blog.slug}`}
          className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-800 transition-colors"
        >
          Read More 
          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;
