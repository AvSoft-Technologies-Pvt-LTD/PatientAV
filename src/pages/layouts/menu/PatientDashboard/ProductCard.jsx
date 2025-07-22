import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Star,
  Heart,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  Search,
  Menu,
  X,
} from 'lucide-react';
import axios from 'axios';

import { useCart } from '../../../../context-api/productcartSlice';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('name');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [itemCount, setItemCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const cartRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('https://mocki.io/v1/7fca606c-abc8-4397-b797-a380fc8be7d7');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const all = products.map(p => p.category);
    return ['All Categories', ...new Set(all)];
  }, [products]);

  const updateCartCount = () => {
    setItemCount(prev => prev + 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const animateFly = (sourceEl) => {
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
      boxShadow: '0 0 15px rgba(255, 165, 0, 0.7)',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    document.body.appendChild(clone);

    const startX = src.left + src.width / 2;
    const startY = src.top + src.height / 2;
    const endX = dst.left + dst.width / 2;
    const endY = dst.top + dst.height / 2;

    clone.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        {
          transform: `translate(${(endX - startX) / 2}px, -150px) scale(0.6)`,
          opacity: 0.8,
        },
        {
          transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.2)`,
          opacity: 0,
        },
      ],
      {
        duration: 1000,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      }
    ).onfinish = () => {
      clone.remove();
      cartRef.current.classList.add('cart-bounce');
      setTimeout(() => cartRef.current.classList.remove('cart-bounce'), 400);
    };
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchCategory =
        selectedCategory === 'All Categories' || product.category === selectedCategory;
      const matchPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchPrice && matchSearch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [products, selectedCategory, sortBy, priceRange, searchQuery]);

  // ---------------- ProductCard Component (Inline) ----------------
  const ProductCard = ({ product, updateCartCount, flyToCart }) => {
    const { addItem } = useCart();
    const btnRef = useRef(null);

    const handleAddToCart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      addItem(product);
      updateCartCount();
      if (btnRef.current && flyToCart) flyToCart(btnRef.current);
    };

    const renderStars = (rating) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      ));
    };

    return (
      <Link to={`/dashboard/product/${product.id}`} className="group">
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="relative flex items-center justify-center h-48 overflow-hidden">
            <img src={product.image} alt={product.name} className="object-contain h-full transition-transform duration-300 group-hover:scale-110" />
            {product.originalPrice && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                SAVE ₹{(product.originalPrice - product.price).toFixed(2)}
              </div>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">Out of Stock</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className="font-medium">{product.brand}</span>
              <span>{product.category}</span>
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-2">{product.name}</h3>
            <div className="flex items-center space-x-1 mb-3">
              <div className="flex">{renderStars(product.rating)}</div>
              <span className="text-xs text-gray-600">({product.reviews})</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="font-semibold">₹{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toFixed(2)}</span>
              )}
            </div>
            <button
              ref={btnRef}
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${product.inStock ? 'view-btn' : 'edit-btn'}`}
            >
              <ShoppingCart className="h-4 w-4" />
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
            {product.inStock && product.stockQuantity <= 10 && (
              <p className="text-xs text-orange-600 mt-2 text-center">Only {product.stockQuantity} left in stock!</p>
            )}
          </div>
        </div>
      </Link>
    );
  };
  // ---------------- End ProductCard ----------------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-gray-50">
          <div className="flex items-center justify-between h-16">
            <form onSubmit={handleSearch} className="hidden md:flex w-full max-w-md mr-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search medical supplies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard/orders" className="text-gray-700 hover:text-[var(--primary-color)] font-medium">Orders</Link>
              <Link to="/dashboard/cartproduct" ref={cartRef} className="relative p-2 text-gray-700 hover:text-[var(--primary-color)]">
                <ShoppingCart className="h-6 w-6 " />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            </nav>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-gray-700">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </header>

        {/* Layout: Sidebar + Product Grid */}
        <div className="flex flex-col gap-6 mt-6">
          {/* 🔳 Product Grid Section */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                Showing {filteredAndSortedProducts.length} products in{' '}
                <span className="font-semibold">{selectedCategory}</span>
              </p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar */}
              <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </h3>
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={selectedCategory === category}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="h-4 w-4 text-[var(--primary-color)] focus:[var(--primary-color)] border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  {/* Price Range Filter */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="range"
                          min="0"
                          max="500"
                          value={priceRange[1]}
                          onChange={(e) =>
                            setPriceRange([priceRange[0], parseInt(e.target.value)])
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* In Stock Filter */}
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1">
                {filteredAndSortedProducts.length === 0 ? (
                  <div className="text-center text-gray-500 py-10">
                    No products found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAndSortedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        updateCartCount={updateCartCount}
                        flyToCart={animateFly}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ✨ Animation Style */}
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

export default ProductsPage;