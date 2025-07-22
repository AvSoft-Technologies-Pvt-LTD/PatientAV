import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload, FaPrint, FaFileInvoice } from 'react-icons/fa';
import Pagination from '../../../../components/Pagination'; // Adjust path if needed

const BillingTable = () => {
  const [p, setP] = useState([]), [l, setL] = useState(true), [e, setE] = useState(null), [s, setS] = useState(null);
  const [page, setPage] = useState(1), rowsPerPage = 4;
  useEffect(() => { f(); }, []);
  const f = async () => { try { const r = await axios.get('https://681b32bd17018fe5057a8bcb.mockapi.io/paybook'); setP(r.data); setL(false); } catch { setE('Failed to fetch payment data'); setL(false); } };
  const getInvoiceTemplate = (i) => ``;
  const d = (i) => { const content = getInvoiceTemplate(i); const blob = new Blob([content], { type: 'text/html' }); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `AV_Swasthya_Invoice_${i.invoiceNo}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url); };
  const pr = (i) => { const w = window.open('', '_blank'); w.document.write(getInvoiceTemplate(i)); w.document.close(); w.onload = () => { w.print(); w.close(); }; };
  const totalPages = Math.ceil(p.length / rowsPerPage), paginatedRows = p.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  return (
    <div className="pt-6 bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="h3-heading mb-4">Billing History</h3>
      <div className="table-container">
        <table className="min-w-full">
          <thead className="table-head">
            <tr>{['Date', 'Invoice No', 'Doctor', 'Service', 'Amount', 'Method', 'Action'].map(h => (<th key={h} className="p-3 text-left">{h}</th>))}</tr></thead>
          <tbody className="table-body">
            {paginatedRows.map(i => (
              <tr key={i.id} className="tr-style">
                <td>{i.date}</td><td>{i.invoiceNo}</td><td>{i.doctorName}</td><td>{i.serviceType}</td><td>₹{i.amount}</td><td className="capitalize">{i.method}</td>  <td>
  <button
    onClick={() => setS(i)}
    className="relative group inline-flex items-center gap-2 px-6 py-2 font-semibold text-[var(--accent-color)] border border-[var(--accent-color)] rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-[var(--accent-color)] hover:text-white">
    <FaFileInvoice className="text-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6 group-hover:scale-110" />
    <span className="absolute inset-0 overflow-hidden rounded-lg">
      <span className="absolute left-[-75%] top-0 h-full w-1/3 transform rotate-12 bg-white opacity-10 group-hover:animate-shimmer"></span></span>
    <span className="absolute inset-0 rounded-lg border border-transparent group-hover:border-white/10 group-hover:blur-md group-hover:opacity-40 animate-glow pointer-events-none"></span>
    <span className="absolute w-2 h-2 bg-white rounded-full opacity-0 group-hover:animate-spark top-1/2 left-1/2 pointer-events-none"></span>
  </button>
</td></tr>  ))}
          </tbody>  </table>
      </div>
         <div className="w-full  flex justify-end mt-4">
  <Pagination
    page={page}
    totalPages={totalPages}
    onPageChange={(newPage) => setPage(newPage)}
  />
</div>
      {s && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transition-all duration-300 print:max-w-none print:rounded-none print:shadow-none print:h-auto print:overflow-visible">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start print:border-none">
              <div>
                <h1 className="h3-heading">AV Swasthya</h1>
                <p className="paragraph">Healthcare & Wellness Center</p>
                <p className="paragraph ">123 Health Avenue, Medical District</p>
                <p className="paragraph">+91 98765 43210</p>
                <p className="paragraph">contact@avswasthya.com</p>
              </div>
              <button onClick={() => setS(null)} title="Close" className="text-gray-400 hover:text-gray-600 transition text-xl">✕</button> </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6">
              <div>
                <h4 className="h4-heading mb-2">Invoice Details</h4>
                <div className="paragraph space-y-1">
                  <p><span className="paragraph">Invoice No:</span> {s.invoiceNo}</p>
                  <p><span className="paragraph">Date:</span> {s.date}</p>
                  <p><span className="paragraph">Status:</span> <strong className="text-green-600">Paid</strong></p>
                </div></div>
              <div>
                <h4 className="h4-heading mb-2">Patient Information</h4>
                <div className="paragraph space-y-1">
                  <p><span className="paragraph">Name:</span> {s.patientName}</p>
                  <p><span className="paragraph">Doctor:</span> {s.doctorName}</p>
                </div> </div></div>
            <div className="p-6">
              <table className="table-container">
                <thead className="table-head"> <tr>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-left">Method</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr></thead>
                <tbody className="table-body">
                  <tr className="tr-style">
                    <td>{s.serviceType}</td>
                    <td>{s.method.toUpperCase()}</td>
                    <td className="text-right ">₹{s.amount}</td>
                  </tr> </tbody></table>
              <div className="mt-4 paragraph text-right">
                <div className="flex justify-end">
                  <div className="w-1/2 sm:w-1/3 space-y-2">
                    <div className="flex justify-between">
                      <span className="paragraph">Subtotal:</span>
                      <span className="paragraph">₹{s.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="paragraph">Tax (0%):</span>
                      <span className="paragraph">₹0.00</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2 mt-2 paragraph font-bold">
                      <span>Total:</span>
                      <span>₹{s.amount}</span>
                    </div> </div>    </div>   </div> </div>
            <div className="px-6 pb-6 pt-4 border-t border-gray-200 text-center paragraph">
              <p className="mb-2">Thank you for choosing AV Swasthya for your healthcare needs.</p>
              <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 print:hidden">
                <button onClick={() => d(s)} className="btn btn-primary"><FaDownload /> Download</button>
                <button onClick={() => pr(s)} className="btn btn-secondary"><FaPrint /> Print</button>
              </div> </div>
          </div> </div>
      )}   </div>);};
export default BillingTable;