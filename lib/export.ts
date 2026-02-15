import { Lead } from "@/types/lead";

export function exportLeadsAsCSV(leads: Lead[], filename = "leads.csv"): void {
  const headers = [
    "Lead ID",
    "Client Name",
    "Business",
    "Industry",
    "Location",
    "Budget (USD)",
    "BANT Score",
    "Budget Score",
    "Authority Score",
    "Need Score",
    "Timing Score",
    "Verdict",
    "Reason",
    "Created At",
  ];

  const rows = leads.map((lead) => [
    lead.id,
    lead.clientName,
    lead.business,
    lead.industry,
    lead.location,
    lead.budget,
    lead.bantScore,
    lead.budgetScore,
    lead.authorityScore,
    lead.needScore,
    lead.timingScore,
    lead.verdict,
    lead.reason,
    lead.createdAt,
  ]);

  // Convert to CSV format
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma
          const cellStr = String(cell);
          if (cellStr.includes(",") || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(","),
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportLeadsAsJSON(
  leads: Lead[],
  filename = "leads.json",
): void {
  const jsonContent = JSON.stringify(leads, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
