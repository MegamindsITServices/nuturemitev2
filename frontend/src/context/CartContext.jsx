import React, { useState, useContext, createContext, useEffect } from "react";
import { axiosInstance, getConfig } from "../utils/request";
import { GET_CART, ADD_TO_CART, REMOVE_FROM_CART } from "../lib/api-client";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const CartContext = createContext();

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [auth] = useAuth();
  const shippingTotal=()=>{
    let totalWeight=0;
    let totalShippingPrize=0;
    for(let i=0;i<cart.length;i++){
      totalWeight+=(parseFloat(cart[i].measurements[0].withPackaging[0].weight)*cart[i].quantity)
      
    }
if(totalWeight > 500 && totalWeight <=1000 ){
        totalShippingPrize+=70
      }else if(totalWeight > 1000 && totalWeight <=2000){
       totalShippingPrize+=140;
      }else if(totalWeight > 2000 && totalWeight <=3000){
        totalShippingPrize+=210;
      }else if(totalWeight > 3000 ){
        totalShippingPrize+=500;
      }else{
          totalShippingPrize+=40
      }
    return totalShippingPrize;
  }
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    const quantity = item.quantity || 1;
    return total + ((item.price)* quantity);
  }, 0);

  // Open cart sidebar
  const openCart = () => setIsCartOpen(true);
  
  // Close cart sidebar
  const closeCart = () => setIsCartOpen(false);

  // Toggle cart sidebar
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // Fetch cart products
  const fetchCartProducts = async (userId) => {
    if (!userId) return;
    
    try {
      await getConfig();
      const { data } = await axiosInstance.post(GET_CART, { userId });
      
      if (data.success && data.cart) {
        // Ensure each cart item has a quantity property
        const cartWithQuantities = data.cart.map(item => ({
          ...item,
          quantity: item.quantity || 1
        }));
        
        setCart(cartWithQuantities);
        localStorage.setItem("cart", JSON.stringify(cartWithQuantities));
      }
    } catch (error) {
      console.error("Error fetching cart products:", error);
    }
  };
  // Add product to cart
  const addToCart = async (product) => {
    if (!auth?.user?.userId) {
      toast.error("Please login to add items to cart");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      
      return;
    }

    try {
      await getConfig();
      console.log(product)
      const { data } = await axiosInstance.post(ADD_TO_CART, {
        userId: auth.user.userId,
        productId: product._id,
      });
      
      if (data.success) {
        await fetchCartProducts(auth.user.userId);
        toast.success("Product added to cart");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
      toast.error("Failed to add product to cart");
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    if (!auth?.user?.userId) return;
    
    try {
      await getConfig();
      const { data } = await axiosInstance.delete(REMOVE_FROM_CART, {
        data: {
          userId: auth.user.userId,
          productId: productId
        }
      });
      
      if (data.success) {
        setCart(data.cart);
        localStorage.setItem("cart", JSON.stringify(data.cart));
        toast.success("Product removed from cart");
      }
    } catch (error) {
      console.error("Error removing product from cart:", error);
      toast.error("Failed to remove product from cart");
    }
  };

  // Update quantity of a product in cart
  const updateQuantity = (productId, newQuantity) => {
    // For now, this is a client-side update only
    // In the future, you might want to add an API endpoint to update quantity
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart => 
      prevCart.map(item => 
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };
  
  // Clear the entire cart (used after successful checkout)
  const clearCart = async () => {
    if (!auth?.user?.userId) {
      setCart([]);
      localStorage.removeItem("cart");
      return;
    }
    
    try {
      await getConfig();
      const { data } = await axiosInstance.post("/api/cart/clear", {
        userId: auth.user.userId
      });
      
      if (data.success) {
        setCart([]);
        localStorage.removeItem("cart");
        toast.success("Order completed successfully!");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Even if the API call fails, clear the cart locally
      setCart([]);
      localStorage.removeItem("cart");
    }
  };

  // Load cart on initial render
  useEffect(() => {
    const userId = auth?.user?.userId;
    if (userId) {
      fetchCartProducts(userId);
    } else {
      // If not logged in, check for cart in local storage
      const localCart = localStorage.getItem("cart");
      if (localCart) {
        setCart(JSON.parse(localCart));
      }
    }
  }, [auth?.user?.userId]);
  
  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        setCart, 
        isCartOpen, 
        openCart, 
        closeCart, 
        toggleCart, 
        addToCart, 
        removeFromCart,
        updateQuantity,
        cartTotal,
        fetchCartProducts,
        clearCart,
        shippingTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// custom hook
const useCart = () => useContext(CartContext);

export { useCart, CartProvider };
