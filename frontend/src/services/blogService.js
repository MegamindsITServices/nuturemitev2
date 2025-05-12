import axios from 'axios';
import { backendURL, BLOG_ROUTE } from '../lib/api-client';

// Create API client instance
const apiClient = axios.create({
  baseURL: backendURL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Include credentials for auth
});

export const blogService = {
  // Create a new blog
  addBlog: async (formData) => {
    try {
      const response = await axios.post(`${backendURL}/${BLOG_ROUTE}/add-blog`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error creating blog', error };
    }
  },

  // Get all blogs
  getBlogs: async (filter = {}) => {
    try {
      const queryParams = new URLSearchParams(filter).toString();
      const response = await apiClient.get(`/${BLOG_ROUTE}/get-blog${queryParams ? `?${queryParams}` : ''}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching blogs', error };
    }
  },

  // Get a blog by slug
  getBlogBySlug: async (slug) => {
    try {
      const response = await apiClient.get(`/${BLOG_ROUTE}/get-blog/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error fetching blog', error };
    }
  },

  // Update a blog
  updateBlog: async (id, formData) => {
    try {
      const response = await axios.put(`${backendURL}/${BLOG_ROUTE}/update-blog/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error updating blog', error };
    }
  },

  // Delete a blog
  deleteBlog: async (id) => {
    try {
      const response = await apiClient.delete(`/${BLOG_ROUTE}/delete-blog/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error deleting blog', error };
    }
  }
};
