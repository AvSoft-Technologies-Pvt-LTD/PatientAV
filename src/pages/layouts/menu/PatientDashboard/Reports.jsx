import React, { useState, useEffect } from "react";
import { FiDownload, FiSend, FiCheck } from "react-icons/fi";
import Pagination from '../../../../components/Pagination'; // Adjust path if needed

const Report = () => {
  const [reports, setReports] = useState([]),
    [downloadState, setDownloadState] = useState({}),
    [showForm, setShowForm] = useState(false),
    [form, setForm] = useState({
      date: "",
      testName: "",
      labName: "",
      status: "",
      file: ""
    }),
    [page, setPage] = useState(1),
    rowsPerPage = 4,
    totalPages = Math.ceil(reports.length / rowsPerPage),
    paginatedReports = reports.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    const saved = localStorage.getItem("reports");
    setReports(saved ? JSON.parse(saved) : [
      { date: "2025-04-10", testName: "Blood Test", labName: "MedLife", status: "Completed", file: "path_to_report_file_1.pdf" },
      { date: "2025-04-12", testName: "Urine Test", labName: "PathCare", status: "Pending", file: null },
      { date: "2025-04-15", testName: "X-Ray", labName: "Apollo", status: "In Review", file: "path_to_report_file_2.pdf" }
    ]);
  }, []);

  useEffect(() => {
    localStorage.setItem("reports", JSON.stringify(reports));
  }, [reports]);

  const handleDownload = (file, idx) => {
    if (!file) return alert("No file to download.");
    setDownloadState(p => ({ ...p, [idx]: "bouncing" }));
    setTimeout(() => {
      setDownloadState(p => ({ ...p, [idx]: "loading" }));
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = file;
        a.download = file.split("/").pop();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadState(p => ({ ...p, [idx]: "done" }));
        setTimeout(() => setDownloadState(p => ({ ...p, [idx]: null })), 3000);
      }, 1500);
    }, 600);
  };

  const handleFormChange = e => {
    const { name, value, files } = e.target;
    setForm(f => ({
      ...f,
      [name]: name === "file" ? (files[0] ? URL.createObjectURL(files[0]) : "") : value
    }));
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    setReports(r => [
      ...r,
      {
        ...form,
        file: form.file || null
      }
    ]);
    setForm({ date: "", testName: "", labName: "", status: "", file: "" });
    setShowForm(false);
  };
  return (
    <>
      <div className="overflow-x-auto p-6 flex flex-col items-center">
        <div className="flex justify-between mb-3 w-full">
          <h4 className="h4-heading">Report</h4>
          <button
            className="view-btn relative inline-block text-[var(--accent-color)] font-semibold px-4 py-2 overflow-hidden transition-all duration-300 hover:text-[var(--accent-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[var(--accent-color)] after:transition-all after:duration-300 hover:after:w-full"
            onClick={() => setShowForm(f => !f)}
          >
            {showForm ? "Close" : "Add Report"}
          </button>
        </div>
        {showForm && (
  <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
    <form onSubmit={handleFormSubmit} className="w-full max-w-md flex flex-col gap-4 bg-white p-6 rounded-lg shadow-lg" style={{ minWidth: 320 }}>
      <h2 className="text-lg font-bold mb-2">Add Report</h2>
      <div className="floating-input relative w-full" data-placeholder="Date">
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleFormChange}
          required
          className="input-field peer"
          placeholder=" "
        />
      </div>
      <div className="floating-input relative w-full" data-placeholder="Test Name">
        <input
          type="text"
          name="testName"
          value={form.testName}
          onChange={handleFormChange}
          required
          className="input-field peer"
          placeholder=" "
        />
      </div>
      <div className="floating-input relative w-full" data-placeholder="Lab Name">
        <input
          type="text"
          name="labName"
          value={form.labName}
          onChange={handleFormChange}
          required
          className="input-field peer"
          placeholder=" "
        />
      </div>
      <div className="floating-input relative w-full" >
        <select
          name="status"
          value={form.status}
          onChange={handleFormChange}
          required
          className="input-field peer"
          placeholder=" "
        >
          <option value="">Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="In Review">In Review</option>
        </select>
      </div>
      <div className="floating-input relative w-full" >
        <input
          type="file"
          name="file"
          accept="application/pdf"
          onChange={handleFormChange}
          className="input-field peer"
          placeholder=" "
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button type="submit" className="btn btn-primary flex-1">Add</button>
        <button type="button" className="btn btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
      </div>
    </form>
  </div>
)}
        <table className="table-container w-full max-w-4xl">
          <thead>
            <tr className="table-head text-center">
              {["Date", "Test Name", "Lab Name", "Status", "Action"].map((h, i) => (
                <th key={i} className="px-6 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body text-center">
            {paginatedReports.map((r, i) => (
              <tr key={i + (page - 1) * rowsPerPage} className="tr-style">
                {[r.date, r.testName, r.labName, r.status].map((val, j) => (
                  <td key={j}>{val}</td>
                ))}
                <td className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => handleDownload(r.file, i + (page - 1) * rowsPerPage)}
                    className={`view-btn relative p-2 rounded-full transition-all duration-300 ${downloadState[i + (page - 1) * rowsPerPage] === "bouncing" ? "bounce-twice" : ""} ${downloadState[i + (page - 1) * rowsPerPage] === "done" ? "pulse-glow" : ""}`}
                    title="Download"
                  >
                    {downloadState[i + (page - 1) * rowsPerPage] === "loading" ? <div className="loader-spinner" /> : downloadState[i + (page - 1) * rowsPerPage] === "done" ? <FiCheck size={18} /> : <FiDownload size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       <div className="w-full  flex justify-end mt-4">
  <Pagination
    page={page}
    totalPages={totalPages}
    onPageChange={(newPage) => setPage(newPage)}
  />
</div>
      </div>
    </>
  );
};
export default Report;