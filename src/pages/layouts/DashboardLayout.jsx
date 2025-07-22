import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader"; // Or use PageWithLoader as before

const DashboardLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const role = user?.role || "patient";
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loader when location changes
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false); // Simulate content load completion
    }, 1000); // adjust to your liking

    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <div className="flex h-screen">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 relative">
        <Header />
        <main className="overflow-y-auto flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-50">
              <Loader />
            </div>
          )}
          <div className={loading ? "opacity-0 pointer-events-none" : "opacity-100 transition-opacity duration-700"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
