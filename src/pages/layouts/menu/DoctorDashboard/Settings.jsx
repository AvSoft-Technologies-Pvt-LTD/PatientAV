import React, { useState, useRef } from "react";
import { Camera } from "lucide-react";
import avtarImg from '../../../../assets/avtar.jpg';

const tabOptions = ["Basic Information", "Professional Details", "Address", "Change Password"];

const mockData = {
  firstName: "Sheetal",
  lastName: "Shelke",
  email: "sheetal@example.com",
  username: "dr.sheetal",
  roles: ["Doctor"],
  accountStatus: "active",
  storageUsed: 181.13,
  qualification: "MBBS",
  specialization: "Neurology",
  experience: "10",
  licenseNo: "ABC-1234",
  address: "123 Main Street",
  city: "Dharwad",
  state: "Karnataka",
  pincode: "580001",
};

const DoctorProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("Basic Information");
  const [formData, setFormData] = useState(mockData);
  const [avatar, setAvatar] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="h2-heading">
          Profile: {formData.firstName} {formData.lastName}
        </h2>
        {activeTab !== "Change Password" && (
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`btn btn-secondary ${isEditMode ? '' : ''}`}
          >
            {isEditMode ? "Cancel" : "Edit"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-gray-200">
        {tabOptions.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-semibold bg-transparent border-none outline-none border-b-4 transition-all duration-200
              ${activeTab === tab
                ? 'border-[var(--accent-color)] text-[var(--accent-color)]'
                : 'border-transparent text-gray-500 hover:text-[var(--primary-color)] hover:border-[var(--accent-color)]'}
            `}
            style={{ background: 'none' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Basic Information */}
      {activeTab === "Basic Information" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl p-6 shadow-lg animate-slideIn">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { label: "First Name", name: "firstName" },
                  { label: "Last Name", name: "lastName" },
                  { label: "Email Address", name: "email", type: "email" },
                  { label: "Username", name: "username" }
                ]
              ).map((field) => (
                <Input key={field.name} label={field.label} name={field.name} value={formData[field.name]} onChange={handleInputChange} disabled={!isEditMode} type={field.type || "text"} />
              ))}
            </div>

            <div className="mt-2 flex gap-6 items-center">
              <label className="block text-sm font-medium">Roles:</label>
              {(["Admin", "User", "Doctor"]).map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.roles.includes(role)} readOnly className="accent-[var(--primary-color)]" disabled />
                  {role}
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 mt-4">Account Status</label>
              <select name="accountStatus" value={formData.accountStatus} onChange={handleInputChange} disabled={!isEditMode} className="input-field">
                {(["active", "inactive"]).map((status) => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <strong>Storage:</strong> {formData.storageUsed}MB of 1900MB used
            </div>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-2 ring-[var(--primary-color)]">
              <img src={avatar || avtarImg} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {isEditMode && (
              <>
                <button onClick={() => fileInputRef.current?.click()} className="btn btn-primary text-sm px-4 py-2">Upload New Photo</button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Professional Details */}
      {activeTab === "Professional Details" && (
        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 animate-slideIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                { label: "Qualification", name: "qualification" },
                { label: "Specialization", name: "specialization" },
                { label: "Experience (in years)", name: "experience" },
                { label: "License No", name: "licenseNo" }
              ]
            ).map((field) => (
              <Input key={field.name} label={field.label} name={field.name} value={formData[field.name]} onChange={handleInputChange} disabled={!isEditMode} />
            ))}
          </div>
        </div>
      )}

      {/* Address */}
      {activeTab === "Address" && (
        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 animate-slideIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              [
                { label: "Address", name: "address" },
                { label: "City", name: "city" },
                { label: "State", name: "state" },
                { label: "Pincode", name: "pincode" }
              ]
            ).map((field) => (
              <Input key={field.name} label={field.label} name={field.name} value={formData[field.name]} onChange={handleInputChange} disabled={!isEditMode} />
            ))}
          </div>
        </div>
      )}

      {/* Change Password */}
      {activeTab === "Change Password" && (
        <div className="bg-white rounded-xl p-6 shadow-lg space-y-4 max-w-xl animate-slideIn">
          {(
            [
              { label: "Current Password", name: "currentPassword", type: "password" },
              { label: "New Password", name: "newPassword", type: "password" },
              { label: "Confirm Password", name: "confirmPassword", type: "password" }
            ]
          ).map((field) => (
            <Input key={field.name} label={field.label} name={field.name} type={field.type} value={formData[field.name] || ""} onChange={handleInputChange} />
          ))}
        </div>
      )}
    </div>
  );
};

const Input = ({ label, name, value, onChange, disabled = false, type = "text" }) => (
  <div className="relative floating-input" data-placeholder={label}>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`input-field peer ${disabled ? "bg-gray-100" : "bg-white"}`}
      placeholder=" "
      autoComplete="off"
    />
  </div>
);

export default DoctorProfileSettings;
