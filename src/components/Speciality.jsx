import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHeartbeat, FaBaby, FaBone, FaPills, FaStethoscope, FaProcedures, FaMicroscope, FaSun, FaEye, FaCut, FaLungs, FaBrain
} from 'react-icons/fa';
import { MdOutlineChevronRight } from 'react-icons/md';

const specialties = [
  { name: "Cardiology", Icon: FaHeartbeat, slug: "cardiology", description: ["Heart diagnostics and evaluations", "Advanced treatment and surgeries", "Preventive cardiology services"] },
  { name: "Gynecology", Icon: FaBaby, slug: "gynecology", description: ["Prenatal and postnatal care", "Fertility assessments", "Gynecological surgeries"] },
  { name: "Orthopedics", Icon: FaBone, slug: "orthopedics", description: ["Bone and joint care", "Sports injury management", "Orthopedic surgeries"] },
  { name: "Oncology", Icon: FaMicroscope, slug: "oncology", description: ["Chemotherapy and radiation", "Personalized cancer treatment", "Surgical oncology services"] },
  { name: "ENT", Icon: FaStethoscope, slug: "ent", description: ["Ear, nose, and throat treatment", "Hearing and sinus disorders", "Minimally invasive procedures"] },
  { name: "Urology", Icon: FaProcedures, slug: "urology", description: ["Urinary tract disorder treatment", "Male reproductive care", "Minimally invasive urological surgery"] },
  { name: "Neurology", Icon: FaBrain, slug: "neurology", description: ["Brain and nervous system care", "Stroke and seizure management", "Neurodegenerative disease treatment"] },
  { name: "Dermatology", Icon: FaSun, slug: "dermatology", description: ["Skin disease diagnosis", "Cosmetic dermatology", "Allergy and rash treatment"] },
  { name: "Ophthalmology", Icon: FaEye, slug: "ophthalmology", description: ["Vision and eye care", "Cataract and LASIK surgery", "Retinal and corneal treatment"] },
  { name: "Surgery", Icon: FaCut, slug: "surgery", description: ["General and emergency surgery", "Minimally invasive techniques", "Post-operative care and rehab"] },
  { name: "Pulmonology", Icon: FaLungs, slug: "pulmonology", description: ["Lung and respiratory care", "Asthma and bronchitis treatment", "Sleep apnea diagnosis"] },
  { name: "Gastroenterology", Icon: FaPills, slug: "gastroenterology", description: ["Digestive system treatment", "Endoscopic procedures", "Liver and bowel care"] }
];

function Speciality() {
  const [showAll, setShowAll] = useState(false);
  const displayedSpecialties = showAll ? specialties : specialties.slice(0, 6);

  return (
    <div className="w-full bg-[#f5f5f5] py-16 ">
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-[var(--accent-color)]/10 rounded-full blur-xl" />
          <span className="relative inline-block text-[var(--accent-color)] text-xs font-semibold tracking-wider uppercase mb-3 py-1.5 px-3 rounded-full bg-[var(--accent-color)]/10">Healthcare Excellence</span>
          <h2 className="h2-heading">Our Medical <span className="text-[var(--accent-color)]">Specializations</span></h2>
          <div className="flex items-center justify-center gap-2 mb-6"><div className="h-0.5 w-6 bg-[var(--accent-color)] rounded-full" /><div className="h-0.5 w-16 bg-[var(--accent-color)] rounded-full" /><div className="h-0.5 w-6 bg-[var(--accent-color)] rounded-full" /></div>
          <p className="text-[var(--primary-color)]/70 text-base max-w-2xl mx-auto">Discover our comprehensive range of specialized medical services, delivered by expert healthcare professionals dedicated to your well-being.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {displayedSpecialties.map((s, i) => (
            <div key={i} className="group bg-white rounded-xl p-4 shadow hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-color)]/5 rounded-full -translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start gap-4">
                <div className="bg-[#f5f5f5] p-3 rounded-xl group-hover:bg-[var(--primary-color)]/10 transition-colors duration-300 flex-shrink-0">
                  <s.Icon className="w-6 h-6 text-[var(--primary-color)] group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="flex flex-col items-start">
                  <h4 className="h4-heading group-hover:text-[var(--accent-color)] transition-colors duration-300">{s.name}</h4>
                  <ul className="text-sm text-[var(--primary-color)]/70 mt-1 list-disc list-inside space-y-1">{s.description.map((d, j) => <li key={j}>{d}</li>)}</ul>
                  <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <Link to={`/specialties/${s.slug}`} className="flex items-center gap-1.5 text-[var(--accent-color)] text-sm font-medium hover:gap-2 transition-all duration-300">
                      Learn More
                      <MdOutlineChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent-color)] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-6">
          <button className=" btn btn-primary " onClick={() => setShowAll(v => !v)}>
            <span className="relative z-10 flex items-center gap-2">
              {showAll ? "Show Less Specialties" : "Explore All Specialties"}
              <MdOutlineChevronRight className={`w-4 h-4 transition-all duration-300 ${showAll ? 'rotate-180' : 'group-hover:translate-x-1'}`} />
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}

export default Speciality;
