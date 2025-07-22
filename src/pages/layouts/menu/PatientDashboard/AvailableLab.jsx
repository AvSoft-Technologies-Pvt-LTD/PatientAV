import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaStar, FaMapMarkerAlt, FaHome, FaClock } from "react-icons/fa";
import axios from "axios";
const AvailableLabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const test = location.state?.test;
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [homeCollectionOnly, setHomeCollectionOnly] = useState(false);
  useEffect(() => {
    axios.get("https://mocki.io/v1/d5770a08-fead-4268-8dd1-41da555ba331")
      .then((res) => { setLabs(res.data); setFilteredLabs(res.data); })
      .catch((err) => console.error("Lab API Error:", err));}, []);
  const handleFilter = () => {
    let filtered = [...labs];
    if (locationFilter.trim()) filtered = filtered.filter(lab => lab.location?.toLowerCase().includes(locationFilter.toLowerCase()));
    if (homeCollectionOnly) filtered = filtered.filter(lab => lab.homeCollection === true);
    setFilteredLabs(filtered);};
  if (!test) return <div className="p-4">No test selected.</div>;
  return (
    <div className="p-6 bg-white shadow-lg rounded-2xl mt-6 space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="paragraph">&larr; Back to Test Details</button></div>
      <div className="card-stat">
        <h2 className="h4-heading font-bold">Labs for {test.title}</h2>
        <p className="paragraph">Code: {test.code}</p>
        <span className="paragraph text-xs bg-blue-100 px-2 py-1 rounded">{test.description}</span>
        <p className="paragraph mt-2">Price: ₹{test.price}</p> </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
<div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-1200 sm:w-auto">
  <div className="floating-input relative w-full sm:w-auto mb-4 sm:mb-0" data-placeholder="Filter by location">
    <input
      type="text"
      placeholder=" "
      className="input-field peer"
      value={locationFilter}
      onChange={(e) => setLocationFilter(e.target.value)}
    />
  </div>
  <button onClick={handleFilter} className="btn btn-primary">Search</button>
</div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={homeCollectionOnly} onChange={() => { setHomeCollectionOnly(!homeCollectionOnly); setTimeout(() => handleFilter(), 0); }} />
          <span className="paragraph">Home Collection</span></label></div>
      {filteredLabs.length === 0 ? (
        <p className="paragraph text-center">No labs found for selected filters.</p> ) : (
        filteredLabs.map((lab, index) => (
          <div key={index} className="card-stat">
            <div className="flex justify-between items-center"><div>
                <h3 className="paragraph font-bold">{lab.name}</h3>
                <p className="paragraph flex items-center gap-1"><FaMapMarkerAlt /> {lab.location}</p></div>
              <span className="paragraph flex items-center gap-1"><FaStar className="text-[#F4C430]" /> {lab.rating || 'N/A'}</span></div>
            <ul className="paragraph space-y-1 mt-2">
              <li className="flex items-center gap-2"><FaClock /> Reports in {lab.reportTime || '24 hours'}</li>
              <li className="flex items-center gap-2"><FaHome /> Home Collection {lab.homeCollection ? 'Available' : 'Not available'}</li> </ul>
            <div className="flex justify-between items-center mt-3">
              <p className="paragraph">₹{test.price}</p>
              <button onClick={() => navigate(`/dashboard/lab-booking/${test.id}`, { state: { lab, test } })} className="view-btn">Select Lab</button>
            </div></div> ))   )} </div>);};
export default AvailableLabs;
