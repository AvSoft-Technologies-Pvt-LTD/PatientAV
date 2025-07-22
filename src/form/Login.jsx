import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, sendOTP, verifyOTP } from '../context-api/authSlice';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const dispatch = useDispatch(), navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [loginMethod, setLoginMethod] = useState('password'), [phone, setPhone] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [otp, setOtp] = useState(new Array(6).fill('')), [otpSent, setOtpSent] = useState(false), [otpError, setOtpError] = useState(''), [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loginMethod === 'password') {
      const res = await dispatch(loginUser({ email, password }));
      res.meta.requestStatus === 'fulfilled' ? navigate('/dashboard') : setOtpError('Invalid email or password');
    } else if (loginMethod === 'otp') await handleSendOTP();
  };
  const handleSendOTP = async () => {
    phone.length === 10 ? (await dispatch(sendOTP(phone)), setOtpSent(true), setOtpError('')) : setOtpError('Invalid phone number');
  };
  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length === 6) {
      const res = await dispatch(verifyOTP({ phone, otp: otpValue, type: 'login' }));
      res.meta.requestStatus === 'fulfilled' ? (setOtp(new Array(6).fill('')), navigate('/dashboard')) : setOtpError('Invalid OTP');
    } else setOtpError('Please enter a valid OTP');
  };
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };
  const switchLoginMethod = (method) => {
    setLoginMethod(method); setOtpError('');
    if (method === 'otp') { setEmail(''); setPassword(''); setOtpSent(false); setOtp(new Array(6).fill('')); }
    else { setPhone(''); setOtpSent(false); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F9FC]">
      <div className="flex items-center w-full max-w-4xl bg-white p-8 rounded-2xl shadow-md border border-gray-200">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-[var(--primary-color)] mb-6">Login to Your Account</h2>
          {loginMethod === 'password' && (
            <div>
              <div className="floating-input relative w-full mb-6" data-placeholder="Email">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field peer" required />
              </div>
              <div className="floating-input relative w-full mb-6" data-placeholder="Password">
                <input type={showPassword ? "text" : "password"} id="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field peer "  />
                <button type="button" tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 hover:text-[var(--primary-color)] focus:outline-none"
                  onClick={() => setShowPassword(prev => !prev)}>
                  {showPassword ?  <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              <button onClick={handleLogin} disabled={loading || !email || !password} className="btn btn-primary w-full">{loading ? 'Logging in...' : 'Login'}</button>
            </div>
          )}
          {loginMethod === 'otp' && (
            <>
              <div className="floating-input relative w-full mb-4" data-placeholder="Phone number">
                <input type="tel" id="phone" value={phone} onChange={e => { const value = e.target.value; if (/^\d{0,10}$/.test(value)) setPhone(value); }} className="input-field peer"  maxLength="10" />
                <button onClick={handleSendOTP} disabled={loading || phone.length !== 10} className="mt-2 bg-[var(--primary-color)] hover:bg-[var(--accent-color)] text-white py-2 px-4 rounded-lg">{loading ? 'Sending...' : 'Send OTP'}</button>
              </div>
              {otpSent && (
                <div className="mb-4">
                  <div className="flex gap-2 justify-between mb-2">
                    {otp.map((digit, index) => (<input key={index} id={`otp-${index}`} type="text" maxLength="1" value={digit} onChange={e => handleOtpChange(e.target.value, index)} className="input-field peer" />))}
                  </div>
                  <button onClick={handleVerifyOTP} disabled={loading || otp.join('').length !== 6} className="bg-[var(--primary-color)] text-white py-2 px-4 rounded-lg w-full">{loading ? 'Verifying...' : 'Verify OTP'}</button>
                </div>
              )}
            </>
          )}
          {otpError && <p className="text-red-500 text-sm mt-2">{otpError}</p>}
          <div className="flex justify-center mt-4">
            <button onClick={() => switchLoginMethod('password')} className={`px-4 py-2 rounded-l-lg border-b-2 ${loginMethod === 'password' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-gray-700'}`}>Password</button>
            <button onClick={() => switchLoginMethod('otp')} className={`px-4 py-2 rounded-r-lg border-b-2 ${loginMethod === 'otp' ? 'border-[var(--primary-color)] text-[var(--primary-color)]' : 'border-transparent text-gray-700'}`}>OTP</button>
          </div>
          <p className="text-sm text-gray-600 text-center mt-6">Don't have an account?{' '}
            <span className="text-[var(--accent-color)] hover:underline cursor-pointer" onClick={() => navigate('/registration')}>Register</span>
          </p>
        </div>
        <div className="w-full max-w-xs ml-8">
          <img src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg" alt="Login illustration" className="w-full h-auto rounded-xl animate-slideIn" />
        </div>
      </div>
    </div>
  );
};
export default Login;