import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance, getConfig } from "../../../utils/request";
import { DELETE_COLLECTION, GET_COLLECTION, UPDATE_COLLECTION } from "../../../lib/api-client";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AddCollectionDialog from "../../../components/forms/AddCollectionDialog";
import UpdateCollectionDialog from "../../../components/forms/UpdateCollectionDialog";
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
const ViewCollections = () => {
  const navigateTo = useNavigate();
  const [collections, setCollections] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCollections = async () => {
    try {
      await getConfig();
      const res = await axiosInstance.get(GET_COLLECTION);
      if (res.status === 200) {
        setCollections(res.data.collections);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Filter collections based on search query
  const filteredCollections = searchQuery
    ? collections.filter((collection) =>
        collection.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : collections;
  const handleUpdateClick = (collection) => {
    setSelectedCollection(collection);
    setUpdateDialogOpen(true);
  };
  const handleDeleteClick = (collection) => {
    setSelectedCollection(collection);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCollection = async () => {
    if (!selectedCollection) return;    try {
      setIsLoading(true);
      await getConfig();
      // Replace :id placeholder in the endpoint with the actual ID
      const endpoint = DELETE_COLLECTION.replace(':id', selectedCollection._id);
      const res = await axiosInstance.delete(endpoint);

      if (res.status === 200) {
        toast.success("Collection deleted successfully");
        fetchCollections();
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete collection"
      );
    } finally {
      setDeleteDialogOpen(false);
      setIsLoading(false);
    }
  };
  const handleUpdateCollection = async (updatedData) => {
    if (!selectedCollection) return;    try {
      setIsLoading(true);
      await getConfig();
      const endpoint = UPDATE_COLLECTION.replace(':id', selectedCollection._id);
      const res = await axiosInstance.put(
        endpoint,
        updatedData
      );

      if (res.status === 200) {
        toast.success("Collection updated successfully");
        fetchCollections();
        setUpdateDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error(
        error.response?.data?.message || "Failed to update collection"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <div className="w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Input
              type="text"
              placeholder="Search by collection name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-2 rounded-md shadow-sm transition-colors duration-200"
              onClick={() => setAddDialogOpen(true)}
              disabled={isLoading}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableCaption className="text-gray-500 mt-4">
              A list of your collections.
            </TableCaption>
            <TableHeader className="bg-gray-50 border-b">
              <TableRow>
                <TableHead className="w-[100px] py-3 text-gray-700 font-semibold">
                  Collections ID
                </TableHead>
                <TableHead className="py-3 text-gray-700 font-semibold">
                  Collections Name
                </TableHead>
                <TableHead className="py-3 text-gray-700 font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.map((collection) => (
                <TableRow
                  key={collection._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="text-gray-600 py-3">
                    {collection._id}
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 py-3">
                    {collection.name}
                  </TableCell>
                  <TableCell className="py-3">
                    <div className="flex space-x-2">
                      <button
                        className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => handleUpdateClick(collection)}
                        disabled={isLoading}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors"
                        onClick={() => handleDeleteClick(collection)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCollections.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-4 text-gray-500"
                  >
                    {searchQuery
                      ? "No collections found matching your search"
                      : "No collections available"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-gray-50">
                <TableCell colSpan={3} className="font-medium text-gray-700">
                  Total collections
                </TableCell>
                <TableCell className="text-right font-semibold text-gray-800">
                  {filteredCollections.length}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      {/* Add Collection Dialog */}
      <AddCollectionDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCollectionAdded={fetchCollections}
      />

      {/* Update Collection Dialog */}
      {selectedCollection && (
        <UpdateCollectionDialog
          open={updateDialogOpen}
          onOpenChange={setUpdateDialogOpen}
          collection={selectedCollection}
          onUpdateCollection={handleUpdateCollection}
        />
      )}      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white rounded-lg border-0 shadow-lg max-w-md">
          <AlertDialogHeader className="border-b pb-4">
            <AlertDialogTitle className="text-xl font-semibold text-gray-800">Delete Collection</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 mt-2">
              Are you sure you want to delete the collection "
              <span className="font-medium">{selectedCollection?.name}</span>"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end gap-2 pt-4 border-t mt-4">
            <AlertDialogCancel 
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollection}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewCollections;
