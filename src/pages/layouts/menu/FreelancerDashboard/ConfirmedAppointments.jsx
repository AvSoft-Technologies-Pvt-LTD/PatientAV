import React, { useState, useEffect } from 'react';
import RescheduleModal from './RescheduleModal';
const ConfirmedAppointments = ({ appointments, moveToOpd }) => {
  const [rescheduleModalId, setRescheduleModalId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [opdTimerStarted, setOpdTimerStarted] = useState(false);
  useEffect(() => {
    if (appointments.length > 0 && !opdTimerStarted && typeof moveToOpd === 'function') {
      setOpdTimerStarted(true);
      const timer = setTimeout(() => {
        moveToOpd();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [appointments, moveToOpd, opdTimerStarted]);
  const handleReschedule = (apptId) => {
    const updatedAppointments = appointments.map(appt =>
      appt.id === apptId
        ? { ...appt, date: rescheduleForm.date, time: rescheduleForm.time }
        : appt
    );
    setRescheduleForm({ date: '', time: '' });
    setRescheduleModalId(null);
    console.log('Rescheduled:', updatedAppointments);
  };
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
          <td className="px-4 py-2 text-center text-sm">
            <button
              onClick={() => setRescheduleModalId(appt.id)}
              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
            >
              Reschedule
            </button>
          </td>
        </tr>
      ))}
      {rescheduleModalId && (
        <RescheduleModal
          rescheduleModalId={rescheduleModalId}
          rescheduleForm={rescheduleForm}
          setRescheduleForm={setRescheduleForm}
          handleReschedule={handleReschedule}
          setRescheduleModalId={setRescheduleModalId}
        />
      )}
    </>
  );
};
export default ConfirmedAppointments;