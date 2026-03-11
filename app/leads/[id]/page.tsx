"use client";

import LeadDetail from "@/components/LeadDetail";
import { Lead } from "@/types/lead";
import { useEffect, useState } from "react";

interface Params {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: Params) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLead = async () => {
      const { id: leadId } = (await params) as { id: string };

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/leads/${leadId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch lead");
        }

        const data = await res.json();
        const fetchedLead: Lead = data.data || data.lead || null;

        if (!fetchedLead) {
          setError("Lead not found");
        } else {
          setLead(fetchedLead);
        }
      } catch (err) {
        console.error("LeadDetailPage error:", err);
        setError(err instanceof Error ? err.message : "Error loading lead");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLead();
  }, [params]);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">Loading lead details...</p>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">{error || "Lead not found"}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Lead Details</h1>
      </div>
      <LeadDetail lead={lead} onLeadUpdate={setLead} />
    </div>
  );
}
