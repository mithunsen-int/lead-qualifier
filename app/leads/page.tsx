"use client";

import FilterBar from "@/components/FilterBar";
import LeadTable from "@/components/LeadTable";
import { Lead, LeadsResponse } from "@/types/lead";
import { useEffect, useState } from "react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/leads");

        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }

        const data: LeadsResponse = await response.json();
        setAllLeads(data.leads);
        setLeads(data.leads);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch leads");
        console.error("Error fetching leads:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleFilterChange = (
    newFilters: Record<string, string | number | boolean | undefined>,
  ) => {
    let filtered = allLeads;

    if (newFilters.search && typeof newFilters.search === "string") {
      const searchLower = newFilters.search.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.leadInfo.leadName.toLowerCase().includes(searchLower) ||
          lead.leadInfo.companyName.toLowerCase().includes(searchLower),
      );
    }

    // If isQualified is provided, it takes precedence
    if (
      Object.prototype.hasOwnProperty.call(newFilters, "isQualified") &&
      typeof newFilters.isQualified === "boolean"
    ) {
      filtered = filtered.filter(
        (lead) => lead.isQualified === newFilters.isQualified,
      );
    } else if (newFilters.status && newFilters.status !== "all") {
      filtered = filtered.filter((lead) => lead.status === newFilters.status);
    }

    const scoreMin =
      newFilters.scoreMin !== undefined &&
      typeof newFilters.scoreMin === "number"
        ? newFilters.scoreMin
        : undefined;
    const scoreMax =
      newFilters.scoreMax !== undefined &&
      typeof newFilters.scoreMax === "number"
        ? newFilters.scoreMax
        : undefined;

    if (scoreMin !== undefined) {
      filtered = filtered.filter((lead) => lead.leadScore >= scoreMin);
    }

    if (scoreMax !== undefined) {
      filtered = filtered.filter((lead) => lead.leadScore <= scoreMax);
    }

    setLeads(filtered);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">
          <strong>Error:</strong> {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">All Leads</h1>
        <p className="text-slate-600 mt-2">
          View and manage all leads in your database
        </p>
      </div>

      <div className="mb-8">
        <FilterBar onFilterChange={handleFilterChange} />
      </div>

      <div className="mb-4">
        <p className="text-sm text-slate-600">
          Showing <strong>{leads.length}</strong> of{" "}
          <strong>{allLeads.length}</strong> leads
        </p>
      </div>

      <LeadTable leads={leads} isLoading={isLoading} />
    </div>
  );
}
