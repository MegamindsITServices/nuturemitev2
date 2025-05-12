import { collections } from "../../data/collection";
import React, { useState } from "react";

const Collections = () => {
     const [hoveredId, setHoveredId] = useState(null);
  return (
    <div className="w-full py-8 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-10">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="flex flex-col items-center transition-all duration-300 relative"
              onMouseEnter={() => console.log(collection.title)}
              onMouseLeave={() => console.log("Mouse left")}
            >
              <div
                className={`rounded-full w-32 h-32 ${
                  collection.bgColor
                } flex item-center justify-center relative overflow-hidden transition-transform duration-300 ${
                  hoveredId === collection.id ? "transform scale-110" : ""
                }`}
              >
                {hoveredId === collection.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    {collection.items.map((item, index) => (
                      <span
                        key={index}
                        className={`absolute text-xs text-white font-medium ${item.position} `}
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                )}
                <img src={collection.image} alt={collection.title} className="object-cover " />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-800">
                {collection.title}
              </h3>
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collections;
