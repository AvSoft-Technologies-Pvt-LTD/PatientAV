import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { addToCart } from '../../../../context-api/cartSlice';
import {FaClock,FaFlask,FaStar,FaCheck,FaFileMedicalAlt,FaMicroscope,FaArrowLeft,} from 'react-icons/fa';
const TestDetail = () => {
  const { id } = useParams();
  const [test, setTest] = useState(null);
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const iconColor = "text-[var(--primary-color)]";
  useEffect(() => {
    axios .get('https://mocki.io/v1/74ac3016-49a3-4cef-992c-a24c681f3a9f')
      .then((res) => {
        const found = Array.isArray(res.data)
          ? res.data.find((i) => i.id.toString() === id)
          : null;setTest(found);})
      .catch((err) => console.error('API Error:', err)); }, [id]);
if (!test) return <div className="p-4">Loading or Not Found...</div>;
  return (
    <div className="p-6 bg-white mt-6 shadow-lg">
      <div className="flex justify-between items-center px-4 mb-4">
        <button onClick={() => window.history.back()} className="text-[var(--primary-color)] flex items-center gap-1">
          <FaArrowLeft className={iconColor} /> Back</button>
        <div className="relative cursor-pointer flex items-center text-gray-700 hover:text-blue-600"
          onClick={() => navigate('/dashboard/cart')}>
          <ShoppingCart size={20} className="mr-1" /> <span>Cart</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--primary-color)] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cart.length} </span>)} </div></div>
      <div className="card-stat mb-6">
        <h1 className="h4-heading flex items-center gap-2">
          <FaFileMedicalAlt className={iconColor} /> {test.title}</h1>
        <p className="card-stat-label">Code: {test.code}</p>
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
          {test.category} </span>
        <p className="paragraph mt-4">{test.description}</p>
        <div className="flex items-center justify-between mt-2">
          <div><p className="text-lg font-semibold text-[var(--accent color)]">₹{test.price}</p>
            {test.originalPrice && (<p className="text-sm line-through text-gray-400">₹{test.originalPrice}</p>)}</div>
          <button className="btn btn-primary" onClick={() => dispatch(addToCart(test))}>Add to Cart</button> </div>
        <div className="flex space-x-6 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FaClock className={iconColor} /> Report: {test.reportTime || '24 hours'}</div>
          <div className="flex items-center gap-1">
            <FaFlask className={iconColor} />
            {test.fasting ? 'Fasting required' : 'No fasting required'}</div></div></div>
      <div className="bg-gray-100 mb-6 p-4 rounded-2xl  flex justify-between items-center">
        <div>  <p className="h4-heading mb-1">Find the best labs for {test.title}</p>
          <p className="card-stat-label">Compare prices, check availability, and book appointments.</p></div>
        <button className="btn btn-secondary"
          onClick={() => navigate(`/dashboard/available-labs/${test.id}`, { state: { test } })}>
          View Available Labs    </button></div>
      <div className="card-stat">
        <h2 className="h4-heading flex items-center mb-3 gap-2">
          <FaMicroscope className={iconColor} />
          About {test.title}</h2>
        <p className="flex items-start gap-2 mb-2">
          <FaCheck className={iconColor} />
          <span className="paragraph"><strong>What is it?</strong> {test.about}</span></p>
        <p className="flex items-start gap-2 mb-2">
          <FaCheck className={iconColor} />
          <span className="paragraph"><strong>Why is it done?</strong> {test.why}</span></p>
        <p className="flex items-start gap-2 mb-2">
          <FaCheck className={iconColor} />
          <span className="paragraph">
            <strong>Preparation Required:</strong> {test.fasting ? 'Fasting required' : 'No fasting required'}
          </span></p></div> </div>)};export default TestDetail;
