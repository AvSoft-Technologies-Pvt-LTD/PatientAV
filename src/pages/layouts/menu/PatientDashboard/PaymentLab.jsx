import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
const PaymentPage = () => {
  const { state: bookingDetails } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [method, setMethod] = useState("upi");
  const [cardData, setCardData] = useState({ number: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});
  const generateBookingId = () => `APT${Date.now().toString().slice(-6)}`;
  const handleDownloadReceipt = () => {
    const receiptContent = `Appointment Receipt\n\nBooking ID: ${bookingId}\nPatient Name: ${bookingDetails.name}\nTest: ${bookingDetails.testTitle}\nLab: ${bookingDetails.labName}\nDate & Time: ${bookingDetails.date} at ${bookingDetails.time}\nLocation: ${bookingDetails.location}\nPayment Method: ${method}\nAmount Paid: ₹${bookingDetails.amount}\nStatus: Paid`;
    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Appointment_Receipt_${bookingId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);};
  const validateCard = () => {
    const errs = {};
    if (!/^\d{16}$/.test(cardData.number)) errs.number = "Invalid card number";
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) errs.expiry = "Invalid expiry format";
    if (!/^\d{3}$/.test(cardData.cvv)) errs.cvv = "Invalid CVV";
    setErrors(errs);
    return Object.keys(errs).length === 0;};
  const handlePayment = async () => {
    if (method === "card" && !validateCard()) return;
    setLoading(true);
    const id = generateBookingId();
    const paymentDetails = {
      bookingId: id, status: "Paid", createdAt: new Date().toISOString(), paymentMethod: method,
      amountPaid: bookingDetails.amount, paymentStatus: "Success", upiTransactionId: method === "upi" ? `UPI-${Date.now()}` : null,
      upiPaymentStatus: method === "upi" ? "Pending" : null, cardType: method === "card" ? "Visa" : null,
      cardLast4Digits: method === "card" ? cardData.number.slice(-4) : null, bankName: method === "net" ? selectedBank : null,
      netBankingTransactionId: method === "net" ? `NET-${Date.now()}` : null, patientName: bookingDetails.name,
      testTitle: bookingDetails.testTitle, labName: bookingDetails.labName, location: bookingDetails.location,
      date: bookingDetails.date, time: bookingDetails.time, email: bookingDetails.email,
      phone: bookingDetails.phone, amount: bookingDetails.amount, };
    try {
      await axios.post("https://680b3642d5075a76d98a3658.mockapi.io/Lab/payment", paymentDetails);
      setSuccess(true);
      setBookingId(id);
    } catch (err) {
      alert("Payment failed!");
    } finally {
      setLoading(false);
    }
  };if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card-stat card-border-primary w-full max-w-md text-center">
          <div className="card-icon card-icon-accent mx-auto mb-4">
            <svg className="card-icon-white w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg></div>
          <h2 className="h3-heading mb-2">Appointment Confirmed!</h2>
          <p className="paragraph mb-6">Your appointment has been successfully booked and payment received.</p>
          <hr className="my-4" />
          <div className="space-y-2 mb-6">
            <div className="flex flex-col items-center">
              <p className="h4-heading mb-2">Appointment Details</p>
              <p className="paragraph">{new Date(bookingDetails.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, {bookingDetails.time}</p>
              <p className="paragraph">{bookingDetails.location}</p>
            </div>
            <p className="paragraph text-sm mt-4">An email confirmation has been sent to {bookingDetails.email}</p>
            <p className="paragraph text-sm">Booking ID: <strong>{bookingId}</strong></p>
          </div>
          <div className="flex gap-4 justify-center">
            <button className="btn btn-primary" onClick={() => navigate(`/dashboard/track-appointment/${bookingId}`)}>Track Appointment</button>
            <button className="btn-secondary" onClick={handleDownloadReceipt}>Download Receipt</button>
          </div></div></div>);  }
  return (
    <div className="p-6 mt-6 bg-[var(--color-surface) ] shadow-lg rounded-2xl grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-2xl text-[var(--accent-color)] font-semibold mb-4">Select Payment Method</h2>
        <div className="space-y-1">
          {[
            { value: "upi", label: "UPI / Google Pay / PhonePe" },
            { value: "card", label: "Credit / Debit Card" },
            { value: "net", label: "Net Banking" }
          ].map((opt) => (
            <div key={opt.value} className="card-border-primary p-4 cursor-pointer hover:scale-[1.02] transition-transform">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="radio" name="payment" checked={method === opt.value} onChange={() => setMethod(opt.value)} className="w-4 h-4" />
                <span className="paragraph font-bold">{opt.label}</span>
              </label> </div> ))}</div>
        <div className="mt-6">
          {method === "upi" && (
            <div className="space-y-4">
              <div className="text-center">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=example@upi&pn=HealthLab&am=${bookingDetails.amount}`} alt="UPI QR Code" className="mx-auto" />
                <p className="paragraph text-sm mt-2">Scan & pay using any UPI app</p>
              </div>   <div>
                <label className="h4-heading block mb-1">Or enter your UPI ID</label>
                <input type="text" placeholder="e.g., user@upi" className="input-field" value={cardData.upi || ""} onChange={(e) => setCardData({ ...cardData, upi: e.target.value })} />
              </div> </div>)}
          {method === "card" && (
            <div className="space-y-3">
              <input type="text" placeholder="Card Number" className="input-field" value={cardData.number} onChange={(e) => setCardData({ ...cardData, number: e.target.value })} />
              {errors.number && <p className="error-text">{errors.number}</p>}
              <div className="flex gap-2">
                <input type="text" placeholder="MM/YY" className="input-field w-1/2" value={cardData.expiry} onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })} />
                <input type="text" placeholder="CVV" className="input-field w-1/2" value={cardData.cvv} onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })} />
              </div>
              {errors.expiry && <p className="error-text">{errors.expiry}</p>}
              {errors.cvv && <p className="error-text">{errors.cvv}</p>}
            </div>)}
          {method === "net" && (
            <div className="space-y-3 mt-3">
              <p className="paragraph mb-2">Select your bank:</p>
              <div className="flex flex-col space-y-2">
                {["Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"].map((bank) => (
                  <label key={bank} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="netbank" checked={selectedBank === bank} onChange={() => setSelectedBank(bank)} className="w-4 h-4" />
                    <span className="paragraph">{bank}</span>
                  </label>))}</div></div> )} </div>
        <button className="btn btn-primary mt-6" onClick={handlePayment} disabled={loading}>
          {loading ? "Processing..." : `Pay ₹${bookingDetails.amount}`} </button>
      </div>
      <div className="card-stat card-border-primary space-y-3">
        <h3 className="h4-heading mb-3">Appointment Summary</h3>
        <p className="paragraph"><strong>Patient:</strong> {bookingDetails.name}</p>
        <p className="paragraph"><strong>Test:</strong> {bookingDetails.testTitle}</p>
        <p className="paragraph"><strong>Lab:</strong> {bookingDetails.labName}</p>
        <p className="paragraph"><strong>Visit Type:</strong> {bookingDetails.location === bookingDetails.labLocation ? "Visit Lab" : "Home Sample Collection"}</p>
        <p className="paragraph"><strong>Address:</strong> {bookingDetails.location}</p>
        <p className="paragraph"><strong>Date & Time:</strong> {bookingDetails.date} at {bookingDetails.time}</p>
        <hr className="my-2" />
        <p className="paragraph"><strong>Test Amount:</strong> ₹{bookingDetails.amount}</p>
        <p className="paragraph"><strong>Collection Fee:</strong> ₹0</p>
        <p className="h4-heading mt-2">Total: <span className="h4-heading">₹{bookingDetails.amount}</span></p>
        <div className="card-stat-label bg-blue-50 p-2 rounded mt-2">You'll receive a confirmation email and your report within 24-48 hours after sample collection.</div>
      </div></div>);};export default PaymentPage;
