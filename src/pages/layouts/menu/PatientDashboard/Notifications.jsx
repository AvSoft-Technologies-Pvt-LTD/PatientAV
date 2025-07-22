import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  useEffect(() => {
    fetchNotifications();
  }, []);
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://67e631656530dbd3110f0322.mockapi.io/notify');
      const sorted = res.data
        .map((n) => ({
          ...n,
          unread: n.unread ?? true
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleNotificationRead = async (notificationId) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, unread: false }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };
  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const time = new Date(createdAt);
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  };
  const getDateCategory = (createdAt) => {
    const now = new Date();
    const time = new Date(createdAt);
    const diffDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This Week';
    if (diffDays < 30) return 'This Month';
    return 'Earlier';
  };
  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm && !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filter === 'unread' && !notification.unread) return false;
    if (filter === 'payment' && !notification.showPayButton) return false;
    return true;
  });
  const groupedNotifications = {};
  filteredNotifications.forEach(notification => {
    const category = getDateCategory(notification.createdAt);
    if (!groupedNotifications[category]) {
      groupedNotifications[category] = [];
    }
    groupedNotifications[category].push(notification);
  });
  const categories = Object.keys(groupedNotifications).sort((a, b) => {
    const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];
    return order.indexOf(a) - order.indexOf(b);
  });
  const unreadCount = notifications.filter(n => n.unread).length;
  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto pt-6 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4 text-[#0E1630] hover:text-[#F4C430]">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0E1630] flex items-center">
            Notifications
            <span className="ml-3 bg-[#F4C430] text-[#0E1630] text-sm rounded-full h-6 px-2">
              {unreadCount}
            </span>
          </h1>
          <div className="ml-auto">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-sm font-medium text-[#0E1630] hover:text-[#F4C430]"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all as read
              </button>
            )}
          </div>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full rounded-lg bg-white text-[#0E1630] placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'unread', 'payment'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filter === type ? 'bg-[#0E1630] text-white' : 'bg-white text-[#0E1630] border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F4C430]"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center">
            <Bell className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#0E1630] mb-2">No notifications found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter to see more results.'
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="font-semibold text-sm text-gray-500 mb-3">{category}</h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                  {groupedNotifications[category].map((notification) => (
                    <div
                      key={notification.id}
                      className={`group p-4 sm:p-5 ${notification.unread ? 'bg-[#F4C430]/10' : 'bg-white'} hover:bg-[#F4C430]/5 cursor-pointer`}
                      onClick={() => handleNotificationRead(notification.id)}
                    >
                      <div className="flex justify-between gap-3 items-start">
                        <div className="flex-1">
                          <p className={`text-sm sm:text-base text-[#0E1630] ${notification.unread ? 'font-medium' : 'font-normal'}`}>
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        {notification.unread && <div className="w-3 h-3 mt-1 bg-[#F4C430] rounded-full"></div>}
                      </div>
                      {notification.showPayButton && (
                        <div className="mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/dashboard/payment', {
                                state: {
                                  doctorName: notification.doctorName || 'Dr. John Doe',
                                  consultationFee: notification.consultationFee || '500'
                                }
                              });
                            }}
                            className="bg-[#F4C430] hover:bg-[#E0B320] text-[#0E1630] text-xs font-semibold px-4 py-2 rounded-full shadow-sm"
                          >
                            Pay Now
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationsPage;