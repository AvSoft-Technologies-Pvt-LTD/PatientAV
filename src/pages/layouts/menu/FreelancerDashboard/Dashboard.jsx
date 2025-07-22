import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Users,
  UserPlus,
  Video,
  UserCheck,
  ChevronRight,
  Check,
  X,
} from "lucide-react";

const Dashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          "  https://mocki.io/v1/b4ef86cd-b44e-4f1b-a826-2797a2ce9ee5  "
        );
        setDoctor(response.data.doctor);
        setStats(response.data.stats);
        setAppointments(response.data.appointments);
        setRevenue(response.data.revenue);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAppointmentAction = (index, action) => {
    const updatedAppointments = [...appointments];
    updatedAppointments[index] = {
      ...updatedAppointments[index],
      status: action === "accept" ? "Confirmed" : "Cancelled",
    };
    setAppointments(updatedAppointments);
  };

  // Filter appointments based on selected status
  const filteredAppointments = statusFilter === "All" 
    ? appointments 
    : appointments.filter(appointment => appointment.status === statusFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F4C430]"></div>
          <p className="mt-4 text-[#0e1630] font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center text-red-500">
          <p className="font-medium text-lg">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-[#F4C430] text-[#0e1630] rounded hover:bg-opacity-90 transition-all duration-300"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!doctor || !stats || !appointments || !revenue) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Doctor Profile Header */}
      <div className="bg-[#0e1630] text-white px-6 py-5 rounded-lg shadow-md">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="relative">
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-full border-2 border-[#F4C430]"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0e1630]"></div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-300">
                  Good Morning
                </div>
                <h2 className="text-2xl font-bold">{doctor.name}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-300">
                  <span className="mr-2">{doctor.specialty}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="mr-2 ml-0 sm:ml-2">
                    {doctor.qualifications}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="ml-0 sm:ml-2">
                    Reg: {doctor.registrationId}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <svg
                        key={index}
                        className={`w-4 h-4 ${
                          index < Math.floor(doctor.rating)
                            ? "text-[#F4C430]"
                            : "text-gray-400"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm text-gray-300">
                      {doctor.rating} ({doctor.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="text-right">
                <div className="text-lg font-medium">{doctor.currentDate}</div>
              </div>
              <button className="flex items-center bg-[#F4C430] text-[#0e1630] px-4 py-2 rounded font-medium hover:bg-opacity-90 transition-all duration-300 shadow-md">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{doctor.appointmentsToday} appointments today</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Patients */}
          <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 font-medium">Total Patients</p>
                <h3 className="text-3xl font-bold text-[#0e1630] mt-2">
                  {stats.totalPatients.count.toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full h-12 w-12 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Returning Patients */}
          <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 font-medium">Pending Patients</p>
                <h3 className="text-3xl font-bold text-[#0e1630] mt-2">
                  {stats.returningPatients.count}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full h-12 w-12 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Virtual Patients */}
          <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-500">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 font-medium">Virtual Patients</p>
                <h3 className="text-3xl font-bold text-[#0e1630] mt-2">
                  {stats.virtualPatients.count}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full h-12 w-12 flex items-center justify-center">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Physical Patients */}
          <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-shadow duration-300 border-l-4 border-amber-500">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 font-medium">Physical Patients</p>
                <h3 className="text-3xl font-bold text-[#0e1630] mt-2">
                  {stats.physicalPatients.count}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-full h-12 w-12 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Appointments Section */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-[#0e1630] text-white">
              <h3 className="text-lg font-semibold">Appointments</h3>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex p-4 bg-gray-50 border-b border-gray-200 gap-2 overflow-x-auto">
              {["All", "Confirmed", "Pending", "Cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    statusFilter === status
                      ? "bg-[#0e1630] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
{/* 
            <div className="flex p-4 bg-gray-50 border-b border-gray-200 gap-2">
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="px-4 py-2 rounded-full text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0e1630] transition-all duration-200"
  >
    {["All", "Confirmed", "Pending", "Cancelled"].map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ))}
  </select>
</div> */}



            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-[#F4C430] flex items-center justify-center text-[#0e1630] font-bold">
                            {appointment.patient.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patient}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.type === "Virtual"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {appointment.type === "Virtual" ? (
                            <Video className="h-3 w-3 mr-1" />
                          ) : (
                            <UserCheck className="h-3 w-3 mr-1" />
                          )}
                          {appointment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            appointment.status === "Confirmed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appointment.status === "Pending" ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                handleAppointmentAction(index, "accept")
                              }
                              className="p-1 hover:bg-green-100 rounded-full transition-colors duration-200"
                            >
                              <Check className="h-5 w-5 text-green-600" />
                            </button>
                            <button
                              onClick={() =>
                                handleAppointmentAction(index, "reject")
                              }
                              className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                            >
                              <X className="h-5 w-5 text-red-600" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400">
                            {appointment.status === "Confirmed" ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : (
                              <X className="h-5 w-5 text-red-600" />
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 bg-gray-50">
              <button
                onClick={() => (window.location.href = "/appointments")}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition-colors duration-300"
              >
                View All Appointments
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Revenue Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-[#0e1630] text-white">
              <h3 className="text-lg font-semibold">Revenue Generated</h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500">Total Revenue</p>
                <h4 className="text-2xl font-bold text-[#0e1630]">
                  ₹{revenue.total.toLocaleString()}
                </h4>
              </div>

              <div className="space-y-6">
                {revenue.breakdown.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${item.color}`}>
                          {item.type.includes("Virtual") ? (
                            <Video className="h-5 w-5" />
                          ) : item.type.includes("Physical") ? (
                            <UserCheck className="h-5 w-5" />
                          ) : (
                            <Users className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.count} consultations
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{item.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color.replace(
                          "text-",
                          "bg-"
                        )}`}
                        style={{
                          width: `${(item.amount / revenue.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => (window.location.href = "/billing")}
                  className="w-full py-2 text-blue-600 hover:text-blue-800 text-[#0e1630] rounded-md hover:bg-opacity-90 transition-all duration-300 font-medium flex items-center justify-center"
                >
                  View Billing & Payments
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;