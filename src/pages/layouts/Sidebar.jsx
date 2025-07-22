import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  RiDashboardFill, RiUserHeartFill, RiCalendarCheckFill, RiHeartPulseFill,
  RiShoppingBagFill, RiShieldCheckFill, RiFileListFill, RiSettings3Fill,
  RiLogoutBoxRFill, RiArrowLeftSLine, RiBriefcaseFill, RiArrowRightSLine,
} from "react-icons/ri";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState(new Set());
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const menus = {
    patient: [
      { icon: RiDashboardFill, label: "Dashboard", path: "/dashboard" },
      { icon: RiCalendarCheckFill, label: "My Appointments", path: "/dashboard/app" },
      { icon: RiUserHeartFill, label: "Medical Records", path: "/dashboard/medical-record" },
      { icon: RiShoppingBagFill, label: "Online Shopping", path: "/dashboard/shopping" },
      { icon: RiShieldCheckFill, label: "Insurance", path: "/dashboard/insurance" },
      { icon: RiFileListFill, label: "Billing", path: "/dashboard/Billing" },
      { icon: RiSettings3Fill, label: "Settings", path: "/dashboard/settings" },
    ]
  };

  const menuItems = menus[user?.role || "patient"] || [];
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMenu = (k) => setOpenMenus(s => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const handleLogout = () => { localStorage.removeItem("user"); localStorage.removeItem("token"); navigate("/"); };

  return (
    <div className={`h-screen overflow-auto  text-[#F5F5F5] m-2 bg-[var(--primary-color)] p-4 flex flex-col rounded-xl shadow-xl transition-all duration-300  ${isCollapsed ? "w-20" : "w-60"}`}>
      <div className="flex items-center justify-between mb-5">
        <div className={`flex items-center transition-all ${isCollapsed ? "justify-center w-full" : ""}`}>
          <div className="bg-[var(--accent-color)] w-10 h-10 rounded-full flex items-center justify-center shadow-md">
            <span className="font-bold text-[var(--primary-color)] ">AV</span>
          </div>
          {!isCollapsed && <h2 className="text-lg font-bold text-[#F5F5F5] ml-1">AVSwasthya</h2>}
        </div>
        <button onClick={toggleSidebar} className={`text-[#F5F5F5] transition hover:bg-slate-700 p-1 rounded-full ${isCollapsed ? "mx-auto mt-4" : ""}`}>
          {isCollapsed ? <RiArrowRightSLine size={18} /> : <RiArrowLeftSLine size={18} />}
        </button>
      </div>
      <div className="flex items-center mb-6">
        <img src="https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg" alt="User Avatar" className={`w-10 h-10 rounded-full border-2 border-yellow-500 shadow-lg mr-3 ${isCollapsed ? "mx-auto" : ""}`} />
        {!isCollapsed && (
          <div className="text-left">
            <p className="text-sm font-semibold">{user?.firstName || "Guest"} {user?.lastName || ""}</p>
            <span className="text-xs text-[#F5F5F5] opacity-75">{user?.role || "User"}</span>
          </div>
        )}
      </div>
      {!isCollapsed && <hr className="border-gray-700 my-3" />}
      <ul className="mt-3 flex-1 space-y-1">
        {menuItems.map((item, i) => (
          <li key={i}>
            {!item.submenu ? (
              <NavLink to={item.path} className={`flex items-center text-[#F5F5F5] py-2 px-3 rounded-xl cursor-pointer transition-all duration-200 text-sm hover:bg-slate-700 ${isCollapsed ? "justify-center" : ""}`}>
                <item.icon className={`${isCollapsed ? "text-xl" : "text-lg"}`} />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </NavLink>
            ) : (
              <>
                <div onClick={() => toggleMenu(item.submenuKey)} className={`flex items-center justify-between py-2 px-3 rounded-xl cursor-pointer text-sm transition-all duration-200 hover:bg-slate-700 ${isCollapsed ? "justify-center" : ""}`}>
                  <div className="flex items-center">
                    <item.icon className={`${isCollapsed ? "text-xl" : "text-lg"}`} />
                    {!isCollapsed && <span className="ml-3">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="transition-transform duration-200">
                      {openMenus.has(item.submenuKey) ? <RiArrowLeftSLine /> : <RiArrowRightSLine />}
                    </span>
                  )}
                </div>
                {openMenus.has(item.submenuKey) && !isCollapsed && (
                  <ul className="ml-8 mt-1 space-y-1 border-l-2 border-gray-700 pl-2 py-1 text-[#F5F5F5] text-sm animate-fadeIn">
                    {item.submenu.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <NavLink to={subItem.path} className="block py-2 px-3 rounded-lg transition-all duration-200 hover:bg-slate-700">
                          {subItem.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <div onClick={handleLogout} className="py-2 text-red-400 hover:bg-red-900 hover:bg-opacity-30 hover:text-red-300 px-3 rounded-lg cursor-pointer flex items-center transition duration-200 text-sm">
          <RiLogoutBoxRFill className={`${isCollapsed ? 'text-xl mx-auto' : 'text-lg'}`} />
          {!isCollapsed && <span className="ml-3">Logout</span>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

