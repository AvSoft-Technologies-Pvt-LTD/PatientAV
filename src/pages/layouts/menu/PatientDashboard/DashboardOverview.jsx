import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaHeartbeat,
  FaThermometerHalf,
  FaTint,
  FaStethoscope,
  FaPlusCircle,
} from "react-icons/fa";
import { useSelector } from "react-redux";

const DashboardOverview = () => {
  const userEmail = useSelector((s) => s.auth?.user?.email);
  const [appointments, setAppointments] = useState([]);
  const [healthSummary, setHealthSummary] = useState({});
  const [newVitals, setNewVitals] = useState({
    heartRate: "",
    temperature: "",
    bloodSugar: "",
    bloodPressure: "",
  });
  const [summaryId, setSummaryId] = useState(null);
  const [isNew, setIsNew] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAnim, setModalAnim] = useState("zoom-in");

  const handleOpenModal = () => {
    setModalAnim("zoom-in");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setModalAnim("zoom-out");
    setTimeout(() => setShowModal(false), 400); // match animation duration
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const email = localStorage.getItem("email")?.trim().toLowerCase();
        const userId = localStorage.getItem("userId")?.trim();
        if (!email || !userId) return;
        const res = await axios.get(
          "https://67e3e1e42ae442db76d2035d.mockapi.io/register/book"
        );
        const filtered = res.data.filter(
          (a) =>
            a.email?.trim().toLowerCase() === email ||
            a.userId?.trim() === userId
        );
        setAppointments(filtered.reverse());
      } catch (err) {
        console.error("Error fetching doctor appointments:", err);
      }
    };
    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchHealthSummary = async () => {
      try {
        const res = await axios.get(
          "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary"
        );
        const data = res.data;
        const userSummary = data.find((e) => e.email === userEmail);
        if (userSummary) {
          setHealthSummary(userSummary);
          setSummaryId(userSummary.id);
          setIsNew(false);
          setNewVitals({
            heartRate: userSummary.heartRate || "",
            temperature: userSummary.temperature || "",
            bloodSugar: userSummary.bloodSugar || "",
            bloodPressure: userSummary.bloodPressure || "",
          });
        } else {
          setHealthSummary({});
          setIsNew(true);
        }
      } catch (error) {
        console.error("Health summary fetch error", error);
      }
    };
    if (userEmail) fetchHealthSummary();
  }, [userEmail]);

  const saveHealthSummary = async () => {
    const vitals = {
      ...newVitals,
      email: userEmail,
      lastUpdated: new Date().toLocaleString(),
    };
    try {
      const response = isNew
        ? await axios.post("https://6808fb0f942707d722e09f1d.mockapi.io/health-summary", vitals)
        : await axios.put(`https://6808fb0f942707d722e09f1d.mockapi.io/health-summary/${summaryId}`, vitals);
      setHealthSummary(response.data);
      setSummaryId(response.data.id);
      setIsNew(false);
      setShowModal(false);
      setNewVitals({ heartRate: "", temperature: "", bloodSugar: "", bloodPressure: "" });
    } catch (error) {
      console.error("Health summary save error", error);
    }
  };

  const summaryCards = [
    {
      label: "Heart Rate",
      value: healthSummary.heartRate,
      unit: "bpm",
      icon: <FaHeartbeat className="text-xl" />,
      color: "card-icon-primary card-icon-white",
    },
    {
      label: "Temperature",
      value: healthSummary.temperature,
      unit: "°C",
      icon: <FaThermometerHalf className="text-xl" />,
      color: "card-icon-accent  card-icon-white",
    },
    {
      label: "Blood Sugar",
      value: healthSummary.bloodSugar,
      unit: "mg/dL",
      icon: <FaTint className="text-xl" />,
      color: "card-icon-accent  card-icon-white",
    },
    {
      label: "Blood Pressure",
      value: healthSummary.bloodPressure,
      unit: "mmHg",
      icon: <FaStethoscope className="text-xl" />,
      color: "card-icon-primary card-icon-white",
    },
  ];

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-surface)] ">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 overflow-x-auto rounded-2xl shadow-xl p-6 slide-in-up">
          <h4 className="h4-heading pt-2 mb-4">Recent Appointments</h4>
          <table className="table-container">
            <thead className="table-head">
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Doctor</th>
                <th>Specialty</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {appointments.length > 0 ? (
                appointments.slice(0, 2).map((a) => (
                  <tr key={a.id} className="tr-style">
                    <td>{a.date || "N/A"}</td>
                    <td>{a.time || "N/A"}</td>
                    <td>{a.doctorName || "N/A"}</td>
                    <td>{a.specialty || "N/A"}</td>
                    <td className="py-2 px-4">
                      {a.status === "Confirmed" ? (
                        <span className="bg-[var(--primary-color)] text-white px-2 py-1 rounded-full">
                          Confirmed
                        </span>
                      ) : a.status?.toLowerCase() === "rejected" ? (
                        <div className="flex items-center space-x-4 paragraph mt-1">
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Rejected
                          </span>
                          <div>
                            <strong>Reason:</strong> {a.rejectReason}
                          </div>
                        </div>
                      ) : (
                        <span className="paragraph">
                          Waiting for Confirmation
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center px-6 py-10 text-[var(--primary-color)] text-base"
                  >
                    :zzz: No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-16 text-right">
            <Link
              to="/dashboard/app"
              className="text-[var(--primary-color)] font-medium hover:underline"
            >
              View More Appointments →
            </Link>
          </div>
        </div>
        {/* Health Summary Panel with Slide In Animation */}
        <div className="w-full lg:w-1/2 bg-[var(--color-surface)] text-[var(--primary-color)] p-5 slide-in-up">
          <div className="flex justify-between items-center mb-4">
            <h4 className="h4-heading">Health Summary</h4>
            <button className="btn btn-secondary " onClick={handleOpenModal}>
              <FaPlusCircle /> {isNew ? "Add Vital" : "Update Vital"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {summaryCards.map((item, idx) => {
              const theme =
                item.color.match(/card-icon-(primary|accent)/)?.[1] ||
                "primary";
              return (
                <div
                  key={idx}
                  className={`card-stat card-border-${theme} p-3 sm:p-2 flex flex-col justify-center items-center text-center fade-in`}
                >
                  <div
                    className={`card-icon ${item.color} w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full mb-2`}
                  >
                    {item.icon}
                  </div>
                  <h5 className="card-stat-label">{item.label}</h5>
                  <p
                    className="card-stat-count text-sm sm:text-base font-semibold"
                    style={{ color: `var(--${theme}-color)` }}
                  >
                    {item.value || "N/A"}{" "}
                    <span className="text-xs text-[var(--color-overlay)]">
                      {item.unit}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-start justify-center pt-20 z-50 mt-17"
          onClick={handleCloseModal}
        >
          <div
            className={`bg-[var(--color-surface)] text-[var(--primary-color)] p-6 rounded-xl shadow-2xl w-full max-w-xl ${modalAnim}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="h4-heading mb-4 text-center">Add Vital Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="floating-input relative w-full" data-placeholder="Heart Rate (bpm)">
                <input
                  type="text"
                  placeholder=" "
                  value={newVitals.heartRate}
                  onChange={(e) =>
                    setNewVitals({ ...newVitals, heartRate: e.target.value })
                  }
                  className="input-field peer"
                />
              </div>
              <div className="floating-input relative w-full" data-placeholder="Temperature (°C)">
                <input
                  type="text"
                  placeholder=" "
                  value={newVitals.temperature}
                  onChange={(e) =>
                    setNewVitals({ ...newVitals, temperature: e.target.value })
                  }
                  className="input-field peer"
                />
              </div>
              <div className="floating-input relative w-full" data-placeholder="Blood Sugar (mg/dL)">
                <input
                  type="text"
                  placeholder=" "
                  value={newVitals.bloodSugar}
                  onChange={(e) =>
                    setNewVitals({ ...newVitals, bloodSugar: e.target.value })
                  }
                  className="input-field peer"
                />
              </div>
              <div className="floating-input relative w-full" data-placeholder="Blood Pressure (mmHg)">
                <input
                  type="text"
                  placeholder=" "
                  value={newVitals.bloodPressure}
                  onChange={(e) =>
                    setNewVitals({ ...newVitals, bloodPressure: e.target.value })
                  }
                  className="input-field peer"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button onClick={handleCloseModal} className="btn btn-disabled">
                Cancel
              </button>
              <button onClick={saveHealthSummary} className="btn btn-primary">
                {isNew ? "Save" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;