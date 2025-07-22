import React from "react";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Departments from "./Departments";
import DoctorsStaffManagement from "./Doctor&StaffManagement";
import PatientManagement from "./PatientManagement";
import Labs from "./Labs";
import Pharmacy from "./Pharmacy";
import BillingPayments from "./BillingPayments";
import Settings from "./Settings";
const HospitalRoutes = () => (
  <Routes>
    <Route index element={<Dashboard />} />
    <Route path="departments" element={<Departments />} />
    <Route path="doctors-staff-management" element={<DoctorsStaffManagement />} />
    <Route path="patient-management" element={<PatientManagement />} />
    <Route path="labs" element={<Labs />} />
    <Route path="pharmacy" element={<Pharmacy />} />
    <Route path="billing-payments" element={<BillingPayments />} />
    <Route path="/settings/*" element={<Settings />} />
  </Routes>
);
export default HospitalRoutes;