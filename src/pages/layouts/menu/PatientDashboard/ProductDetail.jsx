import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, CheckCircle, Check } from 'lucide-react';
import { useCart } from '../../../../context-api/productcartSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const { addItem, itemCount } = useCart();
  const cartRef = useRef(null);


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get('https://mocki.io/v1/7fca606c-abc8-4397-b797-a380fc8be7d7');
        const found = res.data.find((p) => String(p.id) === id);
        setProduct(found);
      } catch (err) {
        console.error('Failed to fetch product', err);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addItem(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };
  const animateFlyToCart = (sourceEl) => {
  if (!sourceEl || !cartRef.current) return;

  const src = sourceEl.getBoundingClientRect();
  const dst = cartRef.current.getBoundingClientRect();

  const clone = sourceEl.cloneNode(true);
  Object.assign(clone.style, {
    position: 'fixed',
    top: `${src.top}px`,
    left: `${src.left}px`,
    width: `${src.width}px`,
    height: `${src.height}px`,
    pointerEvents: 'none',
    zIndex: 9999,
    opacity: 1,
    borderRadius: '8px',
    transition: 'transform 1s, opacity 1s',
    background: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)'
  });

  document.body.appendChild(clone);

  const deltaX = dst.left + dst.width / 2 - (src.left + src.width / 2);
  const deltaY = dst.top + dst.height / 2 - (src.top + src.height / 2);

  clone.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: `translate(${deltaX / 2}px, ${deltaY / 2 - 150}px) scale(0.6) rotate(180deg)`, opacity: 0.8 },
    { transform: `translate(${deltaX}px, ${deltaY}px) scale(0.2) rotate(360deg)`, opacity: 0 }
  ], {
    duration: 1000,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards'
  }).onfinish = () => {
    clone.remove();
    cartRef.current.classList.add('cart-bounce');
    setTimeout(() => cartRef.current.classList.remove('cart-bounce'), 400);
  };
};

  if (!product) return <p className="text-center py-10">Loading product...</p>;

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-10">
      <header className=" sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="hidden md:flex flex-1 max-w-lg mx-8">

              <Link
                to="/dashboard/shopping"
                className="text-[var(--primary-color)] hover:underline text-sm font-medium mb-6 inline-block"
              >
                ← Back to Products
              </Link>
            </div>
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard/orders" className="text-gray-700 hover:text-[var(--primary-color)] font-medium">
                Orders
              </Link>
              <Link
                to="/dashboard/cartproduct"
                ref={cartRef}
                className="relative p-2 text-gray-700 hover:text-[var(--primary-color)]"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Mobile Menu Button */}
     
          </div>
        </div>
      </header>
      
      {showToast && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down z-50">
          <CheckCircle className="w-5 h-5" />
          <span>Added to cart</span>
        </div>
      )}


      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-8 rounded-2xl shadow-xl">
        {/* Product Image */}
        <div className="flex flex-col gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="rounded-2xl w-full max-h-[400px] object-contain border border-gray-100"
          />
          {!product.inStock && (
            <span className="text-red-600 text-center font-semibold">
              Out of Stock
            </span>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="h4-heading">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-4">
            {product.category} • {product.brand}
          </p>

          {/* Price Section */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="font-semibold text-[var(--primary-color)]">
              ₹{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="paragraph  line-through ">
                ₹{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="paragraph mb-4">
            {product.description || 'No description available.'}
          </p>

          {/* Features List */}
          {product.features && (
            <ul className="pl-5 text-sm text-[var(--primary-color)] space-y-2 mb-4">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 mt-1 text-green-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Stock Alert */}
          {product.inStock && product.stockQuantity <= 10 && (
            <p className="text-orange-600 text-sm mb-4">
              Hurry! Only {product.stockQuantity} left in stock.
            </p>
          )}

          {/* Add to Cart */}
               <button
  onClick={(e) => {
    handleAddToCart();
    animateFlyToCart(e.currentTarget);
  }}
  disabled={!product.inStock}
  className={`flex items-center view-btn ${product.inStock ? 'view-btn' : 'edit-btn'}`}
>
  <ShoppingCart className="w-5 h-5" />
  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
</button>
        </div>
      </div>
      <style>{`
  .cart-bounce {
    animation: cart-bounce-glow 0.4s ease;
  }
  @keyframes cart-bounce-glow {
    0%, 100% { transform: scale(1); box-shadow: none; }
    50% { transform: scale(1.3); box-shadow: 0 0 10px 3px rgba(255, 165, 0, 0.7); }
  }
`}</style>
    </div>
  );
};

export default ProductDetail;
