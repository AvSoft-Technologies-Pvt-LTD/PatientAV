import React, { useState, useRef } from 'react';
import SignaturePad from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Calendar from 'react-calendar'; // Make sure to install react-calendar
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

const RealTimePrescription = ({ onSave, onClose }) => {
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState(new Date());
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
  const [advice, setAdvice] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. ');
  const sigCanvas = useRef();
  const previewRef = useRef();
  const [signatureURL, setSignatureURL] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignatureURL('');
  };

  const handleSave = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Please sign before saving.");
      return;
    }

    const sigData = sigCanvas.current.toDataURL();
    setSignatureURL(sigData);

    const prescriptionData = {
      patientName,
      date: date.toISOString().split('T')[0],
      medicines,
      advice,
      doctorName,
      signature: sigData
    };

    const pdf = new jsPDF();

    // --- Outer Box ---
    pdf.setDrawColor(200);
    pdf.setLineWidth(0.5);
    pdf.rect(10, 10, 190, 270, 'S'); // X, Y, Width, Height

    // --- Doctor and Clinic Info ---
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 128);
    pdf.text("Dr.", 105, 25, { align: "center" });

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("MBBS, MD | AV Swasthya Health Center", 105, 33, { align: "center" });

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text("Contact: +91-1234567890 | Email: doctor@clinic.com", 105, 39, { align: "center" });

    pdf.line(20, 45, 190, 45);

    // --- Patient Name and Date ---
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Patient: ${patientName || "—"}`, 20, 55);
    pdf.text(`Date: ${date.toISOString().split('T')[0]}`, 150, 55);

    // --- Medicines Table Headers ---
    pdf.setFontSize(12);
    pdf.setDrawColor(0);
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, 65, 170, 10, 'FD'); // Header background

    pdf.setTextColor(0, 0, 0);
    pdf.text("Medicine", 30, 72);
    pdf.text("Dosage", 95, 72);
    pdf.text("Duration", 150, 72);

    // --- Medicines Data Rows ---
    let startY = 75;
    if (medicines.length === 0) {
      pdf.setFontSize(11);
      pdf.text("—", 30, startY + 10);
      pdf.text("—", 100, startY + 10);
      pdf.text("—", 155, startY + 10);
    } else {
      medicines.forEach((med, index) => {
        let y = startY + (index * 10);
        pdf.rect(20, y, 170, 10);
        pdf.text(med.name, 30, y + 7);
        pdf.text(med.dosage, 95, y + 7);
        pdf.text(med .duration, 150, y + 7);
      });
    }

    // --- Advice Section ---
    let adviceY = startY + (medicines.length > 0 ? medicines.length * 10 + 15 : 25);
    pdf.setFontSize(12);
    pdf.text("Advice:", 20, adviceY);

    pdf.setFontSize(11);
    const adviceLines = pdf.splitTextToSize(advice || "—", 170);
    pdf.text(adviceLines, 25, adviceY + 8);

    // --- Signature ---
    pdf.setFontSize(12);
    pdf.text("Authorized Signature:", 140, 260);

    pdf.addImage(sigData, 'PNG', 140, 240, 50, 20); // X, Y, Width, Height

    // Final Save
    const pdfBlob = pdf.output('blob');

    if (onSave) {
      onSave(prescriptionData, pdfBlob);
    }
  };

  const handleDownload = async () => {
    const canvas = await html2canvas(previewRef.current);
    const link = document.createElement('a');
    const safeName = patientName.trim().replace(/\s+/g, '_') || 'prescription';
    link.download = `${safeName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handlePrint = () => {
    const printContents = previewRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Prescription - ${patientName || 'Patient'}</title>
          <style>
            @media print {
              body * {
                visibility: hidden;
              }
              .print-preview, .print-preview * {
                visibility: visible;
              }
              .print-preview {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 2rem;
                font-family: 'Georgia', serif;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-preview">${printContents}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-gradient-to-tr from-blue-50 via-white to-purple-50 rounded-2xl shadow-2xl">
      {/* Form Section */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-700 mb-2">📝 Prescription Form</h2>
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium text-gray-600">Patient Name</label>
            <input
              type="text"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="w-full p-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Date</label>
            <input
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={e => setDate(new Date(e.target.value))}
              className="w-full p-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* Medicines */}
          <div>
            <label className="text-sm font-medium text-gray-600">Medicines</label>
            <div className="space-y-2 mt-2">
              {medicines.map((med, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Medicine"
                    value={med.name}
                    onChange={e => updateMedicine(idx, 'name', e.target.value)}
                    className="p-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={e => updateMedicine(idx, 'dosage', e.target.value)}
                    className="p-2 border rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={med.duration}
                    onChange={e => updateMedicine(idx, 'duration', e.target.value)}
                    className="p-2 border rounded-lg"
                  />
                </div>
              ))}
            </div>
            <button onClick={addMedicine} className="mt-3 text-sm text-blue-600 hover:underline">
              + Add Medicine
            </button>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Advice</label>
            <textarea
              rows={3}
              value={advice}
              onChange={e => setAdvice(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
              placeholder="Any additional instructions"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Doctor Name</label>
            <input
              type="text"
              value={doctorName}
              onChange={e => setDoctorName(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Signature</label>
            <SignaturePad
              ref={sigCanvas}
              canvasProps={{
                width: 300,
                height: 100,
                className: 'border border-gray-300 rounded mt-2'
              }}
            />
            <button onClick={clearSignature} className="text-sm text-yellow-600 mt-1 hover:underline">
              Clear Signature
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="bg-red-500 text-white px-4 py-2 rounded-lg">Close</button>
          <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg">Save</button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">📋 Prescription Preview</h2>
        <div ref={previewRef} className="print-preview border border-gray-200 rounded-lg p-4 space-y-5 font-serif text-[15px] bg-white text-gray-800">
          <div className="text-center border-b pb-2">
            <h3 className="text-xl font-bold text-blue-800">{doctorName || 'Dr. Name'}</h3>
            <p className="text-sm text-gray-600">MBBS, MD | AV Swasthya Health Center</p>
            <p className="text-xs text-gray-500">Contact: +91-1234567890 | Email: doctor@clinic.com</p>
          </div>

          <div className="flex justify-between">
            <p><strong>Patient:</strong> {patientName || '—'}</p>
            <p><strong>Date:</strong> {date.toISOString().split('T')[0]}</p>
          </div>

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

          <div>
            <p><strong>Advice:</strong> {advice || '—'}</p>
          </div>

          {signatureURL && (
            <div className="pt-4">
              <img src={signatureURL} alt="Doctor's Signature" className="h-20" />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={handleDownload} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Download</button>
          <button onClick={handlePrint} className="bg-purple-600 text-white px-4 py-2 rounded-lg">Print </button>
        </div>
      </div>
    </div>
  );
};

export default RealTimePrescription;