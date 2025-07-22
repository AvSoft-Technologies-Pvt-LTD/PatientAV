import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const statusStyles = {
  pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-5 h-5" /> },
  confirmed: { text: 'Confirmed', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-5 h-5" /> },
  processing: { text: 'Processing', color: 'bg-blue-100 text-blue-700', icon: <Package className="w-5 h-5" /> },
  dispatched: { text: 'Dispatched', color: 'bg-purple-100 text-purple-700', icon: <Truck className="w-5 h-5" /> },
  delivered: { text: 'Delivered', color: 'bg-green-200 text-green-800', icon: <MapPin className="w-5 h-5" /> },
};

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = useSelector(state => state.auth?.user?.id);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get('https://684ac997165d05c5d35a5118.mockapi.io/orders');
        const userOrders = res.data.filter(order => order.userId === userId);
        setOrders(userOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchOrders();
  }, [userId]);
const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search query:', searchQuery);
    // Implement search functionality here
  };
  if (loading) return <p className="text-center py-10 text-gray-500">Loading your orders...</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="h4-heading mb-4">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center text-gray-500">
          <p>No orders found. Start shopping now!</p>
          <Link to="/dashboard/shopping" className="text-blue-600 underline mt-2 inline-block">Go to Shop</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => {
            const status = statusStyles[order.status] || statusStyles['pending'];

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">Order ID: {order.orderId}</h2>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.icon}
                    <span className="ml-2">{status.text}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item.product.id} className="flex gap-3 items-center">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-700">Total: ₹{order.total.toFixed(2)}</p>
                  <Link
                    to={`/dashboard/order-confirmation/${order.orderId}`}
                    state={{ order }}
                    className="inline-flex items-center text-sm text-blue-600 font-medium hover:underline"
                  >
                    View Order Details
                    <ExternalLink className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllOrdersPage;
