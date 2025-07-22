import React from 'react';

const RescheduleModal = ({ rescheduleModalId, rescheduleForm, setRescheduleForm, handleReschedule, setRescheduleModalId }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0e1630]/80 z-50">
      <div className="bg-[#1a2442] rounded-2xl p-6 w-[90%] max-w-md shadow-xl border border-[#2a375f]">
        <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mb-4">Reschedule Appointment</h2>
        <input
          type="date"
          value={rescheduleForm.date}
          onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
          className="w-full p-3 bg-[#2a375f] border border-[#374873] rounded-xl mb-4 text-white focus:ring-2 focus:ring-yellow-400"
        />
        <input
          type="time"
          value={rescheduleForm.time}
          onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
          className="w-full p-3 bg-[#2a375f] border border-[#374873] rounded-xl mb-4 text-white focus:ring-2 focus:ring-yellow-400"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setRescheduleModalId(null)}
            className="px-4 py-2 border border-[#2a375f] rounded-xl text-white hover:bg-[#2a375f]"
          >
            Cancel
          </button>
          <button
            onClick={() => handleReschedule(rescheduleModalId)}
            className="px-4 py-2 bg-yellow-400 text-[#0e1630] rounded-xl hover:bg-yellow-500"
          >
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;