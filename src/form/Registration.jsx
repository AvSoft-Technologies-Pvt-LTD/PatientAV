import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, sendOTP } from '../context-api/authSlice';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCamera } from 'react-icons/ai';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Register = () => {
  const dispatch = useDispatch(), navigate = useNavigate();
  const { loading, error, isOTPSent } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    firstName: '', middleName: '', lastName: '', phone: '', aadhaar: '', gender: '', dob: '', email: '', occupation: '', permanentAddress: '', temporaryAddress: '', isSameAsPermanent: false, photo: null, password: '', confirmPassword: '', agreeDeclaration: false,
  });
  const [formErrors, setFormErrors] = useState({}), [showPassword, setShowPassword] = useState(false), [isModalOpen, setIsModalOpen] = useState(false), [photoPreview, setPhotoPreview] = useState(null);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target, val = type === 'checkbox' ? checked : value;
    if (name === 'phone') return setFormData(prev => ({ ...prev, phone: value.replace(/\D/g, '').slice(0, 10) }));
    if (name === 'aadhaar') return setFormData(prev => ({ ...prev, aadhaar: value.replace(/\D/g, '').slice(0, 12).replace(/(\d{4})(\d{4})(\d{0,4})/, (_, g1, g2, g3) => [g1, g2, g3].filter(Boolean).join('-')) }));
    if (name === 'isSameAsPermanent') return setFormData(prev => ({ ...prev, isSameAsPermanent: val, temporaryAddress: val ? prev.permanentAddress : '' }));
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleFileChange = e => {
    const { name, files } = e.target;
    if (name === 'photo' && files.length > 0) {
      const file = files[0];
      if (file && file.type.startsWith('image/')) { setFormData(prev => ({ ...prev, photo: file })); setPhotoPreview(URL.createObjectURL(file)); }
      else alert('Please upload a valid image file.');
    }
  };

  const validateForm = () => {
    const errors = {}, phoneRegex = /^\d{10}$/, aadhaarRegex = /^\d{4}-\d{4}-\d{4}$/, emailRegex = /^\S+@\S+\.\S+$/, passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    const { firstName, lastName, phone, aadhaar, dob, email, occupation, permanentAddress, password, confirmPassword, agreeDeclaration } = formData;
    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";
    if (!phoneRegex.test(phone)) errors.phone = "Phone number must be exactly 10 digits";
    if (!aadhaarRegex.test(aadhaar)) errors.aadhaar = "Invalid Aadhaar format";
    if (!dob) errors.dob = "Date of birth is required";
    if (!emailRegex.test(email)) errors.email = "Enter a valid email";
    if (!occupation.trim()) errors.occupation = "Occupation is required";
    if (!permanentAddress.trim()) errors.permanentAddress = "Permanent address is required";
    if (!passwordRegex.test(password)) errors.password = "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!agreeDeclaration) errors.agreeDeclaration = "You must agree to the terms and conditions";
    setFormErrors(errors); return errors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) return;
    await dispatch(registerUser(formData));
    if (!isOTPSent) await dispatch(sendOTP(formData.phone));
    navigate('/verification');
  };

  return (
    <div className="min-h-screen bg-[#f5f9fc] flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white/70 backdrop-blur-xl sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/30 rounded-xl">
        <h2 className="text-3xl font-bold text-center text-[var(--primary-color)] drop-shadow mb-2">Register as Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {['firstName', 'middleName', 'lastName', 'phone', 'aadhaar', 'gender', 'dob', 'email', 'occupation', 'permanentAddress', 'temporaryAddress'].map((field, index) => (
              <div key={index} className="space-y-1 floating-input relative" data-placeholder={
                (field === 'firstName' && 'First Name *') ||
                (field === 'middleName' && 'Middle Name') ||
                (field === 'lastName' && 'Last Name *') ||
                (field === 'phone' && 'Phone Number *') ||
                (field === 'aadhaar' && 'Aadhaar Number *') ||
                (field === 'dob' && 'Date of Birth *') ||
                (field === 'email' && 'Email Address *') ||
                (field === 'occupation' && 'Occupation *') ||
                (field === 'permanentAddress' && 'Permanent Address *') ||
                (field === 'temporaryAddress' && 'Temporary Address') || ''
              }>
                {field === 'gender' ? (
                  <select name={field} onChange={handleInputChange} value={formData[field]} className="input-field peer">
                    <option value="">Select Gender *</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <input name={field} type={field === 'dob' ? 'date' : field === 'email' ? 'email' : 'text'} placeholder=" " onChange={handleInputChange} value={formData[field]} className="input-field peer" />
                )}
                {formErrors[field] && <p className="error-text">{formErrors[field]}</p>}
              </div>
            ))}
            <div className="relative flex flex-col gap-2">
              <label className="flex items-center border border-gray-300 rounded-lg p-2 pr-3 bg-white shadow-sm cursor-pointer overflow-hidden">
                <AiOutlineCamera className="text-xl text-gray-500 mr-2" />
                <span className="flex-1 truncate text-gray-700">{formData.photo ? formData.photo.name : 'Upload Photo'}</span>
                <input type="file" accept="image/*" name="photo" onChange={handleFileChange} className="hidden" />
                {formData.photo && <button type="button" onClick={() => setIsModalOpen(true)} className="text-sm text-blue-600 flex items-center gap-1 w-fit mt-1"><FiEye /></button>}
              </label>
              {formErrors.photo && <p className="error-text">{formErrors.photo}</p>}
            </div>
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="isSameAsPermanent" checked={formData.isSameAsPermanent} onChange={handleInputChange} className="mr-2" />
            <span className="text-sm">Temporary address is the same as permanent address</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
            {['password', 'confirmPassword'].map((field, index) => (
              <div className="relative space-y-1 floating-input" data-placeholder={field === 'password' ? 'Password *' : 'Confirm Password *'} key={index}>
                <input name={field} type={showPassword ? 'text' : 'password'} placeholder=" " onChange={handleInputChange} value={formData[field]} className="input-field peer pr-8" />
                <button type="button" tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 hover:text-[var(--primary-color)] focus:outline-none"
                  onClick={() => setShowPassword(prev => !prev)} style={{ display: field === 'password' || field === 'confirmPassword' ? 'block' : 'none' }}>
                  {showPassword ?  <FiEye /> : <FiEyeOff />}
                </button>
                {formErrors[field] && <p className="error-text">{formErrors[field]}</p>}
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <input type="checkbox" name="agreeDeclaration" checked={formData.agreeDeclaration} onChange={handleInputChange} className="mr-2" />
            <span className="text-sm">I agree to the declaration *</span>
          </div>
          {formErrors.agreeDeclaration && <p className="error-text">{formErrors.agreeDeclaration}</p>}
          <div className="flex justify-center">
            <button type="submit" disabled={loading} className="btn btn-primary w-full md:w-auto">{loading ? "Submitting..." : "Verify & Proceed"}</button>
          </div>
          {error && <p className="error-text mt-2">{error}</p>}
          <div className="text-center mt-4 text-[var(--primary-color)]">
            <p>Already have an account? <button type="button" onClick={() => navigate("/login")} className="text-[var(--accent-color)] font-semibold">Login Here</button></p>
          </div>
          {isModalOpen && photoPreview && (
            <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded shadow-lg relative">
                <img src={photoPreview} alt="Preview" className="max-h-[50vh] max-w-full animate-float" style={{ animation: "float 3s ease-in-out infinite" }} />
                <button onClick={() => setIsModalOpen(false)} className="absolute top-2 right-6 text-xl text-red-600">&times;</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;