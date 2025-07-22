import React, { useState } from 'react';
import { 
  FaCheckCircle, 
  FaStar, 
  FaChevronDown, 
  FaChevronUp,
  FaRupeeSign,
  FaCalendarAlt
} from 'react-icons/fa';

const InsuranceCard = ({ insurance }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatIndianCurrency = (amount) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-cyan-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="p-6 border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-cyan-900">{insurance.name}</h3>
            <div className="flex items-center mt-2 text-cyan-600">
              <FaCalendarAlt className="mr-2" />
              <span>Active since {formatDate(insurance.startDate)}</span>
            </div>
          </div>
          <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-sm font-medium">
            {insurance.status}
          </span>
        </div>
      </div>

      {/* Premium Section */}
      <div className="p-6 bg-cyan-50">
        <div className="flex items-center">
          <div className="space-y-1">
            <p className="text-sm text-cyan-600">Monthly Premium</p>
            <div className="flex items-center">
              <FaRupeeSign className="text-2xl text-cyan-700" />
              <span className="text-3xl font-bold text-cyan-900">{insurance.monthlyPremium}</span>
              <span className="text-cyan-600 ml-2">/month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-cyan-600">Policy Number</p>
          <p className="text-lg font-semibold text-cyan-900 mt-1">{insurance.policyNumber}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-cyan-600">Coverage Amount</p>
          <p className="text-lg font-semibold text-cyan-900 mt-1">
            {formatIndianCurrency(insurance.coverage)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-cyan-600">Waiting Period</p>
          <p className="text-lg font-semibold text-cyan-900 mt-1">{insurance.waitingPeriod}</p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="px-6 pb-6">
        <h4 className="text-lg font-semibold text-cyan-900 mb-4">Key Benefits</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insurance.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center bg-cyan-50 p-3 rounded-lg">
              <FaCheckCircle className="text-cyan-500 mr-3 flex-shrink-0" />
              <span className="text-cyan-800">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expand/Collapse Section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-sm flex items-center justify-center text-cyan-600 hover:text-cyan-800 hover:bg-cyan-50 transition-colors duration-200 border-t border-cyan-100"
      >
        {isExpanded ? (
          <>
            <span>Show Less</span>
            <FaChevronUp className="ml-2" />
          </>
        ) : (
          <>
            <span>View More Details</span>
            <FaChevronDown className="ml-2" />
          </>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 bg-white border-t border-cyan-100">
          <h4 className="text-lg font-semibold text-cyan-900 mb-4">Special Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insurance.features.map((feature, index) => (
              <div key={index} className="flex items-start p-4 bg-cyan-50 rounded-lg">
                <FaStar className="text-cyan-500 mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h5 className="text-base font-medium text-cyan-900">{feature.name}</h5>
                  <p className="text-sm text-cyan-600 mt-2">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceCard;