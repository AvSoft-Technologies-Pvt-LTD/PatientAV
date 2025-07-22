
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { CircleUser, Heart, Users, ClipboardCheck } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import DashboardOverview from './DashboardOverview';
const API_BASE_URL = 'https://680cc0c92ea307e081d4edda.mockapi.io';
const FAMILY_API_URL = 'https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData';
const defaultFamilyMember = { name: '', relation: '', number: '', diseases: [], email: '' };
const initialUserData = { name: '', email: '', gender: '', phone: '', dob: '', bloodGroup: '', height: '', weight: '', isAlcoholic: false, isSmoker: false, allergies: '', surgeries: '', familyHistory: { diabetes: false, cancer: false, heartDisease: false, mentalHealth: false, disability: false }, familyMembers: [], additionalDetails: { provider: '', policyNumber: '', coverageType: '', startDate: '', endDate: '', coverageAmount: '', primaryHolder: false } };

function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);
  const [userData, setUserData] = useState(initialUserData);
  const [activeSection, setActiveSection] = useState('basic');
  const [showModal, setShowModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(25);
  const [familyInput, setFamilyInput] = useState(defaultFamilyMember);
  const [feedbackMessage, setFeedbackMessage] = useState({ show: false, message: '', type: '' });

 useEffect(() => { const fetchUserData = async () => { try { if (!user?.email) return showFeedback('Please login', 'error'), navigate('/login'), void 0; let healthData = JSON.parse(localStorage.getItem('userData') || null); if (!healthData || healthData.email !== user.email) { try { const healthResponse = await axios.get(`${API_BASE_URL}/personalHealthDetails?email=${encodeURIComponent(user.email)}`); healthData = healthResponse.data[0] || { ...initialUserData, email: user.email, name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim() }; if (!healthResponse.data.length) { const response = await axios.post(`${API_BASE_URL}/personalHealthDetails`, healthData); healthData = { ...healthData, id: response.data.id }; } try { const familyResponse = await axios.get(`${FAMILY_API_URL}?email=${user.email}`); healthData.familyMembers = familyResponse.data; } catch { healthData.familyMembers = []; } localStorage.setItem('userData', JSON.stringify(healthData)); } catch { healthData = { ...initialUserData, email: user.email, name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim() }; localStorage.setItem('userData', JSON.stringify(healthData)); } } setUserData(healthData); } catch { showFeedback('Error loading user data', 'error'); } }; fetchUserData(); }, [user, navigate]);
const getSectionCompletionStatus = () => ({ basic: true, personal: Boolean(userData.height && userData.weight && userData.bloodGroup), family: Boolean(userData.familyMembers.length > 0) });
useEffect(() => { const c = getSectionCompletionStatus(); setProfileCompletion(Math.round((Object.values(c).filter(Boolean).length / Object.keys(c).length) * 100)); }, [userData]);
const showFeedback = (message, type = 'success') => {
    setFeedbackMessage({ show: true, message, type });
    setTimeout(() => setFeedbackMessage({ show: false, message: '', type: '' }), 3000);
  };
const saveUserData = async updatedData => { try { if (!user?.email) return showFeedback('Please login to save data', 'error'), false; const payload = { ...updatedData, email: user.email, name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim() }; if (!updatedData.id) { const response = await axios.post(`${API_BASE_URL}/personalHealthDetails`, payload); setUserData({ ...updatedData, id: response.data.id, email: user.email }); localStorage.setItem('userData', JSON.stringify({ ...updatedData, id: response.data.id, email: user.email })); showFeedback('Data saved successfully'); } else { await axios.put(`${API_BASE_URL}/personalHealthDetails/${updatedData.id}`, payload); setUserData(updatedData); localStorage.setItem('userData', JSON.stringify(updatedData)); showFeedback('Data updated successfully'); } return true; } catch { showFeedback('Failed to save data', 'error'); return false; } };
const handlePersonalHealthSubmit = async e => { e.preventDefault(); if (!user?.email) return showFeedback('Please login to save data', 'error'); const f = new FormData(e.currentTarget); const d = { height: f.get('height') || '', weight: f.get('weight') || '', bloodGroup: f.get('bloodGroup') || '', surgeries: f.get('surgeries') || '', allergies: f.get('allergies') || '', isSmoker: f.get('isSmoker') === 'on', isAlcoholic: f.get('isAlcoholic') === 'on', name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim(), email: user.email, id: userData.id }; try { if (d.id) { await axios.put(`${API_BASE_URL}/personalHealthDetails/${d.id}`, d); setUserData(prev => ({ ...prev, ...d })); localStorage.setItem('userData', JSON.stringify({ ...userData, ...d })); showFeedback('Personal health data updated'); } else { const r = await axios.post(`${API_BASE_URL}/personalHealthDetails`, d); setUserData({ ...userData, ...d, id: r.data.id }); localStorage.setItem('userData', JSON.stringify({ ...userData, ...d, id: r.data.id })); showFeedback('Personal health data saved'); } setShowModal(false); } catch (error) { showFeedback('Failed to save personal health data', 'error'); } };
const handleAdditionalDetailsSubmit = async e => { e.preventDefault(); const f = new FormData(e.currentTarget); const d = { ...userData, additionalDetails: { provider: f.get('provider') || '', policyNumber: f.get('policyNumber') || '', coverageType: f.get('coverageType') || '', startDate: f.get('startDate') || '', endDate: f.get('endDate') || '', coverageAmount: f.get('coverageAmount') || '', primaryHolder: f.get('primaryHolder') === 'on' } }; if (await saveUserData(d)) setShowModal(false); };
 const handleFamilyInputChange = e => setFamilyInput(prev => ({ ...prev, [e.target.name]: e.target.value }));
 const handleDiseaseCheckbox = e => setFamilyInput(prev => ({ ...prev, diseases: e.target.checked ? [...prev.diseases, e.target.value] : prev.diseases.filter(d => d !== e.target.value) }));
const handleAddFamilyMember = async e => { e.preventDefault(); if (!user?.email) return showFeedback('Please login to add family member', 'error'); if (!familyInput.name || !familyInput.relation) return showFeedback('Name & relation required', 'warning'); try { const d = { ...familyInput, email: user.email }; familyInput.id ? await axios.put(`${FAMILY_API_URL}/${familyInput.id}`, d) : await axios.post(FAMILY_API_URL, d); const r = await axios.get(`${FAMILY_API_URL}?email=${user.email}`); setUserData({ ...userData, familyMembers: r.data }); localStorage.setItem('userData', JSON.stringify({ ...userData, familyMembers: r.data })); setFamilyInput(defaultFamilyMember); showFeedback('Family member saved'); } catch { showFeedback('Failed to save family member', 'error'); } };
const handleDeleteFamilyMember = async id => { try { await axios.delete(`${FAMILY_API_URL}/${id}`); const r = await axios.get(`${FAMILY_API_URL}?email=${user.email}`); setUserData(prev => ({ ...prev, familyMembers: r.data })); showFeedback('Family member deleted'); } catch { showFeedback('Failed to delete family member', 'error'); } };
 const handleGenerateCard = () => navigate("/healthcard");

  const sections = [
    { id: 'basic', name: 'Basic Details', icon: 'user' },
    { id: 'personal', name: 'Personal Health', icon: 'heart' },
    { id: 'family', name: 'Family Details', icon: 'users' }
  ];
  const completionStatus = getSectionCompletionStatus();

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
    <div className="bg-[var(--primary-color)] text-[var(--color-surface)] p-3 sm:p-7 rounded-xl overflow-x-auto">
  <div className="flex flex-nowrap items-center gap-6 min-w-max"><div className="relative w-24 h-24 shrink-0"><div className="w-full h-full rounded-full bg-[var(--color-surface)]/60 flex items-center justify-center"><svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 36 36"><circle className="text-[var(--color-surface)]" strokeWidth="1" stroke="currentColor" fill="none" r="16" cx="18" cy="18" /><circle className="text-[var(--accent-color)]" strokeWidth="2" strokeDasharray="100" strokeDashoffset={100 - profileCompletion} strokeLinecap="round" stroke="currentColor" fill="none" r="16" cx="18" cy="18" /></svg><CircleUser className="w-16 h-16 text-[var(--color-surface)]" /></div><div className="absolute -bottom-1 -right-1 bg-[var(--accent-color)] text-[var(--primary-color)] font-bold px-3 py-1 rounded-full text-xs">{profileCompletion}%</div></div><div className="flex flex-nowrap items-center gap-6"><div className="flex flex-col"><span className="text-sm text-[var(--accent-color)]">Name</span><span className="text-lg">{user?.firstName || "Guest"} {user?.lastName || ""}</span></div><div className="h-8 w-px bg-[var(--color-surface)]" /><div className="flex flex-col"><span className="text-sm text-[var(--accent-color)]">DOB</span><span className="text-lg">{user?.dob || "N/A"}</span></div><div className="h-8 w-px bg-[var(--color-surface)]" /><div className="flex flex-col"><span className="text-sm text-[var(--accent-color)]">Gender</span><span className="text-lg">{user?.gender || "N/A"}</span></div><div className="h-8 w-px bg-[var(--color-surface)]" /><div className="flex flex-col"><span className="text-sm text-[var(--accent-color)]">Phone</span><span className="text-lg">{user?.phone || "N/A"}</span></div><div className="h-8 w-px bg-[var(--color-surface)]" /><div className="flex flex-col"><span className="text-sm text-[var(--accent-color)]">Blood Group</span><span className="text-lg">{userData.bloodGroup || "Not Set"}</span></div></div>
<button onClick={handleGenerateCard} className="shrink-0 px-4 py-4 rounded bg-[var(--accent-color)] font-semibold text-sm text-[var(--color-surface)]">Generate Health Card</button></div>
</div>
  <div className="mt-6 flex gap-4 flex-wrap">{sections.map(section => { const isActive = activeSection === section.id, isCompleted = completionStatus[section.id]; return (<button key={section.id} onClick={() => { setActiveSection(section.id); if (section.id !== 'basic') setShowModal(true); }} className={`btn ${isActive ? 'btn btn-primary' : 'btn btn-primary'} text-sm`}>{section.icon === 'user' && <CircleUser className="w-5 h-5" />}{section.icon === 'heart' && <Heart className="w-5 h-5" />}{section.icon === 'users' && <Users className="w-5 h-5" />}{section.name}{isCompleted && <ClipboardCheck className="text-[var(--accent-color)] ml-1 animate-pulse" />}</button>); })}<button onClick={() => { setActiveSection('additional'); setShowModal(true); }} className="btn btn-primary">Additional Details</button></div>

      {feedbackMessage.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} transition-all`}>
          {feedbackMessage.message}
        </div>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-[var(--color-surface)] rounded-xl p-6 w-full max-w-xl mx-4">
            {activeSection === 'personal' && (
              <form onSubmit={handlePersonalHealthSubmit} className="space-y-4">
                <h4 className="h4-heading">Personal Health Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Height (cm)</label>
                    <input name="height" type="number" defaultValue={userData.height} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Weight (kg)</label>
                    <input name="weight" type="number" defaultValue={userData.weight} className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Blood Group</label>
                  <select name="bloodGroup" defaultValue={userData.bloodGroup} className="input-field" required>
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Surgeries (if any)</label>
                  <input name="surgeries" defaultValue={userData.surgeries} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Allergies</label>
                  <input name="allergies" defaultValue={userData.allergies} className="input-field" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isSmoker" defaultChecked={userData.isSmoker} /> Do you smoke?
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isAlcoholic" defaultChecked={userData.isAlcoholic} /> Do you consume alcohol?
                  </label>
                </div>
               
              </form>
            )}
{activeSection === 'family' && (<div className="space-y-6 mt-10 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--color-overlay)] scrollbar-track-transparent"><h4 className="h4-heading">Family History</h4><form onSubmit={handleAddFamilyMember} className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><input name="name" placeholder="Name" value={familyInput.name} onChange={handleFamilyInputChange} className="input-field" required /><input name="relation" placeholder="Relation" value={familyInput.relation} onChange={handleFamilyInputChange} className="input-field" required /></div><input name="number" placeholder="Phone Number" value={familyInput.number} onChange={handleFamilyInputChange} className="input-field" /><div><label className="block font-semibold mb-1 text-[var(--primary-color)]">Health Conditions (optional):</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[var(--color-overlay)] scrollbar-track-transparent">{['Diabetes','Hypertension','Cancer','Heart Disease','Asthma','Stroke','Alzheimer\'s','Arthritis','Depression','Chronic Kidney Disease','Osteoporosis','Liver Disease','Thyroid Disorders'].map(disease => (<label key={disease} className="flex items-center gap-2 text-sm"><input type="checkbox" value={disease} checked={familyInput.diseases.includes(disease)} onChange={handleDiseaseCheckbox} className="form-checkbox" />{disease}</label>))}</div></div><div className="flex justify-end"><button type="submit" className="btn btn-primary">Add Family Member</button></div></form>
{userData.familyMembers.length > 0 && (<div className="mt-6 space-y-3"><h4 className="h4-heading">Added Family Members:</h4><div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[var(--color-overlay)] scrollbar-track-transparent">{userData.familyMembers.map((member, i) => (<div key={i} className="p-4 bg-[var(--color-surface)] rounded-lg shadow-sm flex justify-between items-start"><div><p className="font-medium">{member.name}</p><p className="text-sm text-[var(--color-overlay)]"><span className="font-medium">Relation:</span> {member.relation}</p>{member.number && <p className="text-sm text-[var(--color-overlay)]"><span className="font-medium">Phone:</span> {member.number}</p>}{member.diseases.length > 0 && <p className="text-sm text-[var(--color-overlay)] mt-1"><span className="font-medium">Health Conditions:</span> <span className="ml-1">{member.diseases.join(', ')}</span></p>}</div><button onClick={() => handleDeleteFamilyMember(member.id)} className="delete-btn">Delete</button></div>))}</div></div>)}
</div>)}

 {activeSection === 'additional' && (<form onSubmit={handleAdditionalDetailsSubmit} className="space-y-4"><h4 className="h4-heading">Additional Details</h4><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Insurance Provider</label><input name="provider" defaultValue={userData.additionalDetails?.provider || ""} className="input-field" /></div><div className="sm:col-span-2"><label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Policy Number</label><input name="policyNumber" defaultValue={userData.additionalDetails?.policyNumber || ""} className="input-field" /></div><div><label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Coverage Type</label><select name="coverageType" defaultValue={userData.additionalDetails?.coverageType || ""} className="input-field"><option value="">Select Coverage Type</option>{['Individual','Family','Group','Senior Citizen','Critical Illness','Accident'].map(type => <option key={type} value={type}>{type}</option>)}</select></div><div><label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Coverage Amount</label><input name="coverageAmount" defaultValue={userData.additionalDetails?.coverageAmount || ""} className="input-field" /></div><div><label className="block text-sm font-medium text-[var(--primary-color)] mb-1">Start Date</label><input name="startDate" type="date" defaultValue={userData.additionalDetails?.startDate || ""} className="input-field" /></div><div><label className="block text-sm font-medium text-[var(--primary-color)] mb-1">End Date</label><input name="endDate" type="date" defaultValue={userData.additionalDetails?.endDate || ""} className="input-field" /></div><div className="sm:col-span-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="primaryHolder" defaultChecked={userData.additionalDetails?.primaryHolder || false} />I am the primary policy holder</label></div></div></form>)}
<div className="flex justify-end gap-4 mt-6"><button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
</div></div>)}

      <div className="mt-8">
        <DashboardOverview />
      </div>
    </div>
  );
}

export default Dashboard;