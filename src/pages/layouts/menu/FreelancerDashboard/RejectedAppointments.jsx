import React from 'react';

const RejectedAppointments = ({ appointments, handleDeleteRejected }) => {
  return (
    <>
      {appointments.map((appt) => (
        <tr key={appt.id} className="hover:bg-gray-50">
          <td className="px-4 py-2 text-sm text-gray-900">{appt.name}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.phone}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.date}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.time}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.reason}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.type}</td>
          <td className="px-4 py-2 text-sm text-gray-900">{appt.rejectReason}</td>
          <td className="px-4 py-2 text-center text-sm text-gray-900">
            <button onClick={() => handleDeleteRejected(appt.id)} className="px-3 py-1 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition-colors">
              Delete
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};

export default RejectedAppointments;