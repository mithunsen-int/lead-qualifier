import { AnalyticsData, Lead } from "@/types/lead";

export function calculateAnalyticsData(leads: Lead[]): AnalyticsData {
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.isQualified === true).length;
  const disqualifiedLeads = leads.filter((l) => l.isQualified === false).length;
  const lowPriorityLeads = leads.filter(
    (l) => l.status === "Low Priority Lead",
  ).length;

  const totalScore = leads.reduce((sum, lead) => sum + lead.leadScore, 0);
  const averageScore =
    totalLeads > 0 ? parseFloat((totalScore / totalLeads).toFixed(2)) : 0;

  // Calculate leads by industry
  const leadsByIndustry = leads.reduce(
    (acc, lead) => {
      const industry = lead.leadInfo.leadIndustry || "Unknown";
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Get top industries
  const topIndustries = Object.entries(leadsByIndustry)
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate score distribution (0-2, 2-4, 4-6, 6-8, 8-10)
  const scoreRanges = [
    { range: "0-2", min: 0, max: 2 },
    { range: "2-4", min: 2, max: 4 },
    { range: "4-6", min: 4, max: 6 },
    { range: "6-8", min: 6, max: 8 },
    { range: "8-10", min: 8, max: 10 },
  ];

  const scoreDistribution = scoreRanges.map((range) => ({
    range: range.range,
    count: leads.filter(
      (l) => l.leadScore >= range.min && l.leadScore <= range.max,
    ).length,
  }));

  // Calculate leads by status over time (by month)
  const leadsByDate = leads.reduce(
    (acc, lead) => {
      const date = new Date(lead.createdAt || new Date());
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!acc[monthKey]) {
        acc[monthKey] = { qualified: 0, disqualified: 0, lowPriority: 0 };
      }

      if (lead.isQualified === true) {
        acc[monthKey].qualified++;
      } else if (lead.isQualified === false) {
        acc[monthKey].disqualified++;
      } else {
        acc[monthKey].lowPriority++;
      }

      return acc;
    },
    {} as Record<
      string,
      { qualified: number; disqualified: number; lowPriority: number }
    >,
  );

  // Convert to sorted array
  const leadsByStatusOverTime = Object.entries(leadsByDate)
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12); // Last 12 months

  return {
    totalLeads,
    qualifiedLeads,
    disqualifiedLeads,
    lowPriorityLeads,
    qualificationRate:
      totalLeads > 0
        ? parseFloat(((qualifiedLeads / totalLeads) * 100).toFixed(2))
        : 0,
    averageScore,
    leadsByIndustry,
    leadsByStatusOverTime,
    topIndustries,
    scoreDistribution,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-blue-600";
  if (score >= 4) return "text-yellow-600";
  return "text-red-600";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Qualified":
      return "bg-green-100 text-green-800";
    case "Disqualified":
      return "bg-red-100 text-red-800";
    case "Low Priority Lead":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case "Qualified":
      return "bg-green-50";
    case "Disqualified":
      return "bg-red-50";
    case "Low Priority Lead":
      return "bg-yellow-50";
    default:
      return "bg-gray-50";
  }
}
