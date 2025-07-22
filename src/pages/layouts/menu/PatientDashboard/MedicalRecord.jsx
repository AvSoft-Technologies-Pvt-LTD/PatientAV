import React, { useState } from "react";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import MedicalRecordDetails from "./MedicalRecordDetails";
import ReusableModal from "../../../../components/microcomponents/Modal";
import { FileText, Guitar as Hospital, Calendar, Search, Plus } from "lucide-react";
import { useSelector } from "react-redux";

const MedicalRecords = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newlyAddedHospitals, setNewlyAddedHospitals] = useState([]); // Track newly added hospitals

  const { user } = useSelector((state) => state.auth);

  // Dummy medical records (can be fetched via Redux later)
  const [medicalRecordsData, setMedicalRecordsData] = useState([
    {
      id: 101,
      hospitalName: "SDM Hospital",
      chiefComplaint: "High fever with chills",
      diagnosis: "Dengue Fever",
      dateOfAdmission: "2025-07-01",
      dateOfDischarge: "2025-07-06",
      patientId: "PT98765",
      patientName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
      age: user?.age ? `${user.age} years` : "N/A",
      sex: user?.gender || "Not specified",
      phone: user?.phone || "Not provided",
      aadhaarNo: user?.aadhaarNo || "XXXX-XXXX-XXXX",
      occupation: user?.occupation || "Not specified",
      address: user?.address || "Not provided",
      patientBroughtBy: "Mother",
      CMO: "Dr. Rajesh",
      consultant: "Dr. Mehta",
      refBy: "Dr. Suresh (Family Doctor)",
      status: "Discharged",
      initialAssessment: "Patient presented with acute febrile illness with typical dengue symptoms",
      systematicExamination: "General condition stable, mild dehydration noted",
      investigations: "NS1 Antigen positive, CBC showing thrombocytopenia",
      treatmentAdvice: "Complete bed rest, adequate hydration, platelet monitoring",
      isNewlyAdded: false // Existing record
    },
  ]);

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowDetailsPage(true);
  };

  const handleBackToList = () => {
    setShowDetailsPage(false);
    setSelectedRecord(null);
  };

  const handleAddRecord = (newData) => {
    const newRecord = {
      id: medicalRecordsData.length + 1,
      ...newData,
      patientId: user?.patientId || "PT00000",
      patientName: `${user?.firstName || "Guest"} ${user?.lastName || ""}`.trim(),
      age: user?.age ? `${user.age} years` : "N/A",
      sex: user?.gender || "Not specified",
      phone: user?.phone || "Not provided",
      aadhaarNo: user?.aadhaarNo || "XXXX-XXXX-XXXX",
      occupation: user?.occupation || "Not specified",
      address: user?.address || "Not provided",
      initialAssessment: "Initial assessment pending documentation",
      systematicExamination: "Systematic examination pending documentation", 
      investigations: "Investigation results pending",
      treatmentAdvice: "Treatment plan to be documented",
      patientBroughtBy: "Self",
      CMO: "Dr. TBD",
      consultant: "Dr. TBD",
      refBy: "Walk-in Patient",
      isNewlyAdded: true // Mark as newly added
    };

    setMedicalRecordsData((prev) => [...prev, newRecord]);
    setNewlyAddedHospitals((prev) => [...prev, newRecord.id]); // Track newly added hospital
  };

  const formFields = [
    {
      name: "hospitalName",
      label: "Hospital",
      type: "text",
    },
    {
      name: "diagnosis",
      label: "Diagnosis",
      type: "text",
    },
    {
      name: "dateOfAdmission",
      label: "Date of Admission",
      type: "date",
    },
    {
      name: "dateOfDischarge",
      label: "Date of Discharge",
      type: "date",
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Discharged", value: "Discharged" },
        { label: "Admitted", value: "Admitted" },
      ],
    },
  ];

  const fieldData = {
    hospitalName: "",
    diagnosis: "",
    dateOfAdmission: "",
    dateOfDischarge: "",
    status: "",
  };

  const columns = [
    {
      header: "Hospital",
      accessor: "hospitalName",
      icon: <Hospital size={16} />,
    },
    {
      header: "Diagnosis",
      accessor: "diagnosis",
    },
    {
      header: "Date of Admission",
      accessor: "dateOfAdmission",
      icon: <Calendar size={16} />,
    },
    {
      header: "Date of Discharge",
      accessor: "dateOfDischarge",
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`text-sm font-semibold px-2 py-1 rounded-full ${
            row.status === "Discharged"
              ? "bg-green-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="text-[var(--primary-color)] underline hover:text-[var(--accent-color)] font-medium text-sm"
        >
          <FileText size={16} className="inline mr-1" />
          View
        </button>
      ),
    },
  ];

  const filters = [
    {
      key: "hospitalName",
      label: "Hospital",
      options: [
        { value: "SDM Hospital", label: "SDM Hospital" },
        { value: "KIMS Hospital", label: "KIMS Hospital" },
        { value: "Apollo Hospital", label: "Apollo Hospital" },
      ],
    },
  ];

  if (showDetailsPage && selectedRecord) {
    return (
      <MedicalRecordDetails
        recordData={selectedRecord}
        onBack={handleBackToList}
        isNewlyAdded={selectedRecord.isNewlyAdded}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Search size={24} className="text-[var(--primary-color)]" />
          <h2 className="h3-heading">Medical Records History</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="view-btn flex gap-2 items-center"
        >
          <Plus size={18} />
          Add Record
        </button>
      </div>

      <DynamicTable columns={columns} data={medicalRecordsData} filters={filters} />

      <ReusableModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode="add"
        title="Add Medical Record"
        fields={formFields}
        data={fieldData}
        onSave={(formData) => {
          handleAddRecord(formData);
          setShowAddModal(false);
        }}
      />
    </div>
  );
};

export default MedicalRecords;