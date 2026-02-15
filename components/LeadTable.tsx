"use client";

import { Lead } from "@/types/lead";
import Link from "next/link";
import ScoreBadge from "./ScoreBadge";

interface LeadTableProps {
  leads: Lead[];
  isLoading?: boolean;
}

export default function LeadTable({
  leads,
  isLoading = false,
}: LeadTableProps) {
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
              Status
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
                {(() => {
                  const label =
                    lead.isQualified === true
                      ? "Qualified"
                      : lead.isQualified === false
                        ? "Disqualified"
                        : lead.status;

                  const colorClass =
                    lead.isQualified === true
                      ? "bg-green-100 text-green-800"
                      : lead.isQualified === false
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800";

                  return (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
                    >
                      {label}
                    </span>
                  );
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
