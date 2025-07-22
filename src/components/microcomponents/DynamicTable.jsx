import React, { useState } from "react";
import { FiFilter, FiX, FiSearch } from "react-icons/fi";
const DynamicTable = ({ columns, data, onCellClick, filters = [], tabs = [], tabActions = [], activeTab, onTabChange }) => {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState({});
  const handleTabClick = (tabValue) => {
    onTabChange?.(tabValue); // notify parent
  };
  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };
  const filteredData = data.filter((row) => {
    const matchesSearch = Object.values(row).some((val) =>
      val?.toString().toLowerCase().includes(search.toLowerCase())
    );
    const matchesCombinedFilter = !activeFilters.combinedFilter || Object.entries(row).some(
      ([, fieldValue]) =>
        typeof fieldValue === "string" && fieldValue === activeFilters.combinedFilter
    );
    const matchesOtherFilters = Object.entries(activeFilters).every(([key, val]) => {
      if (!val || key === "combinedFilter") return true;
      return row[key] === val;
    });
   const matchesTab = true;
    return matchesSearch && matchesCombinedFilter && matchesOtherFilters && matchesTab;
  });
  return (
    <div className="space-y-4">
      {tabs.length > 0 && (
        <div className="flex items-center justify-between mb-4 ">
          <div className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabClick(tab.value)}
                className={`relative cursor-pointer flex items-center gap-1 px-4 py-2 font-medium transition-colors duration-300
                ${activeTab === tab.value
                    ? "text-[var(--primary-color)] after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[var(--primary-color)]"
                    : "text-gray-500 hover:text-[var(--accent-color)] before:content-[''] before:absolute before:left-0 before:bottom-0 before:h-[2px] before:w-0 before:bg-[var(--accent-color)] before:transition-all before:duration-300 hover:before:w-full"
                  }`
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
          {tabActions.length > 0 && (
            <div className="flex gap-3">
              {tabActions.map((action) => (
                <button key={action.label} onClick={action.onClick} className={action.className}>
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex items-center">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input-field peer" />
          <FiSearch className="absolute right-3 text-gray-400 text-lg" />
        </div>
        {filters.map((filter) => (
          <div key={filter.key} className="flex items-center gap-2">
            <FiFilter className="text-[var(--primary-color)] text-4xl" />
            {filter.label || "Filter"}:
            <select value={activeFilters[filter.key] || ""} onChange={(e) => handleFilterChange(filter.key, e.target.value)} className="input-field peer">
              <option value="">All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {activeFilters[filter.key] && (
              <button type="button" onClick={() => handleFilterChange(filter.key, "")} className="text-red-500 hover:text-red-700" title="Clear filter" >
                <FiX className="text-xs" />
              </button>
            )}
          </div>
        ))}
      </div>
      <table className="table-container w-full">
        <thead>
          <tr className="table-head text-left text-sm">
            {columns.map((col, i) => (
              <th key={i} className="px-4 py-2 border-b">{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="table-body overflow-visible text-sm">
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-2 text-center">No records found</td>
            </tr>
          ) : (
            filteredData.map((row) => (
              <tr key={row.id} className="border-t even:bg-gray-50">
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-2 ${col.clickable ? "text-[var(--primary-color)] underline cursor-pointer hover:text-[var(--accent-color)]" : ""}`} onClick={col.clickable ? () => onCellClick?.(row, col) : undefined} >
                    {col.cell ? col.cell(row) : row[col.accessor] || "-"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
export default DynamicTable;