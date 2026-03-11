"use client";

import { Lead } from "@/types/lead";
import Link from "next/link";
import { useState } from "react";
import ScoreBadge from "./ScoreBadge";

interface LeadTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onLeadUpdate?: (updatedLead: Lead) => void;
}

export default function LeadTable({
  leads,
  isLoading = false,
  onLeadUpdate,
}: LeadTableProps) {
  const [reanalyzingIds, setReanalyzingIds] = useState<Set<string>>(new Set());
  const [reanalysisErrors, setReanalysisErrors] = useState<Map<string, string>>(
    new Map(),
  );

  const handleReanalyse = async (leadId: string | undefined) => {
    if (!leadId) return;

    setReanalyzingIds((prev) => new Set(prev).add(leadId));
    setReanalysisErrors((prev) => {
      const newMap = new Map(prev);
      newMap.delete(leadId);
      return newMap;
    });

    try {
      const response = await fetch(`/api/leads/${leadId}/reanalyse`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Reanalysis failed with status ${response.status}`,
        );
      }

      const result = await response.json();
      console.log(`[LeadTable] Reanalysis successful for lead ${leadId}`);

      // Update the lead in the parent component
      if (onLeadUpdate && result.data) {
        onLeadUpdate(result.data);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reanalyse lead";
      console.error(`[LeadTable] Reanalysis error for ${leadId}:`, error);
      setReanalysisErrors((prev) => new Map(prev).set(leadId, errorMessage));
    } finally {
      setReanalyzingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(leadId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-slate-500">Loading leads...</p>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-slate-500">No leads found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Lead Name
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Company
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Job Title
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Location
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Email
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Lead Score
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Reanalysis Count
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Status
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                <Link href={`/leads/${lead._id}`} className="hover:underline">
                  {lead.leadInfo.leadName}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {lead.leadInfo.companyName}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {lead.leadInfo.jobTitle}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {lead.leadInfo.location || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {lead.leadInfo.leadEmail}
              </td>
              <td className="px-6 py-4">
                <ScoreBadge score={lead.leadScore} />
              </td>
              <td className="px-6 py-4">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                  {lead.reanalysisCount || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                {(() => {
                  const getStatusLabel = () => {
                    if (lead.status) return lead.status;
                    if (lead.isQualified === true)
                      return "Sales Qualified Lead (SQL)";
                    if (lead.isQualified === false) return "Disqualified Lead";
                    return "Low Priority Lead";
                  };

                  const getColorClass = () => {
                    if (lead.status === "Sales Qualified Lead (SQL)")
                      return "bg-green-100 text-green-800";
                    if (lead.status === "Marketing Qualified Lead (MQL)")
                      return "bg-blue-100 text-blue-800";
                    if (lead.status === "Disqualified Lead")
                      return "bg-red-100 text-red-800";
                    if (lead.status === "Low Priority Lead")
                      return "bg-yellow-100 text-yellow-800";
                    return "bg-gray-100 text-gray-800";
                  };

                  return (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getColorClass()}`}
                    >
                      {getStatusLabel()}
                    </span>
                  );
                })()}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => handleReanalyse(lead._id)}
                  disabled={reanalyzingIds.has(lead._id || "")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    reanalyzingIds.has(lead._id || "")
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  title={
                    reanalyzingIds.has(lead._id || "")
                      ? "Reanalysis in progress..."
                      : "Click to reanalyse this lead"
                  }
                >
                  {reanalyzingIds.has(lead._id || "")
                    ? "Analyzing..."
                    : "Reanalyse"}
                </button>
                {reanalysisErrors.has(lead._id || "") && (
                  <div className="mt-1 text-xs text-red-600">
                    {reanalysisErrors.get(lead._id || "")}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
