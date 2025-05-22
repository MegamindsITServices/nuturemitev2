import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const ProductSpecifications = ({ product }) => {
  const [activeTab, setActiveTab] = useState("details");
  
  // Helper function to check if section has data
  const hasShortDescription = product?.shortDescription?.length > 0 && Object.values(product?.shortDescription[0]).some(val => val);
  const hasNutritionInfo = product?.nutritionInfo?.length > 0 && Object.values(product?.nutritionInfo[0]).some(val => val);
  const hasImportantInfo = product?.importantInformation?.length > 0 && Object.values(product?.importantInformation[0]).some(val => val);
  const hasMeasurements = product?.measurements?.length > 0 && 
    ((product?.measurements[0]?.withoutPackaging?.length > 0 && 
      Object.values(product?.measurements[0]?.withoutPackaging[0]).some(val => val)) || 
     (product?.measurements[0]?.withPackaging?.length > 0 && 
      Object.values(product?.measurements[0]?.withPackaging[0]).some(val => val)));
      
  // Check if the product is vegetarian
  const isVegetarian = product?.shortDescription?.[0]?.dietType?.toLowerCase().includes('veg');

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-2xl font-bold mb-6">Product Information</h2>
      
      {/* Product Tabs */}
      <div className="flex flex-col space-y-4">
        {/* Item Details Tab */}
        {hasShortDescription && (
          <div className="border border-gray-200 rounded-md overflow-hidden">            <button 
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              onClick={() => setActiveTab(activeTab === "details" ? null : "details")}
            >
              <span className="font-semibold text-lg">Item details</span>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2 text-sm">{activeTab === "details" ? "See less" : "See more"}</span>
                {activeTab === "details" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>
            
            {activeTab === "details" && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                  {product?.shortDescription[0]?.brand && (
                    <div className="flex">
                      <span className="font-semibold w-40">Brand</span>
                      <span>{product.shortDescription[0].brand}</span>
                    </div>
                  )}
                  
                  {product?.shortDescription[0]?.category && (
                    <div className="flex">
                      <span className="font-semibold w-40">Variety</span>
                      <span>{product.shortDescription[0].category}</span>
                    </div>
                  )}
                  
                  {product?.shortDescription[0]?.itemWeight && (
                    <div className="flex">
                      <span className="font-semibold w-40">Item Weight</span>
                      <span>{product.shortDescription[0].itemWeight}</span>
                    </div>
                  )}
                  
                  {product?.shortDescription[0]?.dietType && (
                    <div className="flex">
                      <span className="font-semibold w-40">Diet Type</span>
                      <span>{product.shortDescription[0].dietType}</span>
                    </div>
                  )}
                  
                  {product?.shortDescription[0]?.totalItems && (
                    <div className="flex">
                      <span className="font-semibold w-40">Number of Items</span>
                      <span>{product.shortDescription[0].totalItems}</span>
                    </div>
                  )}
                  
                  {product?.shortDescription[0]?.flavor && (
                    <div className="flex">
                      <span className="font-semibold w-40">Flavour</span>
                      <span>{product.shortDescription[0].flavor}</span>
                    </div>
                  )}
                  
                  {product?.shortDescription[0]?.packagingType && (
                    <div className="flex">
                      <span className="font-semibold w-40">Packaging Type</span>
                      <span>{product.shortDescription[0].packagingType}</span>
                    </div>
                  )}
                </div>
                  {product?.keyFeatures && (
                  <div className="mt-6">
                    {isVegetarian && (
                      <div className="flex items-center mt-4">
                        <div className="inline-block border border-green-600 p-1 rounded-sm">
                          <div className="w-5 h-5 bg-green-600 rounded-full"></div>
                        </div>
                        <p className="ml-2">This is a <span className="font-semibold">Vegetarian</span> product.</p>
                      </div>
                    )}
                      <div className="mt-6">
                      <h3 className="text-xl font-bold mb-4">About this item</h3>
                      <ul className="list-disc list-outside ml-5 space-y-2">
                        {product.keyFeatures.split('\n').filter(item => item.trim()).map((feature, index) => (
                          <li key={index} className="text-gray-700">{feature.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Measurements Tab */}
        {hasMeasurements && (
          <div className="border border-gray-200 rounded-md overflow-hidden">            <button 
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              onClick={() => setActiveTab(activeTab === "measurements" ? null : "measurements")}
            >
              <span className="font-semibold text-lg">Measurements</span>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2 text-sm">{activeTab === "measurements" ? "See less" : "See more"}</span>
                {activeTab === "measurements" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>
            
            {activeTab === "measurements" && (
              <div className="p-4 bg-white">
                {product?.measurements[0]?.withoutPackaging?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Without Packaging:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      {product.measurements[0].withoutPackaging[0]?.height && (
                        <div className="flex">
                          <span className="font-medium w-40">Height</span>
                          <span>{product.measurements[0].withoutPackaging[0].height}</span>
                        </div>
                      )}
                      {product.measurements[0].withoutPackaging[0]?.width && (
                        <div className="flex">
                          <span className="font-medium w-40">Width</span>
                          <span>{product.measurements[0].withoutPackaging[0].width}</span>
                        </div>
                      )}
                      {product.measurements[0].withoutPackaging[0]?.length && (
                        <div className="flex">
                          <span className="font-medium w-40">Length</span>
                          <span>{product.measurements[0].withoutPackaging[0].length}</span>
                        </div>
                      )}
                      {product.measurements[0].withoutPackaging[0]?.weight && (
                        <div className="flex">
                          <span className="font-medium w-40">Weight</span>
                          <span>{product.measurements[0].withoutPackaging[0].weight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {product?.measurements[0]?.withPackaging?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">With Packaging:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                      {product.measurements[0].withPackaging[0]?.height && (
                        <div className="flex">
                          <span className="font-medium w-40">Height</span>
                          <span>{product.measurements[0].withPackaging[0].height}</span>
                        </div>
                      )}
                      {product.measurements[0].withPackaging[0]?.width && (
                        <div className="flex">
                          <span className="font-medium w-40">Width</span>
                          <span>{product.measurements[0].withPackaging[0].width}</span>
                        </div>
                      )}
                      {product.measurements[0].withPackaging[0]?.length && (
                        <div className="flex">
                          <span className="font-medium w-40">Length</span>
                          <span>{product.measurements[0].withPackaging[0].length}</span>
                        </div>
                      )}
                      {product.measurements[0].withPackaging[0]?.weight && (
                        <div className="flex">
                          <span className="font-medium w-40">Weight</span>
                          <span>{product.measurements[0].withPackaging[0].weight}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Nutrition Information Tab */}
        {hasNutritionInfo && (
          <div className="border border-gray-200 rounded-md overflow-hidden">            <button 
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              onClick={() => setActiveTab(activeTab === "nutrition" ? null : "nutrition")}
            >
              <span className="font-semibold text-lg">Nutrition Information</span>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2 text-sm">{activeTab === "nutrition" ? "See less" : "See more"}</span>
                {activeTab === "nutrition" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>
            
            {activeTab === "nutrition" && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
                  {product?.nutritionInfo[0]?.protien && (
                    <div className="flex">
                      <span className="font-semibold w-40">Protein</span>
                      <span>{product.nutritionInfo[0].protien}</span>
                    </div>
                  )}
                  
                  {product?.nutritionInfo[0]?.fat && (
                    <div className="flex">
                      <span className="font-semibold w-40">Fat</span>
                      <span>{product.nutritionInfo[0].fat}</span>
                    </div>
                  )}
                  
                  {product?.nutritionInfo[0]?.carbohydrates && (
                    <div className="flex">
                      <span className="font-semibold w-40">Carbohydrates</span>
                      <span>{product.nutritionInfo[0].carbohydrates}</span>
                    </div>
                  )}
                  
                  {product?.nutritionInfo[0]?.iron && (
                    <div className="flex">
                      <span className="font-semibold w-40">Iron</span>
                      <span>{product.nutritionInfo[0].iron}</span>
                    </div>
                  )}
                  
                  {product?.nutritionInfo[0]?.calcium && (
                    <div className="flex">
                      <span className="font-semibold w-40">Calcium</span>
                      <span>{product.nutritionInfo[0].calcium}</span>
                    </div>
                  )}
                  
                  {product?.nutritionInfo[0]?.vitamin && (
                    <div className="flex">
                      <span className="font-semibold w-40">Vitamins</span>
                      <span>{product.nutritionInfo[0].vitamin}</span>
                    </div>
                  )}
                  
                  {product?.nutritionInfo[0]?.Energy && (
                    <div className="flex">
                      <span className="font-semibold w-40">Energy</span>
                      <span>{product.nutritionInfo[0].Energy}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Important Information Tab */}
        {hasImportantInfo && (
          <div className="border border-gray-200 rounded-md overflow-hidden">            <button 
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              onClick={() => setActiveTab(activeTab === "important" ? null : "important")}
            >
              <span className="font-semibold text-lg">Important information</span>
              <div className="flex items-center">
                <span className="text-blue-600 mr-2 text-sm">{activeTab === "important" ? "See less" : "See more"}</span>
                {activeTab === "important" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>
            
            {activeTab === "important" && (
              <div className="p-4 bg-white">
                {product?.importantInformation[0]?.ingredients && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">Ingredients:</h4>
                    <p>{product.importantInformation[0].ingredients}</p>
                  </div>
                )}
                  {product?.importantInformation[0]?.storageTips && (
                  <div>
                    <h4 className="font-semibold mb-2">Legal Disclaimer:</h4>
                    <p className="text-gray-700">Actual product packaging and materials may contain more and different information than what is shown on our app or website. We recommend that you do not rely solely on the information presented here and that you always read labels, warnings, and directions before using or consuming a product.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSpecifications;
