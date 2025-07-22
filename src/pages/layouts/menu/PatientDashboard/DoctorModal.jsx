import React, { useState } from "react";
const DoctorModal = ({
  doctor,
  onClose,
  setSelectedDoctor,
  setDate,
  setTime,
  handleNext,
}) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const availableDates = doctor.availability.map((slot) => slot.date);
  const getTimesForDate = (date) => {
    const daySlot = doctor.availability.find((slot) => slot.date === date);
    return daySlot ? daySlot.times : [];
  };
  const isSlotBooked = (date, time) => {
    return doctor.bookedSlots?.some(
      (slot) => slot.date === date && slot.time === time
    );
  };
  const handleConfirm = () => {
    if (selectedDate && selectedTime && !isSlotBooked(selectedDate, selectedTime)) {
      setDate(selectedDate);
      setTime(selectedTime);
      setSelectedDoctor(doctor);
      handleNext();
      onClose();
    } else if (isSlotBooked(selectedDate, selectedTime)) {
      alert("This slot is already booked. Please choose another.");
    } else {
      alert("Please select a date and time.");
    }
  };
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-4 border border-slate-200 animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-slate-400 hover:text-red-500 text-xl font-bold"
        >
          &times;
        </button>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-slate-800">{doctor.name}</h2>
          <p className="text-sm text-slate-600">
            {doctor.specialty} • {doctor.qualification}
          </p>
          <p className="text-sm text-slate-500">{doctor.experience} years experience</p>
          <p className="text-sm text-slate-500 italic">{doctor.doctorType}</p>
          {doctor.doctorType === "Hospital Associated" && doctor.hospitalName && (
            <p className="text-sm text-slate-500">:hospital: {doctor.hospitalName}</p>
          )}
          <p className="text-base font-medium text-yellow-600">Fees: ₹{doctor.fees}</p>
        </div>
        <div className="space-y-2">
          <label className="block font-semibold text-slate-700">Select Date</label>
          <select
            className="w-full border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTime("");
            }}
          >
            <option value="">-- Choose a Date --</option>
            {availableDates.map((date, i) => (
              <option key={i} value={date}>{date}</option>
            ))}
          </select>
        </div>
        {selectedDate && (
          <div>
            <label className="block font-semibold text-slate-700 mt-4">Available Time Slots</label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {getTimesForDate(selectedDate).map((time, index) => {
                const isBooked = isSlotBooked(selectedDate, time);
                const isSelected = selectedTime === time;
                const baseStyle = `text-sm rounded-xl py-1.5 px-2 font-medium transition-colors duration-200`;
                const classes = isBooked
                  ? `bg-red-500 text-white cursor-not-allowed ${baseStyle}`
                  : isSelected
                  ? `bg-green-700 text-white ${baseStyle}`
                  : `bg-green-100 text-green-800 hover:bg-green-300 ${baseStyle}`;
                return (
                  <button
                    key={index}
                    disabled={isBooked}
                    onClick={() => setSelectedTime(time)}
                    className={classes}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <button
          onClick={handleConfirm}
          className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-semibold transition-colors duration-200 shadow-md"
        >
          Confirm Appointment
        </button>
      </div>
    </div>
  );
};
export default DoctorModal;