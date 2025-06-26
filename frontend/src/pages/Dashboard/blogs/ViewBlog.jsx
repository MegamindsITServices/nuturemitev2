import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { toast } from "sonner";
import { blogService } from "../../../services/blogService";
import UpdateBlog from "./UpdateBlog";
import { backendURL } from "../../../lib/api-client";

const ViewBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch all blogs when component mounts
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogService.getBlogs();
      setBlogs(response.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle update dialog
  const handleUpdateClick = (blog) => {
    setSelectedBlog(blog);
    setUpdateDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  // Delete blog
  const confirmDelete = async () => {
    try {
      await blogService.deleteBlog(deleteId);
      toast.success("Blog deleted successfully");
      // Refresh blog list
      fetchBlogs();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  // Handle successful update
  const handleUpdateSuccess = () => {
    fetchBlogs();
    setUpdateDialogOpen(false);
  };

  // Table animation variants
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Manage Blogs</h1>
        <p className="text-gray-500">View, update, and delete blog posts</p>
      </motion.div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto"
        >
          {blogs.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first blog post
              </p>
              <Button
                onClick={() => (window.location.href = "/dashboard/blogs/add")}
              >
                Create New Blog
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Read Time</TableHead>
                  <TableHead>Videos</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {blogs.map((blog) => (
                    <motion.tr
                      key={blog._id}
                      variants={rowVariants}
                      exit={{ opacity: 0, y: -10 }}
                      className="border-b dark:border-gray-700"
                    >
                      <TableCell className="font-medium">
                        {blog.title}
                      </TableCell>
                      <TableCell>{blog.tag}</TableCell>                      <TableCell>
                        {blog.images ? (
                          <img
                            src={`${backendURL}/blog/${blog.images.split('/').pop()}`}
                            alt={blog.title}
                            className="h-16 w-24 object-cover rounded"
                          />
                        ) : (
                          "No image"
                        )}
                      </TableCell>
                      <TableCell>{blog.readTime}</TableCell>
                      <TableCell>
                        {blog.videos && blog.videos.length > 0
                          ? `${blog.videos.length} video${
                              blog.videos.length > 1 ? "s" : ""
                            }`
                          : "No videos"}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateClick(blog)}
                          >
                            Update
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className={"bg-red-500 hover:bg-red-600"}
                            onClick={() => handleDeleteClick(blog._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </motion.div>
      )}      {/* Update Blog Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle>Update Blog</DialogTitle>
          </DialogHeader>
          {selectedBlog && (
            <UpdateBlog blog={selectedBlog} onSuccess={handleUpdateSuccess} />
          )}
        </DialogContent>
      </Dialog>      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              blog post and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewBlog;
