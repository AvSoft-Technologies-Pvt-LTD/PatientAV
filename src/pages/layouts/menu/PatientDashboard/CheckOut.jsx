import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, Truck, Check } from 'lucide-react';
import { useCart } from '../../../../context-api/productcartSlice';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const user = useSelector((state) => state.auth.user);
 
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India'
  });
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');

  const [billingAddress, setBillingAddress] = useState(shippingAddress);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const shipping = total > 100 ? 0 : 9.99;
  const tax = total * 0.08;
  const finalTotal = total + shipping + tax;
 useEffect(() => {
    if (user) {
      const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
      setName(fullName);
      setPhone(user.phone || '');
      setShippingAddress((prev) => ({
        ...prev,
        ...user.address,
      }));
    }
    axios.get('https://countriesnow.space/api/v0.1/countries/positions')
      .then(res => {
        const countryList = res.data.data.map(c => c.name);
        setCountries(countryList);
      })
      .catch(err => console.error("Failed to fetch countries", err));
  }, [user]);

  const handleCountryChange = async (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setSelectedState('');
    setShippingAddress({ ...shippingAddress, country, state: '', city: '' });

    try {
      const res = await axios.post('https://countriesnow.space/api/v0.1/countries/states', {
        country,
      });
      const stateNames = res.data.data.states.map(s => s.name);
      setStates(stateNames);
      setCities([]);
    } catch (err) {
      console.error("Error fetching states", err);
    }
  };
  const handleStateChange = async (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setShippingAddress({ ...shippingAddress, state, city: '' });

    try {
      const res = await axios.post('https://countriesnow.space/api/v0.1/countries/state/cities', {
        country: selectedCountry,
        state,
      });
      setCities(res.data.data);
    } catch (err) {
      console.error("Error fetching cities", err);
    }
  };

  const handleCityChange = (e) => {
    setShippingAddress({ ...shippingAddress, city: e.target.value });
  };

  const validateShipping = () => {
    const newErrors = {};
    if (!shippingAddress.street.trim()) newErrors.street = 'Street address is required';
    if (!shippingAddress.city.trim()) newErrors.city = 'City is required';
    if (!shippingAddress.state.trim()) newErrors.state = 'State is required';
    if (!shippingAddress.zipCode.trim() || !/^\d{5,6}$/.test(shippingAddress.zipCode)) newErrors.zipCode = 'Valid ZIP code is required';
    if (!shippingAddress.country) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = () => {
    const newErrors = {};
    if (paymentMethod === 'credit_card') {
      if (!cardDetails.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name required';
      if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Valid 16-digit card number required';
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) newErrors.expiryDate = 'Format should be MM/YY';
      if (!/^\d{3}$/.test(cardDetails.cvv)) newErrors.cvv = '3-digit CVV required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleNextStep = () => {
    if (currentStep === 1 && !validateShipping()) return;
    if (currentStep === 2 && !validatePayment()) return;
    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    await new Promise(resolve => setTimeout(resolve, 2000)); // simulate payment

    const order = {
      orderId: `ORD-${Date.now()}`,
      userId: user?.id || 'guest',
      name,
      phone,
      items,
      total: finalTotal,
      subtotal: total,
      tax,
      shipping,
      status: 'pending',
      shippingAddress,
      billingAddress: sameAsShipping ? shippingAddress : billingAddress,
      paymentMethod,
      trackingNumber: `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [{
        status: 'pending',
        timestamp: new Date().toISOString(),
        description: 'Order received and is being processed',
      }],
    };

    try {
      // POST to your MockAPI or backend
      const res = await axios.post('https://684ac997165d05c5d35a5118.mockapi.io/orders', order);
      console.log('Order saved:', res.data);
    } catch (err) {
      console.error('Failed to save order:', err);
    }

    clearCart();
    navigate(`/dashboard/order-confirmation/${order.orderId}`, { state: { order } });
  };

  if (items.length === 0 && !isProcessing) {
    navigate('/dashboard/cart');
    return null;
  }

  const steps = [
    { number: 1, title: 'Shipping', completed: currentStep > 1 },
    { number: 2, title: 'Payment', completed: currentStep > 2 },
    { number: 3, title: 'Review', completed: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Checkout</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : currentStep === step.number
                      ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                  {step.completed ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <span className={`ml-2 text-sm font-medium ${step.completed || currentStep === step.number
                    ? 'text-gray-900'
                    : 'text-gray-500'
                  }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${step.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <>
  {/* User Full Name and Phone */}
   <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Name Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="First Last"
    />
  </div>

  {/* Phone Field */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
    <input
      type="tel"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      placeholder="+91-XXXXXXXXXX"
    />
  </div>
</div>


  {/* Street Address */}
  <div className="md:col-span-2">
    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
    <input
      type="text"
      value={shippingAddress.street}
      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
    />
    {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
  </div>

  {/* Country + State in one row */}
  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
      <select
        value={selectedCountry}
        onChange={handleCountryChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      >
        <option value="">Select Country</option>
        {countries.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
      <select
        value={selectedState}
        onChange={handleStateChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        disabled={!states.length}
      >
        <option value="">Select State</option>
        {states.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  </div>

  {/* City + Zip Code in one row */}
  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
      <select
        value={shippingAddress.city}
        onChange={handleCityChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        disabled={!cities.length}
      >
        <option value="">Select City</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
      <input
        type="text"
        value={shippingAddress.zipCode}
        onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
      />
      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
    </div>
  </div>
</>
              )}

              {/* Step 2: Payment Information */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6 flex items-center">
  <CreditCard className="h-5 w-5 mr-2" />
  Payment Information
</h2>

                 <div className="flex gap-4 mb-6">
  {['credit_card', 'paypal', 'upi'].map((method) => (
    <button
      key={method}
      onClick={() => setPaymentMethod(method)}
      className={`px-4 py-2 rounded-lg border transition ${
        paymentMethod === method
          ? 'bg-[var(--primary-color)] text-white border-[var(--primary-color)]'
          : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
      }`}
    >
      {method === 'credit_card' && 'Credit/Debit Card'}
      {method === 'paypal' && 'PayPal'}
      {method === 'upi' && 'UPI / QR Code'}
    </button>
  ))}
</div>

{/* Credit Card Form */}
{paymentMethod === 'credit_card' && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Cardholder Name */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
      <input
        type="text"
        value={cardDetails.cardholderName}
        onChange={(e) => setCardDetails({ ...cardDetails, cardholderName: e.target.value })}
        className="input-field"
        placeholder="John Doe"
      />
      {errors.cardholderName && <p className="text-red-500 text-sm">{errors.cardholderName}</p>}
    </div>
    {/* Card Number */}
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
      <input
        type="text"
        value={cardDetails.cardNumber}
        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
        className="input-field"
        placeholder="1234 5678 9012 3456"
      />
      {errors.cardNumber && <p className="text-red-500 text-sm">{errors.cardNumber}</p>}
    </div>
    {/* Expiry and CVV */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
      <input
        type="text"
        value={cardDetails.expiryDate}
        onChange={(e) => setCardDetails({ ...cardDetails, expiryDate: e.target.value })}
        className="input-field"
        placeholder="MM/YY"
      />
      {errors.expiryDate && <p className="text-red-500 text-sm">{errors.expiryDate}</p>}
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
      <input
        type="text"
        value={cardDetails.cvv}
        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
        className="input-field"
        placeholder="123"
      />
      {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
    </div>
  </div>
)}

{/* PayPal Section */}
{paymentMethod === 'paypal' && (
  <div className="text-gray-700">
    <p className="mb-4">You will be redirected to PayPal to complete your payment.</p>
    <button
      className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg"
      onClick={() => alert("Redirecting to PayPal...")}
    >
      Continue with PayPal
    </button>
  </div>
)}

{/* UPI / QR Code Payment */}
{paymentMethod === 'upi' && (
  <div className="text-center">
    <p className="text-gray-700 mb-2">Scan the QR code using any UPI app to pay</p>
    <img
      src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=HealthLab&am=10.00" // Replace with your actual QR code
      alt="Scan to Pay"
      className="w-40 h-40 mx-auto mb-2 rounded-lg"
    />
    <p className="text-sm text-gray-500">UPI ID: <span className="font-medium">pay@upi</span></p>
  </div>
)}
                </div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-semibold mb-6">Review Your Order</h2>

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4">Items</h3>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center space-x-4">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping & Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Shipping Address</h3>
                      <div className="text-sm text-gray-600">
                        <p>{shippingAddress.street}</p>
                        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                        <p>{shippingAddress.country}</p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">Payment Method</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {paymentMethod.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className={`px-6 py-2 rounded-lg font-medium ${currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  Previous
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--accent-color)]"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Place Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="h4-heading">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-[var(--primary-color)]">₹{finalTotal.toFixed(2)}</span>
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

export default CheckoutPage;