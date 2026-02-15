import BudgetChart from "@/components/BudgetChart";
import IndustryChart from "@/components/IndustryChart";
import KPIStatCard from "@/components/KPIStatCard";
import TimeSeriesChart from "@/components/TimeSeriesChart";
import VerdictChart from "@/components/VerdictChart";
import { calculateAnalyticsData } from "@/lib/analytics";
import { Lead } from "@/types/lead";
import { CheckCircle, TrendingUp, Users, XCircle } from "lucide-react";

async function fetchLeadsFromMongoDB(): Promise<Lead[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/leads`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch leads from MongoDB");
    }

    const data = await response.json();
    return data.leads || [];
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}

export default async function DashboardPage() {
  let leads: Lead[] = [];
  let error = null;

  try {
    leads = await fetchLeadsFromMongoDB();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load dashboard";
    console.error("Dashboard error:", err);
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-800">
          <strong>Error:</strong> {error}
        </p>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">No leads available</p>
      </div>
    );
  }

  const analytics = calculateAnalyticsData(leads);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Overview of your lead qualification metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPIStatCard
          label="Total Leads"
          value={analytics.totalLeads}
          icon={<Users size={32} />}
        />
        <KPIStatCard
          label="Qualified Leads"
          value={analytics.qualifiedLeads}
          icon={<CheckCircle size={32} className="text-green-500" />}
        />
        <KPIStatCard
          label="Disqualified Leads"
          value={analytics.disqualifiedLeads}
          icon={<XCircle size={32} className="text-red-500" />}
        />
        <KPIStatCard
          label="Qualification Rate"
          value={`${analytics.qualificationRate.toFixed(1)}%`}
          icon={<TrendingUp size={32} className="text-blue-500" />}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPIStatCard
          label="Average Lead Score"
          value={analytics.averageScore.toFixed(1)}
          className="md:col-span-1"
        />
        <KPIStatCard
          label="Low Priority Leads"
          value={analytics.lowPriorityLeads}
          className="md:col-span-1"
        />
        <KPIStatCard
          label="Total Leads"
          value={leads.length}
          className="md:col-span-1"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <VerdictChart
          qualified={analytics.qualifiedLeads}
          disqualified={analytics.disqualifiedLeads}
          lowPriority={analytics.lowPriorityLeads}
        />
        <IndustryChart topIndustries={analytics.topIndustries} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart data={analytics.leadsByStatusOverTime} />
        <BudgetChart scoreDistribution={analytics.scoreDistribution} />
      </div>
    </div>
  );
}
