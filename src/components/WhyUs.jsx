import React, { useRef, useEffect, useState } from "react";
import { FaShieldAlt, FaUserMd, FaRobot, FaCapsules } from "react-icons/fa";
import { MdHowToReg, MdAssignment, MdDateRange, MdHeadsetMic } from "react-icons/md";
import whyChoose1 from "../assets/99e672c7-f9a2-4070-b3f5-3a49174776bc-removebg-preview.png";
import whyChoose2 from "../assets/team-removebg-preview.png";

const IconWrapper = ({ children }) => <div className="w-19 h-12 flex items-center justify-center rounded-md bg-gradient-to-b from-[var(--accent-color)] to-[var(--accent-color)]/40 shadow-md text-2xl">{children}</div>;
const IconWrapper1 = ({ children }) => <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-b from-[var(--accent-color)] to-[var(--accent-color)]/40 shadow-md text-2xl">{children}</div>;

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
  const headingRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [stepsInView, setStepsInView] = useState(Array(steps.length).fill(false));
  const stepRefs = useRef([]);

  useEffect(() => {
    const observer = new window.IntersectionObserver(([entry]) => entry.isIntersecting && setInView(true), { threshold: 0.6 });
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, idx) =>
      ref ? new window.IntersectionObserver(([entry]) => entry.isIntersecting && setStepsInView(prev => { const updated = [...prev]; updated[idx] = true; return updated; }), { threshold: 0.4 }) : null
    );
    stepRefs.current.forEach((ref, idx) => ref && observers[idx] && observers[idx].observe(ref));
    return () => observers.forEach((observer, idx) => observer && stepRefs.current[idx] && observer.disconnect());
  }, []);

  return (
    <section className="bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="h2-heading">Why & How </h2>
        <h1 className="text-3xl md:text-4xl font-semibold mt-2 overflow-hidden" style={{ color: "var(--primary-color)" }}>
          <span ref={headingRef} className={`inline-block text-[var(--accent-color)] transition-all duration-700 ease-out ${inView ? "heading-fade-up-inview" : "heading-opacity-0"}`}>AVSwasthya Works?</span>
        </h1>
        <p className="paragraph max-w-3xl mt-2 mx-auto">
          AV Swasthya is your one-stop digital healthcare solution, ensuring seamless access to doctors, hospitals, pharmacies, and labs with AI-driven insights and exclusive benefits.
        </p>
        <div className="flex flex-col md:flex-row items-center gap-12 ms-8">
          <div className="w-full md:w-1/2">
            <h3 className="h3-heading">Why Choose AV Swasthya?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 ms-9">
              {features.map(({ icon, title, description }, i) => (
                <div key={i} className="flex items-center p-5 bg-white rounded-xl shadow-md transition-transform duration-300 hover:scale-105 ">
                  <IconWrapper>{icon}</IconWrapper>
                  <div className="ml-4">
                    <p className="paragraph font-bold">{title}</p>
                    <p className="paragraph text-sm">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 relative ms-10">
            <div className="absolute top-3 right-20 bg-[var(--accent-color)] opacity-40 rounded-full w-40 h-40"></div>
            <div className="absolute bottom-[-2px] left-[-40px] bg-[var(--accent-color)] opacity-60 w-[50px] h-[50px] rotate-45"></div>
            <img src={whyChoose1} alt="Healthcare Professional" className="w-full max-w-md object-cover rounded-lg brightness-100" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-12 mt-16 ms-10">
          <div className="w-full md:w-1/2 relative">
            <div className="absolute top-[-20px] left-[-30px] bg-[var(--accent-color)] opacity-60 w-40 h-40 rounded-full"></div>
            <div className="absolute top-1/2 right-[-10px] bg-[var(--accent-color)] w-16 h-16 rotate-45 rounded-full"></div>
            <div className="absolute bottom-[-2px] left-[-40px] bg-[var(--accent-color)] opacity-60 w-35 h-35 rounded-lg"></div>
            <img src={whyChoose2} alt="Healthcare Process" className="w-full max-w-md object-cover rounded-lg brightness-100" />
          </div>
          <div className="w-full md:w-1/2 me-16">
            <h3 className="h2-heading blink-heading">
  {"How We Work?".split("").map((char, index) => (
    <span key={index}>
      {char === " " ? "\u00A0" : char}
    </span>
  ))}
</h3>
            <div className="relative mt-6">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-[var(--accent-color)] rounded-lg"></div>
              {steps.map(({ icon, title, description }, i) => (
                <div key={i} ref={el => (stepRefs.current[i] = el)} className={`relative flex items-center ${i % 2 === 0 ? "flex-row-reverse" : ""} mb-6`}>
                  <div className={`w-full max-w-xs p-3 bg-white rounded-lg shadow-md transform transition-transform hover:scale-105 flex items-center gap-3 group
                    ${stepsInView[i] ? i % 2 === 0 ? "custom-slide-in-right" : "custom-slide-in-left" : "custom-opacity-0"}`}>
                    <IconWrapper1>{icon}</IconWrapper1>
                    <div>
                      <p className="paragraph font-bold">{title}</p>
                      <p className="paragraph text-sm">{description}</p>
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