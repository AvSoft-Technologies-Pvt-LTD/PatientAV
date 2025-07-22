import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCallOutline } from "react-icons/io5";
import {
  RiHospitalLine,
  RiBankCardLine,
  RiBriefcaseLine,
  RiShieldCheckLine,
  RiCapsuleFill,
  RiStethoscopeFill,
  RiFlaskLine,
  RiArrowDropDownFill
} from "react-icons/ri";

const Navbar = () => {
  const [dropdown, setDropdown] = useState(null);
  const navigate = useNavigate();
  const toggleDropdown = menu => setDropdown(dropdown === menu ? null : menu);

  const services = [
    { label: 'Healthcard', icon: <RiBankCardLine /> },
    { label: 'Consultation', icon: <RiStethoscopeFill /> },
    { label: 'Pharmacy', icon: <RiCapsuleFill /> },
    { label: 'Insurance', icon: <RiShieldCheckLine /> },
    { label: 'Emergency', icon: <IoCallOutline /> }
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-xl px-6 py-2 flex justify-between items-center sticky top-0 text-lg shadow-lg z-50 transition-all duration-300">
      <div className='flex items-center text-3xl'>
        <div>Logo</div>
        <h1 className='h2-heading ml-6'>A<span className="text-[var(--accent-color)]">V</span>Swasthya</h1>
      </div>
      {/* <ul className='flex gap-4 font-semibold text-[var(--primary-color)]'>
        {[
          { icon: <RiBankCardLine />, label: 'My Health Card' },
          { icon: <RiStethoscopeFill />, label: 'For Doctors', key: 'doctors' },
          { icon: <RiFlaskLine />, label: 'E-Labs', key: 'labs' },
          { icon: <RiHospitalLine />, label: 'For Hospitals', key: 'hospitals' }
        ].map(({ icon, label, key }) => (
          <li
            key={label}
            onClick={() => key && toggleDropdown(key)}
            className='relative cursor-pointer flex items-center gap-1 hover:text-[var(--accent-color)] transition
              before:content-[""] before:absolute before:left-0 before:-bottom-1 before:h-[2px]
              before:w-0 before:bg-[var(--accent-color)] before:transition-all before:duration-300
              hover:before:w-full'
          >
            {icon} {label}
          </li>
        ))}
        <li
          className='relative group cursor-pointer flex items-center gap-1 hover:text-[var(--accent-color)] transition
            before:content-[""] before:absolute before:left-0 before:-bottom-1 before:h-[2px]
            before:w-0 before:bg-[var(--accent-color)] before:transition-all before:duration-300
            hover:before:w-full'
        >
          <RiBriefcaseLine size={20} /> Services <RiArrowDropDownFill />
          <ul className='absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 bg-white border border-gray-200 py-2 px-3 mt-2 rounded-xl shadow-xl w-52 z-20 top-14 transition-all duration-200'>
            {services.map(({ label, icon }) => (
              <li
                key={label}
                className='flex items-center text-sm gap-2 px-3 py-2 text-[var(--primary-color)]
                  hover:bg-[var(--accent-color)] hover:text-white hover:rounded-lg
                  transition-all duration-150 cursor-pointer'
              >
                {icon} {label}
              </li>
            ))}
          </ul>
        </li>
      </ul> */}
      <div className='flex gap-3 '>
        <button
  onClick={() => navigate('/login')}
  className="group relative inline-flex items-center justify-center px-8 py-2 overflow-hidden font-semibold text-[var(--accent-color)] bg-white border border-[var(--accent-color)] rounded-full shadow-md transition duration-300 ease-in-out hover:shadow-lg">
  <span className="absolute top-0 left-0 w-0 h-[2px] bg-[var(--accent-color)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
  <span className="absolute bottom-0 right-0 w-0 h-[2px] bg-[var(--accent-color)] transition-all duration-300 ease-in-out group-hover:w-full"></span>
  <span className="absolute inset-0 bg-[var(--accent-color)] opacity-0 transform scale-0 group-hover:scale-120 group-hover:opacity-100 transition-all duration-500 ease-out origin-center rotate-6"></span>
  <span className="absolute inset-0 rounded-full border border-transparent group-hover:border-[var(--accent-color)] group-hover:shadow-[0_0_15px_var(--accent-color)] transition-all duration-300 ease-in-out"></span>
  <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-white"> Login</span>
</button>
        <button className='btn btn-primary relative overflow-hidden group' onClick={() => navigate('/register')}><span className="absolute inset-0 bg-[var(--accent-color)] z-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
          <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Register</span></button>
      </div>
    </nav>
  );
};

export default Navbar;

