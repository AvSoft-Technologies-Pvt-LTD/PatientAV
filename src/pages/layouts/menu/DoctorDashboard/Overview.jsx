import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, UserPlus, Video, UserCheck, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import DoctorAppointments from "./Appointments";
import { motion } from "framer-motion";
import profile from "../../../../assets/avtar.jpg";
 // Adjust the path as necessary
const Overview = () => {
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({ totalPatients: 0, opdPatients: 0, ipdPatients: 0, virtualPatients: 0 });
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

useEffect(() => { (async () => { setIsLoading(true); try { const res = await axios.get('https://mocki.io/v1/e676865d-b4a5-41b5-bf1f-d28b927afd6a'); const { doctor, appointments, payments } = res.data; setDoctor(doctor); setAppointments(appointments); const safePayments = Array.isArray(payments) ? payments : []; setRevenue({ total: safePayments.reduce((s, p) => s + Number(p.amount), 0), breakdown: calculateRevenueBreakdown(safePayments) }); setStats(calculatePatientStats(safePayments)); } catch (err) { console.error('Error fetching data:', err); setError('Failed to load dashboard data. Please try again later.'); } finally { setIsLoading(false); } })(); }, []);
const calculatePatientStats = payments => { const s = { totalPatients: new Set(payments.map(p => p.patientName)).size, opdPatients: 0, ipdPatients: 0, virtualPatients: 0 }; payments.forEach(p => { const t = p.serviceType?.toLowerCase() || ''; if (t.includes('opd')) s.opdPatients++; else if (t.includes('ipd')) s.ipdPatients++; else if (t.includes('virtual')) s.virtualPatients++; }); return s; };

  const calculateRevenueBreakdown = payments => { const groups = {}, colors = { 'Virtual Consultation': 'text-[var(--color-overlay)]', 'Physical Consultation': 'text-[var(--color-overlay)]', 'IPD Treatment': 'text-[var(--color-overlay)]', 'OPD Treatment': 'text-[var(--color-overlay)]', 'Lab Tests': 'text-[var(--color-overlay)]', 'Other': 'text-[var(--primary-color)]-600' }; payments.forEach(p => { const type = p.serviceType || 'Other'; if (!groups[type]) groups[type] = { count: 0, amount: 0 }; groups[type].count++; groups[type].amount += Number(p.amount); }); return Object.entries(groups).map(([type, data]) => ({ type, count: data.count, amount: data.amount, color: colors[type] || 'text-[var(--primary-color)]-600' })); };
  function getIconBgClass(type) {
  if (!type) return "card-icon-primary"; const t = type.toLowerCase();
  if (t.includes("virtual") || t.includes("lab")) return "card-icon-accent";
  return "card-icon-primary";
}
 if (isLoading)
    return (
     <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
                  </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--primary-color)]-50">
        <div className="text-red-500">{error}</div>
      </div>
    );

  return (
    <motion.div
      className="min-h-screen bg-[var(--primary-color)]-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div className="bg-[var(--color-surface)] text-[var(--color-surface)] px-6 py-5 rounded-lg shadow-md mt-4" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
  <div className="container mx-auto flex flex-col md:flex-row items-start md:items-center justify-between">
    <div className="flex items-center mb-4 md:mb-0">
      <div className="relative"><img src={profile} alt={doctor.name} className="w-20 h-20 rounded-full border-2 border-[var(--accent-color)]" /><div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 card-border-primary" /></div>
      <div className="ml-4"><div className="text-sm font-medium text-[var(--primary-color)]">Good Morning</div><h4 className="h4-heading">{doctor.name}</h4><div className="flex flex-col sm:flex-row sm:items-center text-[var(--primary-color)]"><span className="mr-2">{doctor.specialty}</span><span className="hidden sm:inline">•</span><span className="mr-2 ml-0 sm:ml-2">{doctor.qualifications}</span><span className="hidden sm:inline">•</span><span className="ml-0 sm:ml-2">Reg: {doctor.registrationId}</span></div><div className="flex items-center mt-1"><div className="flex items-center">{[...Array(5)].map((_, i) => (<svg key={i} className={`w-4 h-4 ${i < Math.floor(doctor.rating) ? "text-[var(--accent-color)]" : "text-[var(--primary-color)]"}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>))}<span className="ml-1 text-sm text-[var(--primary-color)]">{doctor.rating} ({doctor.reviewCount} reviews)</span></div></div></div>
    </div>
    <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
      <div className="text-right"><div className="text-lg font-medium">{doctor.currentDate}</div></div>
      <button className="relative overflow-hidden flex items-center bg-[var(--accent-color)] text-[var(--primary-color)] px-4 py-2 rounded-full font-medium shadow-md transition-colors duration-300 ease-in-out group"><span className="absolute inset-0 bg-[var(--primary-color)] -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out pointer-events-none"></span><Calendar className="relative w-5 h-5 mr-2 text-[var(--color-surface)] group-hover:text-white transition-colors duration-300" /><span className="relative text-[var(--color-surface)] group-hover:text-white transition-colors duration-300">{doctor.appointmentsToday} appointments today</span></button>
    </div>
  </div>
</motion.div>
 <div className="container mx-auto px-2 py-6">
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{["Total Patients", "OPD Patients", "IPD Patients", "Virtual Patients"].map((label, i) => { const icons = [<Users className="h-6 w-6 card-icon-white" />, <UserPlus className="h-6 w-6 card-icon-white" />, <UserCheck className="h-6 w-6 card-icon-white" />, <Video className="h-6 w-6 card-icon-white" />], colors = ["primary", "accent", "primary", "accent"], keys = ["totalPatients", "opdPatients", "ipdPatients", "virtualPatients"], glowColor = colors[i] === "primary" ? "0 2px 12px 0 var(--primary-color)" : "0 2px 12px 0 var(--accent-color)"; return (<div key={label}><Link to={`/doctordashboard/patients?tab=${label.toLowerCase().replace(" ", "")}`}><motion.div className={`card-stat card-border-${colors[i]}`} initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} whileHover={{ boxShadow: glowColor }} transition={{ duration: 0.3, delay: 0.3 + i * 0.1, type: "spring", bounce: 0.2 }}><div className="flex justify-between items-center"><div><p className="card-stat-label">{label}</p><h3 className="card-stat-count">{stats[keys[i]].toLocaleString()}</h3></div><motion.div className={`card-icon card-icon-${colors[i]}`} whileHover={{ scale: 1.08, boxShadow: glowColor }} transition={{ type: "spring", stiffness: 250, damping: 18 }}>{icons[i]}</motion.div></div></motion.div></Link></div>); })}</div>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="grid grid-cols-[70%_30%] gap-4">
            <motion.div className="bg-[var(--color-surface)] rounded-lg shadow-md overflow-hidden mt-3" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
  <div className="sub-heading py-3"><h5 className="text-lg ps-2 ms-3">Recent Appointments</h5></div>
  <DoctorAppointments appointments={appointments.slice(0, 4)} />
  <div className="text-right">
    <Link to="/doctordashboard/appointments" className="text-[var(--primary-color)] hover:text-[var(--accent-color)] flex items-center text-sm font-medium transition-colors duration-300 ms-8">View All Appointments <ChevronRight className="h-4 w-4 ml-1" /></Link>
  </div>
</motion.div>
 <motion.div className="p-4" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
  <div className="sub-heading py-3 px-4 w-full bg-[var(--primary-color)] text-[var(--color-surface)] font-semibold rounded-t"><h3 className="text-lg m-0">Revenue Generated</h3></div>
  <motion.div className="bg-[var(--color-surface)] p-4 rounded-b-lg" style={{ marginTop: '0' }} initial={{ opacity: 0, y: 60, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, type: "spring", bounce: 0.25, delay: 0.7 }}>
    <motion.div className="mb-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 1.1 }}>
      <p className="text-sm paragraph">Total Revenue</p>
      <motion.h4 className="text-2xl font-bold text-[var(--primary-color)]" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 1.2, type: "spring", bounce: 0.4 }}>₹{revenue?.total.toLocaleString()}</motion.h4>
    </motion.div>
    <div className="space-y-6">
      {(revenue?.breakdown.slice(0, 3) || []).map((item, i) => {
        const Icon = item.type.includes("Virtual") ? Video : item.type.includes("Physical") ? UserCheck : Users;
        const isHovered = hoveredIndex === i, iconBgClass = getIconBgClass(item.type);
        return (
          <div className='shadow-sm rounded-sm p-3' key={item.type}>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0, scale: isHovered ? 1.04 : 1, backgroundColor: isHovered ? "rgba(7, 143, 86, 0.1)" : "#fff", boxShadow: isHovered ? "0 8px 32px 0 rgba(0, 255, 106, 0.15)" : "none" }} transition={{ duration: 0.25, type: "spring", bounce: 0.3, delay: 1.3 + i * 0.15 }} className="rounded transition-colors duration-300 cursor-pointer" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <motion.div className={`card-icon ${iconBgClass} shadow-sm mr-3`} animate={{ boxShadow: isHovered ? "0 0 0 4px rgba(0, 255, 85, 0.15), 0 4px 20px 0 rgba(14, 185, 105, 0.1)" : "none", backgroundColor: isHovered ? "var(--accent-color)" : "" }}><Icon className="h-5 w-5 card-icon-white" /></motion.div>
                  <div>
                    <motion.p className="text-sm paragraph" animate={{ color: isHovered ? "var(--primary-color)" : "", scale: isHovered ? 1.08 : 1 }} transition={{ duration: 0.2 }}>{item.type}</motion.p>
                    <motion.p className="text-xs paragraph" animate={{ color: isHovered ? "var(--primary-color)" : "" }} transition={{ duration: 0.2 }}>{item.count} consultations</motion.p>
                  </div>
                </div>
                <motion.p className="text-sm font-semibold paragraph" animate={{ color: isHovered ? "var(--accent-color)" : "", scale: isHovered ? 1.08 : 1 }} transition={{ duration: 0.2 }}>₹{item.amount.toLocaleString()}</motion.p>
              </div>
              <motion.div className="h-1 bg-[var(--color-overlay)]-100 rounded-full overflow-hidden" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.7, delay: 1.6 + i * 0.15 }}>
                <motion.div className="h-full" initial={{ width: 0 }} animate={{ width: `${(item.amount / revenue.total) * 100}%`, backgroundColor: isHovered ? "var(--accent-color)" : iconBgClass === "card-icon-accent" ? "var(--accent-color)" : iconBgClass === "card-icon-primary" ? "var(--primary-color)" : "#e5e7eb" }} transition={{ duration: 1, delay: 1.7 + i * 0.15, type: "spring" }}></motion.div>
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </div>
    <motion.div className="mt-8 pt-6 border-t border-[var(--color-overlay)]-200" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 2 }}>
      <Link to="/doctordashboard/billing" className="text-[var(--primary-color)] hover:text-[var(--primary-color)] flex items-center text-sm font-medium transition-colors duration-300">View Billing & Payments <ChevronRight className="h-4 w-4 ml-1" /></Link>
    </motion.div>
  </motion.div>
</motion.div>
 </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Overview;