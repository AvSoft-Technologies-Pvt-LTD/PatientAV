import React, { useState } from "react";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, MapPin, Calendar, FileText, Pill, TestTube, CreditCard, Heart, Thermometer, Activity, Download, CheckCircle, AlertTriangle, DollarSign, Guitar as Hospital, UserCheck, FileCheck, Printer, Upload, Eye, X } from "lucide-react";
import DocsReader from "../../../../components/DocsReader";
const MedicalRecordDetails = ({ recordData, onBack, isNewlyAdded }) => {
  const [activeTab, setActiveTab] = useState("medical-records");
  const navigate = useNavigate();
  const [billingActiveTab, setBillingActiveTab] = useState("pharmacy");
  const [uploadedFiles, setUploadedFiles] = useState({
    knownCaseFiles: [],
    vitalsFiles: [],
    dischargeSummaryFiles: [],
    prescriptionFiles: [],
    labTestFiles: [],
    pharmacyBillingFiles: [],
    labBillingFiles: [],
    hospitalBillingFiles: []
  });

  const printBillingTable = () => {
    const printContent = document.getElementById("printable-billing-table");
    const WinPrint = window.open('', '', 'width=900,height=650');
    WinPrint.document.write(`
      <html>
        <head>
          <title>Print Billing Table</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px 12px; border: 1px solid #ccc; text-align: left; }
            h2 { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  // Print handler for lab test
  const printLabTestDirect = (labTest) => {
    const printContents = `
      <div>
        <div class="mb-4"><span class="label">Date:</span> <span class="value">${labTest.date}</span></div>
        <div class="mb-4"><span class="label">Test Name:</span> <span class="value">${labTest.testName}</span></div>
        <div class="mb-4"><span class="label">Result:</span> <span class="value">${labTest.result}</span></div>
        <div class="mb-4"><span class="label">Normal Range:</span> <span class="value">${labTest.normalRange}</span></div>
        <div class="mb-4"><span class="label">Status:</span> <span class="value status" style="font-weight:bold;color:${labTest.status === "Normal" ? "#01B07A" : "#E53E3E"}">${labTest.status}</span></div>
      </div>
    `;
    const WinPrint = window.open('', '', 'width=900,height=650');
    WinPrint.document.write(`
      <html>
        <head>
          <title>Lab Test Print</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .label { font-weight: bold; }
            .value { margin-bottom: 8px; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    WinPrint.document.close();
    WinPrint.focus();
    WinPrint.print();
    WinPrint.close();
  };

  // File upload handler
  const handleFileUpload = (event, section) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type);
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not uploaded. Only .jpg, .png, .pdf, .docx, and .txt files are allowed.');
    }

    setUploadedFiles(prev => ({
      ...prev,
      [section]: [...prev[section], ...validFiles]
    }));
  };

  // Remove file handler
  const handleRemoveFile = (section, fileIndex) => {
    setUploadedFiles(prev => ({
      ...prev,
      [section]: prev[section].filter((_, index) => index !== fileIndex)
    }));
  };

  // Render upload section (only if isNewlyAdded)
  const renderUploadSection = (sectionKey, title) => {
    if (!isNewlyAdded) return null; // Only show upload if new hospital record

    const files = uploadedFiles[sectionKey] || [];
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h4 className="font-semibold text-blue-800 mb-4">{title}</h4>
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
          {/* <Upload size={32} className="text-blue-400 mx-auto mb-4" />
          <p className="text-blue-600 mb-4">Upload files for {title.toLowerCase()}</p>
          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.docx,.txt"
            onChange={(e) => handleFileUpload(e, sectionKey)}
            className="hidden"
            id={`upload-${sectionKey}`}
          />
          <label
            htmlFor={`upload-${sectionKey}`}
            className="view-btn cursor-pointer inline-flex items-center gap-2"
          >
            <Upload size={16} />
            Choose Files
          </label>
          <p className="text-xs text-blue-500 mt-2">Supports: .jpg, .png, .pdf, .docx, .txt</p> */}
          <DocsReader></DocsReader>
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg border border-blue-200 p-2">
                <span className="text-sm font-medium text-blue-800">{file.name}</span>
                <button
                  onClick={() => handleRemoveFile(sectionKey, index)}
                  className="text-red-600 hover:text-red-800"
                  title="Remove"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {/* Print Lab Test Button - only for lab test files */}
            {sectionKey === "labTestFiles" && files.length > 0 && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => printLabTestDirect(files[0])}
                  className="edit-btn flex items-center gap-2"
                >
                  <Printer size={16} />
                  Print Lab Test
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Get patient initials
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA';
  };

  // Mock medical record details with doctor name and discharge summary
  const medicalDetails = {
    chiefComplaint: "High fever with chills, body ache, and headache for 3 days",
    pastHistory: "No significant past medical or surgical history. No known allergies.",
    diagnosis: "Dengue Fever (Confirmed by NS1 Antigen and IgM positive)",
    treatmentGiven: "IV fluids, Paracetamol for fever, complete bed rest, platelet monitoring",
    doctorsNotes: "Patient responded well to treatment. Platelet count stabilized. Advised follow-up in 1 week.",
    doctorName: "Dr. Rajesh Kumar",
    doctorSpecialization: "Internal Medicine",
    dischargeSummary: "Patient admitted with dengue fever, treated with supportive care. Platelet count improved from 85,000 to 180,000. Patient is stable and ready for discharge. Continue oral medications and follow-up in 1 week.",
    vitals: {
      bloodPressure: "110/70 mmHg",
      heartRate: "88 bpm",
      temperature: "102.5°F",
      spO2: "98%",
      respiratoryRate: "18/min"
    }
  };

  // Mock prescription data
  const prescriptionsData = [
    {
      id: 1,
      date: "02/07/2025",
      doctorName: "Dr. Rajesh Kumar",
      medicines: "Paracetamol 500mg - 1 tablet TID for 5 days",
      instructions: "Take after meals. Maintain adequate fluid intake."
    },
    {
      id: 2,
      date: "03/07/2025",
      doctorName: "Dr. Rajesh Kumar",
      medicines: "Doxycycline 100mg - 1 capsule BID for 7 days",
      instructions: "Take with plenty of water. Avoid dairy products."
    },
    {
      id: 3,
      date: "04/07/2025",
      doctorName: "Dr. Rajesh Kumar",
      medicines: "ORS Packets - As needed for hydration",
      instructions: "Mix one packet in 1 liter of clean water. Drink slowly."
    }
  ];

  // Mock lab tests data
  const labTestsData = [
    {
      id: 1,
      date: "01/07/2025",
      testName: "Complete Blood Count (CBC)",
      result: "WBC: 12,000, RBC: 4.2, Platelets: 85,000",
      normalRange: "WBC: 4,000-11,000, RBC: 4.5-5.5, Platelets: 150,000-450,000",
      status: "Abnormal",
      reportFile: "cbc-report.pdf"
    },
    {
      id: 2,
      date: "01/07/2025",
      testName: "Dengue NS1 Antigen",
      result: "Positive",
      normalRange: "Negative",
      status: "Abnormal",
      reportFile: "dengue-ns1.pdf"
    },
    {
      id: 3,
      date: "02/07/2025",
      testName: "Dengue IgM/IgG",
      result: "IgM: Positive, IgG: Negative",
      normalRange: "IgM: Negative, IgG: Negative",
      status: "Abnormal",
      reportFile: "dengue-igm-igg.pdf"
    },
    {
      id: 4,
      date: "04/07/2025",
      testName: "Platelet Count",
      result: "125,000",
      normalRange: "150,000-450,000",
      status: "Abnormal",
      reportFile: "platelet-count.pdf"
    },
    {
      id: 5,
      date: "06/07/2025",
      testName: "Final CBC",
      result: "WBC: 8,500, RBC: 4.5, Platelets: 180,000",
      normalRange: "WBC: 4,000-11,000, RBC: 4.5-5.5, Platelets: 150,000-450,000",
      status: "Normal",
      reportFile: "final-cbc.pdf"
    }
  ];

  // Mock billing data
  const pharmacyBills = [
    {
      id: 1,
      medicineName: "Paracetamol 500mg",
      quantity: 15,
      unitPrice: 2.50,
      totalPrice: 37.50,
      date: "02/07/2025"
    },
    {
      id: 2,
      medicineName: "Doxycycline 100mg",
      quantity: 14,
      unitPrice: 8.00,
      totalPrice: 112.00,
      date: "03/07/2025"
    },
    {
      id: 3,
      medicineName: "ORS Packets",
      quantity: 10,
      unitPrice: 3.00,
      totalPrice: 30.00,
      date: "04/07/2025"
    }
  ];

  const labBills = [
    {
      id: 1,
      testName: "Complete Blood Count (CBC)",
      cost: 350.00,
      date: "01/07/2025",
      paymentStatus: "Paid"
    },
    {
      id: 2,
      testName: "Dengue NS1 Antigen",
      cost: 800.00,
      date: "01/07/2025",
      paymentStatus: "Paid"
    },
    {
      id: 3,
      testName: "Dengue IgM/IgG",
      cost: 650.00,
      date: "02/07/2025",
      paymentStatus: "Paid"
    },
    {
      id: 4,
      testName: "Platelet Count",
      cost: 200.00,
      date: "04/07/2025",
      paymentStatus: "Paid"
    },
    {
      id: 5,
      testName: "Final CBC",
      cost: 350.00,
      date: "06/07/2025",
      paymentStatus: "Paid"
    }
  ];

  const hospitalBills = [
    {
      id: 1,
      billType: "Room Charges (5 days)",
      amount: 2500.00,
      paymentMode: "Insurance",
      status: "Paid",
      billDate: "06/07/2025"
    },
    {
      id: 2,
      billType: "Doctor Consultation",
      amount: 500.00,
      paymentMode: "Cash",
      status: "Paid",
      billDate: "06/07/2025"
    },
    {
      id: 3,
      billType: "Nursing Charges",
      amount: 750.00,
      paymentMode: "Insurance",
      status: "Paid",
      billDate: "06/07/2025"
    },
    {
      id: 4,
      billType: "IV Fluids & Supplies",
      amount: 400.00,
      paymentMode: "Cash",
      status: "Paid",
      billDate: "06/07/2025"
    }
  ];

  // Define columns for each table
  const prescriptionColumns = [
    { header: "Date", accessor: "date" },
    { header: "Doctor Name", accessor: "doctorName" },
    { header: "Medicines", accessor: "medicines" },
    { header: "Instructions", accessor: "instructions" }
  ];

  // Update labTestColumns: replace Download with Print button
  const labTestColumns = [
    { header: "Date", accessor: "date" },
    { header: "Test Name", accessor: "testName" },
    { header: "Result", accessor: "result" },
    { header: "Normal Range", accessor: "normalRange" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className={`status-badge ${row.status === "Normal" ? "status-completed" : "status-pending"}`}>
          {row.status === "Normal" ? (
            <CheckCircle size={12} className="inline mr-1" />
          ) : (
            <AlertTriangle size={12} className="inline mr-1" />
          )}
          {row.status}
        </span>
      )
    },
    {
      header: "Print",
      accessor: "print",
      cell: (row) => (
        <button
          className="edit-btn flex items-center gap-1"
          onClick={() => printLabTestDirect(row)}
          title="Print Lab Test"
        >
          <Printer size={14} />
          Print
        </button>
      )
    }
  ];

  const pharmacyColumns = [
    { header: "Medicine Name", accessor: "medicineName" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Unit Price (₹)", accessor: "unitPrice" },
    { header: "Total Price (₹)", accessor: "totalPrice" },
    { header: "Date", accessor: "date" }
  ];

  const labBillColumns = [
    { header: "Test Name", accessor: "testName" },
    { header: "Cost (₹)", accessor: "cost" },
    { header: "Date", accessor: "date" },
    {
      header: "Payment Status",
      accessor: "paymentStatus",
      cell: (row) => (
        <span className={`status-badge ${row.paymentStatus === "Paid" ? "status-completed" : "status-pending"}`}>
          {row.paymentStatus}
        </span>
      )
    }
  ];

  const hospitalBillColumns = [
    { header: "Bill Type", accessor: "billType" },
    { header: "Amount (₹)", accessor: "amount" },
    { header: "Payment Mode", accessor: "paymentMode" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className={`status-badge ${row.status === "Paid" ? "status-completed" : "status-pending"}`}>
          {row.status}
        </span>
      )
    },
    { header: "Bill Date", accessor: "billDate" }
  ];

  // Define tabs for billing section
  const billingTabs = [
    { value: "pharmacy", label: "Pharmacy" },
    { value: "labs", label: "Labs" },
    { value: "hospital", label: "Hospital Bills" }
  ];

  const billingTabActions = [
    {
      label: "Print Preview",
      onClick: printBillingTable,
      className: "edit-btn flex items-center gap-2"
    }
  ];

  // Get billing data based on active tab
  const getBillingData = () => {
    switch (billingActiveTab) {
      case "pharmacy":
        return pharmacyBills;
      case "labs":
        return labBills;
      case "hospital":
        return hospitalBills;
      default:
        return pharmacyBills;
    }
  };

  // Get billing columns based on active tab
  const getBillingColumns = () => {
    switch (billingActiveTab) {
      case "pharmacy":
        return pharmacyColumns;
      case "labs":
        return labBillColumns;
      case "hospital":
        return hospitalBillColumns;
      default:
        return pharmacyColumns;
    }
  };

  // Get billing upload section key based on active tab
  const getBillingUploadSection = () => {
    switch (billingActiveTab) {
      case "pharmacy":
        return { key: "pharmacyBillingFiles", title: "Upload Pharmacy Bills" };
      case "labs":
        return { key: "labBillingFiles", title: "Upload Lab Bills" };
      case "hospital":
        return { key: "hospitalBillingFiles", title: "Upload Hospital Bills" };
      default:
        return { key: "pharmacyBillingFiles", title: "Upload Pharmacy Bills" };
    }
  };

  // Calculate totals
  const pharmacyTotal = pharmacyBills.reduce((sum, item) => sum + item.totalPrice, 0);
  const labTotal = labBills.reduce((sum, item) => sum + item.cost, 0);
  const hospitalTotal = hospitalBills.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = pharmacyTotal + labTotal + hospitalTotal;
  const normalTests = labTestsData.filter(test => test.status === "Normal").length;
  const abnormalTests = labTestsData.filter(test => test.status === "Abnormal").length;

  // Render only upload sections if isNewlyAdded
  const renderTabContent = () => {
    if (isNewlyAdded) {
      switch (activeTab) {
        case "medical-records":
          return (
            <div>
              {renderUploadSection("knownCaseFiles", "Upload Patient Case Files")}
              {renderUploadSection("vitalsFiles", "Upload Vital Signs Records")}
              {renderUploadSection("dischargeSummaryFiles", "Upload Discharge Summary")}
            </div>
          );
        case "prescriptions":
          return renderUploadSection("prescriptionFiles", "Upload Prescription");
        case "lab-tests":
          return renderUploadSection("labTestFiles", "Upload Lab Test Report");
        case "billing":
          const uploadInfo = getBillingUploadSection();
          return renderUploadSection(uploadInfo.key, uploadInfo.title);
        default:
          return null;
      }
    }

    switch (activeTab) {
      case "medical-records":
        return (
          <div className="space-y-6">
            {/* Medical Record Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <FileText size={24} style={{ color: 'var(--primary-color)' }} />
                <h3 className="h3-heading ">Known Case Of Patient</h3>
              </div>

              {/* Upload Section for Known Case */}
              {renderUploadSection("knownCaseFiles", "Upload Patient Case Files")}

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Chief Complaint */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Chief Complaint</div>
                    <div>{medicalDetails.chiefComplaint}</div>
                  </div>

                  {/* Past History */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Past History</div>
                    <div>{medicalDetails.pastHistory}</div>
                  </div>

                  {/* Initial Assessment */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Initial Assessment</div>
                    <div>{recordData.initialAssessment}</div>
                  </div>

                  {/* Systematic/Local Examination */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Systematic/Local Examination</div>
                    <div>{recordData.systematicExamination}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Investigations */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Investigations</div>
                    <div>{recordData.investigations}</div>
                  </div>

                  {/* Treatment / Advice */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Treatment / Advice</div>
                    <div>{recordData.treatmentAdvice}</div>
                  </div>

                  {/* Treatment Given */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Treatment Given</div>
                    <div>{medicalDetails.treatmentGiven}</div>
                  </div>

                  {/* Final Diagnosis */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Final Diagnosis</div>
                    <div>{medicalDetails.diagnosis}</div>
                  </div>

                  {/* Doctor's Notes */}
                  <div className="detail-item bg-white hover:bg-gradient-to-r hover:from-[#01B07A] hover:to-[#1A223F] hover:text-white p-6 rounded-xl transition duration-300">
                    <div className="detail-label font-bold">Doctor's Notes</div>
                    <div>{medicalDetails.doctorsNotes}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity size={24} style={{ color: 'var(--accent-color)' }} />
                <h3 className="h3-heading">Vitals Summary (At Admission)</h3>
              </div>

              {/* Upload Section for Vitals */}
              {renderUploadSection("vitalsFiles", "Upload Vital Signs Records")}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={18} className="text-red-500" />
                    <span className="text-sm font-medium text-red-700">Blood Pressure</span>
                  </div>
                  <div className="text-lg font-bold text-red-800">{medicalDetails.vitals.bloodPressure}</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity size={18} className="text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Heart Rate</span>
                  </div>
                  <div className="text-lg font-bold text-blue-800">{medicalDetails.vitals.heartRate}</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer size={18} className="text-orange-500" />
                    <span className="text-sm font-medium text-orange-700">Temperature</span>
                  </div>
                  <div className="text-lg font-bold text-orange-800">{medicalDetails.vitals.temperature}</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-green-700">SpO2</span>
                  </div>
                  <div className="text-lg font-bold text-green-800">{medicalDetails.vitals.spO2}</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-400">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-purple-700">Respiratory Rate</span>
                  </div>
                  <div className="text-lg font-bold text-purple-800">{medicalDetails.vitals.respiratoryRate}</div>
                </div>
              </div>
            </div>

            {/* Discharge Summary */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileCheck size={24} style={{ color: 'var(--primary-color)' }} />
                <h3 className="h3-heading">Discharge Summary</h3>
              </div>

              {/* Upload Section for Discharge Summary */}
              {renderUploadSection("dischargeSummaryFiles", "Upload Discharge Summary")}

              <div className="detail-item primary">
                <div className="detail-label">Summary</div>
                <div className="detail-value">{medicalDetails.dischargeSummary}</div>
              </div>
            </div>
          </div>
        );

      case "prescriptions":
        return (
          <div className="space-y-6">
            {/* Upload Section for Prescriptions */}
      
{renderUploadSection("prescriptionFiles", "Upload Prescription")}
            {/* Prescriptions Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <User size={20} style={{ color: 'var(--accent-color)' }} />
                <h4 className="h4-heading">Prescribed Medications</h4>
              </div>
              
              <DynamicTable
                columns={prescriptionColumns}
                data={prescriptionsData}
              />
            </div>
          </div>
        );

      case "lab-tests":
        return (
          <div className="space-y-6">
            {/* Upload Section for Lab Tests */}
            {renderUploadSection("labTestFiles", "Upload Lab Test Report")}

            {/* Lab Tests Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <TestTube size={24} style={{ color: 'var(--accent-color)' }} />
                <h4 className="h4-heading">Test Results History</h4>
              </div>
              
              <DynamicTable
                columns={labTestColumns}
                data={labTestsData}
              />
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            {/* Upload Section for Billing - changes based on active tab */}
            {(() => {
              const uploadInfo = getBillingUploadSection();
              return renderUploadSection(uploadInfo.key, uploadInfo.title);
            })()}

            {/* Billing Tables with Sub-tabs */}
            <div id="printable-billing-table" className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <DynamicTable
                columns={getBillingColumns()}
                data={getBillingData()}
                tabs={billingTabs}
                tabActions={billingTabActions}
                activeTab={billingActiveTab}
                onTabChange={setBillingActiveTab}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: "medical-records", label: "Medical Records", icon: FileText },
    { id: "prescriptions", label: "Prescriptions", icon: Pill },
    { id: "lab-tests", label: "Lab Tests", icon: TestTube },
    { id: "billing", label: "Billing", icon: CreditCard }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 hover:text-[var(--accent-color)] transition-colors"
        style={{ color: 'var(--primary-color)' }}
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Medical Records</span>
      </button>

      {/* Show notification if this is a newly added hospital */}
      {isNewlyAdded && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800">
            <Upload size={20} />
            <span className="font-medium">New Hospital Record</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            This is a newly added hospital record. You can upload files in the relevant sections below.
          </p>
        </div>
      )}

      {/* Patient Summary Section */}
      <div className="bg-gradient-to-r from-[#01B07A] to-[#1A223F] rounded-xl p-6 mb-6 text-white">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="relative h-20 w-20 shrink-0">
            <div
              className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-bold uppercase shadow-inner ring-4 ring-white ring-offset-2"
              style={{ color: 'var(--primary-color)' }}
            >
              {getInitials(recordData.patientName)}
            </div>
            <div
              className="absolute bottom-1 right-1 w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--accent-color)' }}
            />
          </div>

          {/* Patient Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-4">{recordData.patientName}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-6 text-sm">
              <div className="space-y-1">
                <div>Age: {recordData.age} years</div>
                <div>Referred By: {recordData.refBy}</div>
              </div>

              <div className="space-y-1">
                <div>Address: {recordData.address}</div>
                <div>CMO: {recordData.CMO}</div>
              </div>

              <div className="space-y-1">
                <div>Sex: {recordData.sex}</div>
                <div>Consultant: {recordData.consultant}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors duration-300 ${
                activeTab === tab.id
                  ? "border-b-2"
                  : "text-gray-500 hover:text-[var(--accent-color)]"
              }`}
              style={activeTab === tab.id ? { 
                color: 'var(--primary-color)', 
                borderBottomColor: 'var(--primary-color)' 
              } : {}}
            >
              <IconComponent size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeIn">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default MedicalRecordDetails;