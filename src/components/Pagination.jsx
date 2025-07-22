// components/Pagination.jsx
import React from "react";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";

const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 shadow ${
          page === 1 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FiChevronsLeft className="w-5 h-5" />
      </button>

      <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--accent-color)] text-white text-sm font-semibold shadow">
        {page}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className={`p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 shadow ${
          page === totalPages ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <FiChevronsRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;
