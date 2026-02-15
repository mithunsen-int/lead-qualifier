"use client";

import KPIStatCard from "@/components/KPIStatCard";
import LeadTable from "@/components/LeadTable";
import { Lead, LeadsResponse } from "@/types/lead";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function QualifiedLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/leads?isQualified=true");

        if (!response.ok) {
          throw new Error("Failed to fetch leads");
        }

        const data: LeadsResponse = await response.json();
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

  const avgScore =
    leads.length > 0
      ? leads.reduce((sum, lead) => sum + lead.leadScore, 0) / leads.length
      : 0;

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
        <h1 className="text-3xl font-bold text-slate-900">Qualified Leads</h1>
        <p className="text-slate-600 mt-2">
          Leads that meet your qualification criteria
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPIStatCard
          label="Total Qualified"
          value={leads.length}
          icon={<CheckCircle size={32} className="text-green-500" />}
        />
        <KPIStatCard label="Average Lead Score" value={avgScore.toFixed(1)} />
        <KPIStatCard label="Total Leads" value={leads.length} />
      </div>

      <LeadTable leads={leads} isLoading={isLoading} />
    </div>
  );
}
