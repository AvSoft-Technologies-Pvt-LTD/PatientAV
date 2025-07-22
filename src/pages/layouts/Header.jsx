import React, { useState, useEffect } from "react";
import { Search, Bell, Pill } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { FaAmbulance } from "react-icons/fa";

const HeaderWithNotifications = () => {
  const [notifications, setNotifications] = useState([]), [showNotifications, setShowNotifications] = useState(false), navigate = useNavigate();
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('https://67e631656530dbd3110f0322.mockapi.io/notify');
        setNotifications(res.data.map(n => ({ ...n, unread: n.unread ?? true })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (e) { }
    };
    fetch(); const i = setInterval(fetch, 10000); return () => clearInterval(i);
  }, []);
  const unreadCount = notifications.filter(n => n.unread).length, displayNotifications = notifications.slice(0, 2);
  const getTimeAgo = d => { const n = new Date(), t = new Date(d), diff = Math.floor((n - t) / 1000); if (diff < 60) return 'Just now'; if (diff < 3600) return `${Math.floor(diff / 60)} min ago`; if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`; return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`; };
  return (
   <nav className="sticky top-0 mt-2 z-50 bg-gray-50 py-2 mx-4 shadow-md rounded-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end h-16 items-center">
          <div className="flex items-center space-x-4 text-[var(--primary-color)]">
            <div className="relative floating-input w-full" data-placeholder="Search...">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--primary-color)]" />
              <input
                type="text"
                placeholder=" "
                onChange={e => console.log("Searching:", e.target.value)}
                className="input-field peer "
              />
            </div>
            <div className="relative">
             <button
  onClick={() => setShowNotifications(!showNotifications)}
  className="relative px-3 py-2 rounded-full border-none bg-gray-300 hover:bg-[var(--accent-color)] hover:text-white transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
  title="Notifications"
>
  <Bell className="h-6 w-6 text-[var(--primary-color)] transition-all duration-300 group-hover:text-white hover:animate-[wiggle_0.3s_ease-in-out]" />

  {unreadCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs animate-bounce shadow-md">
      {unreadCount}
    </span>
  )}
</button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[24rem] bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
                  <div className="sticky top-0 bg-[var(--primary-color)] px-5 py-4 border-b flex justify-between items-center rounded-t-2xl">
                    <h3 className="text-lg font-bold text-[var(--color-surface)]">Notifications</h3>
                    {notifications.length > 0 && (
                      <Link to="/dashboard/notifications" className="text-sm font-medium text-[var(--accent-color)] hover:underline" onClick={() => { setShowNotifications(false); navigate('/dashboard/notifications'); }}>View All</Link>
                    )}
                  </div>
                  {displayNotifications.length === 0 ? (
                    <div className="px-5 py-6 text-center text-gray-500 text-sm">You're all caught up</div>
                  ) : (
                    displayNotifications.map(notification => (
                      <div key={notification.id} onClick={() => setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, unread: false } : n))} className={`group px-5 py-4 transition cursor-pointer border-b ${notification.unread ? 'bg-[var(--accent-color)]/20' : 'bg-[var(--color-surface)]'} hover:bg-[var(--accent-color)]/10`}>
                        <div className="flex justify-between gap-3 items-start">
                          <div className="flex-1">
                            <p className="text-sm paraghraph">{notification.message}</p>
                            <span className="text-xs text-gray-500 mt-1 block">{getTimeAgo(notification.createdAt)}</span>
                          </div>
                          {notification.unread && <div className="w-2 h-2 mt-1 bg-[var(--accent-color)] rounded-full shrink-0 group-hover:opacity-80 transition-opacity" />}
                        </div>
                        {notification.showPayButton && (
                          <button onClick={e => { e.stopPropagation(); console.log('Pay now clicked for notification:', notification.id); }} className="mt-3 inline-block btn btn-primary text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm transition-colors">Pay Now</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
     <button
  onClick={() => navigate('/dashboard/pharmacy')}
  title="Pharmacy"
  className="group p-3 rounded-full bg-[var(--accent-color)]  hover:bg-[var(--primary-color)] transition-all duration-300 transform hover:scale-110 hover:shadow-md"
>
  <Pill className="h-5 w-5 text-white transition-all duration-300 group-hover:rotate-12" />
</button>

  <button
      onClick={() => navigate('/dashboard/ambulance')}
      title="Ambulance"
      className="group px-3 py-2 rounded-full  transition-all duration-300 transform hover:scale-110 bg-red-500"
    >
      <FaAmbulance className="h-6 w-6 text-white shine-blink" />
    </button>

          </div>
        </div>
      </div>
    </nav>
  );
};

export default HeaderWithNotifications;