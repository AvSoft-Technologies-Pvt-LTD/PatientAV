import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, sendOTP } from '../context-api/authSlice';
import { useNavigate } from 'react-router-dom';

const Verification = () => {
  const dispatch = useDispatch(), navigate = useNavigate();
  const { isOTPSent, isVerified, loading, error, user } = useSelector(state => state.auth);
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '', '', '']), [resendTimer, setResendTimer] = useState(30);

  useEffect(() => { if (!isOTPSent) dispatch(sendOTP(user.phone)); }, [dispatch, isOTPSent, user.phone]);
  useEffect(() => { if (isVerified) navigate('/healthcard'); }, [isVerified, navigate]);
  useEffect(() => { if (resendTimer > 0) { const timer = setInterval(() => setResendTimer(prev => prev - 1), 1000); return () => clearInterval(timer); } }, [resendTimer]);

  const handleOtpChange = (e, i) => {
    const v = e.target.value, updated = [...enteredOtp]; updated[i] = v; setEnteredOtp(updated);
    if (v && i < 5) document.getElementById(`otp-input-${i + 1}`)?.focus();
  };
  const handleVerifyOTP = () => {
    const otpValue = enteredOtp.join('');
    otpValue.length === 6 ? dispatch(verifyOTP({ phone: user.phone, otp: otpValue, type: 'register' })) : alert('Please enter a 6-digit OTP');
  };
  const handleResend = () => { dispatch(sendOTP(user.phone)); setResendTimer(30); };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f9fc]">
      <div className="bg-white shadow-lg w-full max-w-4xl p-6 flex items-center border border-gray-200">
        <div className="flex-1 space-y-6">
          <h2 className="text-2xl font-bold text-[var(--primary-color)] text-center">OTP Verification</h2>
          <p className="text-sm text-gray-600 text-center">Enter the 6-digit OTP sent to your registered number</p>
          <div className="flex justify-between gap-2 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <input key={i} type="text" maxLength="1" value={enteredOtp[i] || ''} onChange={e => handleOtpChange(e, i)}
                onKeyDown={e => { if (e.key === 'Backspace' && !enteredOtp[i]) { const prev = i - 1; if (prev >= 0) document.getElementById(`otp-input-${prev}`)?.focus(); } }}
                id={`otp-input-${i}`} className="w-12 h-12 text-center border border-gray-300 rounded-md text-xl font-semibold text-[var(--primary-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]" />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button onClick={handleVerifyOTP} className="w-full bg-[var(--accent-color)] hover:bg-[#00bd7c] transition-colors text-white font-semibold py-2 rounded-lg shadow-md mb-3" disabled={loading}>{loading ? 'Verifying...' : 'Submit & Proceed'}</button>
          <div className="text-center text-sm text-gray-600">
            {resendTimer > 0 ? <p>Resend OTP in {resendTimer} seconds</p> :
              <button onClick={handleResend} className="text-[var(--accent-color)] hover:underline font-medium" disabled={loading}>Resend OTP</button>}
          </div>
        </div>
        <div className="w-full max-w-xs ml-8">
          <img src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg" alt="Login illustration" className="w-full h-auto rounded-xl animate-slideIn" />
        </div>
      </div>
    </div>
  );
};

export default Verification;