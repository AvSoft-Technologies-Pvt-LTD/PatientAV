import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaHospital, FaStethoscope, FaFlask, FaPills } from 'react-icons/fa';

const RegisterSelect = () => {
  const navigate = useNavigate(), [isOpen, setIsOpen] = useState(false);
  const userType = [
    { label: "Patient", value: "patient", icon: <FaUser className="mr-2" /> },
    { label: "Hospital", value: "hospital", icon: <FaHospital className="mr-2" /> },
    { label: "Doctor", value: "doctor", icon: <FaStethoscope className="mr-2" /> },
    { label: "Labs / Scan", value: "lab", icon: <FaFlask className="mr-2" /> },
    // { label: "Pharmacy", value: "pharmacy", icon: <FaPills className="mr-2" /> },
  ];
  return (
    <div className="min-h-screen bg-[#f5f9fc] flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-4xl p-8 bg-white shadow-lg">
        <div className="w-full md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-center h2-heading">Your <span className="text-[var(--accent-color)]">Health</span>, Our Priority. Expert <span className="text-[var(--accent-color)]">Care</span> You Can Trust</h2>
          <p className="paragraph text-center m-6">"Empowering Your Health Journey with AVSwasthya — <span className="text-[var(--accent-color)]">Personalized Care</span> at Your Fingertips, <span className="text-[var(--accent-color)]">Trusted Services</span> Around the Clock."</p>
          <div className="relative w-full">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-2 text-lg bg-white text-gray-700 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition">Who Am I?</button>
            {isOpen && <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">{userType.map(o => <div key={o.value} onClick={() => navigate("/registration", { state: { userType: o.value } })} className="flex items-center px-4 py-2 text-gray-700 hover:bg-[var(--accent-color)] hover:text-white cursor-pointer">{o.icon}{o.label}</div>)}</div>}
          </div>
        </div>
          <div className="w-full max-w-xs ml-8">
          <img src="https://img.freepik.com/premium-vector/doctor-examines-report-disease-medical-checkup-annual-doctor-health-test-appointment-tiny-person-concept-preventive-examination-patient-consults-hospital-specialist-vector-illustration_419010-581.jpg" alt="Login illustration" className="w-full h-auto rounded-xl animate-slideIn" />
        </div>
      </div>
    </div>
  );
};

export default RegisterSelect;
