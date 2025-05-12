import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { backendURL } from '../../lib/api-client';

const CartSidebar = () => {
  const { 
    cart, 
    isCartOpen, 
    closeCart, 
    removeFromCart,
    updateQuantity,
    cartTotal
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 backdrop-blur-md bg-opacity-50 z-40"
        onClick={closeCart}
      ></div>

      {/* Cart Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Your Cart</h2>
          <button 
            onClick={closeCart}
            className="p-1 hover:bg-gray-100 rounded-full"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingBag size={64} className="text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 text-sm">Browse our products and add items to your cart</p>
              <Link 
                to="/products" 
                className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-md text-sm font-medium transition-colors"
                onClick={closeCart}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (                <div key={item._id} className="flex border-b pb-4 last:border-b-0 gap-3">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={item.images && item.images.length > 0 
                        ? `${backendURL}/image/${item.images[0]}`
                        : (item.image || '/images/logo.png')} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {item.category && (
                      <p className="text-xs text-gray-500">{item.category}</p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                          className="p-1 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2 py-1 text-sm">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                          className="p-1 hover:bg-gray-100"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="text-sm font-semibold">₹{(item.price * (item.quantity || 1)).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Total and Checkout Button */}
        {cart.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-lg font-semibold">₹{cartTotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500">Shipping and taxes calculated at checkout</p>
            <Link 
              to="/checkout" 
              className="block w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md text-center font-medium transition-colors"
              onClick={closeCart}
            >
              Checkout
            </Link>
            <button 
              onClick={closeCart} 
              className="block w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-md text-center text-sm hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
