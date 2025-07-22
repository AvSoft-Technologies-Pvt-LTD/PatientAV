import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { CircleUser, Heart, Users, ClipboardCheck,Pencil } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import DashboardOverview from './DashboardOverview';

const API_BASE_URL = 'https://680cc0c92ea307e081d4edda.mockapi.io';
const FAMILY_API_URL = 'https://6808fb0f942707d722e09f1d.mockapi.io/FamilyData';
const defaultFamilyMember = { name: '', relation: '', number: '', diseases: [], email: '' };
const initialUserData = { 
  name: '', 
  email: '',
  gender: '', 
  phone: '', 
  dob: '', 
  bloodGroup: '', 
  height: '', 
  weight: '', 
  isAlcoholic: false, 
  isSmoker: false, 
  allergies: '', 
  surgeries: '', 
  familyHistory: { diabetes: false, cancer: false, heartDisease: false, mentalHealth: false, disability: false }, 
  familyMembers: [], 
  additionalDetails: { provider: '', policyNumber: '', coverageType: '', startDate: '', endDate: '', coverageAmount: '', primaryHolder: false }
};

const getProgressColor = (completion) => {
  if (completion <= 33) return '#ef4444'; // Red
  if (completion <= 67) return '#f59e42'; // Orange
  if (completion < 100) return '#facc15'; // Yellow
  return '#22c55e'; // Green
};

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const [activeSection, setActiveSection] = useState('basic');
  const [showModal, setShowModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(25);
  const [familyInput, setFamilyInput] = useState(defaultFamilyMember);
  const [feedbackMessage, setFeedbackMessage] = useState({ show: false, message: '', type: '' });
  const user = useSelector((state) => state.auth.user);
 const handleEditClick = () => {
    navigate('/dashboard/settings'); // Change this path as needed
  };
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user?.email) {
          showFeedback('Please login to access your data', 'error');
          navigate('/login');
          return;
        }

        // Try to get data from localStorage first
        const cachedData = localStorage.getItem('userData');
        let healthData = cachedData ? JSON.parse(cachedData) : null;

        // If no cached data or email doesn't match, fetch from API
        if (!healthData || healthData.email !== user.email) {
          try {
            // Fetch personal health data
            const healthResponse = await axios.get(`${API_BASE_URL}/personalHealthDetails?email=${encodeURIComponent(user.email)}`);
            
            if (healthResponse.data.length > 0) {
              healthData = healthResponse.data[0];
            } else {
              // Create initial data for new user
              healthData = { 
                ...initialUserData, 
                email: user.email,
                name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim()
              };
              // Save initial data to API
              const response = await axios.post(`${API_BASE_URL}/personalHealthDetails`, healthData);
              healthData = { ...healthData, id: response.data.id };
            }

            // Fetch family members
            try {
              const familyResponse = await axios.get(`${FAMILY_API_URL}?email=${user.email}`);
              healthData.familyMembers = familyResponse.data;
            } catch (familyError) {
              console.error('Error fetching family members:', familyError);
              healthData.familyMembers = [];
            }

            // Save to localStorage
            localStorage.setItem('userData', JSON.stringify(healthData));
          } catch (apiError) {
            console.error('Error fetching from API:', apiError);
            // If API fails, use initial data
            healthData = { 
              ...initialUserData, 
              email: user.email,
              name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim()
            };
            localStorage.setItem('userData', JSON.stringify(healthData));
          }
        }

        setUserData(healthData);
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        showFeedback('Error loading user data', 'error');
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const getSectionCompletionStatus = () => ({
    basic: true,
    personal: Boolean(userData.height && userData.weight && userData.bloodGroup),
    family: Boolean(userData.familyMembers.length > 0)
  });

  useEffect(() => {
    const completionStatus = getSectionCompletionStatus();
    const completedSections = Object.values(completionStatus).filter(Boolean).length;
    setProfileCompletion(Math.round((completedSections / Object.keys(completionStatus).length) * 100));
  }, [userData]);

  const showFeedback = (message, type = 'success') => {
    setFeedbackMessage({ show: true, message, type });
    setTimeout(() => setFeedbackMessage({ show: false, message: '', type: '' }), 3000);
  };

  const saveUserData = async (updatedData) => {
    try {
      if (!user?.email) {
        showFeedback('Please login to save data', 'error');
        return false;
      }

      const payload = { 
        ...updatedData, 
        email: user.email,
        name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim() 
      };

      if (!updatedData.id) {
        // Create new user data
        const response = await axios.post(`${API_BASE_URL}/personalHealthDetails`, payload);
        const savedData = { ...updatedData, id: response.data.id, email: user.email };
        setUserData(savedData);
        localStorage.setItem('userData', JSON.stringify(savedData));
        showFeedback('Data saved successfully');
      } else {
        // Update existing user data
        await axios.put(`${API_BASE_URL}/personalHealthDetails/${updatedData.id}`, payload);
        setUserData(updatedData);
        localStorage.setItem('userData', JSON.stringify(updatedData));
        showFeedback('Data updated successfully');
      }
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      showFeedback('Failed to save data', 'error');
      return false;
    }
  };

  const handlePersonalHealthSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      showFeedback('Please login to save data', 'error');
      return;
    }

    const formData = new FormData(e.currentTarget);
    // Only include the required fields for personal health
    const personalHealthData = {
      height: formData.get('height')?.toString() || '',
      weight: formData.get('weight')?.toString() || '',
      bloodGroup: formData.get('bloodGroup')?.toString() || '',
      surgeries: formData.get('surgeries')?.toString() || '',
      allergies: formData.get('allergies')?.toString() || '',
      isSmoker: formData.get('isSmoker') === 'on',
      isAlcoholic: formData.get('isAlcoholic') === 'on',
      name: `${user?.firstName || 'Guest'} ${user?.lastName || ''}`.trim(),
      email: user.email,
      id: userData.id // Only if updating
    };

    try {
      if (personalHealthData.id) {
        // Update existing personal health data
        await axios.put(`${API_BASE_URL}/personalHealthDetails/${personalHealthData.id}`, personalHealthData);
        setUserData(prev => ({ ...prev, ...personalHealthData }));
        localStorage.setItem('userData', JSON.stringify({ ...userData, ...personalHealthData }));
        showFeedback('Personal health data updated successfully');
      } else {
        // Create new personal health data
        const response = await axios.post(`${API_BASE_URL}/personalHealthDetails`, personalHealthData);
        const savedData = { ...userData, ...personalHealthData, id: response.data.id };
        setUserData(savedData);
        localStorage.setItem('userData', JSON.stringify(savedData));
        showFeedback('Personal health data saved successfully');
      }
      setShowModal(false);
    } catch (error) {
      // If update fails with 404, try to create
      if (error.response && error.response.status === 404) {
        try {
          const response = await axios.post(`${API_BASE_URL}/personalHealthDetails`, personalHealthData);
          const savedData = { ...userData, ...personalHealthData, id: response.data.id };
          setUserData(savedData);
          localStorage.setItem('userData', JSON.stringify(savedData));
          showFeedback('Personal health data saved successfully');
          setShowModal(false);
        } catch (postError) {
          showFeedback('Failed to save personal health data', 'error');
        }
      } else {
        showFeedback('Failed to save personal health data', 'error');
      }
    }
  };

  const handleAdditionalDetailsSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedDetails = {
      ...userData,
      additionalDetails: {
        provider: formData.get('provider')?.toString() || '',
        policyNumber: formData.get('policyNumber')?.toString() || '',
        coverageType: formData.get('coverageType')?.toString() || '',
        startDate: formData.get('startDate')?.toString() || '',
        endDate: formData.get('endDate')?.toString() || '',
        coverageAmount: formData.get('coverageAmount')?.toString() || '',
        primaryHolder: formData.get('primaryHolder') === 'on'
      }
    };

    const success = await saveUserData(updatedDetails);
    if (success) {
      setShowModal(false);
    }
  };

  const handleFamilyInputChange = (e) => {
    const { name, value } = e.target;
    setFamilyInput(prev => ({ ...prev, [name]: value }));
  };

  const handleDiseaseCheckbox = (e) => {
    const { value, checked } = e.target;
    setFamilyInput(prev => ({
      ...prev,
      diseases: checked ? [...prev.diseases, value] : prev.diseases.filter(d => d !== value)
    }));
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      showFeedback('Please login to add family member', 'error');
      return;
    }

    if (!familyInput.name || !familyInput.relation) {
      showFeedback('Name & relation required', 'warning');
      return;
    }

    try {
      const familyMemberData = {
        ...familyInput,
        email: user.email,
        name: familyInput.name,
        relation: familyInput.relation,
        number: familyInput.number,
        diseases: familyInput.diseases
      };

      if (familyInput.id) {
        // Update existing family member
        await axios.put(`${FAMILY_API_URL}/${familyInput.id}`, familyMemberData);
      } else {
        // Create new family member
        await axios.post(FAMILY_API_URL, familyMemberData);
      }

      // Fetch updated family members
      const response = await axios.get(`${FAMILY_API_URL}?email=${user.email}`);
      const updatedUserData = {
        ...userData,
        familyMembers: response.data
      };
      setUserData(updatedUserData);
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      setFamilyInput(defaultFamilyMember);
      showFeedback('Family member saved successfully');
    } catch (error) {
      console.error('Error saving family member:', error);
      showFeedback('Failed to save family member', 'error');
    }
  };

  const handleDeleteFamilyMember = async (familyMemberId) => {
    try {
      await axios.delete(`${FAMILY_API_URL}/${familyMemberId}`);
      
      // Fetch updated family members
      const response = await axios.get(`${FAMILY_API_URL}?email=${user.email}`);
      setUserData(prev => ({ ...prev, familyMembers: response.data }));
      
      showFeedback('Family member deleted successfully');
    } catch (error) {
      console.error('Error deleting family member:', error);
      showFeedback('Failed to delete family member', 'error');
    }
  };
 const handleGenerateCard = () => navigate("/healthcard");
 const sections = [
    { id: 'basic', name: 'Basic Details', icon: 'user' },
    { id: 'personal', name: 'Personal Health', icon: 'heart' },
    { id: 'family', name: 'Family Details', icon: 'users' }
  ];
 const completionStatus = getSectionCompletionStatus();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0e1630] text-white sm:p-4 rounded-xl">
        <div className="flex items-center gap-1 sm:gap-4">
          <div className="relative w-24 h-24 sm:w-30 sm:h-30">
            <div className="w-full h-full rounded-full bg-white/60 flex items-center justify-center">
              <svg className="absolute top-0 left-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-white/80"
                  strokeWidth="1"
                  stroke="currentColor"
                  fill="none"
                  r="16"
                  cx="18"
                  cy="18"
                />
                <circle
                  style={{ transition: 'stroke 0.4s' }}
                  stroke={getProgressColor(profileCompletion)}
                  strokeWidth="2"
                  strokeDasharray="100"
                  strokeDashoffset={100 - profileCompletion}
                  strokeLinecap="round"
                  fill="none"
                  r="16"
                  cx="18"
                  cy="18"
                />
              </svg>
              <CircleUser className="w-16 h-16 sm:w-28 sm:h-28 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[var(--accent-color)] text-[#0e1630] font-bold px-3 py-2 rounded-full text-xs sm:text-base">{profileCompletion}%</div>
          </div>
          <div className="max-w-6xl mx-auto px-4 py-4 rounded-md">
            <div className="flex flex-wrap items-center gap-6 text-white-700 text-lg">
              <div className="flex flex-col">
                <span className="text-lg text-[var(--accent-color)]">Name</span>
                <span className="text-lg text-white-600">{user?.firstName || "Guest"} {user?.lastName || ""}</span>
              </div>
              <span className="hidden sm:block h-8 w-px bg-gray-300"></span>
              <div className="flex flex-col">
                <span className="text-lg text-[var(--accent-color)]">Date of Birth</span>
                <span className="text-lg text-white-600">{user?.dob || "N/A"}</span>
              </div>
              <span className="hidden sm:block h-8 w-px bg-gray-300"></span>
              <div className="flex flex-col">
                <span className="text-lg text-[var(--accent-color)]">Gender</span>
                <span className="text-lg text-white-600">{user?.gender || "N/A"}</span>
              </div>
              <span className="hidden sm:block h-8 w-px bg-gray-300"></span>
              <div className="flex flex-col">
                <span className="text-lg text-[var(--accent-color)]">Phone No.</span>
                <span className="text-lg text-white-600">{user?.phone || "N/A"}</span>
              </div>
              <span className="hidden sm:block h-8 w-px bg-gray-300"></span>
              <div className="flex flex-col">
                <span className="text-lg text-[var(--accent-color)]">Blood Group</span>
                <span className="text-lg text-white-600">{userData.bloodGroup || "Not Set"}</span>
              </div>
            </div>
          </div>
<button onClick={handleGenerateCard} className="shrink-0 px-4 py-4 rounded bg-[var(--accent-color)] font-semibold text-sm text-[var(--color-surface)]">Generate Health Card</button>        
             <div className="relative group">
  <Pencil
    onClick={handleEditClick}
    className="w-9 h-8 p-1.5 rounded-full bg-[var(--color-surface)] text-black cursor-pointer hover:scale-110 transition-transform duration-200 ease-in-out"
  />
  <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-[11px] bg-white text-black rounded-md px-2 py-1 opacity-0 scale-90 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 ease-out shadow-lg z-10">
    Edit
  </span>
</div></div>
   
      </div>

      <div className="mt-6 sm:mt-10 flex gap-4 sm:gap-6 flex-wrap">
        {sections.map((section) => {
          const isActive = activeSection === section.id;
          const isCompleted = completionStatus[section.id];
          return (
            <button 
              key={section.id} 
              onClick={() => {
                setActiveSection(section.id);
                if (section.id !== 'basic') setShowModal(true);
              }}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm sm:text-base
                ${isActive ? 'bg-[#0e1630]' : 'bg-[#1f2a4d] hover:bg-[#1b264a]'} transition-all duration-300`}
            >
              {section.icon === 'user' && <CircleUser className="w-5 h-5 sm:w-6 sm:h-6" />}
              {section.icon === 'heart' && <Heart className="w-5 h-5 sm:w-6 sm:h-6" />}
              {section.icon === 'users' && <Users className="w-5 h-5 sm:w-6 sm:h-6" />}
              {section.name}
              {isCompleted && <ClipboardCheck className="text-green-400 ml-1 animate-pulse" />}
            </button>
          );
        })}
        <button 
          onClick={() => {
            setActiveSection('additional');
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-lg flex items-center gap-2 text-white text-sm sm:text-base bg-[#1f2a4d] hover:bg-[#1b264a] transition-all duration-300"
        >
          Additional Details
        </button>
      </div>

      {feedbackMessage.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          feedbackMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        } transition-all duration-300 transform translate-y-0 opacity-100`}>
          {feedbackMessage.message}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl mx-4">
            {activeSection === 'personal' && (
              <form onSubmit={handlePersonalHealthSubmit} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold">Personal Health Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input name="height" type="number" defaultValue={userData.height} className="w-full border p-2 rounded" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                    <input name="weight" type="number" defaultValue={userData.weight} className="w-full border p-2 rounded" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select name="bloodGroup" defaultValue={userData.bloodGroup} className="w-full border p-2 rounded" required>
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surgeries (if any)</label>
                  <input name="surgeries" defaultValue={userData.surgeries} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <input name="allergies" defaultValue={userData.allergies} className="w-full border p-2 rounded" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isSmoker" defaultChecked={userData.isSmoker} /> Do you smoke?
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isAlcoholic" defaultChecked={userData.isAlcoholic} /> Do you consume alcohol?
                  </label>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-gray-600">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-[#0e1630] text-white">Save</button>
                </div>
              </form>
            )}

            {activeSection === 'family' && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold">Family History</h2>
                <form onSubmit={handleAddFamilyMember} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input name="name" placeholder="Name" value={familyInput.name} onChange={handleFamilyInputChange} className="w-full border p-2 rounded" required />
                    <input name="relation" placeholder="Relation" value={familyInput.relation} onChange={handleFamilyInputChange} className="w-full border p-2 rounded" required />
                  </div>
                  <input name="number" placeholder="Phone Number" value={familyInput.number} onChange={handleFamilyInputChange} className="w-full border p-2 rounded" />
                  <div>
                    <label className="block font-semibold mb-1">Health Conditions (optional):</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 max-h-40 overflow-y-auto pr-2">
                      {['Diabetes', 'Hypertension', 'Cancer', 'Heart Disease', 'Asthma', 'Stroke', 'Alzheimer\'s', 'Arthritis', 'Depression', 'Chronic Kidney Disease', 'Osteoporosis', 'Liver Disease', 'Thyroid Disorders'].map(disease => (
                        <label key={disease} className="flex items-center gap-2 text-sm">
                          <input type="checkbox" value={disease} checked={familyInput.diseases.includes(disease)} onChange={handleDiseaseCheckbox} className="form-checkbox" />
                          {disease}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-2 rounded-lg bg-[#0e1630] text-white">Add Family Member</button>
                  </div>
                </form>
                {userData.familyMembers.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold">Added Family Members:</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {userData.familyMembers.map((member, index) => (
                        <div key={index} className="p-4 bg-gray-100 rounded-lg shadow-sm flex justify-between items-start transition-all hover:shadow-md">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600"><span className="font-medium">Relation:</span> {member.relation}</p>
                            {member.number && <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {member.number}</p>}
                            {member.diseases.length > 0 && <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Health Conditions:</span> <span className="ml-1">{member.diseases.join(', ')}</span></p>}
                          </div>
                          <button onClick={() => handleDeleteFamilyMember(member.id)} className="text-red-600 hover:text-red-800 hover:underline text-sm">Delete</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="view-btn">Cancel</button>
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg btn-primary text-white">Save</button>
                </div>
              </div>
            )}

            {activeSection === 'additional' && (
              <form onSubmit={handleAdditionalDetailsSubmit} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold">Additional Details</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                    <input name="provider" defaultValue={userData.additionalDetails.provider} className="w-full border p-2 rounded" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                    <input name="policyNumber" defaultValue={userData.additionalDetails.policyNumber} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
                    <select name="coverageType" defaultValue={userData.additionalDetails.coverageType} className="w-full border p-2 rounded">
                      <option value="">Select Coverage Type</option>
                      {['Individual', 'Family', 'Group', 'Senior Citizen', 'Critical Illness', 'Accident'].map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount</label>
                    <input name="coverageAmount" defaultValue={userData.additionalDetails.coverageAmount} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input name="startDate" type="date" defaultValue={userData.additionalDetails.startDate} className="w-full border p-2 rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input name="endDate" type="date" defaultValue={userData.additionalDetails.endDate} className="w-full border p-2 rounded" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" name="primaryHolder" defaultChecked={userData.additionalDetails.primaryHolder} /> I am the primary policy holder
                    </label>
                  </div>
                  <div className="flex justify-end gap-4 ">
  <button type="button" onClick={() => setShowModal(false)} className="view-btn">Cancel</button>
  <button type="submit" className="px-4 py-2 rounded-lg bg-[#0e1630] text-white">Save</button>
</div>

                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <div className="mt-8">
        <DashboardOverview />
      </div>
    </div>
  );
}

export default Dashboard;




