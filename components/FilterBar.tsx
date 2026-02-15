"use client";

import { Filter, Search } from "lucide-react";
import { useState } from "react";

interface FilterBarProps {
  onFilterChange?: (filters: Record<string, any>) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");

  const applyFilters = () => {
    // Map Qualified/Disqualified to isQualified boolean when possible
    let isQualified: boolean | undefined = undefined;
    if (status === "Qualified") isQualified = true;
    else if (status === "Disqualified") isQualified = false;

    onFilterChange?.({
      search,
      status,
      isQualified,
      scoreMin: scoreMin ? parseFloat(scoreMin) : null,
      scoreMax: scoreMax ? parseFloat(scoreMax) : null,
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setScoreMin("");
    setScoreMax("");
    onFilterChange?.({
      search: "",
      status: "all",
      isQualified: undefined,
      scoreMin: null,
      scoreMax: null,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={20} className="text-slate-600" />
        <h3 className="font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Lead name or company..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Qualified">Qualified</option>
            <option value="Disqualified">Disqualified</option>
            <option value="Low Priority Lead">Low Priority</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Score Min */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Min Score
          </label>
          <input
            type="number"
            value={scoreMin}
            onChange={(e) => setScoreMin(e.target.value)}
            min="0"
            max="10"
            placeholder="0"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Score Max */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Max Score
          </label>
          <input
            type="number"
            value={scoreMax}
            onChange={(e) => setScoreMax(e.target.value)}
            min="0"
            max="10"
            placeholder="10"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
