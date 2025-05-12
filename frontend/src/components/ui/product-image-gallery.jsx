import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share } from "lucide-react";
import { Button } from "./button";
import { backendURL } from "../../lib/api-client";

const ProductImageGallery = ({ images, productName }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="order-2 md:order-1 md:w-1/6 flex md:flex-col gap-3 mt-4 md:mt-0">
        {images.map((image, index) => (
          <motion.div
            key={index}
            className={`cursor-pointer border rounded-md overflow-hidden transition-all ${
              selectedImage === index ? "border-primary ring-2 ring-primary/30" : "border-gray-200"
            }`}
            onClick={() => setSelectedImage(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >            <img
              src={`${backendURL}/image/${image}`}
              alt={`${productName} - thumbnail ${index + 1}`}
              className="w-20 h-20 object-cover"
            />
          </motion.div>
        ))}
      </div>

      {/* Main Image */}
      <div className="order-1 md:order-2 md:w-5/6 relative rounded-lg overflow-hidden border border-gray-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-square bg-gray-50"
          >            <img
              src={`${backendURL}/image/${images[selectedImage]}`}
              alt={productName}
              className="w-full h-full object-contain"
            />
          </motion.div>
        </AnimatePresence>

        {/* Share button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 right-4 rounded-full bg-white shadow-sm hover:bg-gray-100 focus:ring-primary"
        >
          <Share className="h-5 w-5 text-gray-700" />
        </Button>
      </div>
    </div>
  );
};

export default ProductImageGallery;
