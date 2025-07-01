import React, { useState, useEffect } from "react";
import { axiosInstance, getConfig } from "../../../utils/request";
import {
  DELETE_PROFILE,
  GET_ADMINS,
  UPDATE_ADMIN,
} from "../../../lib/api-client";
import {
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

const ViewAllAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      await getConfig();
      const response = await axiosInstance.post(GET_ADMINS);

      if (response.data.success) {
        setAdmins(response.data.admins || []);
      } else {
        setError("Failed to fetch admins");
        toast.error("Failed to load admin data");
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("An error occurred while fetching admins");
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Handle opening edit modal
  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      email: admin.email || "",
      phone: admin.phone || "",
      address: admin.address || "",
    });
    setDialogOpen(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission for updating admin
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      toast.error("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setUpdateLoading(true);

    try {
      await getConfig();
      const response = await axiosInstance.put(
        `${UPDATE_ADMIN}/${selectedAdmin._id}`,
        formData
      );

      if (response.data.success) {
        toast.success("Admin updated successfully");
        setDialogOpen(false);
        fetchAdmins(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to update admin");
      }
    } catch (error) {
      console.error("Error updating admin:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while updating admin"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle toggling admin status (block/unblock)
  const toggleAdminStatus = async (admin) => {
    try {
      await getConfig();
      const response = await axiosInstance.put(`${UPDATE_ADMIN}/${admin._id}`, {
        isBlocked: !admin.isBlocked,
      });

      if (response.data.success) {
        toast.success(
          `Admin ${admin.isBlocked ? "unblocked" : "blocked"} successfully`
        );
        fetchAdmins(); // Refresh the list
      } else {
        toast.error(
          response.data.message ||
            `Failed to ${admin.isBlocked ? "unblock" : "block"} admin`
        );
      }
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error(
        error.response?.data?.message ||
          `An error occurred while ${
            admin.isBlocked ? "unblocking" : "blocking"
          } admin`
      );
    }
  };

  // Handle deleting an admin
  const deleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) {
      return;
    }
    try {
      await getConfig();
      const response = await axiosInstance.delete(
        `${DELETE_PROFILE}/${adminId}`
      );
      if (response.data.success) {
        toast.success("Admin deleted successfully");
        fetchAdmins(); // Refresh the list
      } else {
        toast.error(response.data.message || "Failed to delete admin");
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast.error(
        error.response?.data?.message ||
          "An error occurred while deleting admin"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg flex items-start gap-2">
        <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-red-800">Error Loading Data</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        <Button asChild>
          <a
            href="/admin/add-admin"
            className="bg-red-400 hover:bg-red-500 text-white"
          >
            Add New Admin
          </a>
        </Button>
      </div>

      {admins.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="h-12 w-12 mx-auto text-gray-400" />
          <h2 className="mt-4 text-lg font-medium text-gray-900">
            No Admins Found
          </h2>
          <p className="mt-2 text-gray-500">
            No admin accounts have been created yet.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Admin
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contact
                  </th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th> */}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className={admin.isBlocked ? "bg-gray-100" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {admin.image ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={`https://api.nuturemite.info/profile/${admin.image}`}
                              alt={`${admin.firstName} ${admin.lastName}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.firstName} {admin.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {admin.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2" />
                          {admin.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate max-w-xs">
                            {admin.address}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        admin.isBlocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {admin.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEdit(admin)}
                          variant="outline"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4 mr-1" /> Update
                        </Button>
                        <Button
                          onClick={() => deleteAdmin(admin._id)}
                          variant="outline"
                          size="sm"
                          className={"text-red-600 hover:text-red-800"}
                        >
                          <X className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Update Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Update Admin Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="1234567890"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="123 Admin Street, City"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-400 hover:bg-red-500 text-white"
                disabled={updateLoading}
              >
                {updateLoading ? "Updating..." : "Update Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewAllAdmins;
