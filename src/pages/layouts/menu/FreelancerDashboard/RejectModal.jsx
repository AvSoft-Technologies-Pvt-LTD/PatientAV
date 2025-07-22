import React from 'react';

const RejectModal = ({ rejectModalId, selectedRejectReason, setSelectedRejectReason, handleReject, setRejectModalId }) => {
  const rejectionOptions = [
    "Doctor unavailable at selected time",
    "Invalid symptoms description",
    "Outside of doctor's expertise",
    "Please choose another consultation type",
    "Other",
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0e1630]/80 z-50">
      <div className="bg-[#1a2442] rounded-2xl p-6 w-[90%] max-w-md shadow-xl border border-[#2a375f]">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">Reject Appointment</h2>
        <select
          className="w-full p-3 bg-[#2a375f] border border-[#374873] rounded-xl mb-4 text-white focus:ring-2 focus:ring-yellow-400"
          value={selectedRejectReason[rejectModalId] || ''}
          onChange={(e) =>
            setSelectedRejectReason({
              ...selectedRejectReason,
              [rejectModalId]: e.target.value,
            })
          }
        >
          <option value="">Select Rejection Reason</option>
          {rejectionOptions.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setRejectModalId(null)}
            className="px-4 py-2 border border-[#2a375f] rounded-xl text-white hover:bg-[#2a375f]"
          >
            Cancel
          </button>
          <button
            onClick={() => handleReject(rejectModalId)}
            disabled={!selectedRejectReason[rejectModalId]}
            className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50"
          >
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;