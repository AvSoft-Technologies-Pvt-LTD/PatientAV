import React, { useState } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import DynamicTable from "./microcomponents/DynamicTable";
import ReusableModal from "./microcomponents/Modal";

const labFields = [
  { name: "labName", label: "Lab Name", type: "text", required: true },
  { name: "head", label: "Lab Head", type: "text", required: true },
  { name: "contact", label: "Contact Number", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
    ],
  },
];

const mockLabs = [
  {
    id: 1,
    labName: "Central Lab Services",
    head: "Dr. Pooja Desai",
    contact: "9876543210",
    email: "central.lab@gmail.com",
    status: "Active",
  },
  {
    id: 2,
    labName: "Quick Test Lab",
    head: "Dr. Karan Nair",
    contact: "9123456780",
    email: "quicktest@email.com",
    status: "Inactive",
  },
];

const LabManagement = () => {
  const [data, setData] = useState(mockLabs);
  const [modal, setModal] = useState({ open: false, type: "", data: null });

  const openModal = (type, row = null) => setModal({ open: true, type, data: row });
  const closeModal = () => setModal({ open: false, type: "", data: null });

  const handleSave = (formData) => {
    if (modal.type === "create") {
      setData([...data, { id: Date.now(), ...formData }]);
    } else if (modal.type === "edit") {
      setData(data.map((d) => (d.id === modal.data.id ? { ...d, ...formData } : d)));
    }
    closeModal();
  };

  const handleDelete = (row) => {
    setData(data.filter((d) => d.id !== row.id));
    closeModal();
  };

  const columns = [
    { header: "Lab Name", accessor: "labName" },
    { header: "Lab Head", accessor: "head" },
    { header: "Contact", accessor: "contact" },
    { header: "Email", accessor: "email" },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            row.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
        <div className="flex gap-2">
          <button title="View" onClick={() => openModal("view", row)}>
            <Eye className="w-4 h-4 text-blue-600" />
          </button>
          <button title="Edit" onClick={() => openModal("edit", row)}>
            <Edit className="w-4 h-4 text-green-600" />
          </button>
          <button title="Delete" onClick={() => openModal("delete", row)}>
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Labs</h2>
        <button
          onClick={() => openModal("create")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Add Lab
        </button>
      </div>

      <DynamicTable columns={columns} data={data} searchKeys={["labName", "head", "email"]} />

      <ReusableModal
        isOpen={modal.open}
        onClose={closeModal}
        type={modal.type}
        title={
          modal.type === "create"
            ? "Add Lab"
            : modal.type === "edit"
            ? "Edit Lab"
            : modal.type === "view"
            ? "Lab Details"
            : "Confirm Delete"
        }
        fields={labFields}
        data={modal.data}
        onSubmit={modal.type === "delete" ? () => handleDelete(modal.data) : handleSave}
        readOnly={modal.type === "view"}
        showButtons={modal.type !== "view"}
      />
    </div>
  );
};

export default LabManagement;
