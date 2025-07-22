import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
const BookLab = () => {
  const { state } = useLocation();
  const { test, lab } = state || {};
  const navigate = useNavigate();
  const [form, setForm] = useState({
    location: "Visit Lab", address: "", date: "", time: "", fullName: "", phone: "", email: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "phone" ? value.replace(/\D/g, "") : value });
    setErrors({ ...errors, [name]: "" });
  };
  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (form.fullName.length > 20) newErrors.fullName = "Full name must be 20 characters or less";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(form.phone)) newErrors.phone = "Phone number must be exactly 10 digits";
    if (!form.date) newErrors.date = "Date is required";
    if (!form.time) newErrors.time = "Time is required";
    if (form.location === "Home Collection" && test.type !== "Scan" && !form.address.trim()) newErrors.address = "Address is required for home collection";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async () => {
    if (!validateForm()) return false;
    try {
      setLoading(true);
      await axios.post("https://680b3642d5075a76d98a3658.mockapi.io/Lab/appointments",
        { testTitle: test.title, labName: lab.name, labLocation: lab.location, testPrice: lab.price, originalPrice: lab.originalPrice, ...form });
      return true;
    } catch (error) {
      console.error(error);
      alert("Booking failed!");
      return false;
    } finally {
      setLoading(false);
    }
  };
  const handleProceed = async () => {
    const success = await handleSubmit();
    if (success) navigate("/dashboard/payment1", {
      state: {
        name: form.fullName, email: form.email, date: form.date, time: form.time,
        location: form.location === "Home Collection" && test.type !== "Scan" ? form.address : lab.location,
        amount: lab.price, testTitle: test.title, labName: lab.name, labLocation: lab.location
      }
    });
  };
  return (
    <div className="mt-6 p-6 bg-[var(--color-surface)] shadow-lg rounded-2xl">
      <button onClick={() => navigate(-1)} className="text-gray-600 hover:underline mb-4">
        ← Back to Lab Details
      </button>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h4 className="h4-heading mb-6">Book Appointment</h4>
          <div className="flex gap-4 mb-6">
            <button
              disabled={test.type === "Scan"}
              className={`view-btn ${form.location === "Home Collection" ? "" : "bg-gray-200"}`}
              onClick={() =>
                test.type !== "Scan" && setForm({ ...form, location: "Home Collection" })
              }
            >
              Home Collection
            </button>
            <button
              className={`btn btn-primary ${form.location === "Visit Lab" ? "" : ""}`}
              onClick={() => setForm({ ...form, location: "Visit Lab" })}
            >
              Visit Lab
            </button>
          </div>
          {form.location === "Home Collection" && test.type !== "Scan" && (
            <div className="mb-6">
              <div className="floating-input relative w-full mb-4" data-placeholder="Enter your address">
                <textarea
                  name="address"
                  placeholder=" "
                  value={form.address}
                  onChange={handleChange}
                  className="input-field peer"
                  rows={2}
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>
          )}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="floating-input relative w-full mb-4" data-placeholder="Date">
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="input-field peer"
                  placeholder=" "
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>
            <div className="flex-1">
              <div className="floating-input relative w-full mb-4" data-placeholder="Time">
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleChange}
                  className="input-field peer"
                  placeholder=" "
                />
              </div>
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time}</p>
              )}
            </div>
          </div>
          <div className="flex gap-4 mb-6">
            <div className="flex-1 floating-input relative w-full mb-4" data-placeholder="Full Name">
              <input
                name="fullName"
                placeholder=" "
                maxLength={20}
                value={form.fullName}
                onChange={handleChange}
                className="input-field peer"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>
            <div className="flex-1 floating-input relative w-full mb-4" data-placeholder="Phone Number">
              <input
                name="phone"
                placeholder=" "
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                className="input-field peer"
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleProceed}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Booking..." : "Proceed to Payment"}
          </button>
        </div>
        <div className="lg:w-1/3">
          <div className="card-stat">
            <h3 className="h4-heading mb-4">Appointment Summary</h3>
            <div className="paragraph">
              <p><strong>Test:</strong> {test.title}</p>
              <p><strong>Lab:</strong> {lab.name}</p>
              <p>
                <strong>Location:</strong>{" "}
                {form.location === "Home Collection" && test.type !== "Scan"
                  ? form.address || "Home address not entered"
                  : lab.location}
              </p>
              <hr className="my-2" />
              <p><strong>Test Price:</strong> <span className="paragraph">₹{lab.price}</span></p>
              <p>
                <strong>Home Collection Fee:</strong>{" "}
                <span className="paragraph">₹{form.location === "Home Collection" && test.type !== "Scan" ? "0" : "0"}</span>
              </p>
              <p className="h4-heading mt-4">
                Total:{" "}
                <span className="h4-heading">₹{lab.price}</span>
              </p>
            </div>
            <div className="text-sm text-gray-500 mt-4">
              Your report will be ready within 24-48 hours after sample
              collection. You'll receive an email notification once it's ready.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BookLab;