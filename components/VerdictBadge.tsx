"use client";

import { getVerdictColor } from "@/lib/analytics";

interface VerdictBadgeProps {
  verdict:
    | "Sales Qualified Lead (SQL)"
    | "Marketing Qualified Lead (MQL)"
    | "Disqualified Lead"
    | "Low Priority Lead";
  className?: string;
}

export default function VerdictBadge({
  verdict,
  className = "",
}: VerdictBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getVerdictColor(verdict)} ${className}`}
    >
      {verdict}
    </span>
  );
}
