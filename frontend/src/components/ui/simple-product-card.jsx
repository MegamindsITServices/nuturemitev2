import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Button } from "./button";

// Create a simpler version of the product card that links to the product detail page
const ProductCard = ({ product }) => {
  // Format price as currency
  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-full transition-all duration-300">
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block">
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={product.image || '/images/products/placeholder.jpg'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount}% Off
            </span>
          )}
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
        <Link to={`/product/${product._id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Ratings */}
        <div className="flex items-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14}
                className={i < Math.floor(product.rating || 0) 
                  ? "text-amber-400 fill-amber-400" 
                  : "text-gray-300"
                }
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">
            ({product.numReviews || 0})
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="ml-2 text-sm text-gray-500 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="p-3 flex border-t border-gray-100">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} /> Add to Cart
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2"
        >
          <Heart size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
