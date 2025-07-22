import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Loader2, Edit } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import Pagination from "../../../../components/Pagination"; // Adjust path if needed

import "react-toastify/dist/ReactToastify.css";
import { FiArrowRight, FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

import {
  FaEye,
  FaEyeSlash,
  FaHeartbeat,
  FaNotesMedical,
  FaFlask,
  FaPills,
  FaSearch,
} from "react-icons/fa";
import axios from "axios";
import TeleConsultFlow from "../../../../components/microcomponents/Call";

// --- Constants ---
const RECORD_TYPES = [
  { id: "vitals", label: "Vitals", icon: FaHeartbeat },
  { id: "clinical-notes", label: "Clinical Notes", icon: FaNotesMedical },
  { id: "lab-tests", label: "Lab Tests", icon: FaFlask },
  { id: "medications", label: "Medications", icon: FaPills },
];

function getCurrentDate() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getCurrentTime() {
  const d = new Date();
  return d.toTimeString().slice(0, 5);
}

const OPT = {
  OCC: ["Doctor", "Engineer", "Teacher", "Student", "Retired"],
  DEPT: [
    "General Medicine",
    "Surgery",
    "Cardiology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology",
  ],
  INS: ["None", "CGHS", "ESIC", "Private Insurance", "Other"],
  RATE: [
    "General",
    "Semi-Private",
    "Private",
    "Deluxe",
    "ICU",
    "ICCU",
    "Special Wards",
  ],
  STATUS: ["Admitted", "Under Treatment", "Discharged"],
  GENDER: ["Female", "Male", "Other"],
  BLOOD: ["A+", "B+", "O+", "AB+"],
  SURGERY: ["No", "Yes"],
};

const API = {
  FORM: "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient",
  HD: "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails",
  FD: "https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData",
  HS: "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary",
};

const getDate = () => new Date().toISOString().slice(0, 10);
const getTime = () => new Date().toTimeString().slice(0, 5);
const to24Hour = (t) => {
  if (!t.includes("AM") && !t.includes("PM")) return t;
  let [time, mod] = t.trim().split(" ");
  let [h, m] = time.split(":").map(Number);
  if (mod === "PM" && h !== 12) h += 12;
  if (mod === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const FIELDS = [
  ["firstName", "First Name*", "text", 1],
  ["middleName", "Middle Name", "text"],
  ["lastName", "Last Name*", "text", 1],
  ["phone", "Phone Number*", "text", 1],
  ["email", "Email Address*", "text", 1],
  ["gender", "Gender*", "select", 1, OPT.GENDER],
  ["dob", "Date of Birth*", "date", 1],
  ["bloodGroup", "Blood Group", "select", 0, OPT.BLOOD],
  ["addressPerm", "Permanent Address*", "textarea", 1],
  ["addressTemp", "Temporary Address*", "textarea", 1],
  ["password", "Create Password*", "password", 1],
  ["confirmPassword", "Confirm Password*", "password", 1],
  ["occupation", "Occupation*", "suggest", 1, OPT.OCC],
];

const IPD = [
  ["admissionDate", "Admission Date*", "date", 1],
  ["admissionTime", "Admission Time*", "time", 1],
  ["status", "Status*", "select", 1, OPT.STATUS],
  ["wardType", "Ward Type*", "select", 1, OPT.RATE],
  // ["wardNo", "Ward Number", "text"],
  // ["bedNo", "Bed Number", "text"],
  ["department", "Department*", "select", 1, OPT.DEPT],
  ["insuranceType", "Insurance Type*", "select", 1, OPT.INS],
  ["doctorInCharge", "Doctor In Charge", "text"],
  ["doctorSpecialization", "Doctor Specialization", "text"],
  ["treatmentPlan", "Treatment Plan", "text"],
  ["surgeryRequired", "Surgery Required", "select", 0, OPT.SURGERY],
  ["dischargeDate", "Discharge Date", "date"],
  ["diagnosis", "Diagnosis", "text"],
  ["reasonForAdmission", "Reason For Admission", "text"],
];

const defaultForm = Object.fromEntries(FIELDS.map((f) => [f[0], ""]));
const defaultIPD = Object.fromEntries(
  IPD.map((f) => [
    f[0],
    f[0] === "admissionDate"
      ? getDate()
      : f[0] === "admissionTime"
      ? to24Hour(getTime())
      : "",
  ])
);

// Ward options
const WARD_TYPES = [
  "General",
  "Semi-Private",
  "Private",
  "Deluxe",
  "ICU",
  "ICCU",
  "Special Wards",
];
const WARD_NUMBERS = ["A", "B", "C", "D", "E"];
const BED_NUMBERS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

// --- Field Renderer ---
function Field({ f, v, onC, err, occList, setOccList, showWardModal }) {
  const [k, l, t, , o] = f;

  if (k === "wardType") {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          className={`input-field peer w-full text-xs font-normal ${
            err ? "border-red-500" : ""
          }`}
          value={v ?? ""}
          placeholder=""
          readOnly
        />
        <button
          type="button"
          onClick={showWardModal}
          className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (t === "select")
    return (
      <select
        className={`input-field peer w-full text-xs font-normal ${
          err ? "border-red-500" : ""
        }`}
        value={v ?? ""}
        onChange={onC}
      >
        <option value="" disabled hidden>
          {l}
        </option>
        {o?.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    );
  if (t === "textarea")
    return (
      <textarea
        className={`input-field peer w-full text-xs font-normal min-h-[60px] ${
          err ? "border-red-500" : ""
        }`}
        value={v ?? ""}
        onChange={onC}
      />
    );
  if (t === "time")
    return (
      <input
        type="time"
        className={`input-field peer w-full text-xs font-normal ${
          err ? "border-red-500" : ""
        }`}
        value={v ? to24Hour(v) : ""}
        onChange={onC}
      />
    );
  if (t === "suggest")
    return (
      <div className="floating-input relative" data-placeholder={l}>
        <input
          className="input-field peer text-xs px-3 py-2"
          value={v}
          placeholder=" "
          onChange={(e) => {
            onC({ target: { value: e.target.value } });
            setOccList(
              o.filter((x) =>
                x.toLowerCase().includes(e.target.value.toLowerCase())
              )
            );
          }}
          autoComplete="off"
        />
        {occList.length > 0 && (
          <ul className="absolute z-10 bg-white border w-full rounded shadow mt-1 max-h-40 overflow-y-auto text-xs">
            {occList.map((item, i) => (
              <li
                key={i}
                onClick={() => {
                  onC({ target: { value: item } });
                  setOccList([]);
                }}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  return (
    <input
      type={t}
      className={`input-field peer w-full text-xs font-normal ${
        err ? "border-red-500" : ""
      }`}
      value={v ?? ""}
      onChange={onC}
    />
  );
}

export default function PatientList() {
  // OPD state
  const occOpt = ["Doctor", "Engineer", "Teacher", "Student", "Retired"];
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const [aadhaarId, setAadhaarId] = useState("");
  const [occ, setOcc] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [occList, setOccList] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [appointmentModal, setAppointmentModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    gender: "",
    dob: "",
    bloodGroup: "",
    addressPerm: "",
    addressTemp: "",
    password: "",
    confirmPassword: "",
  });
  const [appointment, setAppointment] = useState({
    date: getCurrentDate(),
    time: getCurrentTime(),
    reason: "",
    diagnosis: "",
  });
  const [activeTab, setActiveTab] = useState("OPD");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [appointmentErrors, setAppointmentErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [clickedIds, setClickedIds] = useState([]);
  const [patients, setPatients] = useState([]);

  // For patient details modal
  const [personalDetails, setPersonalDetails] = useState(null);
  const [family, setFamily] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const rowRefs = useRef({});

  // Search modal state
  const [searchModal, setSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSearchPatient, setSelectedSearchPatient] = useState(null);
  const [state, setState] = useState({ currentPage: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.ceil(patients.length / pageSize);
  const paginatedPatients = patients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const DEFAULT_DOCTOR_NAME = "Dr.Sheetal S. Shelke";

  // --- IPD state ---
  const [ipdState, setIpdState] = useState({
    ipdPatients: [],
    filteredIPD: [],
    loading: true,
    search: "",
    searching: false,
    modalOpen: false,
    showIpdForm: false,
    editModalOpen: false,
    formData: defaultForm,
    ipdData: defaultIPD,
    occList: [],
    aadhaarId: "",
    readonlyFields: false,
    selectedPatient: null,
    personalDetails: null,
    family: [],
    vitals: null,
    saving: false,
  });
  const [ipdErrors, setIpdErrors] = useState({});
  const [recentPatientId, setRecentPatientId] = useState(null);
  const ipdSearchTimeout = useRef();

  // Ward modal state
  const [wardModal, setWardModal] = useState(false);
  const [wardSelection, setWardSelection] = useState({
    wardType: "",
    wardNumber: "",
    bedNumber: "",
  });

  const S = (k, v) => setIpdState((s) => ({ ...s, [k]: v }));
  const F = (k, v) =>
    setIpdState((s) => ({ ...s, formData: { ...s.formData, [k]: v } }));
  const I = (k, v) =>
    setIpdState((s) => ({ ...s, ipdData: { ...s.ipdData, [k]: v } }));
  const validateIPD = (fields, data) => {
    let errs = {};
    fields.forEach((f) => {
      if (f[3] && !data[f[0]]) errs[f[0]] = `${f[1]} is required`;
    });
    setIpdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- OPD Effects ---
  useEffect(() => {
    if (activeTab === "OPD") {
      (async () => {
        try {
          const res = await axios.get(API.FORM);
          setPatients(
            res.data
              .filter((p) => (p.type || "opd").toLowerCase() === "opd")
              .reverse()
          );
        } catch (e) {}
      })();
    }
  }, [activeTab]);

  useEffect(() => {
    const highlightIds = JSON.parse(
      localStorage.getItem("highlightOPDIds") || "[]"
    );
    const clicked = JSON.parse(localStorage.getItem("clickedOPDIds") || "[]");
    setHighlightId(highlightIds);
    setClickedIds(clicked);
    setTimeout(() => {
      highlightIds.forEach((id) => {
        if (!clicked.includes(id)) {
          const el = rowRefs.current[id];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }, 500);
  }, []);

  // --- IPD Effects ---
  useEffect(() => {
    if (activeTab === "IPD") {
      (async () => {
        S("loading", true);
        try {
          const d = await (await fetch(API.FORM)).json();
          // Map each IPD patient to ensure a 'name' property is set from first/middle/last name
          const mapped = d.reverse().map((p) => ({
            ...p,
            name:
              p.name ||
              [p.firstName, p.middleName, p.lastName]
                .filter(Boolean)
                .join(" ")
                .trim(),
          }));
          S("ipdPatients", mapped);
          S("filteredIPD", mapped);
        } catch {
          toast.error("Failed to fetch patients");
        }
        S("loading", false);
      })();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "IPD") {
      S("searching", true);
      if (ipdSearchTimeout.current) clearTimeout(ipdSearchTimeout.current);
      ipdSearchTimeout.current = setTimeout(() => {
        const val = ipdState.search.trim().toLowerCase();
        S(
          "filteredIPD",
          ipdState.ipdPatients.filter(
            (p) =>
              (p.id || "").toString().toLowerCase().includes(val) ||
              (p.name || "").toLowerCase().includes(val)
          )
        );
        S("searching", false);
      }, 400);
      return () => clearTimeout(ipdSearchTimeout.current);
    }
  }, [ipdState.search, ipdState.ipdPatients, activeTab]);

  // Prevent background scroll when any modal is open
  useEffect(() => {
    if (
      modalOpen ||
      appointmentModal ||
      selectedPatient ||
      searchModal ||
      wardModal
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen, appointmentModal, selectedPatient, searchModal, wardModal]);

  useEffect(() => {
    setPatients([]);
  }, []);

  useEffect(() => {
    localStorage.setItem("opdPatients", JSON.stringify(patients));
  }, [patients]);

  const handleFetchPatient = () => {
    const found = formDummy.find((p) => p.aadhaar === aadhaarId.trim());
    if (found) {
      setFormData({ ...formData, ...found });
      setOcc(found.occupation);
    } else {
      alert("Patient not found!");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient"
        );
        const filteredPatients = res.data
          .filter((p) => p.doctorName === DEFAULT_DOCTOR_NAME)
          .map((p) => ({
            id: p.id,
            name: [p.firstName, p.middleName, p.lastName]
              .filter(Boolean)
              .join(" "),
            diagnosis: p.diagnosis,
            reason: p.reason,
            datetime: `${p.appointmentDate} ${p.appointmentTime}`,
            bloodGroup: p.bloodGroup || "",
            family: p.family || [],
            vitals: p.vitals || {},
            height: p.height,
            weight: p.weight,
            email: p.email,
            phone: p.phone,
          }))
          .reverse();
        localStorage.setItem(
          "filteredPatients",
          JSON.stringify(filteredPatients)
        );
        setPatients(filteredPatients);
      } catch (e) {
        console.error("Error fetching appointments:", e);
      }
    })();
  }, []);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const addForm = (type) => {
    const forms = JSON.parse(localStorage.getItem("medicalForms") || "[]");
    if (!forms.find((f) => f.type === type)) {
      forms.push({ id: Date.now(), type });
      localStorage.setItem("medicalForms", JSON.stringify(forms));
    }
    setShowForm(true);
    setActiveDropdown(null);
  };

  if (showForm) return <FormPage />;

  const handleCloseAppointmentModal = () => {
    setAppointmentModal(false);
    setModalOpen(false);
    setSelectedPatient(null);
    setSelectedSearchPatient(null);
    setSearchModal(false);
  };

  const handleOpenAddPatient = () => {
    if (!appointmentModal) setModalOpen(true);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    try {
      const response = await axios.get(
        "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient"
      );
      const results = response.data.filter((p) =>
        (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  };

  const handleCreateAppointmentFromSearch = async () => {
    if (!selectedSearchPatient || !validateAppointment()) return;
    try {
      const payload = {
        name: selectedSearchPatient.name,
        email: selectedSearchPatient.email,
        phone: selectedSearchPatient.phone,
        aadhaarId: selectedSearchPatient.aadhaarId,
        occupation: selectedSearchPatient.occupation,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        diagnosis: appointment.diagnosis,
        reason: appointment.reason,
        doctorName: DEFAULT_DOCTOR_NAME,
      };
      await axios.post(
        "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient",
        payload
      );
      alert("Appointment scheduled successfully!");
      setAppointmentModal(false);
      setSearchModal(false);
      setSelectedSearchPatient(null);
      setAppointment({
        date: getCurrentDate(),
        time: getCurrentTime(),
        reason: "",
        diagnosis: "",
      });
    } catch (error) {
      alert("Failed to schedule appointment.");
    }
  };

  const handleAddRecord = (patient) => {
    navigate("/doctordashboard/form", { state: { patient } });
  };

  const SuggestInput = ({ val, setVal, list, setList, data, placeholder }) => (
    <div className="floating-input relative" data-placeholder={placeholder}>
      <input
        className="input-field peer"
        value={val}
        placeholder=" "
        onChange={(e) => {
          const v = e.target.value;
          setVal(v);
          setList(
            data.filter((o) => o.toLowerCase().includes(v.toLowerCase()))
          );
        }}
        autoComplete="off"
      />
      {list.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full rounded shadow mt-1 max-h-40 overflow-y-auto">
          {list.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                setVal(item);
                setList([]);
              }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // --- IPD Handlers ---
  const [ipdPage, setIpdPage] = useState(1);
  const ipdPageSize = 6;
  const ipdTotalPages = Math.ceil(
    ipdState.filteredIPD.filter((p) => (p.type || "").toLowerCase() === "ipd")
      .length / ipdPageSize
  );
  const paginatedIPD = ipdState.filteredIPD
    .filter((p) => (p.type || "").toLowerCase() === "ipd")
    .slice((ipdPage - 1) * ipdPageSize, ipdPage * ipdPageSize);

  useEffect(() => {
    setIpdPage(1);
  }, [ipdState.filteredIPD]);

  const fetchPatient = async () => {
    try {
      const data = await (await fetch(API.FORM)).json();
      const found = data.find(
        (p) => (p.id || "").toString() === ipdState.aadhaarId.trim()
      );
      if (found) {
        const name = `${found.firstName || ""} ${found.middleName || ""} ${
          found.lastName || ""
        }`
          .replace(/\s+/g, " ")
          .trim();
        S("formData", {
          ...defaultForm,
          ...found,
          name,
          addressPerm: found.permanentAddress || "",
          addressTemp: found.temporaryAddress || "",
          email: found.email || "",
          dob: found.dob || "",
          occupation: found.occupation || "",
          bloodGroup: found.bloodGroup || "",
          password: found.password || "",
          confirmPassword: found.confirmPassword || "",
        });
        S("readonlyFields", true);
        S("photoUrl", found.photoUrl || "");
        toast.success(`${found.type || "Patient"} details loaded!`);
      } else toast.info("No patient found with this ID.");
    } catch {
      toast.error("Failed to fetch patient");
    }
  };

  const savePatient = async () => {
    if (!validateIPD(IPD, ipdState.ipdData)) return;
    S("saving", true);
    try {
      const patientData = {
        ...ipdState.formData,
        ...ipdState.ipdData,
        type: "ipd",
        name: `${ipdState.formData.firstName} ${
          ipdState.formData.middleName || ""
        } ${ipdState.formData.lastName}`.trim(),
        admissionTime: to24Hour(ipdState.ipdData.admissionTime),
        admissionDate: ipdState.ipdData.admissionDate,
        occupation: ipdState.formData.occupation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const url =
        ipdState.editModalOpen && ipdState.formData.id
          ? `${API.FORM}/${ipdState.formData.id}`
          : API.FORM;
      const method =
        ipdState.editModalOpen && ipdState.formData.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patientData),
      });
      if (response.ok) {
        toast.success(
          ipdState.editModalOpen
            ? "Patient updated successfully!"
            : "Patient added successfully!"
        );
        resetForm();
        handleCloseIpdModal();
        const updatedData = await (await fetch(API.FORM)).json();
        let newPatient = null;
        if (!ipdState.editModalOpen) {
          newPatient = updatedData.find(
            (p) => p.createdAt === patientData.createdAt
          );
          const newId = newPatient
            ? newPatient.id
            : updatedData[updatedData.length - 1]?.id;
          S("ipdPatients", [
            newPatient || patientData,
            ...updatedData.filter((p) =>
              newPatient ? p.id !== newPatient.id : true
            ),
          ]);
          S("filteredIPD", [
            newPatient || patientData,
            ...updatedData.filter((p) =>
              newPatient ? p.id !== newPatient.id : true
            ),
          ]);
          setRecentPatientId(newId);
        } else {
          S("ipdPatients", updatedData.reverse());
          S("filteredIPD", updatedData.reverse());
          setRecentPatientId(null);
        }
      } else throw new Error("Failed to save patient");
    } catch {
      toast.error("Failed to save patient");
    } finally {
      S("saving", false);
    }
  };

  const resetForm = () => {
    S("formData", defaultForm);
    S("ipdData", defaultIPD);
    S("occList", []);
    S("aadhaarId", "");
    S("readonlyFields", false);
    setIpdErrors({});
  };

  const viewIpdPatientDetails = async (a) => {
    S("selectedPatient", a);
    S("personalDetails", null);
    S("family", []);
    S("vitals", null);
    setRecentPatientId(null);
    try {
      const [pd, fd, vs] = await Promise.all([
        fetch(API.HD).then((r) => r.json()),
        fetch(API.FD).then((r) => r.json()),
        fetch(API.HS).then((r) => r.json()),
      ]);
      const email = (a.email || "").trim().toLowerCase();
      S(
        "personalDetails",
        pd.find((x) => (x.email || "").trim().toLowerCase() === email)
      );
      S(
        "family",
        fd.filter((f) => (f.email || "").trim().toLowerCase() === email)
      );
      S(
        "vitals",
        vs.find((x) => (x.email || "").trim().toLowerCase() === email) || null
      );
    } catch {}
  };

  const handleEdit = () => {
    S("editModalOpen", true);
    S("modalOpen", true);
    S("showIpdForm", true);
    S("formData", {
      ...defaultForm,
      ...ipdState.selectedPatient,
      id: ipdState.selectedPatient.id,
      addressPerm: ipdState.selectedPatient.permanentAddress || "",
      addressTemp: ipdState.selectedPatient.temporaryAddress || "",
      email: ipdState.selectedPatient.email || "",
      dob: ipdState.selectedPatient.dob || "",
      occupation: ipdState.selectedPatient.occupation || "",
      bloodGroup: ipdState.selectedPatient.bloodGroup || "",
      password: ipdState.selectedPatient.password || "",
      confirmPassword: ipdState.selectedPatient.confirmPassword || "",
    });
    S("ipdData", { ...defaultIPD, ...ipdState.selectedPatient });
    S("photoUrl", ipdState.selectedPatient.photoUrl || "");
    S("selectedPatient", null);
  };

  const handleCloseIpdModal = () => {
    S("modalOpen", false);
    S("showIpdForm", false);
    S("editModalOpen", false);
    S("selectedPatient", null);
    resetForm();
  };

  const handlePatientFormSubmit = (e) => {
    e.preventDefault();
    if (validateIPD(FIELDS, ipdState.formData)) S("showIpdForm", true);
  };

  const handleIPDFormSubmit = (e) => {
    e.preventDefault();
    savePatient();
  };

  // Ward modal handlers
  const handleWardModalOpen = () => {
    setWardModal(true);
  };

  const handleWardModalClose = () => {
    setWardModal(false);
    setWardSelection({ wardType: "", wardNumber: "", bedNumber: "" });
  };

  const handleWardSelectionConfirm = () => {
    const { wardType, wardNumber, bedNumber } = wardSelection;
    if (wardType && wardNumber && bedNumber) {
      const wardString = `${wardType}-${wardNumber}-${bedNumber}`;
      I("wardType", wardString);
      setWardModal(false);
      setWardSelection({ wardType: "", wardNumber: "", bedNumber: "" });
    }
  };

  const renderFields = (
    fields,
    values,
    onChange,
    errors = {},
    occList,
    setOccList
  ) =>
    fields.map((f) => (
      <div
        key={f[0]}
        className="floating-input relative"
        data-placeholder={f[1]}
      >
        <Field
          f={f}
          v={values[f[0]]}
          onC={(e) => onChange(f[0], e.target.value)}
          err={errors[f[0]]}
          occList={occList}
          setOccList={setOccList}
          showWardModal={f[0] === "wardType" ? handleWardModalOpen : undefined}
        />
        {errors[f[0]] && (
          <span className="text-red-500 text-xs">{errors[f[0]]}</span>
        )}
      </div>
    ));

  const validateAppointment = () => {
    const errors = {};
    if (!appointment.date) errors.date = "Date is required";
    if (!appointment.time) errors.time = "Time is required";
    if (!appointment.diagnosis) errors.diagnosis = "Diagnosis is required";
    if (!appointment.reason) errors.reason = "Reason is required";
    setAppointmentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleAppointment = async () => {
    if (!validateAppointment()) return;
    try {
      const payload = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        name: [formData.firstName, formData.middleName, formData.lastName]
          .filter(Boolean)
          .join(" "),
        email: formData.email,
        phone: formData.phone,
        permanentAddress: formData.addressPerm,
        temporaryAddress: formData.addressTemp,
        dob: formData.dob,
        occupation: formData.occupation,
        aadhaarId,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        diagnosis: appointment.diagnosis,
        reason: appointment.reason,
        doctorName: DEFAULT_DOCTOR_NAME,
        type: "OPD",
      };
      await axios.post(
        "https://681f2dfb72e59f922ef5774c.mockapi.io/addpatient",
        payload
      );
      alert("Appointment scheduled successfully!");
      setAppointmentModal(false);
      setModalOpen(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("Failed to schedule appointment.");
    }
  };

  // --- Add Patient Validation & Handlers ---
  const validateForm = (showAll = false) => {
    const errors = {};
    if (
      (showAll || formTouched.aadhaarId) &&
      (!aadhaarId || aadhaarId.length !== 12 || !/^[0-9]+$/.test(aadhaarId))
    )
      errors.aadhaarId = "Aadhaar must be 12 digits";
    if (
      (showAll || formTouched.firstName) &&
      (!formData.firstName || !/^[A-Za-z\s]+$/.test(formData.firstName))
    )
      errors.firstName = "First name is required and only letters";
    if (
      (showAll || formTouched.middleName) &&
      formData.middleName &&
      !/^[A-Za-z\s]+$/.test(formData.middleName)
    )
      errors.middleName = "Middle name must be only letters";
    if (
      (showAll || formTouched.lastName) &&
      (!formData.lastName || !/^[A-Za-z\s]+$/.test(formData.lastName))
    )
      errors.lastName = "Last name is required and only letters";
    if (
      (showAll || formTouched.phone) &&
      (!formData.phone || !/^\d{10}$/.test(formData.phone))
    )
      errors.phone = "Phone must be 10 digits";
    if (
      (showAll || formTouched.email) &&
      (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
    )
      errors.email = "Valid email is required";
    if (
      (showAll || formTouched.gender) &&
      (!formData.gender || formData.gender === "Select Gender")
    )
      errors.gender = "Gender is required";
    if ((showAll || formTouched.dob) && !formData.dob)
      errors.dob = "Date of birth is required";
    if ((showAll || formTouched.addressPerm) && !formData.addressPerm)
      errors.addressPerm = "Permanent address is required";
    if ((showAll || formTouched.addressTemp) && !formData.addressTemp)
      errors.addressTemp = "Temporary address is required";
    if (
      (showAll || formTouched.password) &&
      (!formData.password ||
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(
          formData.password
        ))
    )
      errors.password =
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character";
    if (
      (showAll || formTouched.confirmPassword) &&
      formData.password !== formData.confirmPassword
    )
      errors.confirmPassword = "Passwords do not match";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAppointment = async (formData, aadhaarId, occ) => {
    if (!validateForm(true)) {
      setFormTouched({
        aadhaarId: true,
        firstName: true,
        middleName: true,
        lastName: true,
        phone: true,
        email: true,
        gender: true,
        dob: true,
        addressPerm: true,
        addressTemp: true,
        password: true,
        confirmPassword: true,
      });
      toast.dismiss();
      toast.error("Please fill all required fields correctly.", {
        position: "top-right",
      });
      return;
    }
    try {
      const payload = { ...formData, aadhaarId, occupation: occ };
      await axios.post(
        "https://6801242781c7e9fbcc41aacf.mockapi.io/api/AV1/users",
        payload
      );
      toast.dismiss();
      toast.success("Patient added successfully!", { position: "top-right" });
      setAppointment({
        date: getDate(),
        time: getTime(),
        reason: "",
        diagnosis: "",
      });
      setAppointmentModal(true);
      setModalOpen(false);
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.dismiss();
      toast.error("Failed to create appointment. Please try again.", {
        position: "top-right",
      });
    }
  };

  const viewPatientDetails = async (a) => {
    setSelectedPatient(a);
    setPersonalDetails(null);
    setFamily([]);
    setVitals(null);
    setLoadingDetails(true);
    try {
      const { data: personalData } = await axios.get(
        "https://680cc0c92ea307e081d4edda.mockapi.io/personalHealthDetails"
      );
      const p = personalData.find(
        (p) =>
          (p.email || "").trim().toLowerCase() ===
          (a.email || "").trim().toLowerCase()
      );
      if (p) {
        setPersonalDetails({
          height: p.height,
          weight: p.weight,
          bloodGroup: p.bloodGroup,
          surgeries: p.surgeries,
          allergies: p.allergies,
          isSmoker: p.isSmoker,
          isAlcoholic: p.isAlcoholic,
        });
      }
      try {
        const { data: familyData } = await axios.get(
          "https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData"
        );
        setFamily(
          familyData.filter(
            (f) =>
              (f.email || "").trim().toLowerCase() ===
              (a.email || "").trim().toLowerCase()
          )
        );
      } catch {
        setFamily([]);
      }
      try {
        const { data: vitalsData } = await axios.get(
          "https://6808fb0f942707d722e09f1d.mockapi.io/health-summary"
        );
        const v = vitalsData.find(
          (v) =>
            (v.email || "").trim().toLowerCase() ===
            (a.email || "").trim().toLowerCase()
        );
        setVitals(
          v
            ? {
                bloodPressure: v.bloodPressure || "Not recorded",
                heartRate: v.heartRate || "Not recorded",
                temperature: v.temperature || "Not recorded",
                bloodSugar: v.bloodSugar || "Not recorded",
              }
            : null
        );
      } catch {
        setVitals(null);
      }
    } catch {}
    setLoadingDetails(false);
  };

  // --- Render ---
  return (
    <div className="p-4">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Patients</h2>
      </div>
      <div className="flex justify-between items-center mb-6 w-full">
        <div className="flex gap-4">
          {["OPD", "IPD"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ease-in-out border ${
                activeTab === tab
                  ? "bg-[#0E1630] text-white border-[#0E1630] shadow-lg"
                  : "bg-transparent text-[#01D48C] border-[#01D48C] hover:bg-[#01D48C] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "OPD" && (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search patient by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
              style={{ width: "300px" }}
            />
            <div className="flex gap-2 items-center">
              <button
                onClick={handleOpenAddPatient}
                className="btn btn-primary whitespace-nowrap px-4 py-2 text-xs flex items-center gap-2"
                disabled={appointmentModal}
              >
                <Plus className="w-4 h-4" /> Add Patient
              </button>
            </div>
          </div>
        )}
        {activeTab === "IPD" && (
          <div className="flex flex-row items-center gap-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Patient ID or Name..."
                value={ipdState.search}
                onChange={(e) => S("search", e.target.value)}
                className="pl-8 pr-5 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-xs"
              />
              {ipdState.searching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin w-4 h-4" />
              )}
            </div>
            <button
              onClick={() => S("modalOpen", true)}
              className="btn btn-primary whitespace-nowrap px-4 py-3 text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Patient
            </button>
          </div>
        )}
      </div>

      {/* OPD Table/Modals */}
      {activeTab === "OPD" && (
        <div>
          {showForm ? (
            <FormPage />
          ) : (
            <table className="table-container">
              <thead>
                <tr className="table-head bg-gray-100">
                  {["ID", "Name", "Diagnosis", "Date & Time", "Actions"].map(
                    (h, i) => (
                      <th key={i} className="py-2 border-b">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="table-body overflow-visible">
                {paginatedPatients.filter((p) =>
                  (p?.name || "")
                    .toLowerCase()
                    .includes((searchTerm || "").toLowerCase())
                ).length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  paginatedPatients
                    .filter((p) =>
                      (p?.name || "")
                        .toLowerCase()
                        .includes((searchTerm || "").toLowerCase())
                    )
                    .map((p, i) => (
                      <tr
                        key={p.id}
                        ref={(el) => (rowRefs.current[p.id] = el)}
                        onClick={() => {
                          const strId = String(p.id);
                          if (highlightId.includes(strId)) {
                            setClickedIds((prev) => {
                              const updated = [...prev, strId];
                              localStorage.setItem(
                                "clickedOPDIds",
                                JSON.stringify(updated)
                              );
                              return updated;
                            });
                          }
                        }}
                        className={`text-center hover:bg-gray-50 transition-colors duration-300 ${
                          highlightId.includes(String(p.id)) &&
                          !clickedIds.includes(String(p.id))
                            ? "blink-row font-bold"
                            : ""
                        } overflow-visible`}
                      >
                        <td className="py-1 px-3 ">{p.id}</td>
                        <td className="py-1 px-3">
                          <button
                            className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]"
                            onClick={() => viewPatientDetails(p)}
                          >
                            {p.name}
                          </button>
                        </td>
                        <td className="py-1 px-3 ">{p.diagnosis}</td>
                        <td className="py-1 px-3 ">{p.datetime}</td>
                        <td className="py-1 px-3 overflow-visible relative">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleAddRecord(p)}
                              className="edit-btn"
                            >
                              Visit Pad
                            </button>
                            <TeleConsultFlow phone={p.phone} />
                          </div>
                          {dropdownOpen === i && (
                            <div className="absolute left-1/2 -translate-x-1/2 mt-1 bg-white border rounded-lg shadow-xl min-w-[200px] z-[99999]">
                              {RECORD_TYPES.map(({ id, label, icon: Icon }) => (
                                <button
                                  key={id}
                                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 border-b last:border-b-0 text-left"
                                  onClick={() => {
                                    addForm(id);
                                    setDropdownOpen(null);
                                  }}
                                  type="button"
                                >
                                  <Icon className="text-[var(--accent-color)] text-base" />
                                  <span className="font-medium text-[var(--primary-color)]">
                                    {label}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
          <div className="w-full  flex justify-end mt-4">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      )}

      {/* IPD Table/Modals */}
      {activeTab === "IPD" && (
        <div className="px-4 min-h-screen bg-gray-50">
          <div className="bg-white rounded shadow-sm overflow-hidden animate-fadeIn">
            <div className="overflow-x-auto">
              <table className="table-container min-w-[700px]">
                <thead className="bg-gray-100 ">
                  <tr className="table-head text-xs">
                    {[
                      "ID",
                      "Name",
                      "Admission",
                      "Status",
                      "Diagnosis",
                      "Ward",
                      "Discharge",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className="px-3 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="table-body text-xs">
                  {paginatedIPD.map((p) => (
                    <tr
                      key={p.id}
                      className={`tr-style text-center hover:bg-gray-50 ${
                        recentPatientId === p.id
                          ? "blink-row font-extrabold"
                          : ""
                      }`}
                      onMouseEnter={() =>
                        recentPatientId === p.id && setRecentPatientId(null)
                      }
                    >
                      <td className="px-2 py-1">{p.id}</td>
                      <td className="px-2 py-1">
                        <button
                          className="cursor-pointer text-[var(--primary-color)] hover:text-[var(--accent-color)]"
                          onClick={() => viewIpdPatientDetails(p)}
                        >
                          {p.name ||
                            `${p.firstName || ""} ${p.middleName || ""} ${
                              p.lastName || ""
                            }`
                              .replace(/\s+/g, " ")
                              .trim()}
                        </button>
                      </td>
                      <td className="px-2 py-1">{p.admissionDate}</td>
                      <td className="px-2 py-1">
                        <span
                          className={`status-badge ${
                            p.status === "Admitted"
                              ? "status-admitted"
                              : p.status === "Under Treatment"
                              ? "status-pending"
                              : "status-discharged"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-2 py-1">{p.diagnosis}</td>
                      <td className="px-2 py-1">
                        {[p.wardType, p.wardNo, p.bedNo]
                          .filter(Boolean)
                          .join("-")}
                      </td>
                      <td className="px-2 py-1">{p.dischargeDate || "-"}</td>
                      <td className="px-2 py-1">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAddRecord(p)}
                            className="edit-btn"
                          >
                            Add Record
                          </button>
                          <TeleConsultFlow phone={p.phone} />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedIPD.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-4 text-gray-400 text-center text-xs"
                      >
                        No patients found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="w-full  flex justify-end mt-4">
                <Pagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {appointmentModal && !selectedSearchPatient && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 max-w-lg w-full rounded shadow space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Schedule OPD Appointment
              </h3>
              <button
                onClick={handleCloseAppointmentModal}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <div className="font-semibold">
              Book an appointment for{" "}
              <span className="text-blue-700">
                {formData.firstName || "Patient"}
              </span>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleScheduleAppointment();
              }}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="date"
                  className="input-field"
                  value={appointment.date}
                  onChange={(e) =>
                    setAppointment({ ...appointment, date: e.target.value })
                  }
                />
                <input
                  type="time"
                  className="input-field"
                  value={appointment.time}
                  onChange={(e) =>
                    setAppointment({ ...appointment, time: e.target.value })
                  }
                />
              </div>
              {appointmentErrors.date && (
                <span className="text-red-500 text-xs">
                  {appointmentErrors.date}
                </span>
              )}
              {appointmentErrors.time && (
                <span className="text-red-500 text-xs">
                  {appointmentErrors.time}
                </span>
              )}
              <input
                type="text"
                className="input-field"
                placeholder="Enter Diagnosis"
                value={appointment.diagnosis}
                onChange={(e) =>
                  setAppointment({ ...appointment, diagnosis: e.target.value })
                }
                required
              />
              {appointmentErrors.diagnosis && (
                <span className="text-red-500 text-xs">
                  {appointmentErrors.diagnosis}
                </span>
              )}
              <select
                className="input-field"
                value={appointment.reason}
                onChange={(e) =>
                  setAppointment({ ...appointment, reason: e.target.value })
                }
              >
                <option value="">Select Reason for Visit</option>
                <option>Consultation</option>
                <option>Follow-up</option>
                <option>Test</option>
                <option>Other</option>
              </select>
              {appointmentErrors.reason && (
                <span className="text-red-500 text-xs">
                  {appointmentErrors.reason}
                </span>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="px-6 py-2 rounded-full border border-gray-400 transition-colors duration-200 hover:bg-[var(--color-overlay)] hover:text-white hover:border-[var(--color-overlay)]"
                  onClick={handleCloseAppointmentModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="border-2 border-[var(--accent-color)] bg-transparent text-[var(--accent-color)] px-6 py-2 rounded-full shadow transition-colors duration-300 hover:bg-[var(--accent-color)] hover:text-white disabled:opacity-60"
                  disabled={!appointment.diagnosis || !appointment.reason}
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh] animate-fadeIn">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 transition-colors"
            >
              &times;
            </button>
            <h4 className="text-2xl font-bold text-[#0E1630] mb-4">
              Patient Details
            </h4>
            <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow mb-5">
              <h4 className="font-bold mb-3 border-b pb-2">
                Basic Information
              </h4>
              <h4 className="font-semibold">{selectedPatient.name}</h4>
              <p className="font-semibold">
                Appointment: {selectedPatient.datetime}
              </p>
              <p className="font-semibold">Reason:{selectedPatient.reason}</p>
              <p className="font-semibold">
                Email: {selectedPatient.email || "—"}
              </p>
            </div>
            <div className="space-y-6">
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">
                  Personal Health Details
                </h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : personalDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Height</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.height || "—"} cm
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Weight</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.weight || "—"} kg
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Blood Group</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.bloodGroup || "Not recorded"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No personal health details found.
                  </div>
                )}
              </div>
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">Family History</h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : family && family.length > 0 ? (
                  <div className="space-y-3">
                    {family.map((m, i) => (
                      <div key={i} className="p-3 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="font-semibold">Name</span>
                            <p>{m.name || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Relation</span>
                            <p>{m.relation || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Number</span>
                            <p>{m.number || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Diseases</span>
                            <p>
                              {m.diseases && m.diseases.length
                                ? m.diseases.join(", ")
                                : "No diseases recorded"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No family history recorded for this patient.
                  </div>
                )}
              </div>
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">Vital Signs</h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : vitals ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        Blood Pressure
                      </span>
                      <p className="text-lg font-semibold">
                        {vitals.bloodPressure}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Heart Rate</span>
                      <p className="text-lg font-semibold">
                        {vitals.heartRate}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Temperature</span>
                      <p className="text-lg font-semibold">
                        {vitals.temperature}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Blood Sugar</span>
                      <p className="text-lg font-semibold">
                        {vitals.bloodSugar}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No vital signs recorded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- IPD Modals --- */}
      {/* Modal for Add Patient */}
      {ipdState.modalOpen && !ipdState.showIpdForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(14,22,48,0.18)] backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-[var(--accent-color)] p-8 w-full max-w-2xl animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Patient</h3>
              <button
                onClick={() => S("modalOpen", false)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <form className="space-y-6" onSubmit={handlePatientFormSubmit}>
              <div className="flex flex-col md:flex-row gap-4">
                <div
                  className="floating-input relative flex-1"
                  data-placeholder="Enter PatientId Number"
                >
                  <input
                    className={`input-field peer ${
                      ipdErrors.aadhaarId ? "border-red-500" : ""
                    }`}
                    value={ipdState.aadhaarId}
                    maxLength={12}
                    onChange={(e) =>
                      S("aadhaarId", e.target.value.replace(/\D/g, ""))
                    }
                    placeholder=" "
                    autoComplete="off"
                  />
                  {ipdErrors.aadhaarId && (
                    <span className="text-red-500 text-xs">
                      {ipdErrors.aadhaarId}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={fetchPatient}
                  className="animate-pulse-save text-white px-4 text-sm py-2 rounded self-end md:self-auto"
                  style={{ backgroundColor: "var(--primary-color)" }}
                >
                  Get Patient Details
                </button>
              </div>
              {/* Name fields */}
              <div className="grid md:grid-cols-3 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(0, 2),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
                {renderFields(
                  FIELDS.slice(2, 3),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              {/* Phone, Email, Gender */}
              <div className="grid md:grid-cols-3 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(3, 6),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              {/* DOB, Blood Group, Occupation (Occupation beside Blood Group) */}
              <div className="grid md:grid-cols-3 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(6, 7),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
                {renderFields(
                  FIELDS.slice(7, 8),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
                {renderFields(
                  FIELDS.slice(12, 13),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              {/* Permanent and Temporary Address below that */}
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(8, 10),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              {/* Password and Confirm Password below addresses */}
              <div className="grid md:grid-cols-2 gap-x-4 gap-y-4">
                {renderFields(
                  FIELDS.slice(10, 12),
                  ipdState.formData,
                  F,
                  ipdErrors,
                  ipdState.occList,
                  (v) => S("occList", v)
                )}
              </div>
              <div>
                <label className="font-medium block mb-1">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field w-full"
                />
              </div>
              <div className="flex flex-col md:flex-row justify-end gap-4 pt-2">
                <button
                  type="submit"
                  className="btn btn-primary animate-pulse-save px-6 py-2 shadow-md hover:scale-105 transition-all duration-300"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalOpen && !appointmentModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-4 max-w-2xl w-full rounded shadow overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Add New Patient</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAppointment(formData, aadhaarId, occ);
              }}
            >
              <div className="grid md:grid-cols-3 gap-2 mb-7">
                {["firstName", "middleName", "lastName"].map((field, i) => (
                  <div
                    key={i}
                    className="floating-input relative mb-3"
                    data-placeholder={`${field
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase())}${
                      field !== "middleName" ? "*" : ""
                    }`}
                  >
                    <input
                      className={`input-field peer w-full ${
                        formErrors[field] ? "border-red-500" : ""
                      }`}
                      value={formData[field]}
                      onChange={(e) => {
                        setFormData({ ...formData, [field]: e.target.value });
                        setFormTouched((t) => ({ ...t, [field]: true }));
                        validateForm();
                      }}
                      placeholder=" "
                      autoComplete="off"
                    />
                    <span className="text-red-500 text-xs absolute left-0 -bottom-8">
                      {formTouched[field] && formErrors[field]
                        ? formErrors[field]
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                <div
                  className="floating-input relative mb-6"
                  data-placeholder="Phone Number*"
                >
                  <input
                    className={`input-field peer w-full ${
                      formErrors.phone ? "border-red-500" : ""
                    }`}
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, phone: val });
                      setFormTouched((t) => ({ ...t, phone: true }));
                      validateForm();
                    }}
                    maxLength={10}
                    placeholder=" "
                    autoComplete="off"
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-5">
                    {formTouched.phone && formErrors.phone
                      ? formErrors.phone
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Email Address*"
                >
                  <input
                    className={`input-field peer w-full ${
                      formErrors.email ? "border-red-500" : ""
                    }`}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setFormTouched((t) => ({ ...t, email: true }));
                      validateForm();
                    }}
                    placeholder=" "
                    autoComplete="off"
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formTouched.email && formErrors.email
                      ? formErrors.email
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-8"
                  data-placeholder="Aadhaar Number*"
                >
                  <input
                    className={`input-field peer w-full ${
                      formErrors.aadhaarId ? "border-red-500" : ""
                    }`}
                    value={aadhaarId}
                    maxLength={12}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setAadhaarId(val);
                      setFormTouched((t) => ({ ...t, aadhaarId: true }));
                      validateForm();
                    }}
                    placeholder=" "
                    autoComplete="off"
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-5">
                    {formTouched.aadhaarId && formErrors.aadhaarId
                      ? formErrors.aadhaarId
                      : ""}
                  </span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-2 mb-1">
                {/* Gender */}
                <div className="floating-input relative mb-1">
                  <select
                    className={`input-field w-full ${
                      formErrors.gender ? "border-red-500" : ""
                    }`}
                    value={formData.gender}
                    onChange={(e) => {
                      setFormData({ ...formData, gender: e.target.value });
                      setFormTouched((t) => ({ ...t, gender: true }));
                      validateForm();
                    }}
                  >
                    <option>Select Gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                  <span className="text-red-500 text-xs absolute left-0 -bottom-1">
                    {formTouched.gender && formErrors.gender
                      ? formErrors.gender
                      : ""}
                  </span>
                </div>
                {/* DOB */}
                <div
                  className="floating-input relative mb-6"
                  data-placeholder="Date of Birth*"
                >
                  <input
                    type="date"
                    className={`input-field peer w-full ${
                      formErrors.dob ? "border-red-500" : ""
                    }`}
                    value={formData.dob}
                    onChange={(e) => {
                      setFormData({ ...formData, dob: e.target.value });
                      setFormTouched((t) => ({ ...t, dob: true }));
                      validateForm();
                    }}
                    placeholder=" "
                    autoComplete="off"
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-6">
                    {formTouched.dob && formErrors.dob ? formErrors.dob : ""}
                  </span>
                </div>
                {/* Occupation */}
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Occupation"
                >
                  <SuggestInput
                    val={occ}
                    setVal={setOcc}
                    list={occList}
                    setList={setOccList}
                    data={occOpt}
                    placeholder="Occupation"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-2">
                <div
                  className="floating-input relative mb-3"
                  data-placeholder="Permanent Address*"
                >
                  <textarea
                    placeholder=" "
                    className={`input-field peer w-full ${
                      formErrors.addressPerm ? "border-red-500" : ""
                    }`}
                    value={formData.addressPerm}
                    onChange={(e) => {
                      setFormData({ ...formData, addressPerm: e.target.value });
                      setFormTouched((t) => ({ ...t, addressPerm: true }));
                      validateForm();
                    }}
                    autoComplete="off"
                    rows={1}
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-4">
                    {formTouched.addressPerm && formErrors.addressPerm
                      ? formErrors.addressPerm
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Temporary Address*"
                >
                  <textarea
                    placeholder=" "
                    className={`input-field peer w-full ${
                      formErrors.addressTemp ? "border-red-500" : ""
                    }`}
                    value={formData.addressTemp}
                    onChange={(e) => {
                      setFormData({ ...formData, addressTemp: e.target.value });
                      setFormTouched((t) => ({ ...t, addressTemp: true }));
                      validateForm();
                    }}
                    autoComplete="off"
                    rows={1}
                  />
                  <span className="text-red-500 text-xs absolute left-0 -bottom-4">
                    {formTouched.addressTemp && formErrors.addressTemp
                      ? formErrors.addressTemp
                      : ""}
                  </span>
                </div>
                <div
                  className="relative floating-input mb-1"
                  data-placeholder="Upload Photo"
                >
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field peer w-full mb-5"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-2">
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Create Password"
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder=" "
                    className={`input-field peer pr-10 w-full mb-5 ${
                      formErrors.password ? "border-red-500" : ""
                    }`}
                    autoComplete="off"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setFormTouched((t) => ({ ...t, password: true }));
                      validateForm();
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/3 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <span className="text-red-500 text-xs absolute left-0 -bottom-8 block min-h-[1rem]">
                    {formTouched.password && formErrors.password
                      ? formErrors.password
                      : ""}
                  </span>
                </div>
                <div
                  className="floating-input relative mb-1"
                  data-placeholder="Confirm Password"
                >
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder=" "
                    className={`input-field peer pr-10 w-full mb-3 ${
                      formErrors.confirmPassword ? "border-red-500" : ""
                    }`}
                    autoComplete="off"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      });
                      setFormTouched((t) => ({ ...t, confirmPassword: true }));
                      validateForm();
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/3 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowConfirm((v) => !v)}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  <span className="text-red-500 text-xs absolute left-0 -bottom-2 block min-h-[1rem]">
                    {formTouched.confirmPassword && formErrors.confirmPassword
                      ? formErrors.confirmPassword
                      : ""}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700"
                >
                  {" "}
                  ADD Patient{" "}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for IPD Details */}
      {ipdState.modalOpen && ipdState.showIpdForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(14,22,48,0.18)] backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-[var(--primary-color)] p-8 w-full max-w-xl animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">IPD Details</h3>
              <button
                onClick={handleCloseIpdModal}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <form className="space-y-6" onSubmit={handleIPDFormSubmit}>
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-x-4 gap-y-4">
                  {renderFields(IPD, ipdState.ipdData, I, ipdErrors)}
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-end gap-4 pt-2">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-6 py-2 rounded shadow hover:bg-gray-500 animated-cancel-btn"
                  onClick={handleCloseIpdModal}
                >
                  {ipdState.editModalOpen ? "Cancel" : "Back"}
                </button>
                <button
                  type="submit"
                  disabled={ipdState.saving}
                  className="btn btn-primary animate-pulse-save flex items-center gap-2 disabled:opacity-50 px-6 py-2 shadow-md hover:scale-105 transition-all duration-300"
                >
                  {ipdState.saving && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  {ipdState.editModalOpen ? "Save" : "Add Patient to IPD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ward Selection Modal */}
      {wardModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Select Ward Details</h3>
              <button
                onClick={handleWardModalClose}
                className="text-gray-500 hover:text-red-600 text-xl"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2"></label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={wardSelection.wardType}
                  onChange={(e) =>
                    setWardSelection({
                      ...wardSelection,
                      wardType: e.target.value,
                    })
                  }
                >
                  <option value="">Select Ward Type</option>
                  {WARD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ward Number
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={wardSelection.wardNumber}
                  onChange={(e) =>
                    setWardSelection({
                      ...wardSelection,
                      wardNumber: e.target.value,
                    })
                  }
                >
                  <option value="">Select Ward Number</option>
                  {WARD_NUMBERS.map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bed Number
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={wardSelection.bedNumber}
                  onChange={(e) =>
                    setWardSelection({
                      ...wardSelection,
                      bedNumber: e.target.value,
                    })
                  }
                >
                  <option value="">Select Bed Number</option>
                  {BED_NUMBERS.map((bed) => (
                    <option key={bed} value={bed}>
                      {bed}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleWardModalClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWardSelectionConfirm}
                disabled={
                  !wardSelection.wardType ||
                  !wardSelection.wardNumber ||
                  !wardSelection.bedNumber
                }
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh] animate-fadeIn">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-red-500 transition-colors"
            >
              &times;
            </button>
            <h4 className="text-2xl font-bold text-[#0E1630] mb-4">
              Patient Details
            </h4>
            <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow mb-5">
              <h4 className="font-bold mb-3 border-b pb-2">
                Basic Information
              </h4>
              <h4 className="font-semibold">{selectedPatient.name}</h4>
              <p className="font-semibold">
                Appointment: {selectedPatient.datetime}
              </p>
              <p className="font-semibold">Reason:{selectedPatient.reason}</p>
              <p className="font-semibold">
                Email: {selectedPatient.email || "—"}
              </p>
            </div>
            <div className="space-y-6">
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">
                  Personal Health Details
                </h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : personalDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Height</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.height || "—"} cm
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Weight</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.weight || "—"} kg
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Blood Group</span>
                      <p className="text-lg font-semibold">
                        {personalDetails.bloodGroup || "Not recorded"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No personal health details found.
                  </div>
                )}
              </div>
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">Family History</h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : family && family.length > 0 ? (
                  <div className="space-y-3">
                    {family.map((m, i) => (
                      <div key={i} className="p-3 border rounded-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <span className="font-semibold">Name</span>
                            <p>{m.name || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Relation</span>
                            <p>{m.relation || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Number</span>
                            <p>{m.number || "—"}</p>
                          </div>
                          <div>
                            <span className="font-semibold">Diseases</span>
                            <p>
                              {m.diseases && m.diseases.length
                                ? m.diseases.join(", ")
                                : "No diseases recorded"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No family history recorded for this patient.
                  </div>
                )}
              </div>
              <div className="border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold mb-3 border-b pb-2">Vital Signs</h4>
                {loadingDetails ? (
                  <div>Loading...</div>
                ) : vitals ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        Blood Pressure
                      </span>
                      <p className="text-lg font-semibold">
                        {vitals.bloodPressure}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Heart Rate</span>
                      <p className="text-lg font-semibold">
                        {vitals.heartRate}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Temperature</span>
                      <p className="text-lg font-semibold">
                        {vitals.temperature}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Blood Sugar</span>
                      <p className="text-lg font-semibold">
                        {vitals.bloodSugar}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No vital signs recorded
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Patient Details */}
      {ipdState.selectedPatient && !ipdState.editModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-[rgba(14,22,48,0.18)] backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-[var(--primary-color)] p-6 w-full max-w-xl relative overflow-y-auto max-h-[90vh] animate-slideUp">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-bold text-[#0E1630]">
                Patient Details
              </h4>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleEdit}
                  className="btn btn-primary px-6 py-2 shadow-md hover:scale-105 transition-all duration-300 gap-2 flex items-center"
                  title="Edit"
                  type="button"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => S("selectedPatient", null)}
                  className="modal-close-btn text-xl text-gray-400 hover:text-red-500"
                  type="button"
                  title="Close"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="border p-2 rounded mb-2">
              <h4 className="font-bold mb-1 border-b pb-1 text-xs">
                Basic Info
              </h4>
              <div className="text-xs">
                {ipdState.selectedPatient.name} | Admission:{" "}
                {ipdState.selectedPatient.admissionDate}{" "}
                {ipdState.selectedPatient.admissionTime} | Status:{" "}
                {ipdState.selectedPatient.status}
              </div>
              <div className="text-xs">
                Reason: {ipdState.selectedPatient.reasonForAdmission}
              </div>
            </div>
            <div className="space-y-2">
              <div className="border p-2 rounded">
                <h4 className="font-bold mb-1 border-b pb-1 text-xs">Health</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {["height", "weight", "bloodGroup"].map((k, i) => (
                    <div key={i}>
                      {k.charAt(0).toUpperCase() + k.slice(1)}:{" "}
                      {ipdState.personalDetails?.[k] ||
                        ipdState.selectedPatient[k] ||
                        (k === "bloodGroup" ? "Not recorded" : "—")}
                      {k === "height" && " cm"}
                      {k === "weight" && " kg"}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border p-2 rounded">
                <h4 className="font-bold mb-1 border-b pb-1 text-xs">
                  Treatment
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["Dept", "department"],
                    ["Doctor", "doctorInCharge"],
                    ["Treatment", "treatmentPlan"],
                    ["Surgery", "surgeryRequired"],
                  ].map(([label, key], i) => (
                    <div key={i}>
                      {label}: {ipdState.selectedPatient[key] || "—"}
                    </div>
                  ))}
                </div>
              </div>
              <div className="border p-2 rounded">
                <h4 className="font-bold mb-1 border-b pb-1 text-xs">
                  Contact & Address
                </h4>
                <div className="text-xs">
                  <div>
                    Permanent Address:{" "}
                    {ipdState.selectedPatient.permanentAddress || "—"}
                  </div>
                  <div>
                    Temporary Address:{" "}
                    {ipdState.selectedPatient.temporaryAddress || "—"}
                  </div>
                  <div>Email: {ipdState.selectedPatient.email || "—"}</div>
                  <div>DOB: {ipdState.selectedPatient.dob || "—"}</div>
                  <div>
                    Occupation: {ipdState.selectedPatient.occupation || "—"}
                  </div>
                  <div>
                    Blood Group: {ipdState.selectedPatient.bloodGroup || "—"}
                  </div>
                  <div>
                    Password:{" "}
                    {ipdState.selectedPatient.password ? "******" : "—"}
                  </div>
                  <div>
                    Confirm Password:{" "}
                    {ipdState.selectedPatient.confirmPassword ? "******" : "—"}
                  </div>
                </div>
              </div>
              <div className="border p-2 rounded">
                <h4 className="font-bold mb-1 border-b pb-1 text-xs">Vitals</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ["BP", "bloodPressure"],
                    ["HR", "heartRate"],
                    ["Temp", "temperature"],
                    ["Sugar", "bloodSugar"],
                  ].map(([label, key], i) => (
                    <div key={i}>
                      {label}:{" "}
                      {ipdState.vitals?.[key] ||
                        ipdState.selectedPatient.vitals?.[key] ||
                        "—"}
                    </div>
                  ))}
                </div>
              </div>
              {ipdState.family && ipdState.family.length > 0 && (
                <div className="border p-2 rounded">
                  <h4 className="font-bold mb-1 border-b pb-1 text-xs">
                    Family
                  </h4>
                  <ul className="text-xs list-disc pl-4">
                    {ipdState.family.map((f, i) => (
                      <li key={i}>
                        {f.name} ({f.relation})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}