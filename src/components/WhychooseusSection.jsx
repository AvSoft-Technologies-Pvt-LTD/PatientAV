

import React from "react";
import { FaShieldAlt, FaUserMd, FaRobot, FaCapsules } from "react-icons/fa";
import { MdHowToReg, MdAssignment, MdDateRange, MdHeadsetMic } from "react-icons/md";
import whyChoose1 from "../assets/99e672c7-f9a2-4070-b3f5-3a49174776bc-removebg-preview.png";
import whyChoose2 from "../assets/team-removebg-preview.png";

const IconWrapper = ({ children }) => (
  <div className="w-19 h-12 flex items-center justify-center rounded-md bg-gradient-to-b from-cyan-400 to-cyan-700 shadow-md text-white text-2xl">
    {children}
  </div>
);

const IconWrapper1 = ({ children }) => (
  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-b from-cyan-400 to-cyan-700 shadow-md text-white text-2xl">
    {children}
  </div>
);

const features = [
  { icon: <FaShieldAlt />, title: "Secure & Trusted", description: "Your health data is encrypted & protected." },
  { icon: <FaUserMd />, title: "Seamless Access", description: "One platform for hospitals, doctors, labs & pharmacies." },
  { icon: <FaRobot />, title: "AI-Driven Insights", description: "Smart health tracking & AI-based recommendations." },
  { icon: <FaCapsules />, title: "Exclusive Benefits", description: "Enjoy discounts on medicines & healthcare services." },
];

const steps = [
  { icon: <MdHowToReg />, title: "Register & Connect", description: "Sign up & link to hospitals, doctors & pharmacies." },
  { icon: <MdAssignment />, title: "Manage Health Records", description: "Store your medical history securely." },
  { icon: <MdDateRange />, title: "Book & Track Appointments", description: "Schedule consultations, lab tests & medicine orders." },
  { icon: <MdHeadsetMic />, title: "24/7 Assistance", description: "Our support team is always ready to help." },
];

const WhyAndHowSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-cyan-700">
          Why & How <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">AV Swasthya Works?</span>
        </h2>
        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
          AV Swasthya is your one-stop digital healthcare solution, ensuring seamless access to doctors, hospitals, pharmacies, and labs with AI-driven insights and exclusive benefits.
        </p>

        {/* Why Choose Us Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mt-12 ms-8">
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl font-semibold text-cyan-700 mb-6">Why Choose AV Swasthya?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ms-9">
              {features.map(({ icon, title, description }, index) => (
                <div key={index} className="flex items-center p-5 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105 hover:bg-gradient-to-r from-cyan-400 to-cyan-700 hover:text-white group">
                  <IconWrapper>{icon}</IconWrapper>
                  <div className="ml-4">
                    <h3 className="text-lg text-cyan-600 font-semibold group-hover:text-white">{title}</h3>
                    <p className="text-sm group-hover:text-white">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 relative ms-10">


          <div className="absolute top-3 right-20 bg-cyan-300 opacity-40 rounded-full w-40 h-40  "></div>
          <div className="absolute bottom-[-2px] left-[-40px] bg-cyan-400 opacity-60 w-[50px] h-[50px] rotate-45"></div>

          <img src={whyChoose1} alt="Healthcare Professional" className="w-full max-w-md object-cover rounded-lg brightness-100" />
           </div>
        </div>

        {/* How We Work Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mt-16 ms-10">
        <div className="w-full md:w-1/2 relative">
    {/* Purple Oval - Top Left */}
    <div className="absolute top-[-20px] left-[-30px] bg-cyan-200 opacity-60 w-40 h-40 rounded-full"></div>

    {/* Yellow Diamond - Center Right */}
    <div className="absolute top-1/2 right-[-10px] bg-cyan-200 w-16 h-16 rotate-45 rounded-full"></div>

    {/* Green Rounded Rectangle - Bottom Left */}
    <div className="absolute bottom-[-2px] left-[-40px] bg-cyan-500 opacity-60 w-35 h-35 rounded-lg"></div>

    {/* Image with Brightness Effect */}
    <img src={whyChoose2} alt="Healthcare Process" className="w-full max-w-md object-cover rounded-lg brightness-100" />
</div>

          <div className="w-full md:w-1/2 me-16">
            <h3 className="text-xl font-semibold text-cyan-700 text-center">How We Work?</h3>
            <div className="relative mt-6">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-cyan-400 rounded-lg"></div>
              {steps.map(({ icon, title, description }, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? "flex-row-reverse" : ""} mb-6`}>                  
                  <div className="w-full max-w-xs p-3 bg-white rounded-lg shadow-md transform transition-transform hover:scale-105 hover:bg-gradient-to-r from-cyan-400 to-cyan-700 hover:text-white flex items-center gap-3 group">
                    <IconWrapper1>{icon}</IconWrapper1>
                    <div>
                      <h3 className="text-sm text-cyan-600 font-medium group-hover:text-white">{title}</h3>
                      <p className="text-xs text-gray-500 mt-1 group-hover:text-white">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyAndHowSection;
