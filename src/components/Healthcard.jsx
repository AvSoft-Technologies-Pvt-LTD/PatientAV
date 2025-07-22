import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaDownload, FaArrowLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import AVCard from "./microcomponents/AVCard";
import axios from "axios";

function Healthcard() {
  const userData = useSelector(s => s.auth.user);
  const [healthId, setHealthId] = useState(""), [state, setState] = useState(""), [city, setCity] = useState(""), [isCardGenerated, setIsCardGenerated] = useState(false);
  const navigate = useNavigate(), cardRef = useRef();

  useEffect(() => {
    const storedId = localStorage.getItem("healthId");
    if (storedId) { setHealthId(storedId); setIsCardGenerated(true); }
  }, []);

  const generateHealthId = (g, s, c, d) => (!g || !s || !c || !d) ? "" : `AV${g.charAt(0).toUpperCase()}${s}${c}${d.replace(/-/g, "")}`;

  const handleGenerateCard = async () => {
    if (!state || !city) return alert("Please select both State and City.");
    if (!userData.aadhaar) return alert("User Aadhaar number is required.");
    const genId = generateHealthId(userData.gender, state, city, userData.dob);
    if (!genId) return alert("Unable to generate Health ID.");
    try {
      const { data } = await axios.get("https://6810972027f2fdac2411f6a5.mockapi.io/healthcard");
      const existing = data.find(c => c.aadhaar === userData.aadhaar);
      if (existing) {
        setHealthId(existing.healthId);
        localStorage.setItem("healthId", existing.healthId);
        return setIsCardGenerated(true);
      }
      await axios.post("https://6810972027f2fdac2411f6a5.mockapi.io/healthcard", {
        firstName: userData.firstName, lastName: userData.lastName, gender: userData.gender,
        phone: userData.phone, dob: userData.dob, aadhaar: userData.aadhaar,
        state, city, email: userData.email || "", healthId: genId
      });
      setHealthId(genId);
      localStorage.setItem("healthId", genId);
      setIsCardGenerated(true);
    } catch (e) { console.error(e); alert("Error generating health card. Please try again."); }
  };

  if (isCardGenerated) return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-surface)] p-10 print:bg-[var(--color-surface)]">
      <div className="max-w-md w-full flex flex-col items-center gap-4">
        <AVCard
          initialName={`${userData?.firstName || "First"} ${userData?.lastName || "Last"}`}
          initialCardNumber={healthId}
          initialGender={userData?.gender || ""}
          initialPhoneNumber={userData?.phone || ""}
          initialPhotoUrl="/default-avatar.png"
          initialDob={userData?.dob || ""}
          isReadOnly ref={cardRef}
        />
        <div className="w-full flex justify-between mt-4">
          <button onClick={() => setIsCardGenerated(false)} className="flex items-center gap-2 text-gray-800 font-semibold py-2 px-4 rounded-lg"><FaArrowLeft /> Back</button>
          <button onClick={() => { const t=document.title; document.title="AV Health Card"; window.print(); document.title=t; }} className="flex items-center gap-2 bg-[var(--primary-color)] text-[var(--color-surface)] font-semibold py-2 px-4 rounded-lg hover:bg-[#123456]"><FaDownload /> Download</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#f5f9fc] flex items-center justify-center px-4 py-10">
      <div className="bg-[var(--color-surface)] rounded-3xl shadow-lg p-6 md:p-10 w-full max-w-6xl flex flex-col md:flex-row gap-10">
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <AVCard
            initialName={`${userData?.firstName || "First"} ${userData?.lastName || "Last"}`}
            initialCardNumber=""
            initialGender={userData?.gender || ""}
            initialPhoneNumber={userData?.phone || ""}
            initialPhotoUrl="/default-avatar.png"
            initialDob={userData?.dob || ""}
            isReadOnly
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-[var(--primary-color)]">Welcome to <span className="text-[var(--accent-color)]">AV Swasthya</span></h1>
          <form className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><strong>First Name:</strong> {userData?.firstName || "N/A"}</div>
              <div><strong>Last Name:</strong> {userData?.lastName || "N/A"}</div>
              <div><strong>DOB:</strong> {userData?.dob || "N/A"}</div>
              <div><strong>Gender:</strong> {userData?.gender || "N/A"}</div>
              <div><strong>Phone:</strong> {userData?.phone || "N/A"}</div>
              <div><strong>Aadhaar:</strong> {userData?.aadhaar || "N/A"}</div>
            </div>
            <div className="flex gap-2 mb-4">
              <select className=" w-1/2 input-field" value={state} onChange={e => setState(e.target.value)} aria-label="Select State">
                <option value="">State</option><option value="MH">Maharashtra</option><option value="DL">Delhi</option><option value="KA">Karnataka</option>
              </select>
              <select className=" w-1/2 input-field" value={city} onChange={e => setCity(e.target.value)} aria-label="Select City">
                <option value="">City</option><option value="CSTM">Mumbai (CSTM)</option><option value="NDLS">New Delhi (NDLS)</option><option value="SBC">Bangalore (SBC)</option>
              </select>
            </div>
            <div className="flex gap-4 mt-6 justify-center">
              <button type="button" className="btn btn-primary group" onClick={handleGenerateCard}>
  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
    Generate Healthcard
  </span>
</button>
              <button type="button" className="flex px-2 view-btn" onClick={() => navigate("/login")}>Skip & Continue <FaArrowRight className="m-1" /></button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Healthcard;
