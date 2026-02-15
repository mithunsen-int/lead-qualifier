import LeadDetail from "@/components/LeadDetail";
import { Lead } from "@/types/lead";

interface Params {
  params: { id: string };
}

export default async function LeadDetailPage({ params }: Params) {
  const { id } = (await params) as { id: string };
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/leads/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch lead");
    }
    const data = await res.json();
    const lead: Lead = data.data || data.lead || null;

    if (!lead) {
      return (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">Lead not found</p>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Lead Details</h1>
        </div>
        <LeadDetail lead={lead} />
      </div>
    );
  } catch (error) {
    console.error("LeadDetailPage error:", error);
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">Error loading lead</p>
      </div>
    );
  }
}
