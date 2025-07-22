import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import SignaturePad from 'react-signature-canvas';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [tab, setTab] = useState('OPD');
  const [opd, setOpd] = useState([]);
  const [ipd, setIpd] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [personalDetails, setPersonalDetails] = useState(null);
  const [family, setFamily] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [note, setNote] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showAdviceModal, setShowAdviceModal] = useState(false);
  const [adviceText, setAdviceText] = useState('');

  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
  const [advice, setAdvice] = useState('');
  const [doctorName, setDoctorName] = useState('Dr.Anjali Mehra');
  const [signatureURL, setSignatureURL] = useState('');
  
  const sigCanvas = useRef(null);
  const previewRef = useRef(null);
  const token = 'sample-token';
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPatientData = async (email) => {
    try {
      const response = await axios.get('https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails');
      const patient = response.data.find(p => p.email === email);
      
      if (patient) {
        setPatientData(prev => ({
          ...prev,
          [email]: {
            ...patient,
            familyHistory: patient.familyHistory ? Object.entries(patient.familyHistory)
              .filter(([_, value]) => value)
              .map(([key]) => key)
              .join(', ') : 'No family history',
            additionalDetails: patient.additionalDetails || {},
            surgeries: patient.surgeries || 'No surgeries recorded',
            allergies: patient.allergies || 'No allergies recorded'
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const fetchData = () => {
    axios.get('https://67e3e1e42ae442db76d2035d.mockapi.io/register/book')
      .then(res => {
        const allAppointments = Array.isArray(res.data) ? res.data : [];
        // Only show appointments that are confirmed, visible, and don't have advice
        const opdAppointments = allAppointments.filter(app => 
          app.status === 'Confirmed' && 
          app.isVisible === true && 
          !app.advice
        );
        setOpd(opdAppointments);

        // Show appointments with advice in IPD
        const ipdAppointments = allAppointments.filter(app => app.advice);
        setIpd(ipdAppointments);

        // Fetch patient data for all appointments
        [...opdAppointments, ...ipdAppointments].forEach(app => {
          if (app.email) {
            fetchPatientData(app.email);
          }
        });
      })
      .catch(err => {
        console.error('Error fetching appointments:', err); 
        setOpd([]);
        setIpd([]); 
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const viewPatientDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    setPersonalDetails(null);
    setFamily([]);
    setVitals(null);
    setLoadingDetails(true);

    try {
      // Fetch personal details
      const personalRes = await axios.get('https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails');
      const patient = personalRes.data.find(p => p.email === appointment.email);
      
      if (patient) {
        setPersonalDetails({
          height: patient.height,
          weight: patient.weight,
          bloodGroup: patient.bloodGroup,
          surgeries: patient.surgeries,
          allergies: patient.allergies,
          isSmoker: patient.isSmoker,
          isAlcoholic: patient.isAlcoholic
        });

        // Fetch family history
        try {
          const familyRes = await axios.get('https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData');
          // Robust email matching: trim and lowercase
          const patientEmail = (appointment.email || '').trim().toLowerCase();
          const familyData = familyRes.data.filter(f => (f.email || '').trim().toLowerCase() === patientEmail);
          if (familyData && familyData.length > 0) {
            setFamily(familyData);
          } else {
            setFamily([]);
          }
        } catch (error) {
          console.error('Error fetching family data:', error);
          setFamily([]);
        }

        // Fetch vitals
        try {
          const vitalsRes = await axios.get('https://6808fb0f942707d722e09f1d.mockapi.io/health-summary');
          // Match by email (case-insensitive, trimmed)
          const patientEmail = (appointment.email || '').trim().toLowerCase();
          const vitalsData = vitalsRes.data.find(v => (v.email || '').trim().toLowerCase() === patientEmail);
          if (vitalsData) {
            setVitals({
              bloodPressure: vitalsData.bloodPressure || "Not recorded",
              heartRate: vitalsData.heartRate || "Not recorded",
              temperature: vitalsData.temperature || "Not recorded",
              bloodSugar: vitalsData.bloodSugar || "Not recorded",
              spo2: vitalsData.spo2 || "Not recorded",
              respiratoryRate: vitalsData.respiratoryRate || "Not recorded",
              lastUpdated: vitalsData.lastUpdated || "Not recorded"
            });
          } else {
            setVitals(null);
          }
        } catch (error) {
          console.error('Error fetching vitals:', error);
          setVitals(null);
        }
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
    }

    setLoadingDetails(false);
  };

  const addNote = () => {
    if (!note || !selectedAppointment) return alert('Enter note');
    
    const payload = { note, doctorName: selectedAppointment.doctorName || '', patientName: selectedAppointment.name || '', appointmentDate: selectedAppointment.date || '', symptoms: selectedAppointment.symptoms || '', createdAt: selectedAppointment.createdAt || '' };

    axios.post('https://6809f36e1f1a52874cde79fe.mockapi.io/note', payload, auth)
      .then(() => { alert('Note added successfully'); setNote(''); })
      .catch(err => { console.error('Error adding note:', err); alert('Failed to add note'); });
  };

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  const updateMedicine = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setMedicines(updatedMedicines);
  };

  const clearSignature = () => { if (sigCanvas.current) { sigCanvas.current.clear(); setSignatureURL(''); } };

  const handleSavePrescription = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return alert("Please sign the prescription before saving.");

    const sigData = sigCanvas.current.toDataURL();
    setSignatureURL(sigData);

    const prescriptionData = { patientName: selectedAppointment?.name, date: new Date().toISOString().split('T')[0], medicines, advice, doctorName, signature: sigData };

    const pdf = new jsPDF();
    pdf.setDrawColor(200);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, 190, 270, 'S');

    pdf.setFontSize(16);
    pdf.setTextColor(14, 22, 48);
    pdf.text(doctorName, 105, 25, { align: "center" });

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("MBBS, MD | AV Swasthya Health Center", 105, 33, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text("Contact: +91-1234567890 | Email: doctor@clinic.com", 105, 39, { align: "center" });

    pdf.line(20, 45, 190, 45);
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Patient: ${selectedAppointment?.name || "—"}`, 20, 55);
    pdf.text(`Date: ${new Date().toISOString().split('T')[0]}`, 150, 55);

    let startY = 75;
    pdf.setFontSize(12);
    pdf.setDrawColor(0);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, 65, 170, 10, 'FD');

    pdf.setTextColor(0, 0, 0);
    pdf.text("Medicine", 30, 72);
    pdf.text("Dosage", 95, 72);
    pdf.text("Duration", 150, 72);

    medicines.forEach((med, index) => {
      let y = startY + (index * 10);
      pdf.rect(20, y, 170, 10);
      pdf.text(med.name || "—", 30, y + 7);
      pdf.text(med.dosage || "—", 95, y + 7);
      pdf.text(med.duration || "—", 150, y + 7);
    });

    let adviceY = startY + (medicines.length * 10 + 15);
    pdf.setFontSize(12);
    pdf.text("Advice:", 20, adviceY);

    pdf.setFontSize(11);
    const adviceLines = pdf.splitTextToSize(advice || "—", 170);
    pdf.text(adviceLines, 25, adviceY + 8);

    pdf.setFontSize(12);
    pdf.text("Authorized Signature:", 140, 260);
    pdf.addImage(sigData, 'PNG', 140, 240, 50, 20);

    const pdfBlob = pdf.output('blob');
    console.log('Prescription saved:', prescriptionData);
    alert('Prescription saved successfully');
    setShowPrescriptionModal(false);

    const updatedAppointment = { ...selectedAppointment, prescription: prescriptionData, status: selectedAppointment.advice ? 'IPD' : 'OPD', movedDate: selectedAppointment.advice ? new Date().toISOString() : null };

    axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${selectedAppointment.id}`, updatedAppointment, auth)
      .then(() => {
        if (selectedAppointment.advice) {
          setIpd(prev => [...prev, updatedAppointment]);
          setOpd(prev => prev.filter(app => app.id !== selectedAppointment.id));
        } else {
          setOpd(prev => prev.map(app => app.id === selectedAppointment.id ? updatedAppointment : app));
        }
        alert('Prescription saved successfully');
        setSelectedAppointment(null);
        setMedicines([{ name: '', dosage: '', duration: '' }]);
        setAdvice('');
        setSignatureURL('');
      })
      .catch(err => { console.error('Error saving prescription:', err); alert('Failed to save prescription'); });
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current);
    const link = document.createElement('a');
    const safeName = selectedAppointment?.name.trim().replace(/\s+/g, '_') || 'prescription';
    link.download = `${safeName}_prescription.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    if (!previewRef.current) return;
    const printContents = previewRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return alert('Pop-up blocked. Please allow pop-ups to print the prescription.');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${selectedAppointment?.name || 'Patient'}</title>
          <style>
            body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.5; }
            .print-preview { max-width: 800px; margin: 0 auto; padding: 2rem; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; }
            table th, table td { border: 1px solid #ddd; padding: 8px; }
            table th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="print-preview">${printContents}</div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
  };

  const handleAddAdvice = () => {
    if (!adviceText.trim()) return alert('Please enter advice before proceeding');

    const payload = { note: adviceText, doctorName: selectedAppointment.doctorName || '', patientName: selectedAppointment.name || '', appointmentDate: selectedAppointment.date || '', symptoms: selectedAppointment.symptoms || '', createdAt: selectedAppointment.createdAt || '' };

    axios.post('https://6809f36e1f1a52874cde79fe.mockapi.io/note', payload, auth)
      .then(() => {
        const updatedAppointment = { ...selectedAppointment, advice: adviceText, status: 'OPD', prescription: selectedAppointment.prescription || null };
        return axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${selectedAppointment.id}`, updatedAppointment, auth);
      })
      .then(() => {
        setOpd(prev => prev.map(app => app.id === selectedAppointment.id ? { ...selectedAppointment, advice: adviceText } : app));
        alert('Advice and consultation note added successfully');
        setShowAdviceModal(false);
        setAdviceText('');
        setSelectedAppointment(null);
      })
      .catch(err => { console.error('Error updating:', err); alert('Failed to update'); });
  };

  const handleMoveToIPD = (appointment) => {
    const updatedAppointment = { ...appointment, status: 'IPD', movedDate: new Date().toISOString() };
    axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${appointment.id}`, updatedAppointment, auth)
      .then(() => {
        setIpd(prev => [...prev, updatedAppointment]);
        setOpd(prev => prev.filter(app => app.id !== appointment.id));
        alert('Patient moved to IPD successfully');
      })
      .catch(err => { console.error('Error moving to IPD:', err); alert('Failed to move patient to IPD'); });
  };

  const currentAppointments = tab === 'OPD' ? opd : ipd;

  const renderPatientDetails = (patient) => {
    if (!patient) return null;
    
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Personal Information</h3>
            <p>Name: {patient.name}</p>
            <p>Age: {patient.age}</p>
            <p>Gender: {patient.gender}</p>
            <p>Email: {patient.email}</p>
            <p>Phone: {patient.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Medical Information</h3>
            <p>Blood Group: {patient.bloodGroup}</p>
            <p>Height: {patient.height}</p>
            <p>Weight: {patient.weight}</p>
            <p>BMI: {patient.bmi}</p>
          </div>
          <div className="col-span-2">
            <h3 className="font-semibold mb-2">Family History</h3>
            <p>{patient.familyHistory || 'No family history recorded'}</p>
          </div>
          <div className="col-span-2">
            <h3 className="font-semibold mb-2">Previous Conditions</h3>
            <p>{patient.previousConditions || 'No previous conditions recorded'}</p>
          </div>
          <div className="col-span-2">
            <h3 className="font-semibold mb-2">Allergies</h3>
            <p>{patient.allergies || 'No allergies recorded'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderRow = (appointment, type) => (
    <tr key={appointment.id}>
      <td className="px-3 py-2">{appointment.name}</td>
      <td className="px-3 py-2">{appointment.phone}</td>
      <td className="px-3 py-2">{appointment.date}</td>
      <td className="px-3 py-2">{appointment.time}</td>
      <td className="px-3 py-2">{appointment.specialty}</td>
      <td className="px-3 py-2">{appointment.reason}</td>
      <td className="px-3 py-2">{appointment.type}</td>
      <td className="px-3 py-2">
        <button 
          onClick={() => viewPatientDetails(appointment)}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          View Details
        </button>
      </td>
    </tr>
  );

  const renderVitals = (vitals) => {
    if (!vitals) return null;
    
    return (
      <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-3 text-[#0e1630] border-b pb-2">Vital Signs</h3>
        {vitals ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm">Blood Pressure</span>
              <p className="font-medium">{vitals.bloodPressure}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm">Heart Rate</span>
              <p className="font-medium">{vitals.heartRate}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm">Temperature</span>
              <p className="font-medium">{vitals.temperature}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm">Blood Sugar</span>
              <p className="font-medium">{vitals.bloodSugar}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm">SpO2</span>
              <p className="font-medium">{vitals.spo2}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="text-gray-500 text-sm">Respiratory Rate</span>
              <p className="font-medium">{vitals.respiratoryRate}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No vitals recorded for this patient.
          </div>
        )}
      </div>
    );
  };

  const renderFamilyHistory = (family) => {
    if (!family || family.length === 0) return null;
    
    return (
      <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-lg font-semibold mb-3 text-[#0e1630] border-b pb-2">Family History</h3>
        <div className="space-y-3">
          {family.map((member, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 text-sm">Name</span>
                  <p className="font-medium">{member.name && member.name.trim() ? member.name : "Not specified"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Relation</span>
                  <p className="font-medium">{member.relation && member.relation.trim() ? member.relation : "Not specified"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Contact</span>
                  <p className="font-medium">{member.number && member.number.trim() ? member.number : "Not specified"}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Diseases</span>
                  <p className="font-medium">
                    {member.diseases && member.diseases.length > 0 
                      ? member.diseases.join(", ") 
                      : "No diseases recorded"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster />
      <main className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-[#0e1630]">Appointment Management</h2>
          <div className="flex gap-3 mb-6">
            {["OPD", "IPD"].map((tabName) => (
              <button
                key={tabName}
                onClick={() => handleTabChange(tabName)}
                className={`px-6 py-2 rounded-md transition-colors duration-200 ${
                  tab === tabName
                    ? "bg-[#0e1630] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tabName} {tabName === "OPD" ? `(${opd.length})` : `(${ipd.length})`}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            {currentAppointments.length > 0 ? (
            <table className="w-full border-collapse text-sm shadow-md rounded-lg overflow-hidden">
              <thead className="bg-[#0e1630] text-white">
                <tr>
                  <th className="p-3 text-left">Patient Name</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Time</th>
                    <th className="p-3 text-left">Reason </th>
                    {tab === 'IPD' && (
                      <>
                        <th className="p-3 text-left">Advice</th>
                        <th className="p-3 text-left">Prescription</th>
                      </>
                    )}
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {currentAppointments.map(appointment => (
                    <tr key={appointment.id} className="border-b hover:bg-blue-50 transition-colors">
                      <td className="p-3">{appointment.name}</td>
                      <td className="p-3">{appointment.date}</td>
                      <td className="p-3">{appointment.time}</td>
                      <td className="p-3">{appointment.symptoms}</td>
                      {tab === 'IPD' && (
                        <>
                          <td className="p-3">
                            <div className="max-w-xs truncate" title={appointment.advice}>
                              {appointment.advice || '—'}
                            </div>
                          </td>
                          <td className="p-3">
                            {appointment.prescription ? (
                              <span className="text-green-600">✓ Added</span>
                            ) : (
                              <span className="text-yellow-600">Pending</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="p-3 flex justify-center gap-2">
                        <button
                          onClick={() => viewPatientDetails(appointment)}
                          className="bg-[#0e1630] text-white hover:bg-[#1a2a4a] px-3 py-1 rounded-md transition-colors"
                        >
                          View Details
                        </button>
                        {tab === 'OPD' && (
                          <>
                            {!appointment.advice ? (
                              <button
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowAdviceModal(true);
                                }}
                                className="bg-yellow-600 text-white hover:bg-yellow-700 px-3 py-1 rounded-md transition-colors"
                              >
                                Add Advice
                              </button>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setAdviceText(appointment.advice);
                                    setShowAdviceModal(true);
                                  }}
                                  className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-md transition-colors"
                                >
                                  View Advice
                                </button>
                                <button
                                  onClick={() => handleMoveToIPD(appointment)}
                                  className="bg-purple-600 text-white hover:bg-purple-700 px-3 py-1 rounded-md transition-colors"
                                >
                                  Move to IPD
                                </button>
                              </div>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowPrescriptionModal(true);
                            if (appointment.prescription) {
                              setMedicines(appointment.prescription.medicines || [{ name: '', dosage: '', duration: '' }]);
                              setAdvice(appointment.prescription.advice || '');
                              setDoctorName(appointment.prescription.doctorName || '');
                              setSignatureURL(appointment.prescription.signature || '');
                            }
                          }}
                          className={`${
                            appointment.prescription 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          } text-white px-3 py-1 rounded-md transition-colors`}
                        >
                          {appointment.prescription ? 'View/Edit Prescription' : 'Add Prescription'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl text-gray-300 mb-4">👨‍⚕️</div>
                <h3 className="text-xl font-semibold text-gray-700">No {tab} Appointments</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There are no {tab.toLowerCase()} appointments scheduled at the moment.
                </p>
              </div>
            )}
          </div>

          {selectedAppointment && !showPrescriptionModal && !showAdviceModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh] animate-fadeIn">
                <button 
                  onClick={() => setSelectedAppointment(null)}
                  className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 transition-colors"
                >
                  &times;
                </button>
                
                <h2 className="text-2xl font-bold mb-4 text-[#0e1630]">Patient Details</h2>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-lg text-[#0e1630]">{selectedAppointment.name}</h3>
                  <p className="text-gray-600">Appointment: {selectedAppointment.date} at {selectedAppointment.time}</p>
                  <p className="text-gray-600">Reason: {selectedAppointment.symptoms}</p>
                </div>
                
                {loadingDetails ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0e1630]"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Personal Details */}
                    {personalDetails && (
                      <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-semibold mb-3 text-[#0e1630] border-b pb-2">Personal Health Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">Height</span>
                            <p className="font-medium">{personalDetails.height || "Not recorded"} cm</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">Weight</span>
                            <p className="font-medium">{personalDetails.weight || "Not recorded"} kg</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">Blood Group</span>
                            <p className="font-medium">{personalDetails.bloodGroup || "Not recorded"}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Family History */}
                    <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold mb-3 text-[#0e1630] border-b pb-2">Family History</h3>
                      {family && family.length > 0 ? (
                        <div className="space-y-3">
                          {family.map((member, index) => (
                            <div key={index} className="bg-gray-50 p-3 rounded-md">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <span className="text-gray-500 text-sm">Name</span>
                                  <p className="font-medium">{member.name && member.name.trim() ? member.name : "Not specified"}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-sm">Relation</span>
                                  <p className="font-medium">{member.relation && member.relation.trim() ? member.relation : "Not specified"}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-sm">Contact</span>
                                  <p className="font-medium">{member.number && member.number.trim() ? member.number : "Not specified"}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 text-sm">Diseases</span>
                                  <p className="font-medium">
                                    {member.diseases && member.diseases.length > 0
                                      ? member.diseases.join(", ")
                                      : "No diseases recorded"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No family history recorded for this patient.
                        </div>
                      )}
                    </div>

                    {/* Vitals */}
                    <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold mb-3 text-[#0e1630] border-b pb-2">Vital Signs</h3>
                      {vitals ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">Blood Pressure</span>
                            <p className="font-medium">{vitals.bloodPressure}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">Heart Rate</span>
                            <p className="font-medium">{vitals.heartRate}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">Temperature</span>
                            <p className="font-medium">{vitals.temperature}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">Blood Sugar</span>
                            <p className="font-medium">{vitals.bloodSugar}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">SpO2</span>
                            <p className="font-medium">{vitals.spo2}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <span className="text-gray-500 text-sm">Respiratory Rate</span>
                            <p className="font-medium">{vitals.respiratoryRate}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No vitals recorded for this patient.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {showAdviceModal && selectedAppointment && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl w-full max-w-2xl relative">
                <button 
                  onClick={() => { setShowAdviceModal(false); setSelectedAppointment(null); setAdviceText(''); }}
                  className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500"
                >
                  &times;
                </button>
                
                <h2 className="text-2xl font-bold mb-4 text-[#0e1630]">
                  {selectedAppointment.advice ? 'View Consultation Notes' : 'Add Consultation Notes'}
                </h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg text-[#0e1630]">{selectedAppointment.name}</h3>
                    <p className="text-gray-600">Appointment: {selectedAppointment.date} at {selectedAppointment.time}</p>
                    <p className="text-gray-600">Reason: {selectedAppointment.symptoms}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Consultation Notes & Advice</label>
                      <textarea
                      rows={6}
                      value={adviceText}
                      onChange={e => setAdviceText(e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter detailed consultation notes and medical advice..."
                      readOnly={!!selectedAppointment.advice}
                    />
                  </div>
                  
                  {!selectedAppointment.advice && (
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => { setShowAdviceModal(false); setSelectedAppointment(null); setAdviceText(''); }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddAdvice}
                        className="bg-[#0e1630] text-white px-4 py-2 rounded-lg hover:bg-[#1a2a4a] transition-colors"
                      >
                        Save Notes
                      </button>
                    </div>
                  )}
                  </div>
              </div>
            </div>
          )}

          {showPrescriptionModal && selectedAppointment && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-2xl w-full max-w-6xl relative overflow-y-auto max-h-[90vh]">
                <button 
                  onClick={() => setShowPrescriptionModal(false)} 
                  className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500"
                >
                  &times;
                </button>
                
                <div className="flex flex-col lg:flex-row gap-6 p-4 bg-gradient-to-tr from-blue-50 via-white to-purple-50 rounded-2xl">
                  <div className="flex-1 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h2 class Name="text-2xl font-bold text-[#0e1630] mb-4">Prescription Form</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Patient Name</label>
                        <input
                          type="text"
                          value={selectedAppointment.name}
                          disabled
                          className="w-full p-2 mt-1 border rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Medicines</label>
                        <div className="space-y-3 mt-2">
                          {medicines.map((med, idx) => (
                            <div key={idx} className="grid grid-cols-3 gap-2">
                              <input
                                type="text"
                                placeholder="Medicine name"
                                value={med.name}
                                onChange={e => updateMedicine(idx, 'name', e.target.value)}
                                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                              <input
                                type="text"
                                placeholder="Dosage"
                                value={med.dosage}
                                onChange={e => updateMedicine(idx, 'dosage', e.target.value)}
                                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                              <input
                                type="text"
                                placeholder="Duration"
                                value={med.duration}
                                onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={addMedicine} 
                          className="mt-3 text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none transition-colors"
                        >
                          + Add Medicine
                        </button>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Doctor Name</label>
                        <input
                          type="text"
                          value={doctorName}
                          onChange={e => setDoctorName(e.target.value)}
                          className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Signature</label>
                        <SignaturePad
                          ref={sigCanvas}
                          canvasProps={{
                            width: 300,
                            height: 100,
                            className: 'border border-gray-300 rounded mt-2 bg-white'
                          }}
                        />
                        <button 
                          onClick={clearSignature} 
                          className="text-sm text-yellow-600 mt-1 hover:text-yellow-800 hover:underline focus:outline-none transition-colors"
                        >
                          Clear Signature
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <h2 className="text-2xl font-bold text-[#0e1630] mb-4">Prescription Preview</h2>
                    <div 
                      ref={previewRef} 
                      className="border border-gray-200 rounded-lg p-6 space-y-5 font-serif text-[15px] bg-white text-gray-800 min-h-[400px]"
                    >
                      <div className="text-center border-b pb-3">
                        <h3 className="text-xl font-bold text-[#0e1630]">{doctorName}</h3>
                        <p className="text-sm text-gray-600">MBBS, MD | AV Swasthya Health Center</p>
                        <p className="text-xs text-gray-500">Contact: +91-1234567890 | Email: doctor@clinic.com</p>
                      </div>
                      <div className="flex justify-between border-b pb-3">
                        <p><strong>Patient:</strong> {selectedAppointment.name}</p>
                        <p><strong>Date:</strong> {new Date().toISOString().split('T')[0]}</p>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2 ">Medications</h4>
                        <table className="w-full border mt-2">
                          <thead className="bg-gray-100 text-gray-700">
                            <tr>
                              <th className="border px-3 py-1 text-left">Medicine</th>
                              <th className="border px-3 py-1 text-left">Dosage</th>
                              <th className="border px-3 py-1 text-left">Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            {medicines.map((med, idx) => (
                              <tr key={idx}>
                                <td className="border px-3 py-1">{med.name || '—'}</td>
                                <td className="border px-3 py-1">{med.dosage || '—'}</td>
                                <td className="border px-3 py-1">{med.duration || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {signatureURL && (
                        <div className="pt-4 flex justify-end">
                          <div className="text-right">
                            <img src={signatureURL} alt="Doctor's Signature" className="h-20 inline-block" />
                            <p className="mt-1 text-sm">{doctorName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                    <button 
                        onClick={() => { setShowPrescriptionModal(false); setSelectedAppointment(null); }} 
  className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500"
>
  &times;
</button>
                      <button 
                        onClick={handlePrint} 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Print
                      </button>
                      <button 
                        onClick={handleSavePrescription} 
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Save Prescription
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;