import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import SignatureCanvas from "react-signature-canvas";
import { Eye, X, Save, ChevronDown } from "lucide-react";


const chunkFields = (fields, size = 3) => {
  const chunks = [];
  for (let i = 0; i < fields.length; i += size) chunks.push(fields.slice(i, i + size));
  return chunks;
};

const ReusableModal = ({
  isOpen, onClose, mode, title, data = {}, saveLabel, cancelLabel, deleteLabel,
  fields = [], viewFields = [], size = "md", onSave, onDelete, showSignature = false
}) => {
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [previewFile, setPreviewFile] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [doctorSignature, setDoctorSignature] = useState("");
  const signaturePadRef = useRef();
  useEffect(() => {
    if (fields.length && ["add", "edit"].includes(mode)) {
      const initial = {}; fields.forEach(f => initial[f.name] = data?.[f.name] ?? "");
      setFormValues(initial); setFormErrors({});
         setDoctorSignature(data?.doctorSignature || "");
    }
  }, [isOpen, fields, mode, data]);
  const handleSignatureUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDoctorSignature(reader.result);
      reader.readAsDataURL(file);
    }
  };
const handleSaveDrawnSignature = () => {
  if (!signaturePadRef.current?.isEmpty()) {
    const drawnSignature = signaturePadRef.current.getCanvas().toDataURL("image/png");
    setDoctorSignature(drawnSignature);
    toast.success("Signature saved!");
  } else {
    toast.warning("Signature pad is empty.");
  }
};


  const handleClearSignature = () => {
    signaturePadRef.current?.clear();
    setDoctorSignature("");
  };

  const handleChange = (name, value) => {
    setFormValues(p => ({ ...p, [name]: value }));
    setFormErrors(p => ({ ...p, [name]: undefined }));
  };

  const handleSave = async () => {
    await onSave({ ...formValues, doctorSignature }); // wait for server
    toast.success(mode === "add" ? "Record added Successfully!" : "Record updated Successfully!");
    onClose();
  };
  const handleDelete = () => { onDelete(); toast.error("Record deleted Successfully!"); onClose(); };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`flex flex-col relative w-full max-h-[90vh] rounded-xl ${{ sm: "max-w-md", md: "max-w-3xl", lg: "max-w-4xl" }[size]}`}>

        {(mode === "add" || mode === "edit" || mode === "viewProfile") && (
          <div className="sticky top-0 z-20 bg-gradient-to-r from-[#01B07A] to-[#004f3d] rounded-t-xl px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--color-surface)] tracking-wide">{title}</h2>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-surface)] text-[var(--color-surface)] hover:bg-gradient-to-br from-[#E6FBF5] to-[#C1F1E8] hover:text-[var(--primary-color)] transition"> <X size={18} />
            </button>
          </div>
        )}
        <div className="flex flex-col max-h-[90vh] overflow-hidden bg-gradient-to-br from-[#E6FBF5] to-[#C1F1E8]">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="rounded-xl bg-[var(--color-surface)] p-6 space-y-6">
              {["add", "edit"].includes(mode) && chunkFields(fields).map((row, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  {row.map(field => (
                    <div key={field.name} className="flex flex-col">
                      {field.type === "radio" ? (
                        <div className="space-y-2">
                          <p className="font-medium mb- text-sm">{field.label}</p>
                          <div className="flex flex-wrap gap-4">
                            {field.options?.map(opt => {
                              const value = typeof opt === "string" ? opt : opt.value;
                              const label = typeof opt === "string" ? opt : opt.label;
                              return (
                                <label key={value} className="flex items-center gap-2 text-sm">
                                  <input type="radio" name={field.name} value={value} checked={formValues[field.name] === value} onChange={e => handleChange(field.name, e.target.value)} className="h-4 w-4 text-blue-600" />
                                  <span>{label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="floating-input relative" data-placeholder={field.label}>
                          {field.type === "select" ? (
                            <select name={field.name} value={formValues[field.name] || ""} onChange={e => handleChange(field.name, e.target.value)} className="peer input-field">
                              <option value="">Select {field.label}</option>
                              {field.options?.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                          ) : field.type === "multiselect" ? (
                            <div className="relative">
                              <button type="button" onClick={() => setFormValues(p => ({ ...p, [`${field.name}Open`]: !p[`${field.name}Open`] }))} className="peer input-field flex justify-between items-center">
                                <span className="truncate">
                                  {Array.isArray(formValues[field.name]) && formValues[field.name].length ? field.options.filter(opt => formValues[field.name].includes(opt.value)).map(opt => opt.label).join(", ") : `Select ${field.label}`}
                                </span>
                                <span className="ml-2"><ChevronDown size={16} /></span>
                              </button>
                              {formValues[`${field.name}Open`] && (
                                <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded border bg-white shadow">
                                  {field.options?.map(opt => (
                                    <label key={opt.value} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                      <input type="checkbox" className="mr-2" checked={Array.isArray(formValues[field.name]) && formValues[field.name].includes(opt.value)} onChange={e => {
                                        const prev = Array.isArray(formValues[field.name]) ? formValues[field.name] : [];
                                        const next = e.target.checked ? [...prev, opt.value] : prev.filter(v => v !== opt.value);
                                        handleChange(field.name, next);
                                      }} />
                                      {opt.label}
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : field.type === "textarea" ? (
                            <textarea name={field.name} value={formValues[field.name] || ""} onChange={e => handleChange(field.name, e.target.value)} rows={1} className="peer input-field" placeholder=" " />
                          ) : field.type === "date" ? (
                            <input type="date" name={field.name} value={formValues[field.name] || ""} onChange={e => handleChange(field.name, e.target.value)} className="peer input-field" />
                          ) : field.type === "file" ? (
                            <div className="relative flex items-center">
                              <input type="file" name={field.name} multiple={field.multiple} onChange={e => {
                                const files = Array.from(e.target.files);
                                handleChange(field.name, field.multiple ? [...(formValues[field.name] || []), ...files] : files[0]);
                              }} className="peer input-field pr-8" />
                              {!field.multiple && formValues[field.name] && (
                                <button type="button" onClick={() => { setPreviewFile(formValues[field.name]); setShowPreviewModal(true); }} className="absolute right-2 text-[var(--primary-color)]">
                                  <Eye size={18} />
                                </button>
                              )}
                            </div>
                          ) : (
                            <input type={field.type || "text"} name={field.name} value={formValues[field.name] || ""} onChange={e => handleChange(field.name, e.target.value)} readOnly={field.readonly} className="peer input-field" placeholder=" " />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {["add", "edit"].includes(mode) && showSignature && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 animate-fadeIn">
                  <h3 className="h3-heading mb-6">Digital Signature</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--primary-color)] mb-2">Upload Signature:</label>
                        <input type="file" accept="image/*" onChange={handleSignatureUpload} className="input-field" />
                      </div>
                      {doctorSignature && (
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <span className="text-sm font-medium text-[var(--primary-color)] ">Preview:</span>
                          <img src={doctorSignature} alt="Doctor's Signature" className="h-12 border border-blue-300 rounded shadow-sm" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-[var(--primary-color)]">Or Draw Signature:</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <SignatureCanvas ref={signaturePadRef} canvasProps={{ width: 400, height: 100, className: "border border-gray-300 rounded-lg shadow-sm w-full bg-white" }} />
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={handleSaveDrawnSignature} className="edit-btn flex items-center gap-1">
                          <Save className="w-4 h-4" />Save
                        </button>

                        <button onClick={handleClearSignature} className="delete-btn flex items-center gap-1"><X className="w-4 h-4" />Clear</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {mode === "viewProfile" && (
                <>
                  <div className="flex items-center rounded-xl bg-gradient-to-r from-[#01B07A] to-[#1A223F] p-5">
                    <div className="relative mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--primary-color)] text-2xl font-bold uppercase shadow-inner ring-4 ring-white ring-offset-2">
                      {viewFields.find(f => f.initialsKey) ? (data[viewFields.find(f => f.initialsKey).key] || "NA").substring(0, 2).toUpperCase() : "NA"}
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-[var(--color-surface)]">{viewFields.find(f => f.titleKey) ? data[viewFields.find(f => f.titleKey).key] || "-" : "-"}</p>
                      <p className="mt-1 text-sm font-medium text-blue-100 tracking-wide">{viewFields.find(f => f.subtitleKey) ? data[viewFields.find(f => f.subtitleKey).key] || "-" : "-"}</p>
                    </div>
                  </div>
                  <div className="rounded-xl p-6 bg-[var(--color-surface)]">
                    <h3 className="mb-4 border-b pb-3 h4-heading">Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {viewFields.filter(f => !f.initialsKey && !f.titleKey && !f.subtitleKey).map((f, i) => (
                        <div key={i} className="flex justify-between border-b border-dashed border-gray-500 pb-2">
                          <span className="text-sm font-medium text-gray-500">{f.label}</span>
                          <span className="ml-4 text-sm font-semibold text-gray-800">{data[f.key] || "-"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {mode === "confirmDelete" && (<p className="text-gray-700">Are you sure you want to delete this record?</p>)}
            </div>
            <div className=" flex justify-end gap-3 px-6 py-4">
              {mode !== "viewProfile" && <button onClick={onClose} className="delete-btn">{cancelLabel || "Cancel"}</button>}
              {["add", "edit"].includes(mode) && <button onClick={handleSave} className="view-btn">{saveLabel || (mode === "edit" ? "Update" : "Save")}</button>}
              {mode === "confirmDelete" && <button onClick={handleDelete} className="edit-btn">{deleteLabel || "Yes, Delete"}</button>}
            </div>

          </div>
        </div>
        {showPreviewModal && previewFile && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-bold">File Preview</h3>
                <button onClick={() => setShowPreviewModal(false)} className="text-gray-700 hover:text-red-500">X</button>
              </div>
              {previewFile.type?.startsWith("image/") ? (
                <img src={URL.createObjectURL(previewFile)} alt={previewFile.name} className="w-full max-h-[70vh] object-contain" onLoad={() => URL.revokeObjectURL(previewFile)} />
              ) : (<p className="text-gray-800">File: {previewFile.name}</p>)}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ReusableModal;