import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import Appointments from "./Appointments";
import Patientlist from "./PatientList";
import Settings from "./Settings";
import Overview from "./Overview";

const DrRoutes = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} /> {/* renders at /doctordashboard */}
      <Route path="appointments" element={<Appointments />} />
      <Route path="patients" element={<Patientlist />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  );
};

export default DrRoutes;
