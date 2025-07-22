import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import SignaturePad from 'react-signature-canvas';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [tab, setTab] = useState('OPD'), [opd, setOpd] = useState(() => JSON.parse(localStorage.getItem('opdAppointments') || '[]')), [ipd, setIpd] = useState(() => JSON.parse(localStorage.getItem('ipdAppointments') || '[]')), [selectedAppointment, setSelectedAppointment] = useState(null), [personalDetails, setPersonalDetails] = useState(null), [family, setFamily] = useState([]), [vitals, setVitals] = useState(null), [loadingDetails, setLoadingDetails] = useState(false), [showPrescriptionModal, setShowPrescriptionModal] = useState(false), [showAdviceModal, setShowAdviceModal] = useState(false), [adviceText, setAdviceText] = useState(''), [medicines, setMedicines] = useState([{ id: Date.now(), name: '', dosage: '', duration: '', timing: '' }]), [advice, setAdvice] = useState(''), [doctorName, setDoctorName] = useState('Dr.Anjali Mehra'), [signatureURL, setSignatureURL] = useState(''), sigCanvas = useRef(null), previewRef = useRef(null), token = 'sample-token', auth = { headers: { Authorization: `Bearer ${token}` } }, [state, setState] = useState({ currentPage: 1 }), pageSize = 4, data = tab === 'OPD' ? opd : ipd, totalPages = Math.ceil(data.length / pageSize), currentAppointments = data.slice((state.currentPage - 1) * pageSize, state.currentPage * pageSize);

  useEffect(() => { axios.get('https://67e3e1e42ae442db76d2035d.mockapi.io/register/book').then(res => { const d = Array.isArray(res.data) ? res.data : [], newOpd = d.filter(app => app.status === 'Confirmed' && app.isVisible && !app.advice), newIpd = d.filter(app => app.advice), existingOpd = JSON.parse(localStorage.getItem('opdAppointments') || '[]'), existingIpd = JSON.parse(localStorage.getItem('ipdAppointments') || '[]'), mergedOpd = [...existingOpd, ...newOpd.filter(n => !existingOpd.some(e => e.id === n.id))], mergedIpd = [...existingIpd, ...newIpd.filter(n => !existingIpd.some(e => e.id === n.id))]; setOpd(mergedOpd); setIpd(mergedIpd); localStorage.setItem('opdAppointments', JSON.stringify(mergedOpd)); localStorage.setItem('ipdAppointments', JSON.stringify(mergedIpd)); }).catch(() => { setOpd([]); setIpd([]); }); }, []);

  const viewPatientDetails = async (a) => { setSelectedAppointment(a); setPersonalDetails(null); setFamily([]); setVitals(null); setLoadingDetails(true); try { const { data } = await axios.get('https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails'); const p = data.find(p => p.email === a.email); if (p) { setPersonalDetails({ height: p.height, weight: p.weight, bloodGroup: p.bloodGroup, surgeries: p.surgeries, allergies: p.allergies, isSmoker: p.isSmoker, isAlcoholic: p.isAlcoholic }); const email = (a.email || '').trim().toLowerCase(); try { const { data } = await axios.get('https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData'); setFamily(data.filter(f => (f.email || '').trim().toLowerCase() === email)); } catch { setFamily([]); } try { const { data } = await axios.get('https://6808fb0f942707d722e09f1d.mockapi.io/health-summary'); const v = data.find(v => (v.email || '').trim().toLowerCase() === email); setVitals(v ? { bloodPressure: v.bloodPressure || "Not recorded", heartRate: v.heartRate || "Not recorded", temperature: v.temperature || "Not recorded", bloodSugar: v.bloodSugar || "Not recorded" } : null); } catch { setVitals(null); } } } catch { } setLoadingDetails(false); };

  const addMedicine = () => setMedicines([...medicines, { id: Date.now() + Math.random(), name: '', dosage: '', duration: '', timing: '' }]);
  const updateMedicine = (i, f, v) => { const m = [...medicines]; m[i] = { ...m[i], [f]: v }; setMedicines(m); };
  const clearSignature = () => { if (sigCanvas.current) { sigCanvas.current.clear(); setSignatureURL(''); } };
const handleSavePrescription = () => {
  if (!sigCanvas.current || sigCanvas.current.isEmpty()) return toast.error("Please sign the prescription before saving.");
  const sigData = sigCanvas.current.toDataURL(), today = new Date().toISOString().split('T')[0];
  setSignatureURL(sigData);
  const prescriptionData = { patientName: selectedAppointment?.name, date: today, medicines, advice, doctorName, signature: sigData, status: 'Verified', type: tab };
  axios.post('https://6809f36e1f1a52874cde79fe.mockapi.io/prescribtion', prescriptionData, auth)
    .then(res => axios.put(
      `https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${selectedAppointment.id}`,
      { ...selectedAppointment, prescription: prescriptionData, prescriptionLink: res.data?.id ? `https://6809f36e1f1a52874cde79fe.mockapi.io/prescribtion/${res.data.id}` : '', status: tab, movedDate: null }, auth
    ))
    .then(() => {
      if (tab === 'OPD') {
        setOpd(prev => {
          const updated = prev.map(app => app.id === selectedAppointment.id ? { ...selectedAppointment, prescription: prescriptionData } : app);
          localStorage.setItem('opdAppointments', JSON.stringify(updated));
          return updated;
        });
      } else if (tab === 'IPD') {
        setIpd(prev => {
          const updated = prev.map(app => app.id === selectedAppointment.id ? { ...selectedAppointment, prescription: prescriptionData } : app);
          localStorage.setItem('ipdAppointments', JSON.stringify(updated));
          return updated;
        });
      }
      setSelectedAppointment(prev => ({ ...prev, prescription: prescriptionData })); // Update selectedAppointment
      toast.success('Prescription saved successfully');
      setMedicines([{ name: '', dosage: '', duration: '', timing: '' }]);
      setAdvice('');
      setSignatureURL('');
      setShowPrescriptionModal(false);
    })
    .catch(() => toast.error('Failed to save prescription'));
};
  const handlePrint = () => {
    if (!previewRef.current) return;
    const printContents = previewRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return toast.error('Pop-up blocked. Please allow pop-ups to print the prescription.');
    printWindow.document.write(`<html><head><title>Prescription - ${selectedAppointment?.name || 'Patient'}</title></head><body>${printContents}<script>window.onload=function(){setTimeout(()=>{window.print();window.close();},500);}</script></body></html>`);
    printWindow.document.close(); printWindow.focus();
  };

  const handleAddAdvice = () => {
    if (!adviceText.trim()) return toast.error('Please enter advice before proceeding');
    const payload = { note: adviceText, doctorName: selectedAppointment.doctorName || '', patientName: selectedAppointment.name || '', appointmentDate: selectedAppointment.date || '', symptoms: selectedAppointment.symptoms || '', createdAt: selectedAppointment.createdAt || '' };
    axios.post('https://6809f36e1f1a52874cde79fe.mockapi.io/note', payload, auth)
      .then(() => {
        const updatedAppointment = { ...selectedAppointment, advice: adviceText, status: 'OPD', prescription: selectedAppointment.prescription || null };
        return axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${selectedAppointment.id}`, updatedAppointment, auth);
      })
      .then(() => {
        setOpd(prev => { const newOpd = prev.map(app => app.id === selectedAppointment.id ? { ...selectedAppointment, advice: adviceText } : app); localStorage.setItem('opdAppointments', JSON.stringify(newOpd)); return newOpd; });
        toast.success('Advice and consultation note added successfully');
        setShowAdviceModal(false); setAdviceText(''); setSelectedAppointment(null);
      })
      .catch(() => { toast.error('Failed to update'); });
  };

  const handleMoveToIPD = (a) => {
    const updatedAppointment = { ...a, status: 'IPD', movedDate: new Date().toISOString(), prescription: a.prescription || null };
    axios.put(`https://67e3e1e42ae442db76d2035d.mockapi.io/register/book/${a.id}`, updatedAppointment, auth).then(() => {
      setIpd(prev => { const newIpd = [...prev, updatedAppointment]; localStorage.setItem('ipdAppointments', JSON.stringify(newIpd)); return newIpd; });
      setOpd(prev => { const newOpd = prev.filter(app => app.id !== a.id); localStorage.setItem('opdAppointments', JSON.stringify(newOpd)); return newOpd; });
      toast.success('Patient moved to IPD successfully');
    }).catch(() => { toast.error('Failed to move patient to IPD'); });
  };

  return (
    <div>
      <Toaster />
      <main>
        <div className="p-6 bg-white mt-6 rounded-2xl shadow-lg">
          <h4 className="h4-heading mb-6">Appointment Management</h4>
          <div className="flex gap-3 mb-6">
            {["OPD", "IPD"].map(tabName => (
              <button key={tabName} onClick={() => { setTab(tabName); setState({ currentPage: 1 }); }}
                className={`btn ${tab === tabName ? 'btn-primary' : 'btn-secondary'}`}>
                {tabName} {tabName === "OPD" ? `(${opd.length})` : `(${ipd.length})`}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            {currentAppointments.length > 0 ? (
              <table className="table-container w-full border-collapse ">
                <thead>
                  <tr className="table-head bg-gray-100 text-center">
                    {['Patient Name', 'Date', 'Time', 'Reason', ...(tab === 'IPD' ? ['Advice', 'Prescription'] : []), 'Actions'].map((h) => (
                      <th key={h} className="p-3 font-semibold text-sm"><h4>{h}</h4></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="table-body">
                  {currentAppointments.map(a => (
                    <tr key={a.id} className="tr-style text-center">
                      <td className="p-3 text-left">
                        <button onClick={() => viewPatientDetails(a)} className="text-[var(--primary-color)] font-semibold hover:text-[var(--accent-color)] focus:outline-none" title="View Patient Details" type="button">{a.name}</button>
                      </td>
                      <td className="p-3 text-center">{a.date}</td>
                      <td className="p-3 text-center">{a.time}</td>
                      <td className="p-3 max-w-xs truncate" title={a.symptoms}>{a.symptoms}</td>
                      {tab === 'IPD' && (
                        <>
                          <td className="p-3 text-center">
                            {a.advice ? (
                              <button
                                onClick={() => {
                                  setSelectedAppointment(a);
                                  setAdviceText(a.advice);
                                  setShowAdviceModal(true);
                                }}
                                className="text-[var(--primary-color)] hover:text-[var(--accent-color)] focus:outline-none"
                                title="View Advice"
                              >
                                📄 {/* Replace with an actual icon if needed */}
                              </button>
                            ) : (
                              <span className="text-gray-500">—</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            {a.prescription ? (
                              <span className="text-[var(--accent-color)] font-semibold">✓ Added</span>
                            ) : (
                              <span className="text-yellow-600 font-semibold">Pending</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="p-3 text-center bg-[var(--color-surface)]">
                        <div className="flex flex-wrap justify-center gap-2">
                          {tab === 'OPD' && (!a.advice ? (
                            <button onClick={() => { setSelectedAppointment(a); setShowAdviceModal(true); }} className="edit-btn">Advice</button>
                          ) : (
                            <>
                              <button onClick={() => { setSelectedAppointment(a); setAdviceText(a.advice); setShowAdviceModal(true); }} className="edit-btn">Advice</button>
                              <button onClick={() => handleMoveToIPD(a)} className="btn bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-[var(--color-surface)]">Move to IPD</button>
                            </>
                          ))}
                          <button onClick={() => { setSelectedAppointment(a); setShowPrescriptionModal(true); if (a.prescription) { setMedicines(a.prescription.medicines || [{ name: '', dosage: '', duration: '', timing: '' }]); setAdvice(a.prescription.advice || ''); setDoctorName(a.prescription.doctorName || ''); setSignatureURL(a.prescription.signature || ''); } }} className={`btn ${a.prescription ? 'edit-btn' : 'view-btn'}`}>{a.prescription ? 'Edit Rx' : 'Add Rx'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <h3 className="h4-heading">No {tab} Appointments</h3>
                <p className="paragraph max-w-md mx-auto">There are no {tab.toLowerCase()} appointments scheduled at the moment.</p>
              </div>
            )}
          </div>
          <div className="flex justify-end items-center mt-4">
            <div className="flex items-center gap-2">
              <button
                disabled={state.currentPage === 1}
                onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                className={`edit-btn ${state.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </button>
              <span>
                Page {state.currentPage} of {totalPages || 1}
              </span>
              <button
                disabled={state.currentPage === totalPages || totalPages === 0}
                onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                className={`edit-btn ${state.currentPage === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
            </div>
          </div>
          {selectedAppointment && !showPrescriptionModal && !showAdviceModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-[var(--color-surface)] p-6 rounded-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh] animate-fadeIn">
                <button onClick={() => setSelectedAppointment(null)}
                  className="absolute top-3 right-4 text-2xl text-[var(--color-overlay)] hover:text-red-500 transition-colors">&times;</button>
                <h4 className="h4-heading text-[var(--primary-color)] mb-4">Patient Details</h4>
                <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow mb-5">
                  <h4 className="paragraph font-bold mb-3 border-b pb-2 ">Basic Information</h4>
                  <h4 className="paragraph font-semibold">{selectedAppointment.name}</h4>
                  <p className="paragraph font-semibold">Appointment: {selectedAppointment.date} at {selectedAppointment.time}</p>
                  <p className="paragraph font-semibold">Reason: {selectedAppointment.symptoms}</p>
                </div>
                {loadingDetails ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {personalDetails && (
                      <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="paragraph font-bold mb-3 border-b pb-2">Personal Health Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {["height", "weight", "bloodGroup"].map((f, i) => (
                            <div key={i} className="bg-[var(--color-overlay)]-50 p-3 mt-3 rounded-md">
                              <span className="text-[var(--color-overlay)]text-sm">
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                              </span>
                              <p className="text-lg font-semibold">
                                {personalDetails[f] || "Not recorded"}
                                {f !== "bloodGroup" ? (f === "height" ? " cm" : " kg") : ""}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="paragraph font-bold mb-3 border-b pb-2">Family History</h4>
                      {family?.length ? <div className="space-y-3">{family.map((m, i) => <div key={i} className="p-3 border rounded-md mt-5"><div className="grid grid-cols-1 md:grid-cols-2 gap-3">{["name", "relation", "number"].map((k, j) => <div key={j}><span className="paragraph font-semibold">{k[0].toUpperCase() + k.slice(1)}</span><p className="paragraph">{m[k]?.trim() || "Not specified"}</p></div>)}<div><span className="paragraph text-[var(--color-overlay)]-500">Diseases</span><p className="paragraph">{m.diseases?.length ? m.diseases.join(", ") : "No diseases recorded"}</p></div></div></div>)}</div>
                        : <div className="text-center py-4 paragraph text-[var(--color-overlay)]-500">No family history recorded for this patient.</div>}
                    </div>
                    <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="paragraph font-bold mb-3 border-b pb-2">Vital Signs</h4>
                      {vitals ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {["bloodPressure", "heartRate", "temperature", "bloodSugar"].map((v, i) => (
                            <div key={i} className="bg-[var(--color-overlay)]-50 p-3 text-[var(--color-overlay)] rounded-md">
                              <span className="text-[var(--color-overlay)]text-sm">
                                {v.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                              </span>
                              <p className="text-lg font-semibold">{vitals[v]}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 paragraph text-[var(--color-overlay)]-500">
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
              <div className="bg-[var(--color-surface)] p-6 rounded-2xl w-full max-w-2xl relative">
                <button
                  onClick={() => {
                    setShowAdviceModal(false);
                    setSelectedAppointment(null);
                    setAdviceText('');
                  }}
                  className="absolute top-3 right-4 text-2xl text-[var(--color-overlay)] hover:text-red-500"
                >
                  &times;
                </button>
                <h4 className="h4-heading">
                  {selectedAppointment.advice ? 'View Consultation Notes' : 'Add Consultation Notes'}
                </h4>
                <div className="space-y-4">
                  <div className="bg-[var(--color-overlay)]-50 p-4 rounded-lg">
                    <h4 className="h4-heading">{selectedAppointment.name}</h4>
                    <p className="paragraph">
                      Appointment: {selectedAppointment.date} at {selectedAppointment.time}
                    </p>
                    <p className="paragraph">Reason: {selectedAppointment.symptoms}</p>
                  </div>
                  <div>
                    <label className="paragraph">Consultation Notes & Advice</label>
                    <textarea
                      rows={6}
                      value={adviceText}
                      onChange={(e) => setAdviceText(e.target.value)}
                      className="input-field"
                      placeholder="Enter detailed consultation notes and medical advice..."
                      readOnly={!!selectedAppointment.advice} // Read-only for IPD
                    />
                  </div>
                  {!selectedAppointment.advice && (
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowAdviceModal(false);
                          setSelectedAppointment(null);
                          setAdviceText('');
                        }}
                        className="btn btn-primary"
                      >
                        Cancel
                      </button>
                      <button onClick={handleAddAdvice} className="btn btn-secondary">
                        Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          {showPrescriptionModal && selectedAppointment && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-[var(--color-surface)] p-6 rounded-2xl w-full max-w-6xl relative overflow-y-auto max-h-[90vh]">
                <button onClick={() => { setShowPrescriptionModal(false); setSelectedAppointment(null); }} className="absolute top-3 right-4 text-2xl text-[var(--color-overlay)] hover:text-red-500">&times;</button>
                <div className="flex flex-col lg:flex-row gap-6 p-4 bg-gradient-to-tr from-[var(--color-overlay)]-50 via-[var(--color-surface)] to-[var(--color-overlay)]-50 rounded-2xl">
                  <div className="flex-1 bg-[var(--color-surface)] p-6 rounded-xl shadow-md border border-[var(--color-overlay)]-200">
                    <h4 className="h4-heading">Prescription Form</h4>
                    <div className="space-y-4">
                      <div><label className="paragraph">Patient Name</label><input type="text" value={selectedAppointment.name} disabled className="input-field" /></div>
                      <div><label className="paragraph">Medicines</label>
                        <div className="space-y-3 mt-2">{medicines.map((med, idx) => (
                          <div key={med.id} className="grid grid-cols-4 gap-2">
                            <input type="text" placeholder="Medicine name" value={med.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} className="input-field" />
                            <input type="text" placeholder="Dosage" value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} className="input-field" />
                            <input type="text" placeholder="Duration" value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} className="input-field" />
                            <select value={med.timing} onChange={e => updateMedicine(idx, 'timing', e.target.value)} className="input-field">
                              <option value="">Timing</option>
                              <option value="Morning (Before Food)">Morning (Before Food)</option>
                              <option value="Afternoon (After Food)">Afternoon (After Food)</option>
                              <option value="Night (After Food)">Night (After Food)</option>
                            </select>
                          </div>))}
                        </div>
                        <button onClick={addMedicine} className="text-sm text-[var(--accent-color)] hover:text-[#1a2a4a] hover:underline focus:outline-none transition-colors">+ Add Medicine</button>
                      </div>
                      <div><label className="paragraph">Doctor Name</label><input type="text" value={doctorName} onChange={e => setDoctorName(e.target.value)} className="input-field" /></div>
                      <div><label className="paragraph">Signature</label>
                        <SignaturePad ref={sigCanvas} canvasProps={{ width: 300, height: 100, className: 'border border-[var(--color-overlay)]-300 rounded mt-2 bg-[var(--color-surface)]' }} />
                        <button onClick={clearSignature} className="text-sm text-[var(--accent-color)] mt-1 hover:text-[#1a2a4a] hover:underline focus:outline-none transition-colors">Clear Signature</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-[var(--color-surface)] p-6 rounded-xl shadow-md border border-[var(--color-overlay)]-200">
                    <h4 className="h4-heading">Prescription Preview</h4>
                    <div ref={previewRef} className="border border-[var(--color-overlay)]-200 rounded-lg p-6 space-y-5 font-serif text-[15px] bg-[var(--color-surface)] text-[var(--color-overlay)]-800 min-h-[400px]">
                      <div className="text-center border-b pb-3"><h4 className="h4-heading">{doctorName}</h4><p className="paragraph">MBBS, MD | AV Swasthya Health Center</p><p className="paragraph">Contact: +91-1234567890 | Email: doctor@clinic.com</p></div>
                      <div className="flex justify-between border-b pb-3"><p className="paragraph"><strong>Patient:</strong> {selectedAppointment.name}</p><p className="paragraph"><strong>Date:</strong> {new Date().toISOString().split('T')[0]}</p></div>
                      <div>
                        <h4 className="h4-heading mb-2">Medications</h4>
                        <table className="w-full border mt-2">
                          <thead className="bg-[var(--color-overlay)]-100 text-[var(--color-overlay)]-700">
                            <tr><th className="border px-3 py-1 text-left">Medicine</th><th className="border px-3 py-1 text-left">Dosage</th><th className="border px-3 py-1 text-left">Duration</th><th className="border px-3 py-1 text-left">Timing</th></tr>
                          </thead>
                          <tbody>{medicines.map((med, idx) => (
                            <tr key={idx}>
                              <td className="border px-3 py-1 paragraph">{med.name || '—'}</td>
                              <td className="border px-3 py-1 paragraph">{med.dosage || '—'}</td>
                              <td className="border px-3 py-1 paragraph">{med.duration || '—'}</td>
                              <td className="border px-3 py-1 paragraph">{med.timing || '—'}</td>
                            </tr>))}
                          </tbody>
                        </table>
                      </div>
                      {signatureURL && (<div className="pt-4 flex justify-end"><div className="text-right"><img src={signatureURL} alt="Doctor's Signature" className="h-20 inline-block" /><p className="mt-1 paragraph">{doctorName}</p></div></div>)}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button onClick={handlePrint} className="btn btn-primary">Print</button>
                      <button onClick={handleSavePrescription} className="btn btn-secondary">Save</button>
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