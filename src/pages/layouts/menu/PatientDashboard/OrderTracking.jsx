import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, Truck, MapPin, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

const API_BASE = 'https://684ac997165d05c5d35a5118.mockapi.io/orders';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
   const { state } = useLocation();
   const [localOrder, setLocalOrder] = useState(state?.order);
  const [autoUpdate, setAutoUpdate] = useState(true);
  // Fetch from API if not passed via location.state
const fetchOrder = async () => {
  try {
    const res = await axios.get(`${API_BASE}/${orderId}`);
    setLocalOrder(res.data);
  } catch (err) {
    console.error('Error fetching order:', err);
  }
};

  const updateOrderStatus = async (newStatus) => {
  const updatedTimeline = [
    ...localOrder.timeline,
    {
      status: newStatus,
      timestamp: new Date().toISOString(),
      description: `Order ${newStatus.replace('_', ' ')} by system`,
    },
  ];
      const updatedOrder = {
    ...localOrder,
    status: newStatus,
    timeline: updatedTimeline,
    updatedAt: new Date().toISOString(),
  };

  try {
    await axios.put(`${API_BASE}/${orderId}`, updatedOrder);
    setLocalOrder(updatedOrder);
  } catch (err) {
    console.error('Error updating status:', err);
  }
};

  useEffect(() => {
    if (!localOrder) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (!localOrder || !autoUpdate) return;

    const statusProgression = ['pending', 'confirmed', 'processing', 'dispatched', 'in_transit', 'delivered'];
    const currentIndex = statusProgression.indexOf(localOrder.status);

    if (currentIndex < statusProgression.length - 1) {
      const timer = setTimeout(() => {
        const nextStatus = statusProgression[currentIndex + 1];
        updateOrderStatus(nextStatus);
      }, 10000); // 10s for demo
      return () => clearTimeout(timer);
    } else {
      setAutoUpdate(false);
    }
  }, [localOrder, autoUpdate]);

  if (!localOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <Link to="/orders" className="text-[var(--primary-color)] hover:text-[var(--accent-color)]">
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const trackingSteps = [
    { status: 'confirmed', title: 'Order Confirmed', description: 'Your order has been confirmed and payment processed', icon: CheckCircle },
    { status: 'processing', title: 'Preparing Order', description: 'Your items are being prepared for shipment', icon: Package },
    { status: 'dispatched', title: 'Order Dispatched', description: 'Your order has left our facility', icon: Truck },
    { status: 'in_transit', title: 'In Transit', description: 'Your order is on the way to you', icon: Truck },
    { status: 'delivered', title: 'Delivered', description: 'Your order has been delivered successfully', icon: MapPin },
  ];

  const getStepStatus = (stepStatus) => {
    const isCompleted = localOrder.timeline.some(t => t.status === stepStatus);
    const isCurrent = localOrder.status === stepStatus;
    return { isCompleted, isCurrent };
  };

  const getStatusColor = (stepStatus) => {
    const { isCompleted, isCurrent } = getStepStatus(stepStatus);
    if (isCompleted) return 'text-green-600 bg-green-100 border-green-200';
    if (isCurrent) return 'text-[var(--primary-color)] bg-blue-100 border-blue-200';
    return 'text-gray-400 bg-gray-100 border-gray-200';
  };

  const getIconColor = (stepStatus) => {
    const { isCompleted, isCurrent } = getStepStatus(stepStatus);
    if (isCompleted) return 'text-green-600';
    if (isCurrent) return 'text-[var(--primary-color)]';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/dashboard/orders" className="inline-flex items-center text-[var(--primary-color)] hover:text-[var(--accent-color)] mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
          <h1 className="h3-heading">Track Your Order</h1>
          <p className="text-gray-600">Order #{localOrder.orderId}</p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="h4-heading">Order Details</h2>
              <p className="text-sm text-gray-600">Placed on {new Date(localOrder.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[var(--primary-color)]">₹{localOrder.total.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{localOrder.items.length} items</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
              <div className="text-sm text-gray-600">
                <p>{localOrder.shippingAddress.street}</p>
                <p>{localOrder.shippingAddress.city}, {localOrder.shippingAddress.state} {localOrder.shippingAddress.zipCode}</p>
                <p>{localOrder.shippingAddress.country}</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tracking Info</h3>
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Tracking #:</span> {localOrder.trackingNumber}</p>
                <p><span className="font-medium">Est. Delivery:</span> {localOrder.estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Tracking Progress</h2>
          <div className="relative">
            <div className="absolute top-8 left-8 right-8 h-0.5 bg-gray-200">
              <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${(localOrder.timeline.length - 1) * 25}%` }} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {trackingSteps.map((step) => {
                const { isCompleted, isCurrent } = getStepStatus(step.status);
                const Icon = step.icon;
                return (
                  <div key={step.status} className="relative">
                    <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-4 ${getStatusColor(step.status)}`}>
                      <Icon className={`h-6 w-6 ${getIconColor(step.status)}`} />
                    </div>
                    <div className="text-center">
                      <h3 className={`font-medium mb-1 ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>{step.title}</h3>
                      <p className={`text-xs ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>{step.description}</p>
                      {isCompleted && (
                        <p className="text-xs text-green-600 mt-1">
                          {new Date(localOrder.timeline.find(t => t.status === step.status)?.timestamp || '').toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Clock className="h-6 w-6 text-[var(--primary-color)] mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Current Status</h3>
              <p className="text-blue-800 capitalize">{localOrder.status.replace('_', ' ')}</p>
              <p className="text-sm text-[var(--accent-color)] mt-1">
                {localOrder.timeline[localOrder.timeline.length - 1]?.description}
              </p>
              <p className="text-xs text-[var(--primary-color)] mt-1">
                Last updated: {new Date(localOrder.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Items in this order</h3>
          <div className="space-y-4">
            {localOrder.items.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">{item.product.brand}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-semibold text-gray-900">₹
                  {(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Update Notice */}
        {autoUpdate && localOrder.status !== 'delivered' && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              🔄 This page will automatically update as your order progresses.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;