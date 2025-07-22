
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Eye } from 'lucide-react';
import Pagination from '../../../../components/Pagination'; // Adjust path if needed

const Prescription = () => {
  const [prescriptions, setPrescriptions] = useState([]), [file, setFile] = useState(null), [isModalOpen, setIsModalOpen] = useState(false), [doctorName, setDoctorName] = useState(""), [consultationType, setConsultationType] = useState(""), [diagnosis, setDiagnosis] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;
  const totalPages = Math.ceil(prescriptions.length / rowsPerPage);
  const paginatedPrescriptions = prescriptions.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  useEffect(() => { fetchPrescriptions(); }, []);
  const fetchPrescriptions = async () => { try { const res = await axios.get("https://6809f36e1f1a52874cde79fe.mockapi.io/prescribtion"); setPrescriptions(res.data.map(item => ({ ...item, status: item.status || "Verified" }))); } catch (err) { console.error("Error fetching prescriptions:", err); } };
  const handleFileChange = (e) => { setFile(e.target.files[0]); };
  const handleAddPrescription = async () => {
  if (!file) return alert("Please select a file to upload!");
  try {
    const res = await axios.post("https://6809f36e1f1a52874cde79fe.mockapi.io/prescribtion", {
      date: new Date().toLocaleDateString(),
      doctorName: doctorName || "Unknown Doctor",
      consultationType: consultationType || "General",
      diagnosis: diagnosis || "Not Provided",
      status: "Self Added", // <-- Change here
      prescriptionURL: URL.createObjectURL(file)
    });
    setPrescriptions(prev => [res.data, ...prev]);
    setIsModalOpen(false);
    setFile(null);
    setDoctorName("");
    setConsultationType("");
    setDiagnosis("");
    alert("Prescription added successfully!");
  } catch (e) {
    console.error("Save error:", e);
    alert("Failed to save prescription. Please try again.");
  }
};
  return (
    <div className="overflow-x-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="h4-heading ms-1">Prescription</h4>
<button
  onClick={() => setIsModalOpen(true)}
  className="view-btn relative inline-block text-[var(--accent-color)] font-semibold px-4 py-2 overflow-hidden transition-all duration-300 hover:text-[var(--accent-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[var(--accent-color)] after:transition-all after:duration-300 hover:after:w-full"
>
  Add Prescription
</button>
      </div>
     {isModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-[var(--color-surface)] p-8 rounded-xl shadow-xl w-xl animate-fadeIn space-y-6">
      <h4 className="h4-heading">Upload Prescription</h4>
      <div className="space-y-4">
        {[
          { label: "Upload Prescription", type: "file", props: { accept: "image/*,application/pdf", onChange: handleFileChange } },
          { label: "Doctor Name", type: "text", value: doctorName, onChange: setDoctorName },
          { label: "Consultation Type", type: "text", value: consultationType, onChange: setConsultationType },
          { label: "Diagnosis", type: "text", value: diagnosis, onChange: setDiagnosis }
        ].map((f, i) => (
          <div key={i} className="floating-input relative w-full" data-placeholder={f.label}>
            {f.label === "Consultation Type" ? (
              <select
                value={consultationType}
                onChange={e => setConsultationType(e.target.value)}
                className="input-field peer"
                placeholder=" "
              >
                <option value="">Select Consultation Type</option>
                <option value="Virtual">Virtual</option>
                <option value="Physical">Physical</option>
              </select>
            ) : f.type === "file" ? (
              <input type="file" {...f.props} className="input-field peer" placeholder=" " />
            ) : (
              <input
                type={f.type}
                placeholder=" "
                value={f.value}
                onChange={e => f.onChange(e.target.value)}
                className="input-field peer"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button onClick={() => setIsModalOpen(false)} className="edit-btn me-4">Cancel</button>
        <button onClick={handleAddPrescription} className="view-btn">Add</button>
      </div>
    </div>
  </div>
)}
      <div className="flex justify-center"> {/* Center the table horizontally */}
        <table className="table-container">
          <thead>
            <tr className="table-head">
              {["Date", "Doctor", "Consultation Type", "Diagnosis", "Status", "Action"].map((heading) => (
                <th key={heading} className="px-6 py-3 text-center">{heading}</th> // Center header text
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {paginatedPrescriptions.map((item, index) => (
              <tr key={index} className="tr-style">
                <td className="px-6 py-4 text-center">{item.date}</td>
                <td className="px-6 py-4 text-center">{item.doctorName}</td>
                <td className="px-6 py-4 text-center">{item.consultationType || "N/A"}</td>
                <td className="px-6 py-4 text-center">{item.diagnosis}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "Verified" ? "bg-[var(--color-surface)] text-[var(--color-surface)]" : "bg-red-100 text-red-700"}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center items-center">
                    {item.prescriptionURL ? (
                      <a
                        href={item.prescriptionURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border border-[var(--accent-color)] text-[var(--accent-color)] shadow-md transition-all duration-300 hover:bg-[var(--accent-color)] hover:text-white hover:scale-110"
                      >
                        <span className="absolute inline-flex w-full h-full rounded-full animate-[pulse-ring_1.5s_ease-out_infinite]" />
                        <Eye className="w-5 h-5 z-10 transition-all duration-300 group-hover:animate-[bounce-float_0.6s]" />
                      </a>
                    ) : (
                      <span className="text-red-500 text-sm italic">No File Available</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
     <div className="w-full  flex justify-end mt-4">
  <Pagination
    page={page}
    totalPages={totalPages}
    onPageChange={(newPage) => setPage(newPage)}
  />
</div>
    </div>
  );
};
export default Prescription;