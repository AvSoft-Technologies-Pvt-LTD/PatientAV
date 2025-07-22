import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTh,
  FaUserMd,
  FaDesktop,
  FaVial,
  FaCapsules,
  FaStream,
  FaTicketAlt
} from "react-icons/fa";
const modules = [
  { name: "Frontdesk", icon: FaDesktop },
  { name: "Admin", icon: FaUserMd },
  { name: "Lab", icon: FaVial },
  { name: "Pharmacy", icon: FaCapsules },
  { name: "Token Display", icon: FaStream },
  { name: "Queue Token", icon: FaTicketAlt },
];
export default function ModulesMenu({ user }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const getDashboardPrefix = () => {
    const type = user?.userType?.toLowerCase();
    if (type === "doctor") return "/doctordashboard";
    if (type === "hospital") return "/hospitaldashboard";
    return ""; // fallback
  };
  const handleModuleClick = (name) => {
    setOpen(false);
    const basePath = getDashboardPrefix();
    switch (name) {
      case "Admin":
    navigate(`${basePath}/dr-admin`);
    break;
  case "Token Display":
    navigate(`${basePath}/token-display`);
    break;
  case "Queue Token":
    navigate(`${basePath}/queue-token`);
    break;
  case "Pharmacy":
    navigate(`${basePath}/pharmacymodule`);
    break;
  case "Lab":
    navigate(`${basePath}/labmodule`);
    break;
  case "Frontdesk":
    navigate(`${basePath}/frontdesk`);
    break;
  default:
    console.log("Navigate to:", name);
    }
  };
  return (
    <div style={{ zIndex: 60 }} className="relative flex" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="p-3 bg-[var(--primary-color)] text-white rounded-full hover:bg-[var(--accent-color)] transition"
      >
        <FaTh size={20} />
      </button>
      {open && (
        <div className="absolute top-14 right-0 bg-white rounded-xl shadow-xl px-5 py-3">
          <div className="flex gap-4 ">
            {modules.map(({ name, icon: Icon }, idx) => (
              <button
                key={name}
                onClick={() => handleModuleClick(name)}
                className="relative group transition-all duration-300"
                style={{ animation: `slideUpFadeIn 0.5s ${idx * 0.02}s both` }}
              >
                <div
                  className="mb-2 w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-[#1CA4AC]/20 to-[#68C723]/20 text-[var(--primary-color)] group-hover:from-[#1CA4AC] group-hover:to-[#68C723] group-hover:text-white shadow-md group-hover:scale-110 transition-all duration-300"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <Icon className="text-2xl" />
                </div>
                <span className="paragraph gap-3 text-[var(--primary-color)] group-hover:text-[var(--accent-color)]">
                  {name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}