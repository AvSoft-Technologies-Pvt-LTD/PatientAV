import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../../../../components/Pagination';
import { Printer } from 'lucide-react';
import AVLogo from '../../../../assets/AV.png';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  const totalPages = Math.ceil(payments.length / rowsPerPage);
  const currentData = payments.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('https://681b32bd17018fe5057a8bcb.mockapi.io/paybook');
        setPayments(res.data);
      } catch {
        setError('Failed to fetch payment data');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const formatDate = (d) => new Date(d).toLocaleDateString();
  const closeModal = () => setSelectedPatient(null);
  const printAllForms = () => window.print();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent-color)]"></div>
      </div>
    ); 
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="h3-heading mb-6">Payment Records</h2>
        <div className="overflow-x-auto">
          <table className="table-container w-full">
            <thead>
              <tr className="table-head bg-gray-100 text-center">
                {['Patient Name', 'Invoice No', 'Date', 'Amount'].map((h) => (
                  <th key={h} className="p-3 font-semibold text-sm">
                    <h4>{h}</h4>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-body">
              {currentData.map((p, i) => (
                <tr key={p.id || i} className="tr-style text-center">
                  <td className="py-3">
                    <button
                      onClick={() => setSelectedPatient(p)}
                      className="text-[var(--primary-color)] hover:text-[var(--accent-color)] font-semibold"
                    >
                      {p.patientName}
                    </button>
                  </td>
                  <td className="py-3">{p.invoiceNo}</td>
                  <td className="py-3">{formatDate(p.date)}</td>
                  <td className="py-3">₹{Number(p.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="w-full flex justify-end mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>

        {/* Invoice Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 z-60 bg-black/70 bg-opacity-50 flex items-center justify-center overflow-y-auto print:bg-white print:p-0">
<div className="bg-white w-[900px] h-auto rounded-md shadow-lg p-6 print:p-10 print:rounded-none print:shadow-none">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <img src={AVLogo} alt="AV Logo" className="w-24 h-24 object-contain" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">AV Swasthya Multispeciality Hospital</h1>
                    <p className="text-sm text-gray-600">123, Main Road, Bengaluru - 560001</p>
                    <p className="text-sm text-gray-600">Phone: +91 98765 43210 | avswasthya@email.com</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-700">
                  <p><strong>INVOICE NO:</strong> {selectedPatient.invoiceNo}</p>
                  <p><strong>DATE:</strong> {formatDate(selectedPatient.date)}</p>
                </div>
              </div>

              {/* Bill & Patient Info */}
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div className="border p-3">
                  <h3 className="font-semibold mb-1">Bill To:</h3>
                  <p><strong>Name:</strong> {selectedPatient.patientName}</p>
                  <p><strong>City:</strong> Bengaluru</p>
                  <p><strong>Country:</strong> India</p>
                  <p><strong>Phone:</strong> +91 98765 43210</p>
                </div>
                <div className="border p-3">
                  <h3 className="font-semibold mb-1">Patient:</h3>
                  <p><strong>Name:</strong> {selectedPatient.patientName}</p>
                  <p><strong>Service Type:</strong> {selectedPatient.serviceType}</p>
                  <p><strong>Payment Mode:</strong> {selectedPatient.method}</p>
                </div>
              </div>

              {/* Physician Info */}
              <div className="grid grid-cols-3 border-y py-2 mb-4 text-sm text-gray-700">
                <p><strong>Physician:</strong> Dr. Sheetal S. Shelke</p>
                <p><strong>Terms:</strong> Net 60</p>
                <p><strong>Due Date:</strong> {formatDate(selectedPatient.date)}</p>
              </div>

              {/* Table Section */}
              <table className="w-full border text-sm mb-6">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="border px-3 py-2">Dt of Service</th>
                    <th className="border px-3 py-2">Description</th>
                    <th className="border px-3 py-2">Total Fee</th>
                    <th className="border px-3 py-2">Co-Pay</th>
                    <th className="border px-3 py-2">Ins Reim</th>
                    <th className="border px-3 py-2">Adj</th>
                    <th className="border px-3 py-2">Balance (PR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-3 py-2">{formatDate(selectedPatient.date)}</td>
                    <td className="border px-3 py-2">{selectedPatient.serviceType}</td>
                    <td className="border px-3 py-2">₹{selectedPatient.amount}</td>
                    <td className="border px-3 py-2">-</td>
                    <td className="border px-3 py-2">-</td>
                    <td className="border px-3 py-2">-</td>
                    <td className="border px-3 py-2">₹{selectedPatient.amount}</td>
                  </tr>
                </tbody>
              </table>

              {/* Payment Summary */}
              <div className="flex justify-between items-center text-sm mb-4">
                <div>
                  <p><strong>Payment Type:</strong> {selectedPatient.method}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">Total: ₹{selectedPatient.amount}</p>
                </div>
              </div>
      

              {/* Action Buttons */}
              <div className="mt-6 flex justify-between print:hidden">
                <button
                  onClick={closeModal}
                  className="btn btn-secondary animated-cancel-btn"
                >
                  Close
                </button>
                <button
                  onClick={printAllForms}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
