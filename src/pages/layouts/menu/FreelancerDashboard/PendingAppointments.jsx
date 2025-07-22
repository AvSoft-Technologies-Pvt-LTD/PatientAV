import React from 'react';
const PendingAppointments = ({ appointments, handleAccept, handleReject, setRejectModalId }) => {
  return (
    <>
      {appointments.map((appt) => (
        <tr key={appt.id} className="hover:bg-gray-50">
          <td className="px-4 py-2 text-sm text-gray-900">{appt.name}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.phone}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.date}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.time}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.specialty}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.reason}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.type}</td>
          <td className="px-4 py-2 text-center">
            <div className="flex justify-center space-x-2">
              <button onClick={() => handleAccept(appt.id)} className="px-3 py-1 text-sm bg-yellow-400 text-[#0E1630] rounded-md font-bold hover:bg-yellow-500 transition-colors">
                Accept
              </button>
              <button onClick={() => setRejectModalId(appt.id)} className="px-3 py-1 text-sm bg-[#2A375F] text-white rounded-md font-bold hover:bg-[#374873] transition-colors">
                Reject
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};
export default PendingAppointments;