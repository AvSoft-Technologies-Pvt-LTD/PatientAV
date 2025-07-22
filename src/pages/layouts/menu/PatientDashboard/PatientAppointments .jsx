import React, { useState, useEffect } from "react";
import Calendar from "../../../../components/Calendar";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("http://localhost:5001/appointments");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const addNewAppointment = () => {
    alert("Open Patient Appointment Form");
  };

  if (loading) return <p className="text-center text-gray-600">Loading appointments...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <Calendar title="Patient Appointments" appointments={appointments} onAddAppointment={addNewAppointment} />
    </div>
  );
};

export default PatientAppointments;
