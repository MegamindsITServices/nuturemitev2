import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { Button } from "./button";
import { getProductImageUrl } from "../../utils/imageUtils";

const ProductImageGallery = ({ images, videos, productName }) => {
  const [selectedMedia, setSelectedMedia] = useState({
    type: "image",
    index: 0,
  });
  const [activeTab, setActiveTab] = useState("images");

  const hasImages = images && images.length > 0;
  const hasVideos = videos && videos.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Media tabs */}
      {hasVideos && (
        <div className="flex border-b border-gray-200">
          <Button
            variant={activeTab === "images" ? "default" : "ghost"}
            onClick={() => {
              setActiveTab("images");
              setSelectedMedia({ type: "image", index: 0 });
            }}
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent transition-colors"
            style={{
              borderBottomColor:
                activeTab === "images" ? "currentColor" : "transparent",
            }}
          >
            <ImageIcon size={16} />
            <span>Images</span>
          </Button>
          <Button
            variant={activeTab === "videos" ? "default" : "ghost"}
            onClick={() => {
              setActiveTab("videos");
              if (hasVideos) {
                setSelectedMedia({ type: "video", index: 0 });
              }
            }}
            className="flex items-center gap-2 rounded-none border-b-2 border-transparent transition-colors"
            style={{
              borderBottomColor:
                activeTab === "videos" ? "currentColor" : "transparent",
            }}
          >
            <VideoIcon size={16} />
            <span>Videos</span>
          </Button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Thumbnails */}
        {activeTab === "images" && hasImages && (
          <div className="order-2 md:order-1 md:w-1/6 flex md:flex-col gap-3 mt-4 md:mt-0">
            {images.map((image, index) => (
              <motion.div
                key={`image-${index}`}
                className={`cursor-pointer border rounded-md overflow-hidden transition-all ${
                  selectedMedia.type === "image" &&
                  selectedMedia.index === index
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedMedia({ type: "image", index })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={getProductImageUrl(image)}
                  alt={`${productName} - thumbnail ${index + 1}`}
                  className="w-20 h-20 object-cover"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Video thumbnails */}
        {activeTab === "videos" && hasVideos && (
          <div className="order-2 md:order-1 md:w-1/6 flex md:flex-col gap-3 mt-4 md:mt-0">
            {videos.map((video, index) => (
              <motion.div
                key={`video-${index}`}
                className={`cursor-pointer border rounded-md overflow-hidden transition-all ${
                  selectedMedia.type === "video" &&
                  selectedMedia.index === index
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedMedia({ type: "video", index })}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-20 h-20 flex items-center justify-center bg-gray-100">
                  <VideoIcon size={24} className="text-gray-500" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Media Display */}
        <div className="order-1 md:order-2 md:w-5/6 relative rounded-lg overflow-hidden border border-gray-200">
          <AnimatePresence mode="wait">
            {selectedMedia.type === "image" && hasImages ? (
              <motion.div
                key={`main-image-${selectedMedia.index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square bg-gray-50"
              >
                <img
                  src={getProductImageUrl(images[selectedMedia.index])}
                  alt={productName}
                  className="w-full h-full object-contain"
                />
              </motion.div>
            ) : selectedMedia.type === "video" && hasVideos ? (
              <motion.div
                key={`main-video-${selectedMedia.index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-square bg-black"
              >
                <video
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  onError={(e) => {
                    console.log("Video error, trying fallback source");
                    // If the first source fails, try the fallback
                    e.target.src = `${backendURL}/videos/${
                      videos[selectedMedia.index]
                    }`;
                  }}
                >
                  <source
                    src={`${backendURL}/video/${videos[selectedMedia.index]}`}
                    type="video/mp4"
                  />
                  <source
                    src={`${backendURL}/videos/${videos[selectedMedia.index]}`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </motion.div>
            ) : (
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500">No media available</p>
              </div>
            )}
          </AnimatePresence>

          {/* Share button */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 rounded-full bg-white shadow-sm hover:bg-gray-100 focus:ring-primary"
          >
            {" "}
            <Share className="h-5 w-5 text-gray-700" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductImageGallery;
