import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { axiosInstance, getConfig } from "../../utils/request";
import { ADD_COLLECTION, GET_COLLECTION } from "../../lib/api-client";
import { toast } from "sonner";

const AddCollectionDialog = ({ open, onOpenChange, onCollectionAdded }) => {
  const [collectionName, setCollectionName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collectionName.trim()) {
      setError("Collection name is required");
      return;
    }
    try {
      setIsSubmitting(true);
      setError("");
      await getConfig();
      const res = await axiosInstance.post(ADD_COLLECTION, {
        name: collectionName,
      });

      if (res.status === 201) {
        setCollectionName("");
        toast.success("Collection created successfully!");
        onOpenChange(false);
        if (onCollectionAdded) {
          onCollectionAdded();
        }
      }
    } catch (err) {
      console.error("Error creating collection:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create collection. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-0 rounded-lg shadow-lg">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Create New Collection
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Add a new collection to your store
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Collection Name
            </label>
            <Input
              id="name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="Enter collection name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>          <DialogFooter className="pt-4 flex justify-end gap-2 border-t mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCollectionDialog;
