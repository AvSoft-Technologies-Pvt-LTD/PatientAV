import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from './context-api/authSlice';
import RegisterSelect from "./form/RegisterSelect";
import Registration from "./form/Registration";
import Verification from "./form/Verification";
import LoginForm from "./form/Login";
import Home from "./pages/Home";
import Healthcard from "./components/Healthcard";
import BookApp from "./components/BookApp";
import DashboardLayout from "./pages/layouts/DashboardLayout";
import PdashboardRoutes from "./pages/layouts/menu/PatientDashboard/PdashboardRoutes";

const App = () => {
  const dispatch = useDispatch(), { isAuthenticated } = useSelector(s => s.auth);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const u = localStorage.getItem('user'), t = localStorage.getItem('token');
    if (u && t) dispatch(setUser(JSON.parse(u)));
    setLoading(false);
  }, [dispatch]);
  const RequireAuth = ({ children }) => !isAuthenticated ? <Navigate to="/login" replace /> : children;
  if (loading) return <div className="text-center mt-20 text-lg">Loading...</div>;
  return (
    <>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterSelect />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/healthcard" element={<Healthcard />} />
        <Route path="/bookconsultation" element={<BookApp />} />
        <Route path="/dashboard/*" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
          <Route path="*" element={<PdashboardRoutes />} />
        </Route>
        <Route path="*" element={<h1 className="text-center text-red-600 text-xl mt-10">404 - Page Not Found</h1>} />
      </Routes>
    </>
  );
};

export default App;