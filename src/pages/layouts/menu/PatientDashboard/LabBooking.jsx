import { useLocation, useNavigate } from "react-router-dom";
import { FaCheck, FaStar, FaClock, FaMapMarkerAlt } from "react-icons/fa";
const LabBooking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { lab, test } = location.state || {};
  const iconColor = "text-[#0e1630]";
  if (!lab || !test) return <div className="paragraph p-4">Error: No lab or test selected. Please go back and try again.</div>;
  const handleClick = () => navigate(`/dashboard/book-app/${test.id}`, { state: { lab, test } });
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <button onClick={() => navigate(-1)} className={`${iconColor} paragraph`}>← Back to Labs List</button>
      <div className="card-border-primary">
        <h2 className="h4-heading">{lab.name}</h2>
        <p className="paragraph"><FaMapMarkerAlt className={`${iconColor} inline mr-1`} /> {lab.location}</p>
        <p className="paragraph"><FaClock className={`${iconColor} inline mr-1`} /> {lab.timings}</p>
        <p className="paragraph text-green-600"><FaStar className="inline text-[#F4C430] mr-1" /> {lab.rating}/5</p>
        <hr className="my-4" />
        <h3 className="h4-heading mb-2 font-semibold">Facilities & Services</h3>
        <ul className="paragraph space-y-1">
          {lab.nabl && <li className="flex items-center gap-2"><FaCheck className={iconColor} /> NABL Accredited</li>}
          {lab.digitalReports && <li className="flex items-center gap-2"><FaCheck className={iconColor} /> Digital Reports</li>}
          {lab.homeCollection && <li className="flex items-center gap-2"><FaCheck className={iconColor} /> Home Collection Available</li>}
          {lab.expertPathologists && <li className="flex items-center gap-2"><FaCheck className={iconColor} /> Expert Pathologists</li>}
        </ul></div>
      <div className="card-stat card-border-accent">
        <h3 className="h4-heading">Test Details</h3>
        <p className="paragraph mb-2 font-semibold">{test.title}</p>
        <div className="flex gap-2 mb-2">
          <span className="input-field">{test.category}</span>
          {test.code && <span className="input-field">Code: {test.code}</span>}</div>
        <p className="paragraph">Report Time: {lab.reportTime}</p>
        <p className="paragraph">{test.fasting ? `${test.fasting} hours fasting required` : "No fasting required"}</p>
        <div className="text-right">
          <p className=" font-bold text-[var(--accent-color)]">₹{lab.price}</p>
          {lab.originalPrice && (<>
              <p className="paragraph line-through ">₹{lab.originalPrice}</p>
              <p className="paragraph">Save ₹{lab.originalPrice - lab.price}</p>
            </> )}</div> </div>
      <div className="">
        <h3 className="h4-heading font-semibold mb-2">Book Your Appointment</h3>
        <p className="paragraph mb-4">Choose between home sample collection or visiting the lab for your <b>{test.title}</b>.</p>
        <button onClick={handleClick} className="btn btn-primary w-full sm:w-auto">Book Appointment</button>
        <div className="card-stat mt-4">
          <h4 className="h4-heading">Lab Information:</h4>
          <p className="paragraph"><strong>Lab Name:</strong> {lab.name}</p>
          <p className="paragraph"><strong>Location:</strong> {lab.location}</p>
        </div></div></div>);};export default LabBooking;
