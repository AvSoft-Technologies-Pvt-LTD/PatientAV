

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaStethoscope, FaCalendarAlt, FaClock, FaUser, FaHospital } from 'react-icons/fa';
import drimg from "../assets/avtar.jpg"
const symptomSpecialtyMap = {
  fever: ["General Physician", "Pediatrics", "Pathology", "Psychiatry", "Oncology"],
  cough: ["General Physician", "Pulmonology", "ENT", "Oncology", "Pathology"],
  chestpain: ["Cardiology", "Pulmonology", "Gastroenterology", "General Medicine", "Orthopedics"],
  acne: ["Dermatology", "Endocrinology", "Psychiatry", "Pathology"],
  skinrash: ["Dermatology", "Pediatrics", "Pathology", "Oncology"],
  headache: ["Neurology", "General Medicine", "Psychiatry", "ENT"],
  stomachache: ["Gastroenterology", "General Medicine", "Pediatrics", "Endocrinology"],
  toothache: ["Dentistry", "Pediatrics", "General Medicine"],
  pregnancy: ["Gynecology", "Pediatrics", "Nephrology"],
  anxiety: ["Psychiatry", "Endocrinology", "General Medicine"],
  bloodinurine: ["Nephrology", "Hematology", "Urology"],
  fatigue: ["General Medicine", "Endocrinology", "Oncology", "Psychiatry"],
  jointpain: ["Orthopedics", "General Medicine", "Endocrinology"]
};

// State-wise cities mapping
const stateCityMap = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur"],
  "Delhi": ["New Delhi", "Delhi"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga","Dharwad"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Allahabad", "Bareilly"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Tripura": ["Agartala"],
  "Meghalaya": ["Shillong"],
  "Manipur": ["Imphal"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Mizoram": ["Aizawl"],
  "Arunachal Pradesh": ["Itanagar"],
  "Sikkim": ["Gangtok"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli": ["Silvassa"],
  "Daman and Diu": ["Daman"],
  "Lakshadweep": ["Kavaratti"],
  "Puducherry": ["Puducherry"]
};

const MultiStepForm = () => {
  const suggestedValues = {
    location: sessionStorage.getItem('suggestedLocation') || "",
    specialty: sessionStorage.getItem('suggestedSpecialty') || "",
    doctorType: sessionStorage.getItem('suggestedDoctorType') || "All",
    symptoms: sessionStorage.getItem('suggestedSymptoms') || ""
  };

  const [state, setState] = useState({
    consultationType: "Physical",
    symptoms: suggestedValues.symptoms,
    specialty: suggestedValues.specialty,
    specialties: [],
    selectedDoctor: null,
    doctors: [],
    filteredDoctors: [],
    states: Object.keys(stateCityMap),
    selectedState: "",
    cities: [],
    location: suggestedValues.location,
    doctorType: suggestedValues.doctorType,
    hospitalName: "",
    minPrice: "",
    maxPrice: "",
    selectedDate: '',
    selectedTime: '', 
    fullAddress: '',
    showBookingModal: false,
    showConfirmationModal: false,
    isLoading: false,
    loadingCities: false,
    isCurrentLocation: false
  });
  
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const doctorsRes = await axios.get("https://mocki.io/v1/6e2c8f67-dba8-43ba-a976-14ef281cc564");

        updateState({ 
          doctors: doctorsRes.data,
          loadingCities: false 
        });

        if (suggestedValues.specialty && suggestedValues.doctorType === "AV Swasthya") {
          const filtered = doctorsRes.data.filter(d => 
            d.specialty === suggestedValues.specialty &&
            d.doctorType === "AV Swasthya" &&
            (suggestedValues.location ? d.location === suggestedValues.location : true)
          );
          updateState({ filteredDoctors: filtered });
        }

        if (suggestedValues.symptoms) {
          const val = suggestedValues.symptoms.toLowerCase().replace(/\s/g, "");
          updateState({ specialties: symptomSpecialtyMap[val] || [] });
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
    return () => {
      Object.keys(suggestedValues).forEach(key => 
        sessionStorage.removeItem(`suggested${key.charAt(0).toUpperCase() + key.slice(1)}`)
      );
    };
  }, []);

  useEffect(() => {
    const filtered = state.doctors.filter(d => 
      d.consultationType.toLowerCase() === state.consultationType.toLowerCase() &&
      d.specialty === state.specialty &&
      (state.consultationType !== "Physical" || d.location === state.location) &&
      (state.minPrice === "" || parseInt(d.fees) >= parseInt(state.minPrice)) &&
      (state.maxPrice === "" || parseInt(d.fees) <= parseInt(state.maxPrice)) &&
      (state.hospitalName === "" || d.hospital.toLowerCase().includes(state.hospitalName.toLowerCase())) &&
      (state.doctorType === "All" || d.doctorType === state.doctorType)
    );
    updateState({ filteredDoctors: filtered });
  }, [state.doctors, state.consultationType, state.specialty, state.location, state.minPrice, state.maxPrice, state.hospitalName, state.doctorType]);

  // Clear location when switching to Virtual consultation
  useEffect(() => {
    if (state.consultationType === "Virtual") {
      updateState({
        selectedState: "",
        location: "",
        cities: [],
        fullAddress: "",
        isCurrentLocation: false
      });
    }
  }, [state.consultationType]);

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    const cities = selectedState ? stateCityMap[selectedState] || [] : [];
    updateState({ 
      selectedState, 
      cities, 
      location: "",
      isCurrentLocation: false
    });
  };

  const handleLocationChange = e => {
    if (e.target.value === 'current-location') {
      if (!navigator.geolocation) return alert('Geolocation not supported');
      
      updateState({ isCurrentLocation: true });
      
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
          const data = await response.json();
          const detectedCity = data.address.city || data.address.town || data.address.village || "";
          const detectedState = data.address.state || "";
          
          // Find the state that contains this city
          let matchedState = "";
          for (const [stateName, cities] of Object.entries(stateCityMap)) {
            if (cities.some(city => city.toLowerCase().includes(detectedCity.toLowerCase()))) {
              matchedState = stateName;
              break;
            }
          }
          
          // If no exact match found, try to match by state name
          if (!matchedState && detectedState) {
            for (const stateName of Object.keys(stateCityMap)) {
              if (stateName.toLowerCase().includes(detectedState.toLowerCase()) || 
                  detectedState.toLowerCase().includes(stateName.toLowerCase())) {
                matchedState = stateName;
                break;
              }
            }
          }
          
          updateState({
            selectedState: matchedState,
            cities: matchedState ? stateCityMap[matchedState] : [],
            location: detectedCity,
            fullAddress: data.display_name || "",
            states: matchedState ? [matchedState] : Object.keys(stateCityMap), // Show only detected state or all states
            isCurrentLocation: true
          });
        } catch (error) {
          console.error("Location error:", error);
          alert("Failed to fetch location");
          updateState({ isCurrentLocation: false });
        }
      }, (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get your location");
        updateState({ isCurrentLocation: false });
      });
    } else {
      updateState({ 
        location: e.target.value, 
        fullAddress: '',
        isCurrentLocation: false
      });
    }
  };

  // Reset states list when manually selecting a different state (not current location)
  const handleManualStateChange = (e) => {
    if (!state.isCurrentLocation) {
      updateState({ states: Object.keys(stateCityMap) });
    }
    handleStateChange(e);
  };

  const scrollRef = useRef(null);
  const [currentGroup, setCurrentGroup] = useState(0);

  const cardWidth = 300;
  const visibleCards = 3;
  const totalGroups = Math.ceil(state.filteredDoctors.length / visibleCards);

  const scrollToGroup = (groupIndex) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: groupIndex * cardWidth * visibleCards,
        behavior: "smooth",
      });
      setCurrentGroup(groupIndex);
    }
  };

  const scroll = (dir) => {
    let newGroup = currentGroup + dir;
    if (newGroup < 0) newGroup = 0;
    if (newGroup >= totalGroups) newGroup = totalGroups - 1;
    scrollToGroup(newGroup);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        if (container.scrollLeft + 300 >= maxScrollLeft) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 300, behavior: "smooth" });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSymptomsChange = e => {
    const val = e.target.value.toLowerCase().replace(/\s/g, "");
    updateState({ 
      symptoms: e.target.value,
      specialties: symptomSpecialtyMap[val] || [],
      specialty: ""
    });
  };

  const handlePayment = async () => {
    const userId = localStorage.getItem("userId");
    const payload = {
      userId,
      name: `${user?.firstName || "Guest"} ${user?.lastName || ""}`,
      phone: user?.phone || "N/A",
      email: user?.email,
      symptoms: state.symptoms,
      date: state.selectedDate,
      time: state.selectedTime,
      specialty: state.specialty,
      consultationType: state.consultationType,
      location: state.consultationType === "Virtual" ? "Online" : state.location,
      doctorId: state.selectedDoctor?.id || "N/A",
      doctorName: state.selectedDoctor?.name || "N/A",
      status: "Upcoming",
      notification: {
        doctorId: state.selectedDoctor?.id || "N/A",
        message: `New appointment with ${user?.firstName || "a patient"} on ${state.selectedDate} at ${state.selectedTime}. Symptoms: ${state.symptoms || "None"}. ${state.consultationType === "Virtual" ? "Virtual consultation" : `Location: ${state.location || "Not specified"}`}.`
      }
    };

    updateState({ isLoading: true, showBookingModal: false, showConfirmationModal: true });
    try {
      await Promise.all([
        axios.post("https://67e3e1e42ae442db76d2035d.mockapi.io/register/book", payload),
        axios.post("https://67e631656530dbd3110f0322.mockapi.io/drnotifiy", payload.notification)
      ]);
      
      setTimeout(() => {
        updateState({
          showConfirmationModal: false,
          selectedState: "",
          location: "",
          symptoms: "",
          selectedDate: "",
          selectedTime: "",
          specialty: "",
          specialties: [],
          selectedDoctor: null,
          consultationType: "Physical",
          states: Object.keys(stateCityMap),
          cities: [],
          isCurrentLocation: false
        });
        navigate("/dashboard/app");
      }, 100);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again.");
    } finally {
      updateState({ isLoading: false });
    }
  };

  const getTimesForDate = (date) => state.selectedDoctor?.availability.find(slot => slot.date === date)?.times || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 px-3">
      <div className="max-w-3xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            Book Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Appointment</span>
          </h1>
          <p className="text-slate-600 text-sm">Connect with top healthcare professionals instantly</p>
        </div>

        {/* Main Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 space-y-6">
          
          {/* Consultation Type - Compact Pills */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Consultation Type
            </h3>
            <div className="flex gap-4">
              {["Physical", "Virtual"].map((type) => (
                <button
                  key={type}
                  onClick={() => updateState({ consultationType: type })}
                  className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300 transform hover:scale-105 ${
                    state.consultationType === type
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* State & Location - Only show for Physical consultations */}
          {state.consultationType === "Physical" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                  State
                  {state.isCurrentLocation && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                       Detected
                    </span>
                  )}
                </label>
                <select
                  value={state.selectedState}
                  onChange={handleManualStateChange}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white"
                  disabled={state.isCurrentLocation}
                >
                  <option value="">Select State</option>
                  {state.states.map(stateName => (
                    <option key={stateName} value={stateName}>{stateName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FaMapMarkerAlt className="text-emerald-500 text-xs" />
                  City
                  {state.isCurrentLocation && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                       Current
                    </span>
                  )}
                </label>
                <select
                  value={state.location}
                  onChange={handleLocationChange}
                  disabled={!state.selectedState && !state.isCurrentLocation}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm bg-white disabled:bg-slate-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select City</option>
                  <option value="current-location">📍 Use My Location</option>
                  {state.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {state.location && state.location !== "current-location" && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-xs" />
                    {state.location}, {state.selectedState}
                    {state.isCurrentLocation && " (Current Location)"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Virtual Consultation Notice */}
          {state.consultationType === "Virtual" && (
            <div className="bg-gradient-to-r from-green-50 to-indigo-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-green-800">Virtual Consultation Selected</h4>
                  <p className="text-sm text-green-600">You'll receive a video call link after booking confirmation</p>
                </div>
              </div>
            </div>
          )}

          {/* Hospital Name & Symptoms */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Hospital (Optional) - Only show for Physical consultations */}
            {state.consultationType === "Physical" && (
              <div className="space-y-2 w-full md:w-1/2">
                <div className="floating-input relative w-full" data-placeholder="Hospital (Optional)">
                  <input
                    type="text"
                    value={state.hospitalName}
                    onChange={(e) => updateState({ hospitalName: e.target.value })}
                    placeholder=" "
                    className="input-field peer"
                  />
                </div>
              </div>
            )}

            {/* Symptoms */}
            <div className={`space-y-2 w-full ${state.consultationType === "Physical" ? "md:w-1/2" : ""}`}>
              <div className="floating-input relative w-full" data-placeholder="Symptoms">
                <input
                  type="text"
                  value={state.symptoms}
                  onChange={handleSymptomsChange}
                  placeholder=" "
                  className="input-field peer"
                />
              </div>
            </div>
          </div>

          {/* Suggested Specialties - Compact Pills */}
          {state.specialties.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700">Suggested Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {state.specialties.map(spec => (
                  <button 
                    key={spec} 
                    onClick={() => updateState({ specialty: spec })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                      state.specialty === spec 
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Doctor Panel - Compact Pills */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-700">Doctor Panel</h3>
            <div className="flex flex-wrap gap-2">
              {["All", "Our Medical Expert","Hospital Affiliated", "Consultant Doctor"].map(type => (
                <button 
                  key={type} 
                  onClick={() => updateState({ doctorType: type })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                    state.doctorType === type 
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md" 
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range - Compact */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <div className="floating-input relative w-full" data-placeholder="Min Fees (₹)">
                <input
                  type="number"
                  value={state.minPrice}
                  onChange={(e) => updateState({ minPrice: e.target.value })}
                  placeholder=" "
                  className="input-field peer "
                />
              </div>
            </div>

            <div className="space-y-2 w-full">
              <div className="floating-input relative w-full" data-placeholder="Max Price">
                <input
                  type="number"
                  value={state.maxPrice}
                  onChange={(e) => updateState({ maxPrice: e.target.value })}
                  placeholder=" "
                  className="input-field peer"
                />
              </div>
            </div>
          </div>

          {/* Available Doctors - Compact Cards */}
          <div className="space-y-4">
            {state.filteredDoctors.length > 0 ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Available Doctors ({state.filteredDoctors.length})
                  </h3>
                  <button
                    onClick={() => navigate('/dashboard/alldoctors', { state: { filteredDoctors: state.filteredDoctors } })}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
                  >
                    View All →
                  </button>
                </div>

                {/* Compact Doctor Cards Scroll */}
                <div className="relative">
                  <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-hidden pb-4 scroll-smooth"
                  >
                    {state.filteredDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => updateState({ selectedDoctor: doc, showBookingModal: true })}
                        className="min-w-[280px] p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
                      >
                        <div className="flex gap-3 items-start">
                          <div className="relative">
                            <img
                              src={drimg|| "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg"}
                              alt={doc.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 text-sm truncate">{doc.name}</h4>
                            <p className="text-emerald-600 text-xs font-medium">{doc.specialty}</p>
                            <p className="text-slate-800 font-bold text-lg">₹{doc.fees}</p>
                            <p className="text-slate-500 text-xs flex items-center gap-1">
                              <FaMapMarkerAlt className="text-xs" />
                              {state.consultationType === "Virtual" ? "Online" : (doc.location || "N/A")}
                            </p>
                            <p className="text-slate-500 text-xs">{doc.doctorType}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={() => scroll(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-emerald-50"
                  >
                    <FaChevronLeft className="text-slate-600 text-sm" />
                  </button>
                  
                  <button
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:bg-emerald-50"
                  >
                    <FaChevronRight className="text-slate-600 text-sm" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="flex justify-center gap-2 mt-4">
                    {Array.from({ length: totalGroups }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => scrollToGroup(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          currentGroup === index ? "bg-emerald-500 scale-125" : "bg-slate-300"
                        }`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
                  <FaUser className="text-slate-400 text-2xl" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No doctors found</h3>
                <p className="text-slate-600 text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Booking Modal */}
      {state.showBookingModal && state.selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl relative animate-slide-up">
            <button
              onClick={() => updateState({ showBookingModal: false })}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Doctor Info - Compact */}
            <div className="text-center mb-6">
              <img
                src={state.selectedDoctor.image || "https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg"}
                alt={state.selectedDoctor.name}
                className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 border-2 border-emerald-200"
              />
              <h2 className="text-xl font-bold text-slate-800">{state.selectedDoctor.name}</h2>
              <p className="text-emerald-600 font-medium">{state.selectedDoctor.specialty}</p>
              <p className="text-slate-600 text-sm">{state.selectedDoctor.qualification}</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm">
                <span className="text-slate-600">{state.selectedDoctor.experience} years exp</span>
                <span className="text-slate-400">•</span>
                <span className="text-2xl font-bold text-emerald-600">₹{state.selectedDoctor.fees}</span>
              </div>
              {/* Consultation Type Badge */}
              <div className="mt-3">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                  state.consultationType === "Virtual" 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {state.consultationType === "Virtual" ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <FaMapMarkerAlt className="w-3 h-3" />
                  )}
                  {state.consultationType} Consultation
                </span>
              </div>
            </div>

            {/* Booking Form - Compact */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <FaCalendarAlt className="text-emerald-500 text-xs" />
                  Select Date
                </label>
               
<input
  type="date"
  className="w-full p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 text-sm"
  value={state.selectedDate}
  min={new Date().toISOString().split("T")[0]}
  onChange={(e) => updateState({ selectedDate: e.target.value, selectedTime: '' })}
/>

              </div>

              {state.selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <FaClock className="text-emerald-500 text-xs" />
                    Available Time Slots
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {getTimesForDate(state.selectedDate).map(time => {
                      const isBooked = state.selectedDoctor.bookedSlots?.some(slot => slot.date === state.selectedDate && slot.time === time);
                      const isSelected = state.selectedTime === time;
                      return (
                        <button 
                          key={time} 
                          disabled={isBooked} 
                          onClick={() => updateState({ selectedTime: time })} 
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                            isBooked 
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                              : isSelected 
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md transform scale-105" 
                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={!state.selectedDate || !state.selectedTime || state.isLoading}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  !state.selectedDate || !state.selectedTime || state.isLoading
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transform hover:scale-105"
                }`}
              >
                {state.isLoading ? "Processing..." : !state.selectedDate || !state.selectedTime ? 'Select Date & Time' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Confirmation Modal */}
      {state.showConfirmationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl animate-slide-up">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Booking Confirmed!</h3>
            <p className="text-slate-600 text-sm">Your appointment has been successfully scheduled.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
