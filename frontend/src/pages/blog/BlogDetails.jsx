import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import { blogService } from '../../services/blogService';
import { backendURL } from '../../lib/api-client';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';

const BlogDetails = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await blogService.getBlogBySlug(slug);
        if (response && response.success && response.blog) {
          setBlog(response.blog);
        } else {
          setError('Blog not found');
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to fetch blog details');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-orange-600 mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <div className="flex justify-center space-x-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-96 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error}
          </h2>
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the blog post you're looking for.
          </p>
          <Button asChild>
            <Link to="/">
              Return Home
            </Link>
          </Button>
        </div>
      ) : blog ? (
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Blog Header */}
          <header className="text-center mb-8">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
            >
              {blog.title}
            </motion.h1>
            
            <div className="flex flex-wrap justify-center items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
              <div className="flex items-center">
                <Tag size={16} className="mr-1" />
                <span>{blog.tag || 'General'}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock size={16} className="mr-1" />
                <span>{blog.readTime}</span>
              </div>
            </div>
          </header>
          
          {/* Blog Image */}
          {blog.images && (
            <motion.div
              className="rounded-lg overflow-hidden mb-8 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img
                src={`${backendURL}/blog/${blog.images.split('/').pop()}`}
                alt={blog.title}
                className="w-full object-cover h-[300px] md:h-[400px]"
              />
            </motion.div>
          )}
          
          {/* Blog Content */}
          <motion.div
            className="prose dark:prose-invert lg:prose-lg max-w-none"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            dangerouslySetInnerHTML={{ __html: blog.description.replace(/\\n/g, '<br />') }}
          />
          
          {/* Videos */}
          {blog.videos && blog.videos.length > 0 && (
            <motion.div
              className="mt-8 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-4">Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blog.videos.map((videoPath, index) => (
                  <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                    <video
                      controls
                      src={`${backendURL}/blogVideos/${videoPath.split('/').pop()}`}
                      className="w-full"
                      poster={blog.images ? `${backendURL}/blog/${blog.images.split('/').pop()}` : ''}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.article>
      ) : null}
    </div>
  );
};

export default BlogDetails;
