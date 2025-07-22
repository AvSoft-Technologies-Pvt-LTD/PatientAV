import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import PendingAppointments from './PendingAppointments';
import ConfirmedAppointments from './ConfirmedAppointments';
import RejectedAppointments from './RejectedAppointments';
import RealTimePrescription from './RealTimePrescription';
import RejectModal from './RejectModal';
import RescheduleModal from './RescheduleModal';

const doctorName = 'Dr. Anjali Mehra';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
  </div>
);

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [tab, setTab] = useState('pending');
  const [selectedRejectReason, setSelectedRejectReason] = useState({});
  const [rejectModalId, setRejectModalId] = useState(null);
  const [rescheduleModalId, setRescheduleModalId] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://67e3e1e42ae442db76d2035d.mockapi.io/register/book');
      const filtered = res.data.filter(item => item.doctorName === doctorName);

      const confirmed = JSON.parse(localStorage.getItem('confirmedAppointments')) || [];
      const rejected = JSON.parse(localStorage.getItem('rejectedAppointments')) || [];

      const updatedAppointments = filtered.map(item => {
        const existingConfirmed = confirmed.find(appt => appt.id === item.id);
        const existingRejected = rejected.find(appt => appt.id === item.id);

        if (existingConfirmed) return existingConfirmed;
        if (existingRejected) return existingRejected;

        return {
          id: item.id,
          name: item.name || 'Unknown',
          phone: item.phone || 'Not Provided',
          date: item.date,
          time: item.time,
          reason: item.symptoms,
          specialty: item.specialty,
          type: item.consultationType,
          status: 'Pending',
          prescription: '',
          link: '',
          rejectReason: '',
          linkSent: false,
          rescheduleCount: 0,
        };
      });

      setAppointments(updatedAppointments);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleSavePrescription = (data, pdfBlob) => {
    const pdfURL = URL.createObjectURL(pdfBlob);
    setAppointments(prev =>
      prev.map(appt =>
        appt.id === selectedAppointment?.id ? { ...appt, savedPrescription: pdfURL } : appt
      )
    );
    setIsModalOpen(false);
  };
  const notifyPatient = async (name, phone, message, showPayButton = false) => {
    try {
      await axios.post('https://67e631656530dbd3110f0322.mockapi.io/notify', {
        name,
        phone,
        message,
        showPayButton,
        doctorName,  // Adding doctorName to the payload
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification to patient');
    }
  };
  
  const handleAccept = async (id) => {
    try {
      setActionLoading(true);
      const updated = appointments.map(appt =>
        appt.id === id ? { ...appt, status: 'Confirmed' } : appt
      );
      setAppointments(updated);
      
      // Send updated status to backend
      await axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${id}`, {
        status: 'Confirmed',
      });
      
      setAppointments(updated);
  
      const accepted = updated.find(appt => appt.id === id);
      await notifyPatient(
        accepted.name,
        accepted.phone,
        `✅ Your appointment with ${doctorName} is confirmed for ${accepted.date} at ${accepted.time}.\nConsultation Fees: ₹699`,
        true
      );
  
      const confirmedAppointments = JSON.parse(localStorage.getItem('confirmedAppointments')) || [];
      localStorage.setItem('confirmedAppointments', JSON.stringify([...confirmedAppointments, accepted]));
  
      toast.success('Appointment confirmed successfully');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      const reason = selectedRejectReason[id] || "No reason provided";
      const updated = appointments.map(appt =>
        appt.id === id ? { ...appt, status: 'Rejected', rejectReason: reason } : appt
      );
      setAppointments(updated);
  
      const rejected = appointments.find(appt => appt.id === id);
      await notifyPatient(
        rejected.name,
        rejected.phone,
        `❌ Your appointment request with ${doctorName} has been rejected.\nReason: ${reason}`,
      );
  
      setRejectModalId(null);
      toast.success('Appointment rejected');
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleSendLink = async (id) => {
    const link = prompt('Enter consultation meeting link:');
    if (link) {
      try {
        setActionLoading(true);
        const updated = appointments.map(appt =>
          appt.id === id ? { ...appt, link, linkSent: true } : appt
        );
        setAppointments(updated);
  
        const appt = appointments.find(appt => appt.id === id);
        await notifyPatient(
          appt.name,
          appt.phone,
          `📞 Hello ${appt.name}, your consultation link with ${doctorName} is: ${link}`,
        );
  
        toast.success('Consultation link sent to patient');
      } finally {
        setActionLoading(false);
      }
    }
  };
  
  const handleReschedule = async (id) => {
    const { date, time } = rescheduleForm;
    if (date && time) {
      try {
        setActionLoading(true);
        const updated = appointments.map(appt => {
          if (appt.id === id) {
            const newCount = appt.rescheduleCount + 1;
            if (newCount > 2) {
              notifyPatient(
                appt.name,
                appt.phone,
                `❌ Your appointment with ${doctorName} has been automatically rejected due to multiple rescheduling attempts.`
              );
              return { ...appt, status: 'Rejected' };
            }
            return { ...appt, date, time, rescheduleCount: newCount };
          }
          return appt;
        });
        setAppointments(updated);
  
        const appt = updated.find(a => a.id === id);
        await notifyPatient(
          appt.name,
          appt.phone,
          `⚠️ Your appointment with ${doctorName} has been rescheduled to ${date} at ${time}.`
        );
  
        setRescheduleModalId(null);
        setRescheduleForm({ date: '', time: '' });
        toast.success('Appointment rescheduled successfully');
      } finally {
        setActionLoading(false);
      }
    }
  };
  
  const filteredAppointments = appointments.filter(appt => {
    if (tab === 'pending') return appt.status === 'Pending';
    if (tab === 'confirmed') return appt.status === 'Confirmed';
    if (tab === 'rejected') return appt.status === 'Rejected';
    return false;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <Toaster position="top-right" />
      <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a2442] leading-tight">Appointments List</h1>
      </div>
      <div className="max-w-7xl mx-auto rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
            {['pending', 'confirmed', 'rejected'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  tab === t
                    ? 'bg-yellow-400 text-[#0e1630] shadow-lg shadow-yellow-400/20'
                    : 'bg-[#2a375f] text-white hover:bg-[#374873]'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#2a375f] bg-white">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#0e1630]">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white">Phone</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white">Time</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white">Specialty</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white">Symptoms</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-white">Type</th>
                    {tab === 'confirmed' && (
                      <>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-white">Link</th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-white">Prescription</th>
                      </>
                    )}
                    {tab === 'rejected' && (
                      <>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-white">Reject Reason</th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-white">Action</th>
                      </>
                    )}
                    <th className="px-4 py-2 text-center text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tab === 'pending' && (
                    <PendingAppointments
                      appointments={filteredAppointments}
                      handleAccept={handleAccept}
                      handleReject={handleReject}
                      setRejectModalId={setRejectModalId}
                    />
                  )}
                  {tab === 'confirmed' && (
                    <ConfirmedAppointments
                      appointments={filteredAppointments}
                      handleSendLink={handleSendLink}
                      sendPrescriptionToPatient={(appt, pdfURL) =>
                        notifyPatient(appt.name, appt.phone, `📝 ${doctorName} has shared your prescription. Please download here: ${pdfURL}`)
                      }
                      setIsModalOpen={setIsModalOpen}
                      setSelectedAppointment={setSelectedAppointment}
                    />
                  )}
                  {tab === 'rejected' && (
                    <RejectedAppointments
                      appointments={filteredAppointments}
                      handleDeleteRejected={(id) =>
                        setAppointments(prev => prev.filter(appt => appt.id !== id))
                      }
                    />
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
          <div className="bg-white rounded-xl w-full max-w-6xl mx-4 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-2xl"
            >
              &times;
            </button>
            <RealTimePrescription
              onSave={handleSavePrescription}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {rejectModalId && (
        <RejectModal
          rejectModalId={rejectModalId}
          selectedRejectReason={selectedRejectReason}
          setSelectedRejectReason={setSelectedRejectReason}
          handleReject={handleReject}
          setRejectModalId={setRejectModalId}
        />
      )}

      {rescheduleModalId && (
        <RescheduleModal
          rescheduleModalId={rescheduleModalId}
          rescheduleForm={rescheduleForm}
          setRescheduleForm={setRescheduleForm}
          handleReschedule={handleReschedule}
          setRescheduleModalId={setRescheduleModalId}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;