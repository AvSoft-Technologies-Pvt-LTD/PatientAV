import React, { useState, useEffect, useRef } from "react";
import { Camera, Eye, EyeOff, Edit2, Check, Save, X, User, Lock } from "lucide-react";
import { useSelector } from "react-redux";
const formFields = {
  personal: [
    { id: "firstName", label: "First Name", type: "text", readOnly: true },
    { id: "middleName", label: "Middle Name", type: "text" },
    { id: "lastName", label: "Last Name", type: "text", readOnly: true },
    { id: "aadhaar", label: "Aadhaar Number", type: "text", readOnly: true },
    { id: "dob", label: "Date of Birth", type: "date" },
    { id: "gender", label: "Gender", type: "text", readOnly: true },
    { id: "email", label: "Email", type: "email" },
    { id: "phone", label: "Phone Number", type: "tel" },
    { id: "alternatePhone", label: "Alternate Phone Number", type: "tel" },
    { id: "permanentAddress", label: "Permanent Address", type: "textarea" },
    { id: "temporaryAddress", label: "Temporary Address", type: "textarea" },
  ],
  password: [
    { id: "currentPassword", label: "Current Password", type: "password", toggleVisibility: true },
    { id: "newPassword", label: "New Password", type: "password", toggleVisibility: true },
    { id: "confirmPassword", label: "Confirm Password", type: "password", toggleVisibility: true },
  ],
};
const Settings = () => {
  const user = useSelector((state) => state.auth.user);
  const fileInputRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileImage, setProfileImage] = useState("");
  const [passwordVisibility, setPasswordVisibility] = useState({});
  const [hasUnsavedChanges, sethasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (user) {
      setFormData({ ...user, currentPassword: "", newPassword: "", confirmPassword: "" });
      setProfileImage(user.profileImage || "");
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    sethasUnsavedChanges(true);
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result.toString());
          sethasUnsavedChanges(true);
          if (saveSuccess) setSaveSuccess(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSaveSuccess(true);
      setIsEditMode(false);
      sethasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!user) return;
    setFormData({ ...user, currentPassword: "", newPassword: "", confirmPassword: "" });
    setProfileImage(user.profileImage || "");
    setIsEditMode(false);
    sethasUnsavedChanges(false);
  };

  const renderField = ({ id, label, type, readOnly, options, toggleVisibility }) => {
    const value = formData[id] || "";
    let field;
    if (type === "textarea") {
      field = (
        <div className="floating-input relative w-full mb-4" data-placeholder={label}>
          <textarea
            name={id}
            value={value}
            onChange={handleInputChange}
            className={`input-field peer ${readOnly ? "btn-disabled" : ""}`}
            rows={3}
            readOnly={readOnly || !isEditMode}
            placeholder=" "
          />
        </div>
      );
    } else if (type === "select") {
      field = (
        <div className="floating-input relative w-full mb-4" data-placeholder={label}>
          <select
            name={id}
            value={value}
            onChange={handleInputChange}
            className={`input-field peer ${readOnly ? "btn-disabled" : ""}`}
            disabled={readOnly || !isEditMode}
            placeholder=" "
          >
            <option value="">Select {label}</option>
            {(options || []).map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    } else if (type === "password") {
      field = isEditMode ? (
        <div className="floating-input relative w-full mb-4" data-placeholder={label}>
          <input
            type={passwordVisibility[id] ? "text" : "password"}
            name={id}
            value={value}
            onChange={handleInputChange}
            className={`input-field peer pr-12`}
            autoComplete="new-password"
            placeholder=" "
          />
          {toggleVisibility && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setPasswordVisibility((prev) => ({ ...prev, [id]: !prev[id] }))}
              className={`absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none ${
                passwordVisibility[id]
                  ? "text-green-500 hover:text-green-700"
                  : "text-gray-400 hover:text-green-500"
              }`}
              style={{ zIndex: 2 }}
            >
              {passwordVisibility[id] ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
      ) : null;
    } else {
      field = (
        <div className="floating-input relative w-full mb-4" data-placeholder={label}>
          <input
            type={type}
            name={id}
            value={value}
            onChange={handleInputChange}
            className={`input-field peer ${readOnly ? "btn-disabled" : ""}`}
            readOnly={readOnly || !isEditMode}
            placeholder=" "
          />
        </div>
      );
    }
    if (type === "password" && !isEditMode) return null;
    return (
      <div key={id} className="md:col-span-1">
        {isEditMode ? field : (
          <div className="floating-input relative w-full mb-4" data-placeholder={label}>
            <div className="input-field peer" placeholder=" ">
              {value || <span className="paragraph italic">Not provided</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case "personal": return <User size={16} />;
      case "password": return <Lock size={16} />;
      default: return null;
    }
  };

  if (isLoading) return <div className="w-full min-h-screen flex items-center justify-center"><div className="animate-pulse flex flex-col items-center"><div className="w-32 h-32 bg-[var(--primary-color)] rounded-full mb-4"></div><div className="h3-heading"></div><div className="btn btn-primary"></div></div></div>;
  if (error) return <div className="w-full min-h-screen flex items-center justify-center"><div className="bg-white p-8 rounded-lg shadow"><div className="h2-heading mb-4">Error</div><p className="paragraph">{error}</p><button onClick={() => window.location.reload()} className="btn btn-primary mt-4">Reload Page</button></div></div>;

  return (
    <div className="mx-auto relative pb-20">
      <div className="relative">
        <div className="h-28 bg-[var(--primary-color)] rounded-3xl shadow-md overflow-hidden"></div>
        <div className="absolute top-6 left-0 right-0 px-6 flex flex-col sm:flex-row justify-between items-center">
          <h2 className="text-2xl text-white mb-4 sm:mb-0">Profile Settings</h2>
          {!isEditMode ? (
            <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 border-2 border-white text-white rounded-full transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 hover:bg-white hover:text-[var(--primary-color)] hover:shadow-lg">
              <Edit2 size={18} className="transition-transform duration-300 group-hover:rotate-12" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="group flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[var(--accent-color)] bg-white text-gray-700 transition-all duration-300 ease-in-out hover:bg-[var(--accent-color)] hover:text-white">
              <span className="transition-colors duration-300 group-hover:text-white">Editing mode</span>
              <div className="w-3 h-3 rounded-full bg-green-500 animate-ping transition-colors duration-300 group-hover:bg-green-700"></div>
            </div>
          )}
        </div>
      </div>
      <div className="relative -mt-16 z-10 flex justify-center">
        <div className="relative group">
          <div className="w-22 h-22 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center ">
                <Camera size={22} className="text-gray-400" />
              </div>
            )}
          </div>
          {isEditMode && (
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[var(--accent-color)] rounded-full flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Camera size={18} className="text-white" />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
          )}
        </div>
      </div>
      <div className=" -mt-16 pt-20 px-6">
        <div className="text-center">
          <div className="paragraph">{formData.occupation || "User"} </div>
          <h3 className="paragraph">{formData.firstName} {formData.lastName}</h3>
          <p className="paragraph">{formData.email}</p>
        </div>
        <div className="rounded-lg p-2 flex flex-wrap gap-2">
          {["personal", ...(isEditMode ? ["password"] : [])].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} type="button"
                className={`group relative overflow-hidden rounded-full px-6 py-2 flex items-center gap-2 font-semibold border-2 transition-all duration-300 focus:outline-none ${isActive ? "bg-[var(--primary-color)] text-white border-[var(--primary-color)] shadow-md shadow-[var(--primary-color)]" : "bg-white text-[var(--accent-color)] border-[var(--accent-color)] hover:text-white"}`}
                style={{ '--primary-color': '#0E1630', '--accent-color': '#01D48C' }}>
                <span className="relative z-10 flex items-center gap-2 capitalize">{getTabIcon(tab)}{tab}</span>
                {!isActive && (<span className="absolute inset-0 z-0 bg-[var(--accent-color)] translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out" />)}
              </button>
            );
          })}
        </div>
        <form onSubmit={handleSaveChanges}>
          {["personal", ...(isEditMode ? ["password"] : [])].map((tab) => (
            <div key={tab} className={`transition-all duration-500 ${activeTab === tab ? "opacity-100" : "hidden opacity-0"}`}>
              <div className="bg-white rounded-lg p-6 mb-6">
                <h4 className="h4-heading mb-6 pb-2 border-b border-gray-200 flex items-center">
                  <span className="paragraph mr-2">{tab.charAt(0).toUpperCase() + tab.slice(1)} Information</span>
                  {isEditMode && <span className="btn btn-secondary text-sm">Editing</span>}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formFields[tab].map(renderField)}
                </div>
              </div>
            </div>
          ))}
          {isEditMode && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-900 shadow-lg p-2 flex justify-end gap-2 z-10">
              <button type="button" onClick={handleCancelEdit}
                className="group relative border-2 border-[var(--primary-color)] text-[var(--primary-color)] flex items-center gap-1 px-4 py-2 rounded-full transition-all duration-300 ease-in-out overflow-hidden hover:bg-[var(--primary-color)] hover:text-white hover:scale-105 active:scale-95"
                style={{ '--primary-color': '#0E1630' }}>
                <X className="z-10 relative text-[var(--primary-color)] group-hover:text-white transition-colors duration-300" size={18} />
                <span className="font-medium z-10 relative group-hover:text-white transition-colors duration-300">Cancel</span>
              </button>
              <button type="submit" disabled={!hasUnsavedChanges || isSaving}
                className="relative flex items-center gap-2 px-5 py-2 rounded-full text-white bg-[var(--accent-color)] active:bg-emerald-700 transition duration-300 ease-in-out disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-70 before:absolute before:inset-0 before:rounded-full before:border-2 before:border-transparent before:pointer-events-none"
                style={{ '--accent-color': '#01D48C' }}>
                {isSaving ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />) : (<Save size={18} />)}
                <span className="font-semibold">{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
              {saveSuccess && (
                <div className="fixed top-4 right-4 bg-[var(--accent-color)] text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up z-20">
                  <div className="bg-white/20 p-1 rounded-full"><Check size={18} /></div>
                  <span className="paragraph">Changes saved successfully!</span>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
export default Settings;