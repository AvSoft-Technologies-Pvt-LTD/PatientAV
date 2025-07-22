import React, { useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
import { BiErrorCircle } from "react-icons/bi";
import { FaShieldAlt, FaFileMedical, FaMoneyBillWave, FaCalendarAlt, FaUserShield, FaBuilding, FaIdCard, FaHospital, FaUserFriends, FaRupeeSign, FaExclamationCircle, FaChartLine, FaChevronDown, FaChevronUp } from "react-icons/fa";
const Insurance = () => {
  const [state, setState] = useState({
    insuranceInfo: null, mobileNumber: "", loading: false, error: "", message: "",
    showEnrollmentForm: false, showInsuranceModal: false, showAllDetails: false,
    formData: { diagnosis: "", sumAssured: "", policyType: "", duration: "" }
  });const policyTypes = ["Individual Health Insurance", "Family Health Insurance", "Critical Illness Insurance", "Senior Citizen Health Insurance"];
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
  const updateFormData = (updates) => setState(prev => ({ ...prev, formData: { ...prev.formData, ...updates } }));
  const fetchInsuranceData = async (mobile) => {
    if (!mobile) return;
    updateState({ loading: true, error: "" });
    try {  const { data: apiData } = await axios.get("https://run.mocky.io/v3/1b899ece-a1d7-4467-850b-e3a30471214b");
      if (apiData?.[mobile]) {
        updateState({ insuranceInfo: apiData[mobile], message: "", showInsuranceModal: true, showAllDetails: false });
      } else {
        updateState({ insuranceInfo: null, message: "No insurance found for this number. You can enroll for a new policy." });
      }} catch (err) {
      console.error("Error fetching insurance data:", err);
      updateState({ error: "Unable to fetch insurance data. Please try again later.", insuranceInfo: null });
    } finally {updateState({ loading: false }); }};
  const InsuranceDetailCard = ({ icon: Icon, title, value, className = "" }) => (
    <div className={`flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300 ${className}`}>
      <div className="p-2 rounded-lg bg-[var(--primary-color)]/5"><Icon className="text-[var(--primary-color)] text-lg" /></div>
      <div><h4 className="paragraph">{title}</h4><p className="paragraph">{value}</p></div> </div>);
  return (
    <div className="pt-6 mt-6 bg-white p-6 rounded-2xl shadow-lg">
      <p className="h3-heading mb-4">Insurance Management</p>
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <form onSubmit={(e) => { e.preventDefault(); if (state.mobileNumber) { fetchInsuranceData(state.mobileNumber); updateState({ showEnrollmentForm: false }); } }} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow">
  <div className="floating-input relative w-full" data-placeholder="Enter Mobile Number">
    <input
      type="text"
      placeholder=" "
      className="input-field peer"
      value={state.mobileNumber}
      onChange={e => updateState({ mobileNumber: e.target.value })}
    />
  </div>
</div>
          <div className="flex gap-2 self-end">
            <button type="submit" className="btn btn-primary">Fetch Insurance</button>
            <button type="button" onClick={() => updateState({ showEnrollmentForm: true, insuranceInfo: null })} className="btn btn-secondary">New Enrollment</button></div></form>  </div>
      {state.loading && <div className="text-center my-3"><div className="inline-block animate-spin rounded-full h-6 w-6 border-3 border-[var(--primary-color)] border-t-transparent"></div><p className="paragraph">Loading...</p></div>}
      {state.error && <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded-md flex items-start"><BiErrorCircle className="text-red-500 mr-2 text-lg" /><p className="paragraph">{state.error}</p></div>}
      {state.message && <div className="mt-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md"><p className="paragraph">{state.message}</p></div>}
      {state.showInsuranceModal && state.insuranceInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl shadow-lg w-full max-w-xl relative">
            <button onClick={() => updateState({ showInsuranceModal: false })} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><IoClose size={20} /></button>
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div><p className="paragraph">{state.insuranceInfo.policyType}</p><p className="paragraph">{state.insuranceInfo.insurerName}</p></div>
                <div className="text-right mt-4"><p className="paragraph">Policy Number</p><p className="paragraph">{state.insuranceInfo.policyNumber}</p></div>
              </div></div><div className="grid grid-cols-3 gap-3 mb-4">
              {[  { label: "Sum Assured", value: `₹${state.insuranceInfo.sumAssured}` },
                { label: "Premium", value: `₹${state.insuranceInfo.premiumAmount}/yr` },
                { label: "Coverage", value: state.insuranceInfo.coverageType }
              ].map((item, i) => (
                <div key={i} className="bg-[var(--primary-color)]/5 p-3 rounded-lg">
                  <p className="paragraph">{item.label}</p><p className="paragraph">{item.value}</p></div> ))} </div>
            <div className="border-t pt-3">
              <button onClick={() => updateState({ showAllDetails: !state.showAllDetails })} className="w-full flex items-center justify-between hover:text-[var(--primary-color)] transition-colors">
                <p className="paragraph">View All Details</p>{state.showAllDetails ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}</button>
              {state.showAllDetails && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[{ icon: FaFileMedical, title: "Diagnosis", value: state.insuranceInfo.diagnosis },
                    { icon: FaCalendarAlt, title: "Policy Duration", value: `${state.insuranceInfo.duration} Years` },
                    { icon: FaUserShield, title: "Enrolled Date", value: state.insuranceInfo.enrolledDate },
                    { icon: FaUserFriends, title: "Nominee", value: state.insuranceInfo.nominee },
                    { icon: FaExclamationCircle, title: "Pre-existing Cover", value: state.insuranceInfo.preExistingCover },
                    { icon: FaChartLine, title: "Claim Limit", value: `₹${state.insuranceInfo.claimLimit}` }
                  ].map((item, i) => <InsuranceDetailCard key={i} {...item} />)}
                </div>)} </div> <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => updateState({ showInsuranceModal: false })} className="btn btn-secondary">Close</button>
            </div></div></div>)}
    {state.showEnrollmentForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-5 rounded-xl shadow-lg w-full max-w-md relative">
      <button onClick={() => updateState({ showEnrollmentForm: false })} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><IoClose size={20} /></button>
      <div className="mb-4">
        <p className="paragraph">New Insurance Enrollment</p>
        <p className="paragraph">Fill in your details to get started</p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Enrollment submitted. We'll contact you shortly!");
          updateState({
            showEnrollmentForm: false,
            formData: { diagnosis: "", sumAssured: "", policyType: "", duration: "" }
          });
        }}
        className="space-y-3"
      >
        <div className="floating-input relative w-full" >
          <select
            value={state.formData.policyType}
            onChange={e => updateFormData({ policyType: e.target.value })}
            className="input-field peer"
            required
            placeholder=" "
          >
            <option value="">Select Policy</option>
            {policyTypes.map((type, i) => (
              <option key={i} value={type}>{type}</option>
            ))}
          </select>
        </div>
        {[
          { label: "Diagnosis", field: "diagnosis", type: "text" },
          { label: "Sum Required", field: "sumAssured", type: "text" },
          { label: "Duration (Years)", field: "duration", type: "number", props: { min: "1", max: "30" } }
        ].map((item, i) => (
          <div className="floating-input relative w-full" data-placeholder={item.label} key={i}>
            <input
              type={item.type}
              value={state.formData[item.field]}
              onChange={e => updateFormData({ [item.field]: e.target.value })}
              className="input-field peer"
              required
              placeholder=" "
              {...item.props}
            />
          </div>
        ))}
        <button type="submit" className="btn btn-primary mx-auto">Submit Enrollment</button>
      </form>
    </div>
  </div>
)}</div>);};
export default Insurance;
