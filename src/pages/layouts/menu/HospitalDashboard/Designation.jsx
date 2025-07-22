import React, { useState } from "react";
import Modal from "../../../../components/microcomponents/Modal";
import DynamicTable from "../../../../components/microcomponents/DynamicTable";
import { FaEdit, FaTrash } from "react-icons/fa";
const Designation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [currentRow, setCurrentRow] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [rows, setRows] = useState([
    { id: 1, departmentName: "Cardiology", departmentCode: "CARD", designationName: "Senior Doctor", designationCode: "SD001" },
    { id: 2, departmentName: "Neurology", departmentCode: "NEUR", designationName: "Consultant", designationCode: "CN001" },
    { id: 3, departmentName: "Orthopedics", departmentCode: "ORTHO", designationName: "Resident", designationCode: "RES001" },
    { id: 4, departmentName: "Pediatrics", departmentCode: "PED", designationName: "Junior Doctor", designationCode: "JD001" },
    { id: 5, departmentName: "Radiology", departmentCode: "RAD", designationName: "Technician", designationCode: "TECH001" },
  ]);

  const combinedFields = [
    { name: "departmentName", label: "Department Name" },
    { name: "departmentCode", label: "Department Code" },
    { name: "designationName", label: "Designation Name" },
    { name: "designationCode", label: "Designation Code" },
    { name: "profilePhoto", label: "Profile Photo", type: "file" },
    { name: "attachments", label: "Documents", type: "file", multiple: true },
  ];

  const viewFields = combinedFields.map((f, i) => ({
    key: f.name, label: f.label, titleKey: i === 0, initialsKey: i === 0, subtitleKey: i === 2
  }));

  const validate = (data) => {
    const errors = {};
    if (!data.departmentName) errors.departmentName = "Department Name is required";
    if (!data.departmentCode) errors.departmentCode = "Department Code is required";
    if (!data.designationName) errors.designationName = "Designation Name is required";
    if (!data.designationCode) errors.designationCode = "Designation Code is required";
    return errors;
  };

  const handleSave = (data) => {
    const errors = validate(data);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (mode === "add") setRows((p) => [...p, { ...data, id: Date.now() }]);
    else setRows(rows.map((r) => (r.id === currentRow.id ? { ...r, ...data } : r)));
    setFormErrors({});
    setIsOpen(false);
  };

  const handleEdit = (r) => { setCurrentRow(r); setMode("edit"); setIsOpen(true); };
  const handleOpenDelete = (r) => { setCurrentRow(r); setMode("confirmDelete"); setIsOpen(true); };
  const handleDelete = () => { setRows(rows.filter((r) => r.id !== currentRow.id)); setIsOpen(false); };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="h4-heading">Departments & Designations</h1>
        <button onClick={() => { setMode("add"); setCurrentRow(null); setIsOpen(true); }} className="btn btn-primary">+ Create</button>
      </div>
      <DynamicTable
        columns={[
          { header: "Department Name", accessor: "departmentName", clickable: true },
          { header: "Department Code", accessor: "departmentCode" },
          { header: "Designation Name", accessor: "designationName" },
          { header: "Designation Code", accessor: "designationCode" },
          {
            header: "Actions", accessor: "actions", cell: (row) => (
              <div className="flex space-x-2">
                <button onClick={() => handleEdit(row)} className="edit-btn rounded p-1 transition  hover:animate-bounce"><FaEdit className="text-[--primary-color]" /></button>
                <button onClick={() => handleOpenDelete(row)} className="delete-btn rounded p-1 transition  hover:animate-bounce"><FaTrash className="text-red-500" /></button>
              </div>
            ),
          },
        ]}
        data={rows}
        onCellClick={(row, col) => { if (col.accessor === "departmentName") { setCurrentRow(row); setMode("viewProfile"); setIsOpen(true); } }}
      />
      <Modal
        key={mode} isOpen={isOpen} onClose={() => setIsOpen(false)} mode={mode}
        title={mode === "add" ? "Add New Department & Designation" : mode === "edit" ? "Edit Department & Designation" : mode === "viewProfile" ? " Department & Designation" : "Confirm Delete"}
        fields={combinedFields} viewFields={viewFields} data={currentRow}
        onSave={handleSave} onDelete={handleDelete} errors={formErrors}
        saveLabel={mode === "edit" ? "Update" : "Save"} deleteLabel="Yes, Delete" cancelLabel="Cancel"
      />
    </div>
  );
};
export default Designation;
