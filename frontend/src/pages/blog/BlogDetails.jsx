import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Tag, Share2, MessageCircle } from 'lucide-react';
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

  // Social share functions
  const shareOnSocial = (platform) => {
    if (!blog) return;
    
    const currentUrl = window.location.href;
    const title = blog.title;
    const description = blog.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        // Twitter properly handles URLs without extra encoding in the text parameter
        const twitterText = `${title} ${currentUrl}`;
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard instead
        const instagramText = `${title}\n\n${currentUrl}`;
        navigator.clipboard.writeText(instagramText).then(() => {
          alert('Link copied to clipboard! You can now paste it in your Instagram story or bio.');
        }).catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = instagramText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Link copied to clipboard! You can now paste it in your Instagram story or bio.');
        });
        return;
      case 'whatsapp':
        // WhatsApp format: separate title and URL with line break for better formatting
        const whatsappText = `${title}\n\n${currentUrl}`;
        shareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
        break;
      default:
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
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
            
            <div className="flex flex-wrap justify-center items-center gap-4 text-gray-600 dark:text-gray-400 text-sm mb-6">
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

            {/* Social Share Section */}
            <motion.div
              className="flex flex-col items-center space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <Share2 size={20} className="mr-2" />
                <span className="font-medium">Share this post</span>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                {/* Twitter */}
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="flex items-center px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                  aria-label="Share on Twitter"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>

                {/* Facebook */}
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                  aria-label="Share on Facebook"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>

                {/* Instagram */}
                <button
                  onClick={() => shareOnSocial('instagram')}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  aria-label="Share on Instagram"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => shareOnSocial('whatsapp')}
                  className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </button>
              </div>
            </motion.div>
          </header>
          
          {/* Blog Image */}
          {blog.images && (
            <motion.div
              className="rounded-lg overflow-hidden mb-8 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
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
            transition={{ delay: 0.5 }}
            dangerouslySetInnerHTML={{ __html: blog.description.replace(/\\n/g, '<br />') }}
          />
          
          {/* Videos */}
          {blog.videos && blog.videos.length > 0 && (
            <motion.div
              className="mt-8 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
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

          {/* Bottom Share Section */}
          <motion.div
            className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Enjoyed this post? Share it with your network!
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="px-6 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full transition-colors duration-200"
                >
                  Share on Twitter
                </button>
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
                >
                  Share on Facebook
                </button>
                <button
                  onClick={() => shareOnSocial('whatsapp')}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200"
                >
                  Share on WhatsApp
                </button>
              </div>
            </div>
          </motion.div>
        </motion.article>
      ) : null}
    </div>
  );
};

export default BlogDetails;