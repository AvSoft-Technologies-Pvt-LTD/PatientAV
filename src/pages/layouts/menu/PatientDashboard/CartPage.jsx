import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart, removeFromCart, clearCart } from '../../../../context-api/cartSlice';
import { ShoppingCart, Trash2, ArrowLeft, PlusCircle } from 'lucide-react';
const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart);
  const subtotal = cart.reduce((sum, test) => sum + test.price, 0);
  return (
    <div className="p-6 bg-white mt-6 rounded-2xl shadow-lg">
      <button onClick={() => navigate('/dashboard/lab-tests')} className="flex items-center text-sm text-[var(--primary-color)] mb-6 hover:underline">
        <ArrowLeft size={16} className="mr-2" /> Continue Shopping </button>
      <div className="flex items-center mb-6">
        <ShoppingCart size={20} className="text-[var(--primary-color)] mr-2" />
        <h2 className="h4-heading">Your Cart</h2> </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="h4-heading">Cart tests ({cart.length})</h3>
              <button onClick={() => dispatch(clearCart())} className="delete-btn">
                <div size={16} className="inline mr-1" /> Clear All   </button> </div>
            {cart.length === 0 ? (
              <p className="paragraph text-center py-10">Your cart is empty. Start adding tests!</p>) : (
              cart.map(test => (
                <div key={test.id} className="border-t pt-6 mt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="paragraph font-bold">{test.title}</h4>
                      <p className="paragraph">Code: <span className="bg-gray-100 px-2 py-0.5 rounded">{test.code}</span></p>
                      {test.fastRequired && (
                        <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Fasting Required</span> )}
                      <p className="paragraph mt-2">{test.description}</p></div>
                    <div className="text-right">
                      <p className="h4-heading text-[var(--primary-color)]">₹{test.price}</p>
                      {test.originalPrice && (
                        <p className="paragraph line-through text-gray-400">₹{test.originalPrice}</p>)}
                      <button onClick={() => dispatch(removeFromCart(test.id))} className="delete-btn mt-3">
                        <Trash2 size={16} className="inline mr-1" /> 
                      </button>    </div></div></div>
              )))}</div></div>
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
          <h3 className="h4-heading">Order Summary</h3>
          {cart.map(test => (
            <div key={test.id} className="flex justify-between">
              <span className="paragraph">{test.title}</span>
              <span className="paragraph">₹{test.price}</span> </div>))}
          <div className="border-t pt-3 flex justify-between">
            <span className="paragraph font-bold">Total</span>
            <span className="paragraph font-bold">₹{subtotal}</span></div>
          <button className="btn btn-primary w-full"
            onClick={() => navigate(`/dashboard/available-labs/${cart[0]?.id}`, { state: { test: cart[0] } })}>Proceed to Book</button>
              </div> </div></div>);};export default CartPage;
