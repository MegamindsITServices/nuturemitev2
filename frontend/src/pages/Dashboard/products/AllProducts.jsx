import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { axiosInstance, getConfig } from "../../../utils/request";
import {
  GET_PRODUCTS,
  DELETE_PRODUCT,
  GET_PRODUCT_BY_ID,
} from "../../../lib/api-client";
import { toast } from "sonner";
import ProductEditDialog from "../../../components/product/ProductEditDialog";
import { getProductImageUrl } from "../../../utils/imageUtils";

const AllProducts = () => {
  const [getProducts, setGetProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);

  const getAllProducts = async () => {
    setLoading(true);
    try {
      await getConfig();
      const response = await axiosInstance.get(GET_PRODUCTS);
      setGetProducts(response.data.products || response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  // Handle delete product
  const handleDelete = async () => {
    if (!selectedProduct) return;

    setDeleteLoading(true);
    try {
      await getConfig();
      const deleteUrl = DELETE_PRODUCT.replace(":id", selectedProduct._id);
      await axiosInstance.delete(deleteUrl);

      // Update the products list
      setGetProducts((prev) =>
        prev.filter((product) => product._id !== selectedProduct._id)
      );
      toast.success("Product deleted successfully");
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleteLoading(false);
      setSelectedProduct(null);
    }
  };
  const navigate = useNavigate();
  // Open delete confirmation modal
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  }; // Open edit dialog
  const openEditDialog = async (product) => {
    // setLoadingProduct(true);
    navigate(`/admin/edit-product/${product._id}`);
    try {
      // Fetch full product details using the new endpoint
      await getConfig();
      const productUrl = GET_PRODUCT_BY_ID.replace(":id", product._id);
      const response = await axiosInstance.get(productUrl);

      if (response.data.success && response.data.product) {
        setEditProduct(response.data.product);
        setShowEditDialog(true);
      } else {
        // Fallback to using the product data we already have if the API fails
        setEditProduct(product);
        setShowEditDialog(true);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      // Fallback to using the product data we already have if the API fails
      setEditProduct(product);
      setShowEditDialog(true);
    } finally {
      setLoadingProduct(false);
    }
  };

  // Handle update after edit
  const handleProductUpdate = () => {
    getAllProducts(); // Refresh the products list
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">All Products</h1>
          <Link
            to="/dashboard/add-product"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Product
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Image</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Price</th>
                  <th className="py-3 px-4 text-left">Original Price</th>
                  <th className="py-3 px-4 text-left">Collection</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getProducts.length > 0 ? (
                  getProducts.map((product) => (
                    <tr
                      key={product._id || product.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={getProductImageUrl(product.images[0])}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="py-3 px-4">₹{product.price}</td>
                      <td className="py-3 px-4">₹{product.originalPrice}</td>
                      <td className="py-3 px-4">
                        {product.collection?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        {" "}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditDialog(product)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                            title="Edit Product"
                            disabled={loadingProduct}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            title="Delete Product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="mr-2" />
              <h3 className="text-xl font-semibold">Delete Product</h3>
            </div>
            <p className="mb-6">
              Are you sure you want to delete "{selectedProduct?.name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>{" "}
          </div>
        </div>
      )}

      {/* Product Edit Dialog */}
      <ProductEditDialog
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditProduct(null);
        }}
        product={editProduct}
        onUpdate={handleProductUpdate}
      />
    </div>
  );
};

export default AllProducts;
