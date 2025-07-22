import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Plus, Edit, Trash2, User, Stethoscope, Award, FileText } from "lucide-react";
import ReusableModal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";

// Add combined filter options for DoctorEnlistmentList
const doctorFilters = [
  {
    key: "combinedFilter",
    label: "Filter",
    options: [
      // ...["Active", "Inactive"].map(status => ({ value: status, label: `Status: ${status}` })),
      ...["Cardiology", "Medicine", "Surgery", "Pediatrics"].map(dep => ({ value: dep, label: ` ${dep}` })),
      // ...["Professor & Doctor", "Doctor", "Consultant", "Assistant Doctor"].map(des => ({ value: des, label: `Designation: ${des}` }))
    ]
  }
];

const DoctorEnlistmentList = () => {
  const [activeTab, setActiveTab] = useState("enlistment");
  
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      eid: "EMP001",
      employeeName: "Dr. Jamal Khan",
      doctorCode: "DOC001",
      categoryName: "Cardiology",
      specialist: "Heart Surgeon",
      productName: "Cardiac Surgery",
      practiceStartDate: "2018-01-15",
      experience: "6 years",
      doctorFee: 2500,
      remarks: "Senior Consultant",
      popularCategory: true,
      status: "Active"
    },
    {
      id: 2,
      eid: "EMP002", 
      employeeName: "Dr. Kamal Khan",
      doctorCode: "DOC002",
      categoryName: "Medicine",
      specialist: "General Physician",
      productName: "General Consultation",
      practiceStartDate: "2020-03-10",
      experience: "4 years",
      doctorFee: 1500,
      remarks: "General Medicine",
      popularCategory: false,
      status: "Active"
    }
  ]);

  const [doctorList, setDoctorList] = useState([]);

  const [employees] = useState([
    { id: 1, name: "Dr. Jamal Khan", eid: "EMP001" },
    { id: 2, name: "Dr. Kamal Khan", eid: "EMP002" },
    { id: 3, name: "Dr. Sarah Ahmed", eid: "EMP003" }
  ]);

  const [categories] = useState([
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Medicine" },
    { id: 3, name: "Surgery" },
    { id: 4, name: "Pediatrics" }
  ]);

  const [specialists] = useState([
    { id: 1, name: "Heart Surgeon" },
    { id: 2, name: "General Physician" },
    { id: 3, name: "Orthopedic Surgeon" },
    { id: 4, name: "Pediatrician" }
  ]);

  const [products] = useState([
    { id: 1, name: "Cardiac Surgery" },
    { id: 2, name: "General Consultation" },
    { id: 3, name: "Orthopedic Treatment" },
    { id: 4, name: "Child Care" }
  ]);

  const [departments] = useState([
    { id: 1, name: "Cardiology" },
    { id: 2, name: "Medicine" },
    { id: 3, name: "Surgery" },
    { id: 4, name: "Pediatrics" }
  ]);

  const [designations] = useState([
    { id: 1, name: "Professor & Doctor" },
    { id: 2, name: "Doctor" },
    { id: 3, name: "Consultant" },
    { id: 4, name: "Assistant Doctor" }
  ]);

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: "add",
    type: "enlistment", // "enlistment" or "doctor"
    data: {}
  });

  const calculateExperience = (startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    const years = Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000));
    return `${years} year${years !== 1 ? 's' : ''}`;
  };

  const openModal = (mode, type = "enlistment", data = {}) => {
    setModalState({ isOpen: true, mode, type, data });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: "add", type: "enlistment", data: {} });
  };
const handleSave = (formData) => {
  const { mode, type, data } = modalState;

  if (type === "enlistment") {
    if (mode === "add") {
      const selectedEmployee = employees.find(emp => emp.name === formData.employee);
      const newDoctor = {
        ...formData,
        id: doctors.length + 1,
        eid: selectedEmployee?.eid || `EMP${(doctors.length + 1).toString().padStart(3, '0')}`,
        employeeName: formData.employee,
        experience: calculateExperience(formData.practiceStartDate),
        popularCategory: formData.popularCategory === 'true' || formData.popularCategory === true,
        status: "Active"
      };
      setDoctors([...doctors, newDoctor]);
      closeModal(); // ✅ close modal after add
    } else if (mode === "edit") {
      setDoctors(doctors.map(doc => 
        doc.id === data.id 
          ? { 
              ...doc, 
              ...formData, 
              experience: calculateExperience(formData.practiceStartDate),
              popularCategory: formData.popularCategory === 'true' || formData.popularCategory === true
            } 
          : doc
      ));
      closeModal(); // ✅ close modal after edit
    }
  } 
  
  else if (type === "doctor") {
    if (mode === "add") {
      const newDoctor = {
        ...formData,
        id: doctorList.length + 1,
        status: "Active"
      };
      setDoctorList([...doctorList, newDoctor]);
      closeModal(); // ✅ close modal after add
    } else if (mode === "edit") {
      setDoctorList(doctorList.map(doc => 
        doc.id === data.id ? { ...doc, ...formData } : doc
      ));
      closeModal(); // ✅ close modal after edit
    }
  }
};


  const handleDelete = (id, type = "enlistment") => {
    if (type === "enlistment") {
      setDoctors(doctors.filter(doc => doc.id !== id));
    } else {
      setDoctorList(doctorList.filter(doc => doc.id !== id));
    }
  };

  const handleReport = () => {
    // This would typically open a new page or modal for report generation
    alert("Report functionality would be implemented here");
  };

  // Combine both lists into one unified doctor list
  const combinedDoctors = [
    ...doctors.map(doc => ({
      ...doc,
      doctorName: doc.employeeName, // for consistency
      // Assign mapEmployee to a different name for each doctor
      mapEmployee: doc.id === 1 ? "Dr. Sarah Ahmed" : doc.id === 2 ? "Dr. Jamal Khan" : "-",
      designation: "-",
      department: doc.categoryName || "-",
      degreeSummary: "-",
      specializationArea: doc.specialist || "-",
    })),
    ...doctorList
  ];

  // Unified columns (all doctor list columns)
  const unifiedColumns = [
    { header: "EID", accessor: "eid" },
    {
      header: "Doctor Name",
      accessor: "doctorName",
      cell: (row) => (
        <button
          type="button"
          className="text-[var(--primary-color)] hover:text-[var(--accent-color)] underline cursor-pointer"
          onClick={() => openModal("viewProfile", "doctor", row)}
          title="View Doctor"
        >
          {row.doctorName}
        </button>
      ),
    },
    {
      header: "Map Employee",
      accessor: "mapEmployee",
      cell: (row) => (
        <span>
          {row.mapEmployee && row.mapEmployee !== "-" ? (
            <>
              <User size={14} className="inline mr-1 text-gray-500" />
              {row.mapEmployee}
            </>
          ) : "-"
          }
        </span>
      ),
    },
    { header: "Department", accessor: "department" },
    { header: "Experience", accessor: "experience" },
    {
      header: "fee",
      accessor: "doctorFee",
      cell: (row) => (
        <span>
          <span className="inline-block mr-1 align-middle">₹</span>{row.doctorFee?.toLocaleString() || 0}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const key = row.status?.toLowerCase(); // "active" or "inactive"
        const statusColors = {
          active: "text-green-600 bg-green-100",
          inactive: "text-red-600 bg-red-100",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[key] || "text-gray-600 bg-gray-100"}`}>
            {key?.toUpperCase()}
          </span>
        );
      }
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal("edit", "doctor", row)}
            className="edit-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => handleDelete(row.id, "doctor")}
            className="delete-btn hover:bg-blue-100 rounded p-1 transition hover:animate-bounce"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Unified view fields for modal
  const unifiedViewFields = [
    { label: "Doctor Name", key: "doctorName", initialsKey: true, titleKey: true, subtitleKey: true },
    { label: "Map Employee", key: "mapEmployee" },
    { label: "Designation", key: "designation" },
    { label: "Department", key: "department" },
    { label: "Degree Summary", key: "degreeSummary" },
    { label: "Specialization Area", key: "specializationArea" },
    { label: "EID", key: "eid" },
    { label: "Category Name", key: "categoryName" },
    { label: "Specialist", key: "specialist" },
    { label: "Practice Start Date", key: "practiceStartDate" },
    { label: "Experience", key: "experience" },
    { label: "fee", key: "doctorFee" },
    { label: "Doctor Code", key: "doctorCode" },
    { label: "Product Name", key: "productName" },
    { label: "Remarks", key: "remarks" },
    { label: "Popular Category", key: "popularCategory" },
    { label: "Status", key: "status" },
  ];

  const getDoctorFields = () => [
    { name: "doctorName", label: "Doctor Name", type: "text", required: true },
    { name: "doctorCode", label: "Doctor Code", type: "text", required: true },
    { 
      name: "mapEmployee", 
      label: "Map HR Employee", 
      type: "select",
      options: employees.map(emp => ({ value: `${emp.eid} ${emp.name}`, label: `${emp.eid} ${emp.name}` })),
      required: true
    },
    { 
      name: "dutyDepartment", 
      label: "Duty Department", 
      type: "select",
      options: departments.map(dept => ({ value: dept.name, label: dept.name })),
      required: true
    },
    { 
      name: "dutyDesignation", 
      label: "Duty Designation", 
      type: "select",
      options: designations.map(desig => ({ value: desig.name, label: desig.name })),
      required: true
    },
    { name: "doctorService", label: "Doctor Service", type: "text", required: true },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "email", label: "Email", type: "email" },
    { name: "roomNo", label: "Room No", type: "text" },
    { name: "emergencyContact", label: "Emergency Contact", type: "tel" },
    { name: "address", label: "Address", type: "textarea" },
    { name: "degreeSummary", label: "Degree Summary", type: "textarea", required: true },
    { name: "specializationArea", label: "Specialize Area", type: "textarea", required: true },
    { name: "doctorSummary", label: "Doctor Summary", type: "textarea" }
  ];

  // Tab definitions for nav bar (LabSettings style)
  const tabs = [
    { id: "enlistment", label: "Doctor Enlistment List" },
    { id: "doctor", label: "Doctor List" },
  ];

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl ">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="h4-heading">Doctor List</h1>
          <div className="flex gap-3">
            {/* <button
              onClick={handleReport}
              className="btn-secondary"
            >
              <FileText size={16} />
              Print Report
            </button> */}
            <button
              onClick={() => openModal("add", "doctor")}
              className="btn btn-primary"
            >
              <Plus size={20} />
              Create
            </button>
          </div>
        </div>
        <DynamicTable
          columns={unifiedColumns}
          data={combinedDoctors}
          filters={doctorFilters}
        />
      </div>
      <ReusableModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        mode={modalState.mode}
        title={
          modalState.mode === "add"
            ? "Create Doctor"
            : modalState.mode === "edit"
              ? "Edit Doctor"
              : "Doctor Details"
        }
        fields={getDoctorFields()}
        viewFields={unifiedViewFields}
        data={modalState.data}
        size="lg"
        onSave={handleSave}
        saveLabel={modalState.mode === "add" ? "Create" : "Update"}
      />
    </div>
  );
};

export default DoctorEnlistmentList;