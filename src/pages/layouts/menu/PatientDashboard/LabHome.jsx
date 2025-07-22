import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../../context-api/cartSlice';
import axios from 'axios';
import { ShoppingCart, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const performSearch = data =>
    !searchQuery.trim()
      ? data
      : data.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
  return { searchQuery, setSearchQuery, performSearch };
};

const LabHome = () => {
  const [activeTab, setActiveTab] = useState('tests'),
    [tests, setTests] = useState([]),
    [packages, setPackages] = useState([]),
    [loading, setLoading] = useState(true),
    [addedIds, setAddedIds] = useState(new Set());
  const dispatch = useDispatch(),
    cart = useSelector(state => state.cart),
    navigate = useNavigate(),
    { searchQuery, setSearchQuery, performSearch } = useSearch(),
    cartRef = useRef(null),
    btnRefs = useRef({});
  const MOCK_API_URL = 'https://mocki.io/v1/0aeb8233-e477-46f8-9713-373a90796139';

  useEffect(() => {
    setLoading(true);
    axios.get(MOCK_API_URL).then(res => {
      const data = res.data[activeTab] || [];
      setTests(performSearch(data));
      setPackages(res.data.packages || []);
    }).finally(() => setLoading(false));
  }, [activeTab, searchQuery]);

  const animateFly = sourceEl => {
    if (!sourceEl || !cartRef.current) return;
    const src = sourceEl.getBoundingClientRect(), dst = cartRef.current.getBoundingClientRect(),
      clone = sourceEl.cloneNode(true);
    Object.assign(clone.style, {
      position: 'fixed', top: `${src.top}px`, left: `${src.left}px`, width: `${src.width}px`, height: `${src.height}px`,
      pointerEvents: 'none', zIndex: 9999, opacity: 1, boxShadow: '0 0 15px rgba(255, 165, 0, 0.7)', borderRadius: '8px',
      transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1), opacity 1s ease', background: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    });
    document.body.appendChild(clone);
    const startX = src.left + src.width / 2, startY = src.top + src.height / 2, endX = dst.left + dst.width / 2, endY = dst.top + dst.height / 2;
    clone.animate([
      { offset: 0, transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { offset: 0.5, transform: `translate(${(endX - startX) / 2}px, -150px) scale(0.6) rotate(180deg)`, opacity: 0.8 },
      { offset: 1, transform: `translate(${endX - startX}px, ${endY - startY}px) scale(0.2) rotate(360deg)`, opacity: 0 }
    ], { duration: 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }).onfinish = () => {
      clone.remove();
      cartRef.current.classList.add('cart-bounce');
      setTimeout(() => cartRef.current.classList.remove('cart-bounce'), 400);
    };
  };

  const handleAdd = (item, key, pushToCart = false) => {
    if (!addedIds.has(key)) {
      dispatch(addToCart(item));
      animateFly(btnRefs.current[key]);
      setAddedIds(prev => new Set(prev).add(key));
      if (pushToCart) navigate('/dashboard/cart');
    }
  };

  const renderButton = (item, prefix, pushToCart = false) => {
    const key = `${prefix}${item.id}`, label = addedIds.has(key) ? 'Added' : pushToCart ? 'Book Now' : 'Add', cls = pushToCart ? 'btn btn-primary' : 'edit-btn';
    return <button ref={el => (btnRefs.current[key] = el)} className={`${cls} text-sm`} onClick={() => handleAdd(item, key, pushToCart)}>{label}</button>;
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl mt-6">
      <div className="flex justify-between items-center p-4 mb-6">
        <form className="flex-1 max-w-xl mx-4 relative">
          <input type="text" className="input-field" placeholder="Search for tests, scans..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          <button disabled className="absolute top-3 right-3"><Search size={20} /></button>
        </form>
        <div ref={cartRef} onClick={() => navigate('/dashboard/cart')} className="relative cursor-pointer p-2 rounded-full border-2 border-[var(--primary-color)] bg-white shadow-sm hover:shadow-md transition group"><ShoppingCart size={26} className="text-[var(--primary-color)] group-hover:scale-110 transition-transform duration-200" />{cart.length > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">{cart.length}</span>)}</div>
      </div>

      <div className="px-4 mb-6">
        {['tests', 'scans'].map(tab => (
          <button key={tab} className={`py-1 px-4 border-b-2 ${activeTab === tab ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent hover:text-gray-700 hover:border-gray-300'}`} onClick={() => setActiveTab(tab)}>{tab[0].toUpperCase() + tab.slice(1)}</button>
        ))}
      </div>

      <div className="px-4">
        {loading ? <div className="text-center py-10">Loading…</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {tests.map(t => (
              <div key={t.id} className="card-stat">
                <h2 className="font-semibold">{t.title}</h2>
                <p>Code: {t.code}</p>
                <p className="mt-1 mb-2">{t.description}</p>
                <p className="text-[var(--primary-color)] font-bold">₹{t.price}</p>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => navigate(`/dashboard/lab-tests/test/${t.id}`)} className="view-btn">View</button>
                  {renderButton(t, 't')}
                  {renderButton(t, 'tb', true)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 mt-12">
        <h2 className="h4-heading font-bold mb-6">Popular Health Packages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {packages.map(p => (
            <div key={p.id} className="card-stat">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{p.title}</h3>
                <span className="bg-blue-100 text-xs px-2 py-1 rounded-full text-[var(--primary-color)]">{p.testsCount} Tests</span>
              </div>
              <div className="mb-2">
                <span className="text-[var(--primary-color)] font-bold">₹{p.price}</span>
                {p.originalPrice && <span className="ml-2 text-gray-400 line-through">₹{p.originalPrice}</span>}
              </div>
              {renderButton(p, 'p', true)}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .cart-bounce { animation: cart-bounce-glow 0.4s ease; }
        @keyframes cart-bounce-glow {
          0%, 100% { transform: scale(1); box-shadow: none; }
          50% { transform: scale(1.3); box-shadow: 0 0 10px 3px rgba(255, 165, 0, 0.7); }
        }
      `}</style>
    </div>
  );
};

export default LabHome;
