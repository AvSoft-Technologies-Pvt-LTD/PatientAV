import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../../../../context-api/productcartSlice';

const CartProduct = () => {
const { items = [], total = 0, updateQuantity, removeItem, itemCount = 0 } = useCart();


  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const shipping = total > 100 ? 0 : 9.99;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="h3-heading">Your cart is empty</h2>
          <p className="paragraph">Start shopping to add items to your cart</p>
          <Link
            to="/dashboard/shopping"
            className="inline-flex items-center px-6 py-3 bg-[var(--primary-color)] text-white font-semibold rounded-lg hover:bg-[var(--primary-color)] transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/shopping"
            className="inline-flex items-center text-[var(--primary-color)] hover:text-[var(--primary-color)] mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="h4-heading">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">{itemCount} items in your cart</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="h4-heading">Cart Items</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.product.id} className="p-6 flex flex-col sm:flex-row">
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-6">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link 
                              to={`/product/${item.product.id}`}
                              className="hover:text-[var(--primary-color)]"
                            >
                              {item.product.name}
                            </Link>
                          </h3>
                          <p className="paragraph">{item.product.brand}</p>
                          <p className="paragraph">
                            ₹{item.product.price.toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center mt-4">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="mx-4 text-lg font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="mt-4 sm:mt-0 sm:ml-6 text-right">
                      <p className="paragraph">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg shadow-md sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="h4-heading">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">₹{tax.toFixed(2)}</span>
                </div>

                {shipping === 0 && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                       You qualify for free shipping!
                    </p>
                  </div>
                )}
                
                {total < 100 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Add ₹{(100 - total).toFixed(2)} more for free shipping
                    </p>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-lg font-bold text-[var(--primary-color)]">
                      ₹{finalTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Link
                  to="/dashboard/checkout"
                  className="w-full bg-[var(--primary-color)] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[var(--primary-color)] transition-colors flex items-center justify-center"
                >
                  Proceed to Checkout
                </Link>

                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <span>🔒</span>
                    <span>Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProduct;